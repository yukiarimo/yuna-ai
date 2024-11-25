import json
import os
import uuid
import torch
from pydub import AudioSegment
import re
import soundfile as sf
import io
from aiflow import agi
config = agi.get_config()

if config['ai']['audio'] == True:
    from transformers import pipeline

    yunaListen = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-tiny",
        torch_dtype=torch.float32,
        device="mps",
        model_kwargs={"attn_implementation": "sdpa"},
    )

if config['server']['yuna_audio_mode'] == "11labs":
    from elevenlabs import VoiceSettings
    from elevenlabs.client import ElevenLabs

if config['server']['yuna_audio_mode'] == "native":
    from gpt_sovits_python import TTS, TTS_Config

    soviets_configs = {
        "default": {
            "device": "cpu",
            "is_half": False,
            "t2s_weights_path": f"lib/utils/models/agi/voice/{config['server']['voice_default_model']}/{config['server']['voice_model_config'][0]}",
            "vits_weights_path": f"lib/utils/models/agi/voice/{config['server']['voice_default_model']}/{config['server']['voice_model_config'][1]}",
            "cnhuhbert_base_path": f"lib/utils/models/agi/voice/{config['server']['voice_default_model']}/chinese-hubert-base",
            "bert_base_path": f"lib/utils/models/agi/voice/{config['server']['voice_default_model']}/chinese-roberta-wwm-ext-large"
        }
    }

    params = {
        "text_lang": "en",
        "ref_audio_path": "/Users/yuki/Documents/AI/Datasets/voice/yuna-ai-v2/wavs/2644.wav", #2599
        "prompt_text": "You're here! It's not a dream! You're still alive and well! So if that section of the book is a lie, maybe you aren't so weak.",
        "prompt_lang": "en",
        "top_k": 1,
        "top_p": 0.6,
        "temperature": 0.7,
        "text_split_method": "cut0",
        "batch_size": 1,
        "batch_threshold": 1.0,
        "split_bucket": True,
        "speed_factor": 1.0,
        "fragment_interval": 0.3,
        "seed": 1234,
        "media_type": "wav",
        "streaming_mode": False,
        "parallel_infer": True,
        "repetition_penalty": 1.25
    }

    tts_config = TTS_Config(soviets_configs)
    tts_pipeline = TTS(tts_config)

def transcribe_audio(audio_file): return yunaListen(audio_file, chunk_length_s=30, batch_size=40, return_timestamps=False)['text']

def speak_text(text, project=None, chapter=None, paragraph=None, mode='siri'):
    # Create directory structure if it doesn't exist
    if project and chapter:
        audio_dir = f"static/audio/audiobooks/{project}/{chapter}"
        os.makedirs(audio_dir, exist_ok=True)
        
        # Use paragraph number in filename if provided
        if paragraph:
            output_filename = f"{audio_dir}/paragraph_{paragraph}.mp3"
        else:
            output_filename = f"{audio_dir}/full_chapter.mp3"
    else:
        output_filename = f"static/audio/{uuid.uuid4()}.mp3"

    # Check if audio file already exists
    if os.path.exists(output_filename):
        return '/' + output_filename

    mode = 'siri'
    if mode == "siri":
        os.system(f'say -o temp.aiff {repr(text)}')
        audio = AudioSegment.from_file("temp.aiff")
        audio.export(output_filename, format="mp3")
        os.remove("temp.aiff")

    return '/' + output_filename