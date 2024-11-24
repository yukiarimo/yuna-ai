import json
import os
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

def speak_text(text, reference_audio=config['server']['yuna_reference_audio'], mode=config['server']['yuna_audio_mode']):
    def export_audio(input_file):
        audio = AudioSegment.from_file(input_file)
        audio.export("static/audio/audio.mp3", format="mp3")

    if mode == "siri":
        os.system(f'say -o static/audio/audio.aiff {repr(text)}')
        export_audio("static/audio/audio.aiff")

    elif mode == "siri-pv":
        os.system(f'say -v {reference_audio} -o static/audio/audio.aiff {repr(text)}')
        export_audio("static/audio/audio.aiff")

    elif mode == "native":
        params.update({
            "text": text,
            "ref_audio_path": f"static/audio/{reference_audio}",
        })

        with torch.no_grad():
            tts_generator = tts_pipeline.run(params)
            sr, audio_data = next(tts_generator)
            buffer = io.BytesIO()
            sf.write(buffer, audio_data, sr, format='WAV')
            buffer.seek(0)
            export_audio(buffer)

    elif mode == "11labs":
        client = ElevenLabs(api_key=config['security']['11labs_key'])
        audio_bytes = b''.join(client.generate(text=text, voice="Yuna Instant", voice_settings=VoiceSettings(stability=0.40, similarity_boost=0.98, style=0.35, use_speaker_boost=True), model="eleven_multilingual_v2"))
        with open("static/audio/audio.mp3", "wb") as f: f.write(audio_bytes)

# Generator Function Module
def stream_generate_speech(text, id, output_path):
    sentences = re.split('(?<=[.!?]) +', text)
    chunks, current_chunk = [], ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= 400:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    with torch.no_grad():
        for index, chunk in enumerate(chunks):
            params["text"] = chunk
            tts_generator = tts_pipeline.run(params)
            sr, audio_data = next(tts_generator)
            
            # Generate filenames with project path
            wav_filename = f"chunk_{id}_{index}.wav"
            mp3_filename = f"chunk_{id}_{index}.mp3"
            wav_path = os.path.join(output_path, wav_filename)
            mp3_path = os.path.join(output_path, mp3_filename)
            
            # Save audio files
            sf.write(wav_path, audio_data, sr)
            audio = AudioSegment.from_wav(wav_path)
            audio.export(mp3_path, format='mp3')
            
            # Clean up WAV file
            os.remove(wav_path)
            
            yield json.dumps({
                'id': id,
                'audio_path': mp3_path,
                'chunk_index': index,
                'total_chunks': len(chunks)
            }) + '\n'
    
    yield json.dumps({'status': 'complete'}) + '\n'