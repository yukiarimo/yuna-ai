var allHtmlContent = '';

document.getElementById('searchButton').addEventListener('click', function () {
  var searchData = document.getElementById('searchInput').value;

  // Display the request information
  var requestResultsContainer = document.getElementById('requestResults');
  requestResultsContainer.classList.remove('d-none');
  requestResultsContainer.innerHTML = '<p><strong>Request:</strong> Sending for: ' +
    searchData + '</p>';

  // Use Fetch API to send a POST request to the server
  fetch('/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: searchData,
      url: "https://www.google.com",
      processData: false,
    })
  })
  .then(response => response.json()) // Parse the JSON from the response
  .then(data => {
    console.log('Data:', data);
  
    // Extract the message and results from the data
    var message = data.message[0];
    var results = data.message[1];
    var imageUrls = data.images;
  
    var resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    var answerResultsContainer = document.getElementById('answerResults');
    answerResultsContainer.innerHTML = `
      <div class="alert alert-info mb-3">
        <div class="card-body">
          <h5 class="card-title">Search Result</h5>
          <p class="card-text" id="main-search-info">${message}</p>
        </div>
      </div>`;
  
    // Loop through each result
    results.forEach(function (result) {
      // Get the title, description, and URL
      var title = result.Title;
      var description = result.Description;
      var url = result.Link;
  
      // Display the information using Bootstrap cards
      resultsContainer.innerHTML += `
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">${description}</p>
              <a href="${url}" class="btn btn-primary" target="_blank">Visit</a>
              <button type="button" class="btn btn-primary" onclick="analyzeContent('${url}')">Analyze</button>
            </div>
          </div>
        </div>`;
    });

    // Process image URLs
    imageUrls.forEach(function (url) {
      // create a new div element to act as a card
      let card = document.createElement('div');
      card.className = 'card mb-3';

      // create a new image element and set the source attribute
      let img = document.createElement('img');
      img.src = url;
      img.className = 'card-img-top'; // Bootstrap class for images in cards

      // append the image to the card
      card.appendChild(img);

      // append the card to the resultsContainer element without overwriting the previous content
      resultsContainer.appendChild(card);
    });

  })
  .catch(error => {
    console.error('Error:', error);
  });
});

function analyzeContent(url) {
  // Create a FormData object
  const formData = new FormData();
  formData.append('url', url);
  formData.append('task', 'html');

  var promptForContent = prompt('Enter the query to search for in the content:');

  // Send the FormData object to the server
  fetch('/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      task: 'html',
      query: promptForContent
    })
  })
  .then(response => response.json())
  .then(data => {
    displayAnalysisResult(data);
  })
  .catch(error => {
    console.error('Error analyzing content:', error);
  });
}

function displayAnalysisResult(data) {
  const analysisResultContainer = document.getElementById('analysisResult');
  analysisResultContainer.innerHTML = `
    <div class="alert alert-info mb-3">
      <div class="card-body">
        <h5 class="card-title">Analysis Result</h5>
        <p class="card-text">${data.response}</p>
      </div>
    </div>`;
}