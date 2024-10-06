// Global Variables
let entries = [];
let notes = [];
let schedules = [];

// Load data from localStorage
if (localStorage.getItem('diaryEntries')) {
    entries = JSON.parse(localStorage.getItem('diaryEntries'));
    displayEntries();
}

if (localStorage.getItem('diaryNotes')) {
    notes = JSON.parse(localStorage.getItem('diaryNotes'));
    displayNotes();
}

if (localStorage.getItem('diarySchedules')) {
    schedules = JSON.parse(localStorage.getItem('diarySchedules'));
    displaySchedules();
}

// Event Listener for Diary Entries
document.getElementById('entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('entry-title').value.trim();
    const text = document.getElementById('entry-text').value.trim();
    const dateInput = document.getElementById('entry-date').value;
    const imageFile = document.getElementById('entry-image').files[0];

    if (title && text && dateInput) {
        const date = new Date(dateInput);
        const entry = {
            id: Date.now(),
            title,
            text,
            date: date.toISOString(),
            image: null,
        };
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = function () {
                entry.image = reader.result;
                saveEntry(entry);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveEntry(entry);
        }
    } else {
        alert('Please fill out all required fields.');
    }
});

// Event Listener for Notes/Memories
document.getElementById('note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('note-title').value.trim();
    const text = document.getElementById('note-text').value.trim();

    if (title && text) {
        const note = {
            id: Date.now(),
            title,
            text,
            date: new Date().toISOString(),
        };
        saveNote(note);
    } else {
        alert('Please fill out all required fields.');
    }
});

// Event Listener for Timetable/Schedule
document.getElementById('schedule-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('schedule-title').value.trim();
    const timeInput = document.getElementById('schedule-time').value;

    if (title && timeInput) {
        const time = new Date(timeInput);
        const schedule = {
            id: Date.now(),
            title,
            time: time.toISOString(),
        };
        saveSchedule(schedule);
    } else {
        alert('Please fill out all required fields.');
    }
});

// Save Entry
function saveEntry(entry) {
    entries.push(entry);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    displayEntries();
    clearEntryForm();
}

// Display Entries
function displayEntries() {
    const container = document.getElementById('entries-container');
    container.innerHTML = '';
    const categorizedEntries = categorizeEntries(entries);
    for (const year in categorizedEntries) {
        const yearSection = document.createElement('div');
        yearSection.innerHTML = `<h2 class="mt-5 mb-4">${year}</h2>`;
        for (const month in categorizedEntries[year]) {
            const monthSection = document.createElement('div');
            monthSection.innerHTML = `<h3 class="mb-3">${month}</h3>`;
            for (const week in categorizedEntries[year][month]) {
                const weekSection = document.createElement('div');
                weekSection.innerHTML = `<h4 class="mb-2">Week ${week}</h4>`;
                for (const day in categorizedEntries[year][month][week]) {
                    const daySection = document.createElement('div');
                    daySection.innerHTML = `<h5 class="mb-2">Day ${day}</h5>`;
                    for (const timeOfDay in categorizedEntries[year][month][week][day]) {
                        const timeSection = document.createElement('div');
                        timeSection.innerHTML = `<h6 class="mb-2">${timeOfDay}</h6>`;
                        categorizedEntries[year][month][week][day][timeOfDay].forEach((entry) => {
                            const entryDiv = document.createElement('div');
                            entryDiv.className = 'entry card mb-3';
                            let entryContent = `
                <div class="card-body">
                  <h5 class="card-title">${entry.title}</h5>
                  <h6 class="card-subtitle mb-2 text-muted">${new Date(
                    entry.date
                  ).toLocaleString()}</h6>
                  <p class="card-text">${entry.text}</p>
              `;
                            if (entry.image) {
                                entryContent += `<img src="${entry.image}" alt="Entry image" class="img-fluid">`;
                            }
                            entryContent += `
                  <button class="btn btn-danger btn-sm mt-2" onclick="deleteEntry(${entry.id})">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              `;
                            entryDiv.innerHTML = entryContent;
                            timeSection.appendChild(entryDiv);
                        });
                        daySection.appendChild(timeSection);
                    }
                    weekSection.appendChild(daySection);
                }
                monthSection.appendChild(weekSection);
            }
            yearSection.appendChild(monthSection);
        }
        container.appendChild(yearSection);
    }
}

// Save Note
function saveNote(note) {
    notes.push(note);
    localStorage.setItem('diaryNotes', JSON.stringify(notes));
    displayNotes();
    clearNoteForm();
}

// Display Notes
function displayNotes() {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';
    notes.forEach((note) => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note card mb-3';
        noteDiv.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${note.title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${new Date(
          note.date
        ).toLocaleString()}</h6>
        <p class="card-text">${note.text}</p>
        <button class="btn btn-danger btn-sm mt-2" onclick="deleteNote(${note.id})">
          <i class="bi bi-trash"></i> Delete
        </button>
      </div>
    `;
        container.appendChild(noteDiv);
    });
}

// Save Schedule
function saveSchedule(schedule) {
    schedules.push(schedule);
    localStorage.setItem('diarySchedules', JSON.stringify(schedules));
    displaySchedules();
    clearScheduleForm();
}

// Display Schedules
function displaySchedules() {
    const container = document.getElementById('schedule-container');
    container.innerHTML = '';
    schedules.sort((a, b) => new Date(a.time) - new Date(b.time));
    schedules.forEach((schedule) => {
        const scheduleDiv = document.createElement('div');
        scheduleDiv.className = 'schedule card mb-3';
        scheduleDiv.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${schedule.title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${new Date(
          schedule.time
        ).toLocaleString()}</h6>
        <button class="btn btn-danger btn-sm mt-2" onclick="deleteSchedule(${schedule.id})">
          <i class="bi bi-trash"></i> Delete
        </button>
      </div>
    `;
        container.appendChild(scheduleDiv);
    });
}

// Categorize Entries
function categorizeEntries(entriesList) {
    const categories = {};
    entriesList.forEach((entry) => {
        const date = new Date(entry.date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', {
            month: 'long'
        });
        const week = Math.ceil(date.getDate() / 7);
        const day = date.getDate();
        const timeOfDay = getTimeOfDay(date.getHours());
        if (!categories[year]) categories[year] = {};
        if (!categories[year][month]) categories[year][month] = {};
        if (!categories[year][month][week]) categories[year][month][week] = {};
        if (!categories[year][month][week][day])
            categories[year][month][week][day] = {};
        if (!categories[year][month][week][day][timeOfDay])
            categories[year][month][week][day][timeOfDay] = [];
        categories[year][month][week][day][timeOfDay].push(entry);
    });
    return categories;
}

// Delete Entry
function deleteEntry(id) {
    entries = entries.filter((entry) => entry.id !== id);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    displayEntries();
}

// Delete Note
function deleteNote(id) {
    notes = notes.filter((note) => note.id !== id);
    localStorage.setItem('diaryNotes', JSON.stringify(notes));
    displayNotes();
}

// Delete Schedule
function deleteSchedule(id) {
    schedules = schedules.filter((schedule) => schedule.id !== id);
    localStorage.setItem('diarySchedules', JSON.stringify(schedules));
    displaySchedules();
}

// Clear Forms
function clearEntryForm() {
    document.getElementById('entry-title').value = '';
    document.getElementById('entry-text').value = '';
    document.getElementById('entry-date').value = '';
    document.getElementById('entry-image').value = '';
}

function clearNoteForm() {
    document.getElementById('note-title').value = '';
    document.getElementById('note-text').value = '';
}

function clearScheduleForm() {
    document.getElementById('schedule-title').value = '';
    document.getElementById('schedule-time').value = '';
}

// Get Time of Day
function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) {
        return 'Morning';
    } else if (hour >= 12 && hour < 17) {
        return 'Afternoon';
    } else if (hour >= 17 && hour < 21) {
        return 'Evening';
    } else {
        return 'Night';
    }
}