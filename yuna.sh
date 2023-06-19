#!/bin/bash

# Servers

# ----- yuna-hendlers ------

# 3000 - yuna.js main
# 3009 - yuna telegram

# ----- yuna-core ------

# 3001 - ai
# 3002 - Neo-gpt
# 3003 - search
# 3004 - vision
# 3005 - qna
# 3006 - translate
# 3007 - generate
# 3008 - classify

# Run main
osascript -e 'tell application "Terminal" to do script "cd /Volumes/Yuki\\ 1/Work/Projects/Yuna/app && node yuna"'

# Run telegram
osascript -e 'tell application "Terminal" to do script "cd /Volumes/Yuki\\ 1/Work/Projects/Yuna/app/yuna-lib/yuna-tg && node index"'

# Run core
osascript -e 'tell application "Terminal" to do script "cd /Volumes/Yuki\\ 1/Work/Projects/Yuna/app/yuna-lib/yuna-core && conda activate /Users/yuki/miniconda/envs/tf && python index.py"'

# Run lang
osascript -e 'tell application "Terminal" to do script "cd /Volumes/Yuki\\ 1/Work/Projects/Yuna/app/yuna-lib/yuna-lang && conda activate /Users/yuki/miniconda/envs/tf && python index.py"'