from selenium import webdriver
from flask import Flask, request
import json

options = webdriver.ChromeOptions()
options.add_argument('headless')  # run Chrome in headless mode
driver = webdriver.Chrome(options=options)

app = Flask(__name__)

@app.route('/search', methods=['POST'])
def receive_data_enru():
    data = request.get_json()['json']
    print(data)
    data = data.replace(" ", "+")

    driver.get(f"https://www.google.com/search?q={data}&client=safari&rls=en&ei=Cr9AZLLSDN2B0PEP6bC_wAo&oq=stop+it+now&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQARgHMgUILhCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDoKCAAQRxDWBBCwAzoKCAAQigUQsAMQQzoPCC4QigUQyAMQsAMQQxgBOgoILhCKBRCxAxBDOgcILhCKBRBDOggIABCABBCxAzoHCAAQigUQQzoVCC4QigUQsQMQQxDcBBDeBBDgBBgCOhIILhCKBRBDENwEEN4EEOAEGAI6EAguEIAEENwEEN4EEOAEGAJKBAhBGABQmAVY7y5g4VdoAXABeACAAcQBiAGmBpIBAzAuNpgBAKABAcgBEcABAdoBBggBEAEYCNoBBggCEAEYFA&sclient=gws-wiz-serp")

    # wait for the search results to load
    driver.implicitly_wait(10)

    # execute the script on the page to extract the search results
    results = driver.execute_script("""
        var value = document.querySelector('.kno-rdesc');
        var links = document.querySelectorAll('.yuRUbf > a');
        var titles = document.querySelectorAll('.LC20lb.DKV0Md');
        var descriptions = document.querySelectorAll('.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf > span:last-of-type');

        var answer;
        var resultLinks = [];

        if (value) {
            var valueNode = value.querySelector('.Uo8X3b.OhScic.zsYMMe:first-of-type');
            if (valueNode) {
                answer = valueNode.innerText;
            } else {
                answer = value.innerText;
            }

            links.forEach(function(link, i) {
                if (i < 5) {
                    var title = titles[i] ? titles[i].innerText : '';
                    var desc = descriptions[i] ? descriptions[i].innerText : '';
                    resultLinks.push({ 'title': title, 'desc': desc, 'link': link.href });
                }
            });
        } else {
            value = document.querySelector('.hgKElc');
            if (value) {
                answer = value.innerText;
            } else {
                answer = "I don't know";
            }

            links.forEach(function(link, i) {
                if (i < 5) {
                    var title = titles[i] ? titles[i].innerText : '';
                    var desc = descriptions[i] ? descriptions[i].innerText : '';
                    resultLinks.push({ 'title': title, 'desc': desc, 'link': link.href });
                }
            });
        }

        return JSON.stringify([{ 'answer': answer, 'links': resultLinks }]);
    """)

    # print the results
    print(results)

    driver.quit()

    return results

"""
CRINGE CODE FOR SUMMARIZATION (DO NOT USE)

from transformers import pipeline
import article_parser

summarizer = pipeline("summarization", model="bart-large-cnn")

title, content = article_parser.parse(url="http://www.chinadaily.com.cn/a/202009/22/WS5f6962b2a31024ad0ba7afcb.html", output='markdown', timeout=50)

print(title, summarizer(content, max_length=230, min_length=30, do_sample=False))
"""

if __name__ == '__main__':
    app.run(port=3003)