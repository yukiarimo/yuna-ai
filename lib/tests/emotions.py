import requests
import json

class YunaLLM:
    def __init__(self):
        self.url = "http://localhost:1234/v1/chat/completions"
        self.headers = {"Content-Type": "application/json"}

    def generateTextFromPrompt(self, prompt, message):
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": message}
        ]

        # save to a file
        with open('messages.json', 'w') as f:
            json.dump(messages, f)

        dataSendAPI = {
            "model": "/Users/yuki/Documents/Github/yuna-ai/lib/models/yuna/yukiarimo/yuna-ai/yuna-ai-v3-q6_k.gguf",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 64,
            "stop": ["###", "\n"],
            "top_p": 0.9,
            "top_k": 60,
            "min_p": 0,
            "presence_penalty": 0,
            "frequency_penalty": 0,
            "logit_bias": {},
            "repeat_penalty": 1.1,
            "seed": -1,
        }

        response = requests.post(self.url, headers=self.headers, json=dataSendAPI, stream=False)

        if response.status_code == 200:
            response_json = json.loads(response.text)
            response_text = response_json.get('choices', [{}])[0].get('message', {}).get('content', '')
            return response_text
        else:
            return "Error: Unable to generate a response."

class EmotionalProfile:
    def __init__(self):
        self.emotions = {
            "Affection": 0,
            "Anger": 0,
            "Sadness": 0,
            "Happiness": 40
        }
        self.emotion_triggers = {
            "Cuddling": {"Affection": 10, "Happiness": 5},
            "Compliments": {"Happiness": 10, "Affection": 5, "Anger": -10, "Sadness": -5},
            "Insults": {"Anger": 15, "Affection": -10, "Happiness": -10},
            "Neglect": {"Sadness": 10, "Affection": -5},
            "Playtime": {"Happiness": 10, "Affection": 5},
            "Disobedience": {"Anger": 10, "Sadness": 5}
        }
        self.emotion_thresholds = {
            "Affection": {"Distant": 20, "Normal": 70, "Clingy": 100},
            "Anger": {"Calm": 30, "Irritated": 60, "Furious": 100},
            "Sadness": {"Content": 30, "Sad": 60, "Depressed": 100},
            "Happiness": {"Unhappy": 20, "Normal": 70, "Ecstatic": 100}
        }

    def update_emotions(self, triggered_emotions):
        for emotion, value in triggered_emotions.items():
            self.emotions[emotion] = max(0, min(100, self.emotions[emotion] + value))

    def get_emotional_state(self):
        state = {}
        for emotion, value in self.emotions.items():
            thresholds = self.emotion_thresholds[emotion]
            for threshold, limit in thresholds.items():
                if value < limit:
                    state[emotion] = threshold
                    break
            else:
                state[emotion] = list(thresholds.keys())[-1]
        return state

    def generate_behavior_prompt(self, emotional_state):
        prompt = "### Current emotional state:\n\n"
        for emotion, state in emotional_state.items():
            prompt += f"- {emotion}: {state}\n"
        prompt += "\nPlease behave according to your current emotional state."
        return prompt

def process_user_input(user_input, emotional_profile, llm, previous_response):
    # Generate a behavior prompt based on Yuna's current emotional state
    emotional_state = emotional_profile.get_emotional_state()
    behavior_prompt = emotional_profile.generate_behavior_prompt(emotional_state)

    # Generate Yuna's response using the LLM
    dialogue_turn = f"### Dialogue Turn:\nYuna: {previous_response}\nYuki: {user_input}\nYuna:"
    response_prompt = f"{behavior_prompt}\n\n{dialogue_turn}"
    response = llm.generateTextFromPrompt(response_prompt, " ")

    # Analyze the response and update Yuna's emotional state
    update_prompt = f"### Dialogue Turn:\nYuna: {previous_response}\nYuki: {user_input}\nYuna: {response}\n\n### Current emotional state:\n{emotional_profile.get_emotional_state()}\n\n### Instruction:\nPlease analyze the user's message and respond accordingly. Please state the value that you're going to change and the amount of change based on the pseudo idea. For example:\nAffection += 10\nHappiness += 5\nAnger -= 10\nSadness -= 5\n\n### Response:"
    update_response = llm.generateTextFromPrompt(update_prompt, " ")

    # Parse the update response and update Yuna's emotional state
    triggered_emotions = {}
    for line in update_response.split("\n"):
        if "+=" in line or "-=" in line:
            emotion, change = line.split(" ")
            triggered_emotions[emotion] = int(change.split("=")[-1])
    emotional_profile.update_emotions(triggered_emotions)

    return response

# Usage example
emotional_profile = EmotionalProfile()
llm = YunaLLM()
previous_response = ""

while True:
    user_input = input("User: ")
    if user_input.lower() == "quit":
        break

    yuna_response = process_user_input(user_input, emotional_profile, llm, previous_response)
    print("Yuna:", yuna_response)
    previous_response = yuna_response
