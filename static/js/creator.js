// Get the necessary elements
const nakedWorkArea = document.getElementById('naked-work-area');
const articlePromptTemplate = document.getElementById('article-prompt-template');
const articleUserInput = document.getElementById('article-user-input');
const articleOutputText = document.getElementById('article-output-text');
const articleDraftText = document.getElementById('article-draft-text');

const sendCreateNakedButton = document.getElementById('send-create-naked');
const sendCreateArticleButton = document.getElementById('send-create-article');
const copyToDraftButton = document.getElementById('copy-to-draft');

// Shared function to send messages
async function sendMessage(content, outputElement) {
    // Clear the output element before starting
    if (outputElement) {
        outputElement.value = '';
    }

    // Send the message using the messageManagerInstance
    await messageManagerInstance.sendMessage(
        content, // message
        false, // kanojo
        '', // imageData
        '/message', // url
        true, // naked
        true, // stream
        outputElement
    );
}

// Function for Naked tab
function sendNakedRequest() {
    activeElement = nakedWorkArea;
    sendMessage(nakedWorkArea.value, nakedWorkArea);
}

// Function for Article tab
function sendArticleRequest() {
    const combinedContent = `${articlePromptTemplate.value}\n\n${articleUserInput.value}`;
    sendMessage(combinedContent, articleOutputText);
}

// Function to copy the output text to the draft text area
function copyToDraft() {
    articleDraftText.value = articleOutputText.value;
}

// Add event listeners to the buttons
sendCreateNakedButton.addEventListener('click', sendNakedRequest);
sendCreateArticleButton.addEventListener('click', sendArticleRequest);
copyToDraftButton.addEventListener('click', copyToDraft);

// presentation maker renderers
// Initialize Elements
const markdownInput = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const saveButton = document.getElementById('save-button');
const exportButton = document.getElementById('export-button');
const clearButton = document.getElementById('clear-button');

// Configure Marked for better parsing
marked.setOptions({
    breaks: true,
    gfm: true,
});

// Load Markdown from LocalStorage
window.onload = function () {
    const savedMarkdown = localStorage.getItem('presentationMarkdown');
    if (savedMarkdown) {
        markdownInput.value = savedMarkdown;
    }
    renderPreview();
};

// Save Presentation to LocalStorage
saveButton.addEventListener('click', () => {
    localStorage.setItem('presentationMarkdown', markdownInput.value);
    alert('Presentation saved!');
});

// Clear Presentation
clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the presentation?')) {
        markdownInput.value = '';
        preview.innerHTML = '';
        localStorage.removeItem('presentationMarkdown');
    }
});

// Handle Markdown Input for Preview
markdownInput.addEventListener('input', () => {
    renderPreview();
});

// Render Preview
function renderPreview() {
    const rawMarkdown = markdownInput.value;
    const slides = rawMarkdown.split(/^---$/m);
    preview.innerHTML = '';

    slides.forEach(slide => {
        const slideContainer = document.createElement('div');
        slideContainer.classList.add('slide-container', 'mb-4', 'p-3', 'border', 'rounded');

        const html = marked.parse(slide);
        slideContainer.innerHTML = html;

        preview.appendChild(slideContainer);
    });
}

// Export to PPTX
exportButton.addEventListener('click', exportPPTX);

function exportPPTX() {
    const pptx = new PptxGenJS();

    // Define a layout
    pptx.defineLayout({
        name: 'LAYOUT_WIDE',
        width: 13.33,
        height: 7.5
    });

    // Set the layout for the presentation
    pptx.layout = 'LAYOUT_WIDE';

    const rawMarkdown = markdownInput.value;
    const slides = rawMarkdown.split(/^---$/m);

    slides.forEach((slideMarkdown, index) => {
        const slideObj = pptx.addSlide();

        // Parse the slide Markdown into tokens
        const tokens = marked.lexer(slideMarkdown);

        let yOffset = 0.5; // Initial Y offset
        const margin = 0.5;
        const slideWidth = 13.33; // Width of the defined layout

        // Iterate through tokens
        tokens.forEach(token => {
            switch (token.type) {
                case 'heading':
                    slideObj.addText(token.text, {
                        x: margin,
                        y: yOffset,
                        w: slideWidth - 2 * margin,
                        fontSize: getFontSize(token.depth),
                        bold: token.depth === 1 || token.depth === 2,
                        color: '363636',
                        breakLine: true,
                    });
                    yOffset += getFontSize(token.depth) / 72 + 0.2; // Approximate line height
                    break;

                case 'paragraph':
                    const paragraphData = parseInlineStyles(token.text);
                    slideObj.addText(paragraphData, {
                        x: margin,
                        y: yOffset,
                        w: slideWidth - 2 * margin,
                        fontSize: 14,
                        color: '363636',
                        breakLine: true,
                        hyperlinkClick: getHyperlinks(token.text),
                    });
                    yOffset += calculateTextHeight(paragraphData, slideWidth - 2 * margin, 14) + 0.1;
                    break;

                case 'blockquote':
                    slideObj.addShape(pptx.ShapeType.rect, {
                        x: margin + 0.2,
                        y: yOffset,
                        w: slideWidth - 2 * margin - 0.4,
                        h: 0.4,
                        fill: {
                            color: 'D3D3D3'
                        },
                        line: {
                            color: 'D3D3D3'
                        },
                    });
                    slideObj.addText(parseInlineText(token.text), {
                        x: margin + 0.4,
                        y: yOffset,
                        w: slideWidth - 2 * margin - 0.6,
                        fontSize: 12,
                        italic: true,
                        color: '555555',
                        breakLine: true,
                    });
                    yOffset += 0.5;
                    break;

                case 'list':
                    const listOptions = {
                        x: margin + 0.2,
                        y: yOffset,
                        w: slideWidth - 2 * margin - 0.4,
                        fontSize: 14,
                        color: '363636',
                        bullet: true,
                        indent: 0.3,
                    };
                    if (token.ordered) {
                        listOptions.bullet = {
                            type: 'number'
                        };
                    }
                    token.items.forEach(item => {
                        const itemData = parseInlineStyles(item.text);
                        slideObj.addText(itemData, listOptions);
                        yOffset += calculateTextHeight(itemData, slideWidth - 2 * margin - 0.4 - 0.3, 14) + 0.05;
                    });
                    break;

                case 'code':
                    slideObj.addText(token.text, {
                        x: margin,
                        y: yOffset,
                        w: slideWidth - 2 * margin,
                        fontSize: 12,
                        fontFace: 'Courier New',
                        color: '555555',
                        fill: {
                            color: 'F5F5F5'
                        },
                        border: {
                            type: 'solid',
                            color: 'D3D3D3'
                        },
                        breakLine: true,
                    });
                    yOffset += 0.6;
                    break;

                case 'hr':
                    slideObj.addShape(pptx.ShapeType.line, {
                        x: margin,
                        y: yOffset + 0.1,
                        w: slideWidth - 2 * margin,
                        h: 0,
                        line: {
                            color: 'C0C0C0',
                            w: 1
                        },
                    });
                    yOffset += 0.3;
                    break;

                default:
                    break;
            }
        });
    });

    pptx.writeFile({
        fileName: "Presentation.pptx"
    });
}

// Helper Functions

// Determine font size based on heading level
function getFontSize(depth) {
    switch (depth) {
        case 1:
            return 32;
        case 2:
            return 28;
        case 3:
            return 24;
        case 4:
            return 20;
        case 5:
            return 16;
        case 6:
            return 14;
        default:
            return 14;
    }
}

// Parse inline styles for bold, italic, underline, strikethrough, and links
function parseInlineStyles(text) {
    const inlineTokens = marked.lexer(text, {
        gfm: true,
        breaks: false
    });

    let richText = [];
    inlineTokens.forEach(token => {
        switch (token.type) {
            case 'strong':
                richText.push({
                    text: token.text,
                    bold: true
                });
                break;
            case 'em':
                richText.push({
                    text: token.text,
                    italic: true
                });
                break;
            case 'codespan':
                richText.push({
                    text: token.text,
                    fontFace: 'Courier New',
                    color: '555555',
                    italic: true
                });
                break;
            case 'link':
                richText.push({
                    text: token.text,
                    hyperlink: token.href,
                    color: '0000FF',
                    underline: true
                });
                break;
            case 'br':
                richText.push({
                    text: '\n'
                });
                break;
            default:
                if (typeof token === 'string') {
                    richText.push({
                        text: token
                    });
                } else if (token.type === 'text') {
                    richText.push({
                        text: token.text
                    });
                }
                break;
        }
    });

    return richText;
}

// Extract hyperlinks for entire paragraph (simplistic approach)
function getHyperlinks(text) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let hyperlinks = {};
    while ((match = regex.exec(text)) !== null) {
        hyperlinks[match[1]] = {
            url: match[2]
        };
    }
    return hyperlinks;
}

// Calculate approximate text height
function calculateTextHeight(richText, width, fontSize) {
    // Simple approximation: number of lines * line height
    const approxCharsPerLine = Math.floor(width * 1.5);
    const totalChars = richText.reduce((sum, part) => sum + part.text.length, 0);
    const lines = Math.ceil(totalChars / approxCharsPerLine);
    return lines * (fontSize / 72); // Convert font size to inches
}

// Parse inline text without styles for blockquotes
function parseInlineText(text) {
    const inlineTokens = marked.lexer(text, {
        gfm: true,
        breaks: false
    });

    let plainText = '';
    inlineTokens.forEach(token => {
        if (typeof token === 'string') {
            plainText += token;
        } else if (token.type === 'text') {
            plainText += token.text;
        } else if (token.type === 'strong') {
            plainText += token.text;
        } else if (token.type === 'em') {
            plainText += token.text;
        } else if (token.type === 'codespan') {
            plainText += token.text;
        } else if (token.type === 'link') {
            plainText += token.text;
        } else if (token.type === 'br') {
            plainText += '\n';
        }
    });

    return plainText;
}

// audiobook generator
// Initialize playback queue and playback state
let playbackQueue = [];
let isPlaying = false;

async function generateSpeech() {
    const text = document.getElementById('textInput').value.trim();
    const statusDiv = document.getElementById('status');
    const audioOutput = document.getElementById('audioOutput');

    if (!text) {
        alert('Please enter some text to generate speech.');
        return;
    }

    // Clear previous outputs and show loading status
    audioOutput.innerHTML = '';
    statusDiv.textContent = 'Generating speech... Please wait.';

    try {
        const response = await fetch('/generate_audiobook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        // Use reader to handle streaming data
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // Function to handle and parse JSON messages
        function processBuffer() {
            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                const message = buffer.slice(0, boundary);
                buffer = buffer.slice(boundary + 1);
                if (message) {
                    try {
                        const data = JSON.parse(message);
                        handleMessage(data);
                    } catch (e) {
                        console.error('Invalid JSON:', message);
                    }
                }
                boundary = buffer.indexOf('\n');
            }
        }

        // Handle incoming messages
        function handleMessage(data) {
            if (data.audio_path) {
                // Add to playback queue
                playbackQueue.push(data.audio_path);
                statusDiv.textContent = 'Queued audio chunk...';
                // If not currently playing, start playback
                if (!isPlaying) {
                    playNextAudio();
                }
            }
            if (data.status === 'complete') {
                statusDiv.textContent = 'All audio chunks have been generated.';
            }
        }

        // Function to play the next audio in the queue
        function playNextAudio() {
            if (playbackQueue.length === 0) {
                isPlaying = false;
                statusDiv.textContent = 'Playback completed.';
                return;
            }

            isPlaying = true;
            const path = playbackQueue.shift();
            statusDiv.textContent = `Playing audio chunk...`;

            const audio = new Audio(path);
            audio.controls = true;
            audioOutput.appendChild(audio);

            audio.play()
                .then(() => {
                    console.log(`Playing: ${path}`);
                })
                .catch(error => {
                    console.error(`Error playing audio ${path}:`, error);
                    // Proceed to the next audio even if there's an error
                    isPlaying = false;
                    playNextAudio();
                });

            // When current audio ends, play the next one
            audio.onended = () => {
                console.log(`Finished playing: ${path}`);
                isPlaying = false;
                playNextAudio();
            };

            // Handle errors during playback
            audio.onerror = () => {
                console.error(`Error loading audio file: ${path}`);
                isPlaying = false;
                playNextAudio();
            };
        }

        // Read the stream
        while (true) {
            const {
                done,
                value
            } = await reader.read();
            if (done) {
                break;
            }
            buffer += decoder.decode(value, {
                stream: true
            });
            processBuffer();
        }

    } catch (error) {
        console.error('Error:', error);
        statusDiv.textContent = 'An error occurred while generating speech.';
    }
}