from pydub import AudioSegment

# Create a silence audio of 1 second
silence = AudioSegment.silent(duration=1000)  # duration in milliseconds

# Initialize the output audio
output = AudioSegment.empty()

# Loop over the audio files
for i in range(1, 54):
    # Load an audio file
    audio = AudioSegment.from_wav(f"./../static/audio/response_{i}.wav")
    
    # Append the audio and silence to the output
    output += audio + silence

# Remove the last silence from the output
output = output[:-1000]

# Export the output audio
output.export("outputf.wav", format="wav")