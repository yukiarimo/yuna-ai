var allHtmlContent = '';

document.getElementById('searchButton').addEventListener('click', function () {
  var searchData = document.getElementById('searchInput').value;

  // Display the request information
  var requestResultsContainer = document.getElementById('requestResults');
  requestResultsContainer.innerHTML = '<p><strong>Request:</strong> Sending search request for: ' +
    searchData + '</p>';

  // Use Fetch API to send a POST request to your server
  fetch('http://localhost:3003/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: searchData
      }),
    })
    .then(response => response.text()) // Note: Use text() instead of json() to get the HTML content
    .then(htmlContent => {
      // Store all the HTML content received from the server
      allHtmlContent = htmlContent;

      // Display the response information
      var responseResultsContainer = document.getElementById('results');
      responseResultsContainer.innerHTML =
        '<p><strong>Response:</strong> Received HTML content from the server.</p>';

      // Process the received HTML content
      var parser = new DOMParser();
      var doc = parser.parseFromString(htmlContent, 'text/html');

      // Example: Display the title of the parsed HTML
      var titleElement = doc.querySelector('title');

      // Get the element with class 'kno-rdesc'
      var knoRdescElement = doc.querySelector('.kno-rdesc');

      if (knoRdescElement == null) {
        // If the element is not found, try to get the element with class 'kno-rdesc c-wiz'
        knoRdescElement = doc.getElementsByClassName('hgKElc')[0];
      }

      // Extract text content from the element
      var textContent = knoRdescElement ? knoRdescElement.textContent.trim() : '';

      var resultsContainer = document.getElementById('results');
      resultsContainer.innerHTML = '<p><strong>Page Title:</strong> ' + titleElement
        .innerText + '</p>';
      resultsContainer.innerHTML += '<p><strong>Extracted Content:</strong> ' + textContent +
        '</p>';

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

        // Display the information
        resultsContainer.innerHTML += '<p><strong>Title:</strong> ' + title +
          '</p>';
        resultsContainer.innerHTML += '<p><strong>URL:</strong> <a href="' + url +
          '" target="_blank">' + url + '</a></p>';
      });
    })
    .catch(error => console.error('Error:', error));
});
