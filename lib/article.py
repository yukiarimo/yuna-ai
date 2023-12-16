
import article_parser

title, content = article_parser.parse(url="https://www.animesenpai.net/cute-anime-girls/", output='markdown', timeout=50)

print(title, content)