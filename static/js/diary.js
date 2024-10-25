// Constants for localStorage keys
const STORAGE_KEYS = {
    entries: 'diaryEntries',
    notes: 'diaryNotes',
    schedules: 'diarySchedules'
};

// Data storage
let data = {
    entries: JSON.parse(localStorage.getItem(STORAGE_KEYS.entries)) || [],
    notes: JSON.parse(localStorage.getItem(STORAGE_KEYS.notes)) || [],
    schedules: JSON.parse(localStorage.getItem(STORAGE_KEYS.schedules)) || []
};

// Get Time of Day
const getTimeOfDay = hour => {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
};

// Categorize Entries for Display
function categorizeEntries(entries) {
    return entries.reduce((acc, entry) => {
        const date = new Date(entry.date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', {
            month: 'long'
        });
        const week = Math.ceil(date.getDate() / 7);
        const day = date.getDate();
        const timeOfDay = getTimeOfDay(date.getHours());

        acc[year] = acc[year] || {};
        acc[year][month] = acc[year][month] || {};
        acc[year][month][week] = acc[year][month][week] || {};
        acc[year][month][week][day] = acc[year][month][week][day] || {};
        acc[year][month][week][day][timeOfDay] = acc[year][month][week][day][timeOfDay] || [];
        acc[year][month][week][day][timeOfDay].push(entry);
        return acc;
    }, {});
}

// Display Functions
const displayFunctions = {
    entries: () => {
        const container = document.getElementById('entries-container');
        const categorized = categorizeEntries(data.entries);
        let html = '';

        for (const [year, months] of Object.entries(categorized)) {
            html += `<div><h2 class="mt-5 mb-4">${year}</h2>`;
            for (const [month, weeks] of Object.entries(months)) {
                html += `<div><h3 class="mb-3">${month}</h3>`;
                for (const [week, days] of Object.entries(weeks)) {
                    html += `<div><h4 class="mb-2">Week ${week}</h4>`;
                    for (const [day, times] of Object.entries(days)) {
                        html += `<div><h5 class="mb-2">Day ${day}</h5>`;
                        for (const [timeOfDay, entries] of Object.entries(times)) {
                            html += `<div><h6 class="mb-2">${timeOfDay}</h6>`;
                            entries.forEach(entry => {
                                html += `
                                    <div class="entry card mb-3">
                                        <div class="card-body">
                                            <h5 class="card-title">${escapeHTML(entry.title)}</h5>
                                            <h6 class="card-subtitle mb-2 text-muted">${new Date(entry.date).toLocaleString()}</h6>
                                            <p class="card-text">${escapeHTML(entry.text)}</p>
                                            ${entry.image ? `<img src="${entry.image}" alt="Entry image" class="img-fluid">` : ''}
                                            <button class="btn btn-danger btn-sm mt-2" onclick="deleteItem('entries', ${entry.id})">
                                                <i class="bi bi-trash"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                `;
                            });
                            html += `</div>`;
                        }
                        html += `</div>`;
                    }
                    html += `</div>`;
                }
                html += `</div>`;
            }
            html += `</div>`;
        }

        container.innerHTML = html;
    },
    notes: () => {
        const container = document.getElementById('notes-container');
        let html = '';

        data.notes.forEach(note => {
            html += `
                <div class="note card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${escapeHTML(note.title)}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${new Date(note.date).toLocaleString()}</h6>
                        <p class="card-text">${escapeHTML(note.text)}</p>
                        <button class="btn btn-danger btn-sm mt-2" onclick="deleteItem('notes', ${note.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },
    schedules: () => {
        const container = document.getElementById('schedule-container');
        let sortedSchedules = [...data.schedules].sort((a, b) => new Date(a.time) - new Date(b.time));
        let html = '';

        sortedSchedules.forEach(schedule => {
            html += `
                <div class="schedule card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${escapeHTML(schedule.title)}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${new Date(schedule.time).toLocaleString()}</h6>
                        <button class="btn btn-danger btn-sm mt-2" onclick="deleteItem('schedules', ${schedule.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

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

// Initial Display
['entries', 'notes', 'schedules'].forEach(displayType => displayFunctions[displayType]());

// Event Listeners
document.getElementById('entry-form').addEventListener('submit', e => handleSubmit(e, 'entries'));
document.getElementById('note-form').addEventListener('submit', e => handleSubmit(e, 'notes'));
document.getElementById('schedule-form').addEventListener('submit', e => handleSubmit(e, 'schedules'));

// Handle Form Submissions
function handleSubmit(e, type) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = Date.now();
    let item = {
        id
    };

    // Process form data based on type
    for (let [key, value] of formData.entries()) {
        if (type === 'entries' && key === 'image' && value) {
            const reader = new FileReader();
            reader.onloadend = () => {
                item.image = reader.result;
                finalizeItemSubmission(type, item, form);
            };
            reader.readAsDataURL(value);
            return; // Wait for the image to be read before saving
        } else if (type === 'schedules' && key === 'time') {
            item.time = new Date(value).toISOString();
        } else if (type === 'entries' && key === 'date') {
            item.date = new Date(value).toISOString();
        } else if (type === 'notes') {
            // For notes, we'll handle the date separately
            item[key] = value.trim();
        } else {
            item[key] = value.trim();
        }
    }

    // For notes, set the current date
    if (type === 'notes') {
        item.date = new Date().toISOString();
    }

    if (validateForm(type, item)) {
        saveItem(type, item);
    }
}

// Finalize Item Submission (for handling images)
function finalizeItemSubmission(type, item, form) {
    if (validateForm(type, item)) {
        saveItem(type, item);
    }
}

// Validate Form Inputs
function validateForm(type, item) {
    switch (type) {
        case 'entries':
            return item.title && item.text && item.date;
        case 'notes':
            return item.title && item.text && item.date;
        case 'schedules':
            return item.title && item.time;
        default:
            return false;
    }
}

// Save Item to Data and localStorage
function saveItem(type, item) {
    data[type].push(item);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data[type]));
    displayFunctions[type]();
    formReset(type);
}

// Delete Item
function deleteItem(type, id) {
    data[type] = data[type].filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data[type]));
    displayFunctions[type]();
}

// Clear Forms
function formReset(type) {
    const forms = {
        entries: ['entry-title', 'entry-text', 'entry-date', 'entry-image'],
        notes: ['note-title', 'note-text'],
        schedules: ['schedule-title', 'schedule-time']
    };
    forms[type].forEach(id => {
        const input = document.getElementById(id);
        if (input.type === 'file') {
            input.value = ''; // Clear file inputs differently
        } else {
            input.value = '';
        }
    });
}