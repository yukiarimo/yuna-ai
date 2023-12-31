from selenium import webdriver
from flask import Flask, request
from flask_cors import CORS  # Import the CORS extension

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes in your Flask app

class WebDriverContext:
    def __enter__(self):
        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        self.driver = webdriver.Chrome(options=options)
        return self.driver

    def __exit__(self, exc_type, exc_value, traceback):
        self.driver.quit()

@app.route('/search', methods=['POST'])
def receive_data_enru():
    data = request.get_json()['json']
    print(data)
    data = data.replace(" ", "+")

    with WebDriverContext() as driver:
        driver.get(f"https://www.google.com/search?q={data}&client=safari&rls=en&ei=Cr9AZLLSDN2B0PEP6bC_wAo&oq=stop+it+now&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQARgHMgUILhCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDoKCAAQRxDWBBCwAzoKCAAQigUQsAMQQzoPCC4QigUQyAMQsAMQQxgBOgoILhCKBRCxAxBDOgcILhCKBRBDOggIABCABBCxAzoHCAAQigUQQzoVCC4QigUQsQMQQxDcBBDeBBDgBBgCOhIILhCKBRBDENwEEN4EEOAEGAI6EAguEIAEENwEEN4EEOAEGAJKBAhBGABQmAVY7y5g4VdoAXABeACAAcQBiAGmBpIBAzAuNpgBAKABAcgBEcABAdoBBggBEAEYCNoBBggCEAEYFA&sclient=gws-wiz-serp")

        # wait for the search results to load
        driver.implicitly_wait(10)

        # Extract the entire HTML content
        results = driver.page_source

    return results

if __name__ == '__main__':
    app.run(port=3003)

"""
CRINGE CODE FOR SUMMARIZATION (DO NOT USE)

from transformers import pipeline
import article_parser

summarizer = pipeline("summarization", model="bart-large-cnn")

title, content = article_parser.parse(url="http://www.chinadaily.com.cn/a/202009/22/WS5f6962b2a31024ad0ba7afcb.html", output='markdown', timeout=50)

print(title, summarizer(content, max_length=230, min_length=30, do_sample=False))
"""