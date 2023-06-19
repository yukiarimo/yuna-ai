from transformers import pipeline
import article_parser

summarizer = pipeline("summarization", model="bart-large-cnn")

title, content = article_parser.parse(url="http://www.chinadaily.com.cn/a/202009/22/WS5f6962b2a31024ad0ba7afcb.html", output='markdown', timeout=50)

print(title, summarizer(content, max_length=230, min_length=30, do_sample=False))