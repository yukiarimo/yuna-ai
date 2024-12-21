// Element selectors
const $ = id => document.getElementById(id);
const elements = {
    workArea: $('work-area'),
    draftArea: $('draft-area'),
    outputArea: $('output-area'),
    sendButton: $('send-button'),
    togglePresentation: $('toggle-presentation'),
    presentationSection: $('presentation-section'),
    presentationPreview: $('presentation-content'),
    saveButton: $('save-button'),
    clearButton: $('clear-button'),
    copyToDraftButton: $('copy-to-draft'),
    markdownInput: $('markdown-input'),
    exportButton: $('export-presentation-button')
};

// Shared message sending function
const sendMessage = async (content, output) => {
    if (output) output.value = '';
    await messageManagerInstance.sendMessage(content, false, '', '/message', true, true, output);
};

// Event handlers
const sendRequest = () => sendMessage(elements.workArea.value, elements.outputArea);
const copyToDraft = () => elements.draftArea.value = elements.outputArea.value;
const togglePresentation = () => {
    elements.presentationSection.classList.toggle('d-none');
};

// Attach event listeners
elements.sendButton.addEventListener('click', sendRequest);
elements.copyToDraftButton.addEventListener('click', copyToDraft);
elements.togglePresentation.addEventListener('change', togglePresentation);

// Markdown Renderer Setup
marked.setOptions({
    breaks: true,
    gfm: true
});

// Load and render markdown on load
window.onload = () => {
    const saved = localStorage.getItem('presentationMarkdown');
    if (saved) elements.workArea.value = saved;
    renderPreview();
};

// Markdown Event Listeners
elements.saveButton.addEventListener('click', () => {
    localStorage.setItem('presentationMarkdown', elements.workArea.value);
    alert('Presentation saved!');
});
elements.clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the presentation?')) {
        elements.workArea.value = '';
        elements.outputArea.innerHTML = '';
        localStorage.removeItem('presentationMarkdown');
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
    const slides = elements.markdownInput.value.split(/^---$/m);

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

// Audiobook Generator Enhanced
let currentProject = null;
let currentChapter = null;

// Function to create a project
document.getElementById('createProject').addEventListener('click', () => {
    const projectName = document.getElementById('projectName').value;
    if (projectName) {
        fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: projectName
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                updateProjectSelect();
            });
    } else {
        alert('Please enter a valid project name.');
    }
});

// Function to update project select options
function updateProjectSelect() {
    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            const projectSelect = document.getElementById('projectSelect');
            projectSelect.innerHTML = '<option selected>Select Project</option>';
            data.projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project;
                option.textContent = project;
                projectSelect.appendChild(option);
            });

            // Add project management buttons
            const projectManagement = document.createElement('div');
            projectManagement.className = 'mt-2';
            projectManagement.innerHTML = `
                    <button class="btn btn-warning btn-sm" onclick="renameProject()">
                        <i class="bi bi-pencil"></i> Rename Project
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject()">
                        <i class="bi bi-trash"></i> Delete Project
                    </button>
                `;
            const existingManagement = document.querySelector('#projectManagement');
            if (existingManagement) {
                existingManagement.replaceWith(projectManagement);
            } else {
                document.getElementById('loadProject').after(projectManagement);
            }
        });
}

// Function to load a project
document.getElementById('loadProject').addEventListener('click', () => {
    const projectSelect = document.getElementById('projectSelect').value;
    if (projectSelect !== 'Select Project') {
        currentProject = projectSelect;
        updateChapterSelect();
        alert(`Project "${currentProject}" loaded.`);
    } else {
        alert('Please select a project to load.');
    }
});

// Function to create a chapter
document.getElementById('createChapter').addEventListener('click', () => {
    const chapterName = document.getElementById('chapterName').value;
    if (currentProject && chapterName) {
        fetch(`/projects/${currentProject}/chapters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: chapterName
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                updateChapterSelect();
            });
    } else {
        alert('Please enter a valid chapter name and select a project.');
    }
});

// Function to update chapter select options
function updateChapterSelect() {
    fetch(`/projects/${currentProject}/chapters`)
        .then(response => response.json())
        .then(data => {
            const chapterSelect = document.getElementById('chapterSelect');
            chapterSelect.innerHTML = '<option selected>Select Chapter</option>';

            // Update both selects and add download buttons
            [chapterSelect, document.getElementById('playChapterSelect')].forEach(select => {
                select.innerHTML = '<option selected>Select Chapter</option>';
                data.chapters.forEach(chapter => {
                    const option = document.createElement('option');
                    option.value = chapter;
                    option.textContent = chapter;
                    select.appendChild(option);
                });
            });

            // Add download buttons container if it doesn't exist
            if (!document.getElementById('downloadButtons')) {
                const buttonContainer = document.createElement('div');
                buttonContainer.id = 'downloadButtons';
                buttonContainer.className = 'mt-3';
                buttonContainer.innerHTML = `
                        <button class="btn btn-primary" onclick="downloadChapter()">
                            <i class="bi bi-download"></i> Download Current Chapter
                        </button>
                        <button class="btn btn-primary" onclick="downloadProject()">
                            <i class="bi bi-download"></i> Download Entire Project
                        </button>
                    `;
                document.querySelector('#audiobook-sidebar').appendChild(buttonContainer);
            }

            const chapterManagement = document.createElement('div');
            chapterManagement.className = 'mt-2';
            chapterManagement.innerHTML = `
                    <button class="btn btn-warning btn-sm" onclick="renameChapter()">
                        <i class="bi bi-pencil"></i> Rename Chapter
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteChapter()">
                        <i class="bi bi-trash"></i> Delete Chapter
                    </button>
                `;
            const existingManagement = document.querySelector('#chapterManagement');
            if (existingManagement) {
                existingManagement.replaceWith(chapterManagement);
            } else {
                document.getElementById('loadChapter').after(chapterManagement);
            }
        });
}

// Function to load a chapter
document.getElementById('loadChapter').addEventListener('click', () => {
    const chapterSelectValue = document.getElementById('chapterSelect').value;
    if (chapterSelectValue !== 'Select Chapter') {
        currentChapter = chapterSelectValue;
        fetch(`/projects/${currentProject}/chapters/${currentChapter}`)
            .then(response => response.json())
            .then(data => {
                loadChapter(data.paragraphs);
            });
    } else {
        alert('Please select a chapter to load.');
    }
});

// Function to load a chapter and display its paragraphs
function loadChapter(paragraphs) {
    const textBlocksContainer = document.getElementById('textBlocks');
    textBlocksContainer.innerHTML = '';
    paragraphs.forEach((paragraph, index) => {
        const textBlock = createTextBlock(paragraph, index + 1);
        textBlocksContainer.appendChild(textBlock);
    });
}

// Function to create a text block element
function createTextBlock(paragraph, index) {
    const div = document.createElement('div');
    div.className = 'text-block d-flex justify-content-between align-items-center mb-3 p-3 border';
    div.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="badge bg-secondary me-2">#${index}</span>
                    <span>${paragraph.text}</span>
                </div>
                <div class="btn-group">
                    <button class="btn btn-success btn-sm" onclick="playParagraph('${paragraph.audio_url}', ${index})">
                        <i class="bi bi-play-fill"></i> Play
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="downloadParagraph(${index})">
                        <i class="bi bi-download"></i> Download
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="regenerateText(${index})">
                        <i class="bi bi-arrow-clockwise"></i> Regenerate
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteText(${index})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            `;
    return div;
}

// Function to regenerate text
function regenerateText(index) {
    const newText = prompt('Enter new text:');
    if (newText) {
        fetch(`/projects/${currentProject}/chapters/${currentChapter}/paragraphs/${index}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: newText,
                    id: `${currentProject}_${currentChapter}_${index}`
                })
            })
            .then(response => response.json())
            .then(data => {
                loadChapter(data.paragraphs);
            });
    }
}

// Function to delete a text block
function deleteText(index) {
    fetch(`/projects/${currentProject}/chapters/${currentChapter}/paragraphs/${index}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            loadChapter(data.paragraphs);
        });
}

function playParagraph(audioUrl, index) {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
    } else {
        // Generate audio if it doesn't exist
        fetch('/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: currentParagraphs[index - 1].text,
                    project: currentProject,
                    chapter: currentChapter,
                    paragraph: index
                })
            })
            .then(response => response.json())
            .then(data => {
                const audio = new Audio(data.audio_url);
                audio.play();
                // Update the stored audio URL
                currentParagraphs[index - 1].audio_url = data.audio_url;
            });
    }
}

// Function to start playing a selected chapter from a specific paragraph
document.getElementById('startPlaying').addEventListener('click', () => {
    const chapterSelectValue = document.getElementById('playChapterSelect').value;
    const startFrom = parseInt(document.getElementById('startFrom').value) || 1;

    if (chapterSelectValue !== 'Select Chapter') {
        fetch(`/projects/${currentProject}/chapters/${chapterSelectValue}`)
            .then(response => response.json())
            .then(data => {
                const paragraphs = data.paragraphs.slice(startFrom - 1);
                playParagraphsSequentially(paragraphs, 0);
            });
    } else {
        alert('Please select a chapter to play.');
    }
});

function playParagraphsSequentially(paragraphs, index) {
    if (index >= paragraphs.length) return;

    const audio = new Audio(paragraphs[index].audio_url);
    audio.onended = () => playParagraphsSequentially(paragraphs, index + 1);
    audio.play();
}

document.getElementById('addParagraph').addEventListener('click', () => {
    const text = document.getElementById('paragraphText').value;
    if (currentProject && currentChapter && text) {
        fetch(`/projects/${currentProject}/chapters/${currentChapter}/paragraphs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('paragraphText').value = '';
                loadChapter(data.paragraphs);
            });
    } else {
        alert('Please select a project and chapter first, and enter some text.');
    }
});

function downloadParagraph(index) {
    window.location.href = `/download/paragraph/${currentProject}/${currentChapter}/${index}`;
}

function downloadChapter() {
    if (currentChapter) {
        window.location.href = `/download/chapter/${currentProject}/${currentChapter}`;
    } else {
        alert('Please select a chapter first.');
    }
}

function downloadProject() {
    if (currentProject) {
        window.location.href = `/download/project/${currentProject}`;
    } else {
        alert('Please select a project first.');
    }
}

function deleteProject() {
    if (!currentProject) {
        alert('Please select a project first.');
        return;
    }

    if (confirm(`Are you sure you want to delete project "${currentProject}"?`)) {
        fetch(`/projects/${currentProject}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                currentProject = null;
                updateProjectSelect();
                document.getElementById('textBlocks').innerHTML = '';
            });
    }
}

function renameProject() {
    if (!currentProject) {
        alert('Please select a project first.');
        return;
    }

    const newName = prompt('Enter new project name:', currentProject);
    if (newName && newName !== currentProject) {
        fetch(`/projects/${currentProject}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                currentProject = newName;
                updateProjectSelect();
            });
    }
}

function deleteChapter() {
    if (!currentProject || !currentChapter) {
        alert('Please select a project and chapter first.');
        return;
    }

    if (confirm(`Are you sure you want to delete chapter "${currentChapter}"?`)) {
        fetch(`/projects/${currentProject}/chapters/${currentChapter}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                currentChapter = null;
                updateChapterSelect();
                document.getElementById('textBlocks').innerHTML = '';
            });
    }
}

function renameChapter() {
    if (!currentProject || !currentChapter) {
        alert('Please select a project and chapter first.');
        return;
    }

    const newName = prompt('Enter new chapter name:', currentChapter);
    if (newName && newName !== currentChapter) {
        fetch(`/projects/${currentProject}/chapters/${currentChapter}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                currentChapter = newName;
                updateChapterSelect();
            });
    }
}

// Initialize the project select options on page load
updateProjectSelect();