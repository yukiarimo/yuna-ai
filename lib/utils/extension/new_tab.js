document.getElementById('searchButton').addEventListener('click', search);
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        search();
    }
});

function search() {
    const query = document.getElementById('searchInput').value;
    if (query) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.location.href = url;
    }
}

// Load bookmarks
function loadBookmarks() {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        const bookmarkList = document.getElementById('bookmarkList');
        bookmarkList.innerHTML = '';
        processBookmarks(bookmarkTreeNodes, bookmarkList);
    });
}

function processBookmarks(bookmarks, parentElement) {
    bookmarks.forEach(function (bookmark) {
        if (bookmark.url) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = bookmark.url;
            link.textContent = bookmark.title || bookmark.url;
            li.appendChild(link);
            parentElement.appendChild(li);
        } else if (bookmark.children) {
            processBookmarks(bookmark.children, parentElement);
        }
    });
}

loadBookmarks();