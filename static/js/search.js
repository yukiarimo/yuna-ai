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
          query: encodeURIComponent(searchData)
        })
      })
      .then(response => response.text())
      .then(htmlContent => {
        // Store all the HTML content received from the server
        allHtmlContent = htmlContent;

        // Process the received HTML content
        var parser = new DOMParser();
        var doc = parser.parseFromString(htmlContent, 'text/html');

        // Example: Display the title of the parsed HTML
        var titleElement = doc.querySelector('title');

        // Get the element with class 'kno-rdesc'
        var knoRdescElement = doc.querySelector('.kno-rdesc');

        if (knoRdescElement == null) {
          knoRdescElement = doc.getElementsByClassName('hgKElc')[0];
        }

        // Extract text content from the element
        var textContent = knoRdescElement ? knoRdescElement.textContent.trim() : '';

        var resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Title: ${titleElement.innerText}</h5>
            <p class="card-text">${textContent}</p>
          </div>
        </div>`;

        // Select all elements with class "N54PNb"
        var resultElements = doc.querySelectorAll('.N54PNb');

        // Loop through each result element
        resultElements.forEach(function (resultElement) {
          // Get the title
          var titleElement = resultElement.querySelector('.LC20lb');
          var title = titleElement ? titleElement.textContent.trim() : '';

          // Get the URL
          var urlElement = resultElement.querySelector('a');
          var url = urlElement ? urlElement.href : '';

          // Display the information using Bootstrap cards
          resultsContainer.innerHTML += `
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${url}</p>
                <a href="${url}" class="btn btn-primary" target="_blank">Visit</a>
                <button type="button" class="btn btn-primary" onclick="analyzeContent('${url}')">Analyze</button>
              </div>
            </div>
          </div>`;

          /*
          // Get the first three search result elements
          const searchResults = doc.querySelectorAll('.eA0Zlc');

          // Extract the image URLs from the first three search results
          const imageUrls = [];
          for (let i = 0; i < 3 && i < searchResults.length; i++) {
            const imgElement = searchResults[i].querySelector('img');
            if (imgElement) {
              imageUrls.push(imgElement.src);
            }

            console.log(imageUrls);

            // Get the first url and base64 decode it and save it to a file (client side) from the variable imageUrls
            base64data = imageUrls[0]

            // save to file
            const a = document.createElement('a');
            a.href = base64data;
            a.download = 'image.jpg';
            a.click();

            // Create a new block with the image after the results
            resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML += `
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <img src="${base64data}" alt="Image" class="card-img-top">
              <a href="${base64data}" download="image.jpg" class="btn btn-primary">Download</a>
            </div>
          </div>
        </div>`;
          }*/
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
);

function analyzeContent(url) {
  // Process the received HTML content
}