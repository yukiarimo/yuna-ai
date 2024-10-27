import json
import os
import torch
from pydub import AudioSegment
import re
import soundfile as sf
import io

with open('static/config.json', 'r') as config_file:
    config = json.load(config_file)

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
            "device": "mps",
            "is_half": False,
            "t2s_weights_path": "/Users/yuki/Downloads/GPT-SoVITS/GPT_SoVITS/pretrained_models/YunaAi-e20-gpt.ckpt",
            "vits_weights_path": "/Users/yuki/Downloads/GPT-SoVITS/SoVITS_weights_v2/YunaAi_e20_s620-sovits.pth",
            "cnhuhbert_base_path": "/Users/yuki/Downloads/GPT-SoVITS/GPT_SoVITS/pretrained_models/chinese-hubert-base",
            "bert_base_path": "/Users/yuki/Downloads/GPT-SoVITS/GPT_SoVITS/pretrained_models/chinese-roberta-wwm-ext-large"
        }
    }

    tts_config = TTS_Config(soviets_configs)
    tts_pipeline = TTS(tts_config)

def transcribe_audio(audio_file):
    result = yunaListen(audio_file, chunk_length_s=30, batch_size=40, return_timestamps=False)
    return result['text']

def speak_text(text, reference_audio=config['server']['yuna_reference_audio'], output_audio=config['server']['output_audio_format'], mode=config['server']['yuna_audio_mode'], language="en"):
    if mode == "siri":
        command = f'say -o static/audio/audio.aiff {repr(text)}'
        os.system(command)
        audio = AudioSegment.from_file("static/audio/audio.aiff")
        audio.export("static/audio/audio.mp3", format='mp3')

    elif mode == "siri-pv":
        command = f'say -v {reference_audio} -o static/audio/audio.aiff {repr(text)}'
        os.system(command)
        audio = AudioSegment.from_file("static/audio/audio.aiff")
        audio.export("static/audio/audio.mp3", format='mp3')

    elif mode == "native":
        params = {
            "text": text,          # str.(required) text to be synthesized
            "text_lang": "en",            # str.(required) language of the text to be synthesized [, "en", "zh", "ja", "all_zh", "all_ja"] 
            "ref_audio_path": "/Users/yuki/Downloads/y-orig.wav",         # str.(required) reference audio path
            "prompt_text": "If you're wondering about our goal, it's a town near the capital of this kingdom",  # str.(optional) prompt text for the reference audio
            "prompt_lang": "en",          # str.(required) language of the prompt text for the reference audio
            "top_k": 80,                 # int. top k sampling
            "top_p": 1,                   # float. top p sampling
            "temperature": 1,             # float. temperature for sampling
            "text_split_method": "cut5",  # str. text split method, see gpt_sovits_python\TTS_infer_pack\text_segmentation_method.py for details.
            "batch_size": 40,              # int. batch size for inference
            "batch_threshold": 0.75,      # float. threshold for batch splitting.
            "split_bucket": True,         # bool. whether to split the batch into multiple buckets.
            "speed_factor": 1.0,          # float. control the speed of the synthesized audio.
            "fragment_interval": 0.5,     # float. to control the interval of the audio fragment.
            "seed": -1,                   # int. random seed for reproducibility.
            "media_type": "wav",          # str. media type of the output audio, support "wav", "raw", "ogg", "aac".
            "streaming_mode": False,      # bool. whether to return a streaming response.
            "parallel_infer": True,       # bool.(optional) whether to use parallel inference.
            "repetition_penalty": 1.3    # float.(optional) repetition penalty for T2S model.
        }

        with torch.no_grad():
            tts_generator = tts_pipeline.run(params)
            sr, audio_data = next(tts_generator)
            
            # Use an in-memory buffer
            buffer = io.BytesIO()
            sf.write(buffer, audio_data, sr, format='WAV')
            buffer.seek(0)
            
            # Convert directly from the buffer
            audio = AudioSegment.from_file(buffer, format='wav')
            audio.export("static/audio/audio.mp3", format='mp3')

    elif mode == "11labs":
        client = ElevenLabs(api_key=config['security']['11labs_key'])
        audio = client.generate(
            text=text,
            voice="Yuna Instant",
            voice_settings=VoiceSettings(stability=0.40, similarity_boost=0.98, style=0.35, use_speaker_boost=True),
            model="eleven_multilingual_v2"
        )
        audio_bytes = b''.join(audio)
        with open("static/audio/audio.mp3", "wb") as f:
            f.write(audio_bytes)

    else:
        raise ValueError("Invalid mode for speaking text")

def chunk_sentences(sentences, max_chars=200):
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chars:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

def generate_speech(text):
    params = {
        "text": text,
        "text_lang": "en",
        "ref_audio_path": "/Users/yuki/Downloads/y-orig.wav",
        "prompt_text": "If you're wondering about our goal, it's a town near the capital of this kingdom",
        "prompt_lang": "en",
        "top_k": 80,
        "top_p": 1,
        "temperature": 1,
        "text_split_method": "cut5",
        "batch_size": 40,
        "batch_threshold": 0.75,
        "split_bucket": True,
        "speed_factor": 1.0,
        "fragment_interval": 0.5,
        "seed": -1,
        "media_type": "wav",
        "streaming_mode": False,
        "parallel_infer": True,
        "repetition_penalty": 1.3
    }

    with torch.no_grad():
        tts_generator = tts_pipeline.run(params)
        sr, audio_data = next(tts_generator)
    return sr, audio_data

def save_and_convert_audio(audio_data, sr, index):
    wav_path = f"static/audio/audio_{index}.wav"
    mp3_path = f"static/audio/audio_{index}.mp3"
    sf.write(wav_path, audio_data, sr)
    audio = AudioSegment.from_wav(wav_path)
    audio.export(mp3_path, format='mp3')
    return mp3_path

def stream_generate_speech(text):
    sentences = re.split('(?<=[.!?]) +', text)
    chunks = chunk_sentences(sentences)
    for index, chunk in enumerate(chunks):
        sr, audio_data = generate_speech(chunk)
        mp3_path = save_and_convert_audio(audio_data, sr, index)
        yield json.dumps({'audio_path': mp3_path}) + '\n'
    yield json.dumps({'status': 'complete'}) + '\n'