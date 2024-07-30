import json
import os
import whisper
import torch
import torchaudio
from pydub import AudioSegment

model = whisper.load_model(name="tiny.en", device="cpu")
XTTS_MODEL = None

with open('static/config.json', 'r') as config_file:
    config = json.load(config_file)

if config['server']['yuna_audio_mode'] == "native":
    from TTS.tts.configs.xtts_config import XttsConfig
    from TTS.tts.models.xtts import Xtts

if config['server']['yuna_audio_mode'] == "11labs":
    from elevenlabs import VoiceSettings
    from elevenlabs.client import ElevenLabs

def transcribe_audio(audio_file):
    result = model.transcribe(audio_file)
    return result['text']

def load_model(xtts_checkpoint, xtts_config, xtts_vocab):
    global XTTS_MODEL
    config = XttsConfig()
    config.load_json(xtts_config)
    XTTS_MODEL = Xtts.init_from_config(config)
    XTTS_MODEL.load_checkpoint(config, checkpoint_path=xtts_checkpoint, vocab_path=xtts_vocab, use_deepspeed=False)
    if torch.cuda.is_available():
        XTTS_MODEL.cuda()

def run_tts(lang, tts_text, speaker_audio_file, output_audio):
    gpt_cond_latent, speaker_embedding = XTTS_MODEL.get_conditioning_latents(audio_path=speaker_audio_file, gpt_cond_len=XTTS_MODEL.config.gpt_cond_len, max_ref_length=XTTS_MODEL.config.max_ref_len, sound_norm_refs=XTTS_MODEL.config.sound_norm_refs)

    out = XTTS_MODEL.inference(
        text=tts_text,
        language=lang,
        gpt_cond_latent=gpt_cond_latent,
        speaker_embedding=speaker_embedding,
        temperature=XTTS_MODEL.config.temperature,
        length_penalty=XTTS_MODEL.config.length_penalty,
        repetition_penalty=XTTS_MODEL.config.repetition_penalty,
        top_k=XTTS_MODEL.config.top_k,
        top_p=XTTS_MODEL.config.top_p,
    )

    out_path = f"/Users/yuki/Documents/Github/yuna-ai/static/audio/{output_audio}"
    torchaudio.save(out_path, torch.tensor(out["aiff"]).unsqueeze(0), 22000)

    return out_path, speaker_audio_file
def speak_text(text, reference_audio=config['server']['yuna_reference_audio'], output_audio=config['server']['output_audio_format'], mode=config['server']['yuna_audio_mode'], language="en"):
    if mode == "native":
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

        for i, chunk in enumerate(chunks):
            audio_file = f"response_{i+1}.wav"
            result = speak_text(chunk, reference_audio, audio_file, "native")
            audio_files.append("/Users/yuki/Documents/Github/yuna-ai/static/audio/" + audio_file)

        # Concatenate the audio files with a 1-second pause in between
        combined = AudioSegment.empty()
        for audio_file in audio_files:
            combined += AudioSegment.from_wav(audio_file) + AudioSegment.silent(duration=1000)

        # Export the combined audio
        combined.export("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.wav", format='wav')

        # convert audio to aiff
        audio = AudioSegment.from_wav("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.wav")
        audio.export("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.mp3", format='mp3')
    elif mode == "fast":
        command = f'say -o /Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff {repr(text)}'
        exit_status = os.system(command)

        # convert audio to mp3
        audio = AudioSegment.from_file("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff")
        audio.export("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.mp3", format='mp3')
    elif mode == "fast-pv":
        command = f'say -v Yuna -o /Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff {repr(text)}'
        print(command)
        exit_status = os.system(command)

        # convert audio to mp3
        audio = AudioSegment.from_file("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff")
        audio.export("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.mp3", format='mp3')
    elif mode == "11labs":
        client = ElevenLabs(
            api_key=config['security']['11labs_key']
        )

        audio = client.generate(
            text=text,
            voice="Yuna Instant",
            voice_settings=VoiceSettings(stability=0.40, similarity_boost=0.98, style=0.35, use_speaker_boost=True),
            model="eleven_multilingual_v2"
        )

        # Convert generator to bytes
        audio_bytes = b''.join(audio)

        # Optionally, save the audio to a file
        with open("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.mp3", "wb") as f:
            f.write(audio_bytes)
    else:
        raise ValueError("Invalid mode for speaking text")

if config['server']['yuna_audio_mode'] == "native":
    xtts_checkpoint = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/yuna-talk.pth"
    xtts_config = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/config.json"
    xtts_vocab = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/vocab.json"
    load_model(xtts_checkpoint, xtts_config, xtts_vocab)