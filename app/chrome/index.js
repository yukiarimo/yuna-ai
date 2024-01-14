// Create a container for the popover
var popoverContainer = document.createElement('div');

// Set the innerHTML of the container with your popover HTML
popoverContainer.innerHTML = `
    <img id="floatingImage" src="yuna-ai-48.png" alt="Yuna AI" style="position: fixed; bottom: 10px; right: 10px; cursor: pointer; z-index: 1000;">
    <div id="popoverContainer" class="popover bs-popover-top" style="position: fixed; bottom: 70px; right: 10px; display: none; z-index: 1001;">
        <div class="arrow"></div>
        <h3 class="popover-header">Input</h3>
        <div class="popover-body">
            <input type="text" id="inputField" class="form-control">
            <button id="submitButton" class="btn btn-primary mt-2">Submit</button>
        </div>
    </div>
`;

// Append the container to the body
document.body.appendChild(popoverContainer);

// Create the link element for Bootstrap CSS
var bootstrapLink = document.createElement('link');
bootstrapLink.rel = 'stylesheet';
bootstrapLink.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css';

// Append the link element to the head of the document
document.head.appendChild(bootstrapLink);

// Vanilla JavaScript to toggle the popover
// Add event listeners for the popover functionality
window.onload = function() {
    var floatingImage = document.getElementById('floatingImage');
    var popover = document.getElementById('popoverContainer');

    floatingImage.addEventListener('click', function() {
        var isDisplayed = popover.style.display === 'block';
        popover.style.display = isDisplayed ? 'none' : 'block';
        popover.style.opacity = isDisplayed ? 0 : 1;
    });

    document.getElementById('submitButton').addEventListener('click', function() {
        var input = document.getElementById('inputField');
        console.log(input.value);
        input.value = '';
        popover.style.display = 'none';
    });
};