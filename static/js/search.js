document.getElementById('searchButton').addEventListener('click', async () => {
  const searchData = document.getElementById('searchInput').value.trim();
  if (!searchData) return;

  // Display the request information
  const requestResultsContainer = document.getElementById('requestResults');
  requestResultsContainer.classList.remove('d-none');
  requestResultsContainer.innerHTML = `<p><strong>Request:</strong> Sending for: ${searchData}</p>`;

  try {
    const response = await fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchData,
        url: "https://www.google.com",
        processData: false,
      }),
    });

    const data = await response.json();
    const [message, results] = data.message;
    const { images: imageUrls } = data;

    // Update the main search info
    document.getElementById('answerResults').innerHTML = `
      <div class="alert alert-info mb-3">
        <div class="card-body">
          <h5 class="card-title">Search Result</h5>
          <p class="card-text" id="main-search-info">${message}</p>
        </div>
      </div>`;

    // Populate the results
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = results.map(({ Title, Description, Link }) => `
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${Title}</h5>
            <p class="card-text">${Description}</p>
            <a href="${Link}" class="btn btn-primary" target="_blank">Visit</a>
            <button type="button" class="btn btn-secondary" onclick="analyzeContent('${Link}')">Analyze</button>
          </div>
        </div>
      </div>
    `).join('');

    // Append image cards
    imageUrls.forEach(url => {
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.innerHTML = `<img src="${url}" class="card-img-top" alt="Image"/>`;
      resultsContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Error:', error);
  }
});

const analyzeContent = async (url) => {
  const query = prompt('Enter the query to search for in the content:');
  if (!query) return;

  try {
    const response = await fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        task: 'html',
        query,
      }),
    });

    const data = await response.json();
    displayAnalysisResult(data);
  } catch (error) {
    console.error('Error analyzing content:', error);
  }
};

const displayAnalysisResult = (data) => {
  document.getElementById('analysisResult').innerHTML = `
    <div class="alert alert-info mb-3">
      <div class="card-body">
        <h5 class="card-title">Analysis Result</h5>
        <p class="card-text">${data.response}</p>
      </div>
    </div>`;
};