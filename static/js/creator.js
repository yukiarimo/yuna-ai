// Element selectors
const $ = id => document.getElementById(id);
const elements = {
    workArea: $('work-area'),
    draftArea: $('draft-area'),
    outputArea: $('output-area'),
    sendButton: $('createButtonHimitsuCreator'),
    presentationPreview: $('presentation-content'),
    saveButton: $('savePresentationButtonHimitsuCreator'),
    clearButton: $('clearButtonHimitsuCreator'),
    copyToDraftButton: $('copyToDraftButtonHimitsuCreator'),
    exportButton: $('exportPresentationButtonHimitsuCreator')
};
// Simplified event handlers
const copyToDraft = () => elements.draftArea.value = elements.outputArea.value;

// Alternative approach
function sendNaked() {
    // Send request to the backend API
    fetch(`/extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: elements.workArea.value
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        elements.outputArea.value = data.response;
      })
  }

// Attach event listeners
elements.copyToDraftButton.addEventListener('click', copyToDraft);
elements.sendButton.addEventListener('click', sendNaked);

// Markdown Renderer Setup
marked.setOptions({
    breaks: true,
    gfm: true
});

// Load and render markdown on load
window.onload = () => {
    // Load all saved content
    const savedPresentation = localStorage.getItem('presentationMarkdown');
    if (savedPresentation) elements.workArea.value = savedPresentation;

    const savedDraft = localStorage.getItem('draftAreaContent');
    if (savedDraft) elements.draftArea.value = savedDraft;

    const savedOutput = localStorage.getItem('outputAreaContent');
    if (savedOutput) elements.outputArea.value = savedOutput;

    renderPreview();
};

// Markdown Event Listeners
elements.saveButton.addEventListener('click', () => {
    // Save all three text areas to localStorage
    localStorage.setItem('presentationMarkdown', elements.workArea.value);
    localStorage.setItem('draftAreaContent', elements.draftArea.value);
    localStorage.setItem('outputAreaContent', elements.outputArea.value);
    alert('All content saved!');
});

elements.clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all content?')) {
        elements.workArea.value = '';
        elements.draftArea.value = '';
        elements.outputArea.value = '';
        elements.presentationPreview.innerHTML = '';

        // Clear all stored content
        localStorage.removeItem('presentationMarkdown');
        localStorage.removeItem('draftAreaContent');
        localStorage.removeItem('outputAreaContent');
    }
});

elements.workArea.addEventListener('input', renderPreview);

// Render markdown preview
function renderPreview() {
    const slides = elements.workArea.value.split(/^---$/m);
    elements.presentationPreview.innerHTML = slides.map(slide => {
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
    pptx.defineLayout({
        name: 'LAYOUT_WIDE',
        width: 13.33,
        height: 7.5
    });
    pptx.layout = 'LAYOUT_WIDE';
    const slides = elements.workArea.value.split(/^---$/m);

    slides.forEach(md => {
        const slide = pptx.addSlide();
        const tokens = marked.lexer(md);
        let y = 0.5,
            margin = 0.5,
            width = 13.33;

        tokens.forEach(token => {
            switch (token.type) {
                case 'heading':
                    slide.addText(token.text, {
                        x: margin,
                        y,
                        w: width - 2 * margin,
                        fontSize: getFontSize(token.depth),
                        bold: token.depth < 3,
                        color: '363636',
                        breakLine: true
                    });
                    y += getFontSize(token.depth) / 72 + 0.2;
                    break;
                case 'paragraph':
                    slide.addText(parseInlineStyles(token.text), {
                        x: margin,
                        y,
                        w: width - 2 * margin,
                        fontSize: 14,
                        color: '363636',
                        breakLine: true,
                        hyperlinkClick: getHyperlinks(token.text)
                    });
                    y += calculateTextHeight(token.text, width - 2 * margin, 14) + 0.1;
                    break;
                case 'blockquote':
                    slide.addShape(pptx.ShapeType.rect, {
                        x: margin + 0.2,
                        y,
                        w: width - 2 * margin - 0.4,
                        h: 0.4,
                        fill: {
                            color: 'D3D3D3'
                        },
                        line: {
                            color: 'D3D3D3'
                        }
                    });
                    slide.addText(parseInlineText(token.text), {
                        x: margin + 0.4,
                        y,
                        w: width - 2 * margin - 0.6,
                        fontSize: 12,
                        italic: true,
                        color: '555555',
                        breakLine: true
                    });
                    y += 0.5;
                    break;
                case 'list':
                    token.items.forEach(item => {
                        slide.addText(parseInlineStyles(item.text), {
                            x: margin + 0.2,
                            y,
                            w: width - 2 * margin - 0.4,
                            fontSize: 14,
                            color: '363636',
                            bullet: token.ordered ? {
                                type: 'number'
                            } : true,
                            indent: 0.3
                        });
                        y += calculateTextHeight(item.text, width - 2 * margin - 0.7, 14) + 0.05;
                    });
                    break;
                case 'code':
                    slide.addText(token.text, {
                        x: margin,
                        y,
                        w: width - 2 * margin,
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
                        breakLine: true
                    });
                    y += 0.6;
                    break;
                case 'hr':
                    slide.addShape(pptx.ShapeType.line, {
                        x: margin,
                        y: y + 0.1,
                        w: width - 2 * margin,
                        h: 0,
                        line: {
                            color: 'C0C0C0',
                            w: 1
                        }
                    });
                    y += 0.3;
                    break;
            }
        });
    });

    pptx.writeFile({
        fileName: "Presentation.pptx"
    });
}

// Helper Functions
const getFontSize = depth => [32, 28, 24, 20, 16, 14][depth - 1] || 14;

function parseInlineStyles(text) {
    return marked.lexer(text, {
        gfm: true,
        breaks: false
    }).flatMap(token => {
        switch (token.type) {
            case 'strong':
                return {
                    text: token.text, bold: true
                };
            case 'em':
                return {
                    text: token.text, italic: true
                };
            case 'codespan':
                return {
                    text: token.text, fontFace: 'Courier New', color: '555555', italic: true
                };
            case 'link':
                return {
                    text: token.text, hyperlink: token.href, color: '0000FF', underline: true
                };
            case 'br':
                return {
                    text: '\n'
                };
            case 'text':
            default:
                return {
                    text: token.text || token
                };
        }
    });
}

const getHyperlinks = text => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g,
        links = {};
    let match;
    while ((match = regex.exec(text)) !== null) links[match[1]] = {
        url: match[2]
    };
    return links;
};

const calculateTextHeight = (text, width, size) => {
    const charsPerLine = Math.floor(width * 1.5);
    const lines = Math.ceil(text.length / charsPerLine);
    return lines * (size / 72);
};

function parseInlineText(text) {
    return marked.lexer(text, {
        gfm: true,
        breaks: false
    }).map(token => token.text || '').join('');
}