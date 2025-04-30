// Data storage
let data = JSON.parse(localStorage.getItem('diaryNotes')) || [];

// Utility Function to Escape HTML (Prevent XSS)
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[match];
    });
}

// Display Function
function displayNotes() {
    const container = document.getElementById('notes-container');
    if (data.length === 0) {
        container.innerHTML = '<p>No notes available.</p>';
        return;
    }
    let html = '';
    data.forEach(note => {
        html += `
            <div class="note card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${escapeHTML(note.title)}</h5>
                    ${note.date ? `<h6 class="card-subtitle mb-2 text-muted">${new Date(note.date).toLocaleDateString()}</h6>` : ''}
                    <p class="card-text">${escapeHTML(note.content)}</p>
                    <button class="btn btn-danger btn-sm" onclick="deleteNote(${note.id})">Delete</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Handle Form Submission
document.getElementById('note-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const isScheduled = document.getElementById('isScheduled').checked;
    const date = isScheduled ? document.getElementById('noteDate').value : null;

    if (title && content) {
        const note = {
            id: Date.now(),
            title,
            content,
            date: date ? new Date(date).toISOString() : null
        };
        data.push(note);
        localStorage.setItem('diaryNotes', JSON.stringify(data));
        displayNotes();
        document.getElementById('note-form').reset();
        document.getElementById('dateField').style.display = 'none';
    }
});

// Delete Note
function deleteNote(id) {
    data = data.filter(note => note.id !== id);
    localStorage.setItem('diaryNotes', JSON.stringify(data));
    displayNotes();
}

// Toggle Date Field Visibility
function toggleDateField() {
    const dateField = document.getElementById('dateField');
    const isChecked = document.getElementById('isScheduled').checked;
    dateField.style.display = isChecked ? 'block' : 'none';
}

// Initialize Display after DOM is loaded
document.addEventListener('DOMContentLoaded', displayNotes);