import json
import re
import requests
from flask_login import current_user

def get_config(config_path='static/config.json', config=None):
    mode = 'r' if config is None else 'w'
    with open(config_path, mode) as f:
        return json.load(f) if config is None else json.dump(config, f, indent=4)

from lib.history import ChatHistoryManager

# Conditional imports based on yuna_text_mode
def load_conditional_imports(config):
    mode = config["server"].get("yuna_text_mode")
    if config["ai"].get("agi"):
        from langchain_community.document_loaders import TextLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain_community.vectorstores import Chroma
        from langchain_huggingface import HuggingFaceEmbeddings
        from langchain.chains import RetrievalQA
        from langchain_community.llms import LlamaCpp
        globals().update({
            'TextLoader': TextLoader,
            'RecursiveCharacterTextSplitter': RecursiveCharacterTextSplitter,
            'Chroma': Chroma,
            'HuggingFaceEmbeddings': HuggingFaceEmbeddings,
            'RetrievalQA': RetrievalQA,
            'LlamaCpp': LlamaCpp
        })
    elif mode == "native":
        print("Loading Llama from llama_cpp")
        from llama_cpp import Llama
        globals().update({'Llama': Llama})

config_agi = get_config()
if config_agi.get("server", {}).get("yuna_text_mode") in {"agi", "native"}: load_conditional_imports(config_agi)

class ChatGenerator:
    def __init__(self, config):
        self.config = config
        self.model = Llama(
            model_path=f"lib/models/yuna/{config['server']['yuna_default_model']}",
            n_ctx=config["ai"]["context_length"],
            last_n_tokens_size=config["ai"]["last_n_tokens_size"],
            seed=config["ai"]["seed"],
            n_batch=config["ai"]["batch_size"],
            n_gpu_layers=config["ai"]["gpu_layers"],
            n_threads=config["ai"]["threads"],
            use_mmap=config["ai"]["use_mmap"],
            use_mlock=config["ai"]["use_mlock"],
            flash_attn=config["ai"]["flash_attn"],
            offload_kqv=config["ai"]["offload_kqv"],
            verbose=False
        ) if config["server"]["yuna_text_mode"] == "native" else None

    def generate(self, chat_id=None, speech=False, text="", kanojo=None, chat_history_manager=None, useHistory=True, yunaConfig=None, stream=False):
        print(f'chat_id -> {chat_id}, speech -> {speech}, text -> {text}, kanojo -> {kanojo}, '
              f'chat_history_manager -> {chat_history_manager.load_chat_history(current_user.get_id(), chat_id)}, '
              f'useHistory -> {useHistory}, yunaConfig -> {yunaConfig}, stream -> {stream}')

        self.config = yunaConfig or self.config
        chat_history = chat_history_manager.load_chat_history(current_user.get_id(), chat_id)
        response = ''

        mode = self.config["server"]["yuna_text_mode"]
        if mode in {"native", "fast"}:
            final_prompt = self.construct_prompt(text, kanojo, chat_history, yunaConfig, mode)
            if mode == "native":
                response = self.model(
                    final_prompt,
                    stream=stream,
                    top_k=yunaConfig["ai"]["top_k"],
                    top_p=yunaConfig["ai"]["top_p"],
                    temperature=yunaConfig["ai"]["temperature"],
                    repeat_penalty=yunaConfig["ai"]["repetition_penalty"],
                    max_tokens=yunaConfig["ai"]["max_new_tokens"],
                    stop=yunaConfig["ai"]["stop"],
                )
                return (chunk['choices'][0]['text'] for chunk in response) if stream else self.clearText(str(response['choices'][0]['text']))
            elif mode == "fast":
                dataSendAPI = {
                    "model": f"/Users/yuki/Documents/Github/yuna-ai/lib/models/yuna/yukiarimo/yuna-ai/yuna-ai-v3-q6_k.gguf",
                    "messages": self.get_history_text(chat_history, text, useHistory, yunaConfig),
                    "temperature": yunaConfig["ai"]["temperature"],
                    "max_tokens": -1,
                    "stop": yunaConfig["ai"]["stop"],
                    "top_p": yunaConfig["ai"]["top_p"],
                    "top_k": yunaConfig["ai"]["top_k"],
                    "min_p": 0,
                    "presence_penalty": 0,
                    "frequency_penalty": 0,
                    "logit_bias": {},
                    "repeat_penalty": yunaConfig["ai"]["repetition_penalty"],
                    "seed": yunaConfig["ai"]["seed"]
                }
                response = requests.post("http://localhost:1234/v1/chat/completions", headers={"Content-Type": "application/json"}, json=dataSendAPI, stream=stream)
                if response.status_code == 200:
                    resp = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
                    return ''.join(resp) if stream else self.clearText(resp)
                print(f"Request failed with status code: {response.status_code}")
        elif mode == "kobold":
            return self.handle_kobold_mode(text, kanojo, chat_history, yunaConfig, stream)
        return response

    def construct_prompt(self, text, kanojo, chat_history, yunaConfig, mode):
        if kanojo:
            tokens = self.model.tokenize(kanojo.encode('utf-8'))
            history_text = self.get_history_text(chat_history, text, useHistory=True, yunaConfig=yunaConfig)
            max_tokens = yunaConfig["ai"]["context_length"] - len(tokens) - yunaConfig["ai"]["max_new_tokens"]
            tokens_history = self.model.tokenize(history_text.encode('utf-8'))
            if len(tokens_history) > max_tokens:
                tokens_history = tokens_history[-max_tokens:]
                history_text = self.model.detokenize(tokens_history).decode('utf-8')
            return self.model.detokenize(tokens).decode('utf-8') + history_text
        return text

    def handle_kobold_mode(self, text, kanojo, chat_history, yunaConfig, stream):
        messages = self.get_history_text(chat_history, text, useHistory=True, yunaConfig=yunaConfig)
        formatted_prompt = f"{kanojo}{messages}" if kanojo else messages
        call_api = {
            "n": 1,
            "max_context_length": yunaConfig["ai"]["context_length"],
            "max_length": yunaConfig["ai"]["max_new_tokens"],
            "rep_pen": yunaConfig["ai"]["repetition_penalty"],
            "temperature": yunaConfig["ai"]["temperature"],
            "top_p": yunaConfig["ai"]["top_p"],
            "top_k": yunaConfig["ai"]["top_k"],
            "top_a": 0,
            "typical": 1,
            "tfs": 1,
            "rep_pen_range": 360,
            "rep_pen_slope": 0.7,
            "sampler_order": [6, 0, 1, 3, 4, 2, 5],
            "memory": kanojo,
            "trim_stop": True,
            "genkey": "KCPP3164",
            "min_p": 0,
            "dynatemp_range": 0,
            "dynatemp_exponent": 1,
            "smoothing_factor": 0,
            "banned_tokens": [],
            "render_special": True,
            "presence_penalty": 0,
            "logit_bias": {key: -100 for key in [38]},
            "prompt": formatted_prompt,
            "quiet": True,
            "stop_sequence": yunaConfig["ai"]["stop"],
            "use_default_badwordsids": False,
            "bypass_eos": False,
        }
        url = "http://localhost:5001/api/extra/generate/stream/" if stream else "http://localhost:5001/api/v1/generate/"
        response = requests.post(url, headers={"Content-Type": "application/json"}, json=call_api, stream=stream)
        
        if response.status_code == 200:
            if stream:
                def stream_generator():
                    for line in response.iter_lines():
                        if line:
                            decoded_line = line.decode('utf-8')
                            if decoded_line.startswith('data: '):
                                data = json.loads(decoded_line[6:])
                                yield data['token']
                return stream_generator()
            else:
                resp = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
                return self.clearText(resp)
        print(f"Request failed with status code: {response.status_code}")
        return ''

    def processTextFile(self, text_file, question, temperature):
        loader, splitter = TextLoader(text_file), RecursiveCharacterTextSplitter(chunk_size=200)
        docs = splitter.split_documents(loader.load())
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = Chroma.from_documents(documents=docs, embedding=embeddings)
        llm = LlamaCpp(model_path="lib/models/yuna/yuna-ai-v3-q5_k_m.gguf", temperature=temperature, verbose=False)
        qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=vectorstore.as_retriever())
        return qa.invoke(question).get('result', '')

    def get_history_text(self, chat_history, text, useHistory, yunaConfig):
        user_name = yunaConfig["ai"]["names"][0].lower()
        assistant_name = yunaConfig["ai"]["names"][1].lower()
        
        history = ''.join([
            f"<yuki>{item.get('message', '')}</yuki>\n" if item.get('name', '').lower() == user_name else f"<yuna>{item.get('message', '')}</yuna>\n"
            for item in chat_history
        ]) if useHistory else ''
        
        return f"{history}<yuki>{text}</yuki>\n<yuna>"

    def clearText(self, text):
        text = text.replace('</yuki>', '').replace('</yuna>', '').replace('<yuki>', '').replace('<yuna>', '')
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF]+', '', text)
        text = re.sub(r':-?\)|:-?\(|;-?\)|:-?D|:-?P', '', text)
        return ' '.join(text.split()).strip()