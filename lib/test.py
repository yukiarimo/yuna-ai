from trafilatura import fetch_url, extract
from agiTextWorker import agiTextWorker

url = 'https://zapier.com/blog/how-to-use-chatgpt/'
downloaded = fetch_url(url)

result = extract(downloaded)
result = str(result)

# save the result to a file
with open('output.txt', 'w') as f:
    f.write(result)

# process the file with the agiTextWorker
worker = agiTextWorker()
response = worker.processTextFile('output.txt', 'Question: How to use chatgpt. Instruction: Please summarize this article with bullet points shortly.')
print(response)