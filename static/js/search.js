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
        query: 'https://www.google.com/search?q=' + encodeURIComponent(searchData),
        processData: false,
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
      resultsContainer.innerHTML = '';
      var answerResultsContainer = document.getElementById('answerResults');
      answerResultsContainer.innerHTML = `
        <div class="alert alert-info mb-3">
          <div class="card-body">
            <h5 class="card-title">${titleElement.innerText}</h5>
            <p class="card-text" id="main-search-info">${textContent}</p>
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
      });

      fetch('/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: 'https://www.google.com/search?q=' + encodeURIComponent(searchData) + '&tbm=isch',
            processData: false,
          })
        })
        .then(response => response.text())
        .then(htmlContent => {
          // Store all the HTML content received from the server
          allHtmlContent = htmlContent;

          // Process the received HTML content
          var parser = new DOMParser();
          var doc = parser.parseFromString(htmlContent, 'text/html');
          console.log(doc);
          
          let scripts = doc.body.getElementsByTagName('script');
          let targetScript;

          for (let script of scripts) {
            if (script.innerHTML.includes('google.kEXPI')) {
              targetScript = script;
              break;
            }
          }

          if (targetScript) {
            // get the value that element as a text
            let text = targetScript.innerHTML;
            text_snippet = text

            // Regex pattern to match the structure and capture the URL
            let pattern = /"([^"]*\.jpg)"/g;

            // Find all matches in the text snippet
            let matches = text_snippet.match(pattern);

            console.log('Matches:', matches);

            // Print first three matched URLs
            for (let i = 0; i < matches.length && i < 3; i++) {
              let url = matches[i];
              // create a new div element to act as a card
              let card = document.createElement('div');
              card.className = 'card mb-3';

              // create a new image element and set the source attribute
              let img = document.createElement('img');
              img.src = url.replace(/"/g, '').replace(/"/g, '');
              img.className = 'card-img-top'; // Bootstrap class for images in cards

              // append the image to the card
              card.appendChild(img);

              // append the card to the resultsContainer element without overwriting the previous content
              resultsContainer.appendChild(card);
            }
          } else {
            console.log('No script found with "google.kEXPI"');
          }
        });

    })
    .catch(error => {
      console.error('Error:', error);
    });
});

function analyzeContent(url) {
  // Process the received HTML content
}