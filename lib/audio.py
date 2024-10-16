import json
import os
import torch
import torchaudio
from pydub import AudioSegment
from transformers import pipeline
import re
import numpy as np
from multiprocessing import Process, Pipe
from transformers import pipeline, SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan


yunaListen = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-tiny",
    torch_dtype=torch.float32,
    device="mps",  # or mps for Mac devices
    model_kwargs={"attn_implementation": "sdpa"},
)

XTTS_MODEL = None

with open('static/config.json', 'r') as config_file:
    config = json.load(config_file)

if config['server']['yuna_audio_mode'] == "coqui":
    from TTS.tts.configs.xtts_config import XttsConfig
    from TTS.tts.models.xtts import Xtts

if config['server']['yuna_audio_mode'] == "11labs":
    from elevenlabs import VoiceSettings
    from elevenlabs.client import ElevenLabs

def load_speecht5_in_process(config, conn):
    from load_speecht5 import load_speecht5
    vocoder, processor, model, speaker_model = load_speecht5(config)
    conn.send((vocoder, processor, model, speaker_model))
    conn.close()

if config['server']['yuna_audio_mode'] == "native":
    parent_conn, child_conn = Pipe()
    p = Process(target=load_speecht5_in_process, args=(config, child_conn))
    p.start()
    vocoder, processor, model, speaker_model = parent_conn.recv()
    p.join()

    import soundfile as sf
    import librosa
    from datasets import Dataset, Audio

    def create_speaker_embedding(waveform):
        with torch.no_grad():
            waveform_tensor = torch.tensor(waveform).unsqueeze(0).to(torch.float32)
            speaker_embeddings = speaker_model.encode_batch(waveform_tensor)
            speaker_embeddings = torch.nn.functional.normalize(speaker_embeddings, dim=2)
            speaker_embeddings = speaker_embeddings.squeeze().cpu().numpy()
        return speaker_embeddings

    audio_array, sampling_rate = librosa.load("/Users/yuki/Documents/Github/yuna-ai/static/audio/" + config["server"]["yuna_reference_audio"], sr=16000)

    # Create a dictionary to mimic the dataset structure
    custom_audio = {
        "array": audio_array,
        "sampling_rate": sampling_rate
    }

    # Create a Dataset object with the custom audio
    dataset = Dataset.from_dict({"audio": [custom_audio]})

    # Use the custom audio in the rest of the code
    example = dataset[0]
    audio = example["audio"]

    # Create speaker embedding
    speaker_embeddings = create_speaker_embedding(audio["array"])
    speaker_embeddings = torch.tensor(speaker_embeddings).unsqueeze(0).to(torch.float32)

def transcribe_audio(audio_file):
    result = yunaListen(
        audio_file,
        chunk_length_s=30,
        batch_size=24,
        return_timestamps=False,
    )
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
    if mode == "coqui":
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
            result = speak_text(chunk, reference_audio, audio_file, "coqui")
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
    elif mode == "siri":
        command = f'say -o /Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff {repr(text)}'
        exit_status = os.system(command)

        # convert audio to mp3
        audio = AudioSegment.from_file("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff")
        audio.export("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.mp3", format='mp3')
    elif mode == "siri-pv":
        command = f'say -v {config["server"]["yuna_reference_audio"]} -o /Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff {repr(text)}'
        print(command)
        exit_status = os.system(command)

        # convert audio to mp3
        audio = AudioSegment.from_file("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.aiff")
        audio.export("/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.mp3", format='mp3')
    elif mode == "native":
        inputs = processor(text=text, return_tensors="pt")
        spectrogram = model.generate_speech(inputs["input_ids"], speaker_embeddings)

        with torch.no_grad():
            speech = vocoder(spectrogram)

        # Save the output as a WAV file
        wav_path = "/Users/yuki/Documents/Github/yuna-ai/static/audio/audio.wav"
        sf.write(wav_path, speech.cpu().numpy(), samplerate=16000)

        # Convert WAV to MP3
        audio = AudioSegment.from_wav(wav_path)
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

if config['server']['yuna_audio_mode'] == "coqui":
    xtts_checkpoint = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/yuna-talk.pth"
    xtts_config = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/config.json"
    xtts_vocab = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/vocab.json"
    load_model(xtts_checkpoint, xtts_config, xtts_vocab)

def split_into_sentences(text):
    """Split text into sentences."""
    sentences = re.split('(?<=[.!?]) +', text)
    return sentences

def chunk_sentences(sentences, max_chars=200):
    """Chunk sentences into groups not exceeding max_chars."""
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

def generate_native_speech(text, embedding_path, processor, model, vocoder):
    """
    Generate speech audio from text using the provided models and embeddings.
    """
    # Load precomputed speaker embeddings
    speaker_embeddings = np.load(embedding_path)
    speaker_embeddings = torch.tensor(speaker_embeddings).unsqueeze(0).to(torch.float32)

    inputs = processor(text=text, return_tensors="pt")
    spectrogram = model.generate_audiobook(inputs["input_ids"], speaker_embeddings)

    with torch.no_grad():
        speech = vocoder(spectrogram)

    return speech.cpu().numpy()

def save_and_convert_audio(speech_array, index):
    """
    Save the speech array as WAV and convert it to MP3.
    """
    wav_path = f"static/audio/audio_{index}.wav"
    mp3_path = f"static/audio/audio_{index}.mp3"

    # Save WAV
    sf.write(wav_path, speech_array, samplerate=16000)

    # Convert to MP3
    audio = AudioSegment.from_wav(wav_path)
    audio.export(mp3_path, format='mp3')

    return wav_path, mp3_path

def process_chunk(chunk, index, embedding_path, processor, model, vocoder):
    """
    Process a single text chunk: generate speech and save audio.
    """
    print(f"Processing chunk {index+1}: {chunk}")
    speech_array = generate_native_speech(chunk, embedding_path, processor, model, vocoder)
    wav_path, mp3_path = save_and_convert_audio(speech_array, index)
    print(f"Chunk {index+1} processed.")
    return mp3_path

def stream_generate_speech(text, embedding_path):
    """
    Generator function to process text and yield audio paths incrementally.
    Processes chunks sequentially to maintain order.
    """
    # Load models and processor outside the loop for efficiency
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
    processor = SpeechT5Processor.from_pretrained("lib/models/agi/voice/yuna-ai-voice-v1/")
    model = SpeechT5ForTextToSpeech.from_pretrained("lib/models/agi/voice/yuna-ai-voice-v1/")

    sentences = split_into_sentences(text)
    chunks = chunk_sentences(sentences)

    for index, chunk in enumerate(chunks):
        mp3_path = process_chunk(chunk, index, embedding_path, processor, model, vocoder)
        # Yield the path as a JSON string followed by a newline for streaming
        yield json.dumps({'audio_path': mp3_path}) + '\n'

    # Indicate completion
    yield json.dumps({'status': 'complete'}) + '\n'