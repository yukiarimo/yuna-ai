import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

def get_transcript(url):
    # Set up Chrome options for headless browsing
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run Chrome in headless mode

    # Create a new Chrome WebDriver instance with the headless option
    driver = webdriver.Chrome(options=chrome_options)

    try:
        # Navigate to the specified URL
        driver.get(url)

        # Wait for the page to load completely
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        time.sleep(2)

        # Execute the JavaScript function to get the transcript
        transcript = driver.execute_script("""
            function getTranscript() {
                // click on the #description-inner element to expand the description
                document.querySelector('#description-inner').click();

                const transcriptButton = document.querySelector('#primary-button ytd-button-renderer yt-button-shape button');
                if (transcriptButton) {
                    transcriptButton.click();
                }

                const parser = new DOMParser();
                html = document.querySelector('body').innerHTML;

                const doc = parser.parseFromString(html, 'text/html');

                // Get all the <yt-formatted-string> elements
                const elements = doc.querySelectorAll('yt-formatted-string');

                // Extract the text from each element and store it in an array
                const textArray = Array.from(elements).map(element => element.textContent.trim());

                // Find the index of "Transcript" and "No results found" in the array
                const startIndex = textArray.indexOf("Transcript") + 3; // +3 to skip empty lines after "Transcript"
                const endIndex = textArray.indexOf("No results found");

                // Slice the array from the index of "Transcript" to the index of "No results found"
                const slicedArray = textArray.slice(startIndex, endIndex);

                // Join the sliced array into a single string with each element separated by a newline
                const extractedText = slicedArray.join('\\n');

                return extractedText;
            }

            return getTranscript();
        """)

        return transcript

    finally:
        # Close the browser
        driver.quit()

# Example usage
url = "https://www.youtube.com/watch?v=xHHj6Xm9qVY"
transcript = get_transcript(url)
print(transcript)