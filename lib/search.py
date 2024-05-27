import requests

def search_web(search_query, url, processData):
    if processData == False:
        # Send a GET request to the URL with additional headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        }

        response = requests.get(url, headers=headers)

        # Get the HTML content from the response
        html_content = response.text

        # Return the HTML content as plain text
        return html_content, 200, {'Content-Type': 'text/plain'}
    elif processData == True:
        from trafilatura import fetch_url, extract
        from agiTextWorker import agiTextWorker

        downloaded = fetch_url(url)

        result = extract(downloaded)
        result = str(result)

        # save the result to a file
        with open('output.txt', 'w') as f:
            f.write(result)

        # process the file with the agiTextWorker
        worker = agiTextWorker()
        response = worker.processTextFile('output.txt', f'Question: {search_query}. Instruction: Please summarize this article with bullet points shortly.')
        return response
 #   elif processData == "YouTube":
        # run js script on the page for a specific url
