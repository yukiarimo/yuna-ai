// Element selectors
const $ = id => document.getElementById(id);
const elements = {
    nakedWorkArea: $('naked-work-area'),
    articlePromptTemplate: $('article-prompt-template'),
    articleUserInput: $('article-user-input'),
    articleOutputText: $('article-output-text'),
    articleDraftText: $('article-draft-text'),
    sendCreateNakedButton: $('send-create-naked'),
    sendCreateArticleButton: $('send-create-article'),
    copyToDraftButton: $('copy-to-draft'),
    markdownInput: $('markdown-input'),
    preview: $('preview'),
    saveButton: $('save-button'),
    exportButton: $('export-button'),
    clearButton: $('clear-button'),
    textInput: $('textInput'),
    status: $('status'),
    audioOutput: $('audioOutput'),
};

// Shared message sending function
const sendMessage = async (content, output) => {
    if (output) output.value = '';
    await messageManagerInstance.sendMessage(content, false, '', '/message', true, true, output);
};

// Event handlers
const sendNakedRequest = () => sendMessage(elements.nakedWorkArea.value, elements.nakedWorkArea);
const sendArticleRequest = () => {
    const content = `${elements.articlePromptTemplate.value}\n\n${elements.articleUserInput.value}`;
    sendMessage(content, elements.articleOutputText);
};
const copyToDraft = () => elements.articleDraftText.value = elements.articleOutputText.value;

// Attach event listeners
elements.sendCreateNakedButton.addEventListener('click', sendNakedRequest);
elements.sendCreateArticleButton.addEventListener('click', sendArticleRequest);
elements.copyToDraftButton.addEventListener('click', copyToDraft);

// Markdown Renderer Setup
marked.setOptions({ breaks: true, gfm: true });

// Load and render markdown on load
window.onload = () => {
    const saved = localStorage.getItem('presentationMarkdown');
    if (saved) elements.markdownInput.value = saved;
    renderPreview();
};

// Markdown Event Listeners
elements.saveButton.addEventListener('click', () => {
    localStorage.setItem('presentationMarkdown', elements.markdownInput.value);
    alert('Presentation saved!');
});
elements.clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the presentation?')) {
        elements.markdownInput.value = '';
        elements.preview.innerHTML = '';
        localStorage.removeItem('presentationMarkdown');
    }
});
elements.markdownInput.addEventListener('input', renderPreview);

// Render markdown preview
function renderPreview() {
    const slides = elements.markdownInput.value.split(/^---$/m);
    elements.preview.innerHTML = slides.map(slide => {
        const div = document.createElement('div');
        div.className = 'slide-container mb-4 p-3 border rounded';
        div.innerHTML = marked.parse(slide);
        return div.outerHTML;
    }).join('');
}

// Export to PPTX
elements.exportButton.addEventListener('click', exportPPTX);

function exportPPTX() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'LAYOUT_WIDE', width: 13.33, height: 7.5 });
    pptx.layout = 'LAYOUT_WIDE';
    const slides = elements.markdownInput.value.split(/^---$/m);

    slides.forEach(md => {
        const slide = pptx.addSlide();
        const tokens = marked.lexer(md);
        let y = 0.5, margin = 0.5, width = 13.33;

        tokens.forEach(token => {
            switch (token.type) {
                case 'heading':
                    slide.addText(token.text, {
                        x: margin, y, w: width - 2 * margin,
                        fontSize: getFontSize(token.depth),
                        bold: token.depth < 3, color: '363636', breakLine: true
                    });
                    y += getFontSize(token.depth) / 72 + 0.2;
                    break;
                case 'paragraph':
                    slide.addText(parseInlineStyles(token.text), {
                        x: margin, y, w: width - 2 * margin,
                        fontSize: 14, color: '363636', breakLine: true,
                        hyperlinkClick: getHyperlinks(token.text)
                    });
                    y += calculateTextHeight(token.text, width - 2 * margin, 14) + 0.1;
                    break;
                case 'blockquote':
                    slide.addShape(pptx.ShapeType.rect, {
                        x: margin + 0.2, y, w: width - 2 * margin - 0.4,
                        h: 0.4, fill: { color: 'D3D3D3' }, line: { color: 'D3D3D3' }
                    });
                    slide.addText(parseInlineText(token.text), {
                        x: margin + 0.4, y, w: width - 2 * margin - 0.6,
                        fontSize: 12, italic: true, color: '555555', breakLine: true
                    });
                    y += 0.5;
                    break;
                case 'list':
                    token.items.forEach(item => {
                        slide.addText(parseInlineStyles(item.text), {
                            x: margin + 0.2, y, w: width - 2 * margin - 0.4,
                            fontSize: 14, color: '363636',
                            bullet: token.ordered ? { type: 'number' } : true,
                            indent: 0.3
                        });
                        y += calculateTextHeight(item.text, width - 2 * margin - 0.7, 14) + 0.05;
                    });
                    break;
                case 'code':
                    slide.addText(token.text, {
                        x: margin, y, w: width - 2 * margin,
                        fontSize: 12, fontFace: 'Courier New', color: '555555',
                        fill: { color: 'F5F5F5' }, border: { type: 'solid', color: 'D3D3D3' }, breakLine: true
                    });
                    y += 0.6;
                    break;
                case 'hr':
                    slide.addShape(pptx.ShapeType.line, {
                        x: margin, y: y + 0.1, w: width - 2 * margin, h: 0,
                        line: { color: 'C0C0C0', w: 1 }
                    });
                    y += 0.3;
                    break;
            }
        });
    });

    pptx.writeFile({ fileName: "Presentation.pptx" });
}

// Helper Functions
const getFontSize = depth => [32, 28, 24, 20, 16, 14][depth - 1] || 14;

function parseInlineStyles(text) {
    return marked.lexer(text, { gfm: true, breaks: false }).flatMap(token => {
        switch (token.type) {
            case 'strong': return { text: token.text, bold: true };
            case 'em': return { text: token.text, italic: true };
            case 'codespan': return { text: token.text, fontFace: 'Courier New', color: '555555', italic: true };
            case 'link': return { text: token.text, hyperlink: token.href, color: '0000FF', underline: true };
            case 'br': return { text: '\n' };
            case 'text': 
            default: return { text: token.text || token };
        }
    });
}

const getHyperlinks = text => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g, links = {};
    let match;
    while ((match = regex.exec(text)) !== null) links[match[1]] = { url: match[2] };
    return links;
};

const calculateTextHeight = (text, width, size) => {
    const charsPerLine = Math.floor(width * 1.5);
    const lines = Math.ceil(text.length / charsPerLine);
    return lines * (size / 72);
};

function parseInlineText(text) {
    return marked.lexer(text, { gfm: true, breaks: false }).map(token => token.text || '').join('');
}

// Audiobook Generator
let playbackQueue = [], isPlaying = false;

async function generateSpeech() {
    const text = elements.textInput.value.trim();
    if (!text) return alert('Please enter some text to generate speech.');

    elements.audioOutput.innerHTML = '';
    elements.status.textContent = 'Generating speech... Please wait.';

    try {
        const response = await fetch('/generate_audiobook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        const processBuffer = () => {
            let boundary;
            while ((boundary = buffer.indexOf('\n')) !== -1) {
                const message = buffer.slice(0, boundary);
                buffer = buffer.slice(boundary + 1);
                if (message) {
                    try {
                        const data = JSON.parse(message);
                        if (data.audio_path) {
                            playbackQueue.push(data.audio_path);
                            elements.status.textContent = 'Queued audio chunk...';
                            if (!isPlaying) playNextAudio();
                        }
                        if (data.status === 'complete') {
                            elements.status.textContent = 'All audio chunks have been generated.';
                        }
                    } catch { console.error('Invalid JSON:', message); }
                }
            }
        };

        const playNextAudio = () => {
            if (!playbackQueue.length) {
                isPlaying = false;
                elements.status.textContent = 'Playback completed.';
                return;
            }
            isPlaying = true;
            const path = playbackQueue.shift();
            elements.status.textContent = 'Playing audio chunk...';
            const audio = new Audio(path);
            audio.controls = true;
            elements.audioOutput.appendChild(audio);
            audio.play().catch(error => {
                console.error(`Error playing ${path}:`, error);
                isPlaying = false;
                playNextAudio();
            });
            audio.onended = playNextAudio;
            audio.onerror = () => {
                console.error(`Error loading ${path}`);
                isPlaying = false;
                playNextAudio();
            };
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            processBuffer();
        }
    } catch (error) {
        console.error('Error:', error);
        elements.status.textContent = 'An error occurred while generating speech.';
    }
}