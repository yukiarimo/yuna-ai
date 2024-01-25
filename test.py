from flask import Flask, send_from_directory
from flask_sock import Sock
import time
import os

app = Flask(__name__)
sock = Sock(app)

@app.route('/')
def index():
    return send_from_directory('.', 'test.html')

@sock.route('/counter')
def counter(ws):
    print("Client connected, starting to count.")
    ws.send("Welcome! Counting will start shortly.")
    time.sleep(3)  # Welcome message delay
    for number in range(1, 101):
        if ws.closed:
            print(f"Client disconnected, stopped counting at {number}")
            break
        ws.send(str(number))
        print(f"Sent number {number}")
        time.sleep(1)  # One second delay between numbers
    print("Finished counting or client disconnected.")

if __name__ == '__main__':
    app.run(debug=True)