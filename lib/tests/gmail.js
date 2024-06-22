// get the HTML content of the page
htmlString = document.body.innerHTML

// Function to extract text content from an element
function getTextContent(element) {
  return element ? element.textContent.trim() : 'N/A';
}

// Parse the HTML string
const parser = new DOMParser();
const htmlDoc = parser.parseFromString(htmlString, 'text/html');

// Find all the email rows in the table
const emailRows = htmlDoc.querySelectorAll('tr.zA');

// Array to store email data
const emailData = [];

// Iterate over each email row
emailRows.forEach(row => {
  // Find the title element
  const titleElement = row.querySelector('span.bog');
  const title = getTextContent(titleElement);

  // Find the body element
  const bodyElement = row.querySelector('span.y2');
  const body = getTextContent(bodyElement).replace('- ', '');

  // Print the title and body
  console.log('Title:', title);
  console.log('Body:', body);
  console.log('---');

  // Save as a JSON object
  emailData.push({
    title: title,
    body: body
  });
});

// Download the JSON file using Blob
const json = JSON.stringify(emailData, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'emailData.json';
a.click();
