function pause(milliseconds) {
    var dt = new Date();
    while ((new Date()) - dt <= milliseconds) {}
}

function speakYuna(txt) {
    const synth = window.speechSynthesis;

    // Get the desired voice configuration
    const voiceConfig = {
        name: 'Samantha',
        lang: 'en-US',
        default: true,
        localService: true,
        voiceURI: 'com.apple.voice.compact.en-US.Samantha'
    };

    // Find the desired voice and set it as the default voice
    const voice = synth.getVoices().find(v => {
        return v.name === voiceConfig.name &&
            v.lang === voiceConfig.lang &&
            v.default === voiceConfig.default &&
            v.localService === voiceConfig.localService &&
            v.voiceURI === voiceConfig.voiceURI;
    });

    synth.cancel();
    const speakText = new SpeechSynthesisUtterance(txt);
    speakText.voice = voice;

    // Set pitch and rate
    speakText.pitch = 1;
    speakText.rate = 1;

    synth.speak(speakText);
}

function sendMSG() {
    var data = document.getElementById('text').value.toString()
    console.log(data)
    fetch('/ai', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: data
            })
        })
        .then((response) => {
            return response.text();
        })
        .then(text => {
            console.log('Success:', JSON.parse(text).message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function yunaListen() {
    var speech = true;
    window.SpeechRecognition = window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;

    let transcript = '';

    recognition.addEventListener('result', e => {
        const interimTranscript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

        transcript = interimTranscript;
    });

    recognition.addEventListener('end', e => {
        console.log(transcript);
        document.getElementById('text').value = transcript
        sendMSG()

        transcript = '';
        if (speech == true) {
            recognition.start();
        }
    });

    if (speech == true) {
        recognition.start();
    }

    // Pause speech recognition when user presses a key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (transcript !== '') {
                recognition.stop();
            }
        }
    });
}

function telegramHelp() {
    var intervalYunaChecker = Number(prompt('What the interval of Yuna telegram checking in seconds?'))

    for (let step = 0; step <= 100; step++) {
        pause(Number(intervalYunaChecker) * 1000)

        fetch('/tg', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: "data"
                })
            })
            .then((response) => {
                return response.text();
            })
            .then(text => {
                console.log('Success:', JSON.parse(text).message);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    localStorage.setItem('mode', '1');
    DarkEnabler();
} else {
    localStorage.setItem('mode', '0');
}

function startGame(game) {
    let myPopup = document.getElementById('games')
    myPopup.style.width = '90%'
    myPopup.style.height = '90%'

    if (game == '1') {
        myPopup.innerHTML = `<iframe src="/games/chess/index.html"></iframe>`
    } else if (game == '2') {

    } else if (game == '2') {

    }
}

// Select the container element for the chat messages
const messageContainer = document.querySelector('.message-container');

function viewMessages() {
    messageContainer.innerHTML = ''
    // Fetch the messages from the JSON file
    fetch('/db/dialog.json')
        .then(response => response.json())
        .then(data => {
            // Loop through the messages and generate the message bubbles
            data.messages.forEach(message => {
                const messageBubble = document.createElement('div');
                messageBubble.classList.add(message.sender === 'user' ? 'user-message' : 'other-message');
                messageBubble.innerHTML = `<div class="message-bubble">${message.content}</div>`;
                messageContainer.appendChild(messageBubble);
            });
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
        });

}

viewMessages()