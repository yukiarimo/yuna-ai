from transformers import pipeline

generator = pipeline('text-generation', model='./text/gpt-neo/1.3B/')

while True:
    input('press enter to continue...')
    # read input question from file
    with open('input.txt', 'r') as f:
        userInput = f.read()

    maxlengthoftext = input('what is amount: ')

    # generate response
    result = generator(userInput, do_sample=True, max_length=int(maxlengthoftext))

    # write response to file
    with open('output.txt', 'w') as f:
        f.write(result[0]['generated_text'])