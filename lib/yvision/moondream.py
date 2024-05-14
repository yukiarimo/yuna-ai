import torch
from .configuration_moondream import MoondreamConfig
from transformers import PreTrainedModel
import re
from .modeling_phi import PhiForCausalLM
from .configuration_moondream import PhiConfig
from torch import nn
from PIL import Image
from einops import rearrange
from torchvision.transforms.v2 import (
    Compose,
    Resize,
    InterpolationMode,
    ToImage,
    ToDtype,
    Normalize,
)
import timm

class VisualHolder(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.visual = model

    def forward(self, x):
        return self.visual(x)


class ModelHolder(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, x):
        return self.model(x)


class LinearPatchEmbedding(nn.Module):
    def __init__(self, conv):
        super().__init__()
        self.linear = nn.Linear(588, 1152)
        self.linear.weight.data = conv.weight.data.view(1152, -1)
        if conv.bias is not None:
            self.linear.bias.data = conv.bias.data

    def forward(self, x):
        return self.linear(x)


class MLP(nn.Module):
    def __init__(
        self,
        in_features: int,
        hidden_features: int = None,
        out_features: int = None,
        act_layer: nn.Module = nn.GELU,
    ) -> None:
        super().__init__()
        out_features = out_features or in_features
        hidden_features = hidden_features or in_features
        self.fc1 = nn.Linear(in_features, hidden_features)
        self.act = act_layer()
        self.fc2 = nn.Linear(hidden_features, out_features)

        torch.nn.init.kaiming_normal_(
            self.fc1.weight, mode="fan_in", nonlinearity="relu"
        )
        torch.nn.init.kaiming_normal_(
            self.fc2.weight, mode="fan_in", nonlinearity="relu"
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.fc1(x)
        x = self.act(x)
        x = self.fc2(x)
        return x


class VisionProjection(nn.Module):
    def __init__(self):
        super().__init__()

        image_embedding_dim = 1152
        model_dim = 2048
        hidden_dim = model_dim * 4

        self.mlp = MLP(image_embedding_dim, hidden_dim, model_dim)

    @property
    def device(self):
        return self.mlp.fc1.weight.device

    def forward(self, x):
        return self.mlp(x)


class VisionEncoder(nn.Module):
    def __init__(self) -> None:
        super().__init__()

        self.encoder = ModelHolder(
            VisualHolder(timm.create_model("vit_so400m_patch14_siglip_384"))
        )
        self.encoder.model.visual.patch_embed = LinearPatchEmbedding(
            self.encoder.model.visual.patch_embed.proj
        )
        self.encoder.model.visual.attn_pool = nn.Identity()

        self.projection = VisionProjection()

        self.preprocess = Compose(
            [
                Resize(size=(378, 378), interpolation=InterpolationMode.BICUBIC),
                ToImage(),
                ToDtype(torch.float32, scale=True),
                Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ]
        )

    @property
    def device(self):
        return self.projection.mlp.fc1.weight.device

    @property
    def dtype(self):
        return self.projection.mlp.fc1.weight.dtype

    def __call__(self, image: Image) -> torch.Tensor:
        with torch.no_grad():
            x = (
                self.preprocess(image.convert("RGB"))
                .unsqueeze(0)
                .to(self.device, dtype=self.dtype)
            )
            x = rearrange(x, "b c (h p1) (w p2) -> b (h w) (c p1 p2)", p1=14, p2=14)

            x = self.encoder(x)
            x = self.projection(x)

            return x

class Moondream(PreTrainedModel):
    config_class = MoondreamConfig

    def __init__(self, config):
        super().__init__(config)
        self.vision_encoder = VisionEncoder()

        if type(config.phi_config) == dict:
            phi_config = PhiConfig(**config.phi_config)
        else:
            phi_config = config.phi_config
        self.text_model = PhiForCausalLM(phi_config)

    @property
    def device(self):
        return self.text_model.device

    def encode_image(self, image):
        return self.vision_encoder(image)

    def input_embeds(self, prompt, image_embeds, tokenizer):
        def _tokenize(txt):
            return tokenizer(
                txt, return_tensors="pt", add_special_tokens=False
            ).input_ids.to(self.device)

        text_emb = self.text_model.get_input_embeddings()

        # Add BOS token
        embeds = []
        embeds.append(
            text_emb((torch.tensor([[tokenizer.bos_token_id]], device=self.device)))
        )

        if "<image>" not in prompt:
            embeds.append(text_emb(_tokenize(prompt)))
        else:
            assert prompt.count("<image>") == 1
            before, after = prompt.split("<image>")
            embeds.append(text_emb(_tokenize(f"{before}<image>")))
            embeds.append(image_embeds.to(self.device))
            embeds.append(text_emb(_tokenize(f"</image>{after}")))

        return torch.cat(embeds, dim=1)

    def generate(
        self,
        image_embeds,
        prompt,
        tokenizer,
        eos_text="<END>",
        max_new_tokens=256,
        **kwargs,
    ):
        eos_tokens = tokenizer(eos_text, add_special_tokens=False)[0].ids

        generate_config = {
            "eos_token_id": eos_tokens,
            "bos_token_id": tokenizer.bos_token_id,
            "pad_token_id": tokenizer.eos_token_id,
            "max_new_tokens": max_new_tokens,
            **kwargs,
        }

        with torch.no_grad():
            inputs_embeds = self.input_embeds(prompt, image_embeds, tokenizer)
            output_ids = self.text_model.generate(
                inputs_embeds=inputs_embeds, **generate_config
            )

        return tokenizer.batch_decode(output_ids, skip_special_tokens=True)

    def answer_question(
        self,
        image_embeds,
        question,
        tokenizer,
        chat_history="",
        result_queue=None,
        **kwargs,
    ):
        prompt = f"<image>\n\n{chat_history}Question: {question}\n\nAnswer: "
        answer = self.generate(
            image_embeds,
            prompt,
            eos_text="<END>",
            tokenizer=tokenizer,
            max_new_tokens=256,
            **kwargs,
        )[0]
        cleaned_answer = re.sub("<$", "", re.sub("END$", "", answer)).strip()

        # Use the result_queue to pass the result if it is provided
        if result_queue:
            result_queue.put(cleaned_answer)
        else:
            return cleaned_answer
