from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
import os
import torch
import torchaudio
from pydub import AudioSegment

XTTS_MODEL = None

def load_model(xtts_checkpoint, xtts_config, xtts_vocab):
    global XTTS_MODEL
    config = XttsConfig()
    config.load_json(xtts_config)
    XTTS_MODEL = Xtts.init_from_config(config)
    XTTS_MODEL.load_checkpoint(config, checkpoint_path=xtts_checkpoint, vocab_path=xtts_vocab, use_deepspeed=False)
    if torch.cuda.is_available():
        XTTS_MODEL.cuda()

def run_tts(lang, tts_text, speaker_audio_file, output_audio):
    gpt_cond_latent, speaker_embedding = XTTS_MODEL.get_conditioning_latents(
        audio_path=speaker_audio_file,
    )

    out = XTTS_MODEL.inference(
        text=tts_text,
        language=lang,
        gpt_cond_latent=gpt_cond_latent,
        speaker_embedding=speaker_embedding,
    )

    out_path = f"/Users/yuki/Documents/Github/yuna-ai/static/audio/{output_audio}"
    torchaudio.save(out_path, torch.tensor(out["wav"]).unsqueeze(0), 22000)

    return out_path, speaker_audio_file

def speak_text(text, reference_audio, output_audio, language="en"):
    # Split the text into sentences
    sentences = text.replace("\n", " ").replace("?", "?|").replace(".", ".|").replace("...", "...|").split("|")

    # Initialize variables
    chunks = []
    current_chunk = ""

    # Iterate over the sentences
    for sentence in sentences:
        # Check if adding the sentence to the current chunk exceeds the character limit
        if len(current_chunk) + len(sentence) <= 200:
            current_chunk += sentence.strip() + " "
        else:
            # If the current chunk is not empty, add it to the chunks list
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = sentence.strip() + " "

    # Add the last chunk if it's not empty
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # Join small chunks together if possible
    i = 0
    while i < len(chunks) - 1:
        if len(chunks[i]) + len(chunks[i + 1]) <= 200:
            chunks[i] += " " + chunks[i + 1]
            chunks.pop(i + 1)
        else:
            i += 1

    # List to store the names of the generated audio files
    audio_files = []

    print(chunks)

    for i, chunk in enumerate(chunks):
        audio_file = f"response_{i+1}.wav"
        result = run_tts(language, chunk, reference_audio, audio_file)
        audio_files.append("/Users/yuki/Documents/Github/yuna-ai/static/audio/" + audio_file)

    # Concatenate the audio files with a 1-second pause in between
    combined = AudioSegment.empty()
    for audio_file in audio_files:
        combined += AudioSegment.from_wav(audio_file) + AudioSegment.silent(duration=1000)

    # Export the combined audio
    combined.export("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.wav", format='wav')
    
    print(f"Generated audio saved at: {output_audio}")

xtts_checkpoint = "/Users/yuki/Downloads/yuna-talk-v2/yuna-small.pth"
xtts_config = "/Users/yuki/Downloads/yuna-talk-v2/config.json"
xtts_vocab = "/Users/yuki/Downloads/yuna-talk-v2/vocab.json"
load_model(xtts_checkpoint, xtts_config, xtts_vocab)

# run TTS
tts_text = """IMPORTANT: You are using gradio version 4.7.1, however version 4.29 available, please upgrade."""
speaker_audio_file = "/Users/yuki/Downloads/yuna-talk-v2/dataset/wavs/yuna-tamer-prepared_00000177.wav"
output_audio = "output.wav"
speak_text(tts_text, speaker_audio_file, output_audio)

"""
checkpoint = torch.load(xtts_checkpoint, map_location=torch.device("cpu"))
del checkpoint["optimizer"]
for key in list(checkpoint["model"].keys()):
    if "dvae" in key:
        del checkpoint["model"][key]
torch.save(checkpoint, "yuna-small.pth")
"""