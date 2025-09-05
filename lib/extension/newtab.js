document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const clockElement = document.getElementById('clock');
    const searchForm = document.getElementById('kagi-search-form');
    const searchInput = document.getElementById('kagi-search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const bookmarksList = document.getElementById('bookmarks-list');
    const addBookmarkBtn = document.getElementById('add-bookmark-btn');
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    const addBookmarkForm = document.getElementById('add-bookmark-form');
    const cancelBookmarkBtn = document.getElementById('cancel-bookmark-btn');
    const bookmarkNameInput = document.getElementById('bookmark-name');
    const bookmarkUrlInput = document.getElementById('bookmark-url');

    // --- State ---
    let bookmarks = JSON.parse(localStorage.getItem('newTabBookmarks')) || [];
    let activeSuggestionIndex = -1;

    // --- Functions ---

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        clockElement.textContent = `${hours}:${minutes} ${ampm}`;
    }

    function renderBookmarks() {
        bookmarksList.innerHTML = '';
        bookmarks.forEach((bookmark, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'bookmark-item';

            // Create the favicon using Google's public favicon service for simplicity
            const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${bookmark.url}`;
            const nameInitial = bookmark.name.charAt(0).toUpperCase();

            listItem.innerHTML = `
                <a href="${bookmark.url}" title="${bookmark.name}">
                    <img src="${faviconUrl}" alt="${bookmark.name}" style="width: 24px; height: 24px; border-radius: 4px;" onerror="this.onerror=null; this.outerHTML='<span>${nameInitial}</span>';">
                </a>
                <button class="delete-bookmark" data-index="${index}" title="Delete Bookmark">&times;</button>
            `;
            bookmarksList.appendChild(listItem);
        });
    }

    function saveBookmarks() {
        localStorage.setItem('newTabBookmarks', JSON.stringify(bookmarks));
        renderBookmarks();
    }

    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function performSearch(query) {
        if (query) {
            window.location.href = `https://kagi.com/search?q=${encodeURIComponent(query)}`;
        }
    }

    async function fetchSuggestions(query) {
        if (!query) { clearSuggestions(); return; }
        try {
            const response = await fetch(`https://kagisuggest.com/api/autosuggest?q=${encodeURIComponent(query)}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data && data[1] && data[1].length > 0) {
                // limit to 7 suggestions
                data[1] = data[1].slice(0, 7);
                renderSuggestions(data[1]);
            } else {
                clearSuggestions();
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
            clearSuggestions();
        }
    }

    function renderSuggestions(suggestions) {
        suggestionsContainer.innerHTML = '<ul>' + suggestions.map((s, i) => `<li data-index="${i}">${s}</li>`).join('') + '</ul>';
        suggestionsContainer.style.display = 'block';
        activeSuggestionIndex = -1;
        suggestionsContainer.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedQuery = li.textContent.trim();
                clearSuggestions();
                performSearch(selectedQuery);
            });
        });
    }

    function clearSuggestions() {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        activeSuggestionIndex = -1;
    }

    function handleKeyboardNavigation(e) {
        const items = suggestionsContainer.querySelectorAll('li');
        if (!items.length || suggestionsContainer.style.display === 'none') return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
        } else if (e.key === 'Enter' && activeSuggestionIndex > -1) {
            e.preventDefault();
            const selectedQuery = items[activeSuggestionIndex].textContent.trim();
            clearSuggestions();
            performSearch(selectedQuery);
            return;
        } else if (e.key === 'Escape') {
            clearSuggestions();
            return;
        }

        items.forEach(item => item.classList.remove('active'));
        if (activeSuggestionIndex > -1) {
            items[activeSuggestionIndex].classList.add('active');
        }
    }

    const debouncedFetch = debounce(fetchSuggestions, 250);

    // --- EVENT LISTENERS ---

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        clearSuggestions();
        performSearch(query);
    });

    searchInput.addEventListener('input', () => debouncedFetch(searchInput.value.trim()));
    searchInput.addEventListener('keydown', handleKeyboardNavigation);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) clearSuggestions();
    });

    // Bookmark Modal Listeners
    addBookmarkBtn.addEventListener('click', () => addBookmarkModal.classList.add('active'));
    cancelBookmarkBtn.addEventListener('click', () => addBookmarkModal.classList.remove('active'));
    addBookmarkModal.addEventListener('click', (e) => {
        if (e.target === addBookmarkModal) addBookmarkModal.classList.remove('active');
    });

    addBookmarkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        bookmarks.push({
            name: bookmarkNameInput.value.trim(),
            url: bookmarkUrlInput.value.trim()
        });
        addBookmarkForm.reset();
        addBookmarkModal.classList.remove('active');
        saveBookmarks();
    });

    bookmarksList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-bookmark')) {
            const indexToDelete = parseInt(e.target.dataset.index, 10);
            bookmarks.splice(indexToDelete, 1);
            saveBookmarks();
        }
    });

    // --- INITIALIZATION ---
    updateClock();
    setInterval(updateClock, 1000);
    renderBookmarks();
});