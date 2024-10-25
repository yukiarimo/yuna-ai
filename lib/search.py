from lib.generate import get_config
config = get_config()

if config.get("ai", {}).get("search"):
    import time
    import urllib.parse
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.options import Options
    from contextlib import contextmanager
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.by import By

    @contextmanager
    def get_driver():
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        try:
            yield driver
        finally:
            driver.quit()

    def search_web(search_query, base_url, process_data):
        encoded_query = urllib.parse.quote(search_query)
        search_url = f'{base_url}/search?q={encoded_query}'
        print(f"Search URL: {search_url}")

        if not process_data:
            with get_driver() as driver:
                try:
                    driver.get(search_url)
                except Exception as e:
                    print(f"Error navigating to {search_url}: {e}")
                    return None, None, None

                answer = driver.execute_script("""
                    var ans = document.querySelector('.kno-rdesc > span') || document.querySelector('.hgKElc');
                    return ans ? ans.textContent.trim() : 'Answer not found.';
                """)

                search_results = driver.execute_script("""
                    return Array.from(document.querySelectorAll('.g')).map(result => {
                        const link = result.querySelector('.yuRUbf a')?.href || '';
                        const title = result.querySelector('.yuRUbf a h3')?.textContent.trim() || '';
                        const description = result.querySelector('.VwiC3b')?.textContent.trim() || '';
                        return { 'Link': link, 'Title': title, 'Description': description };
                    }).filter(r => r.Link && r.Title && r.Description);
                """)

            return answer, search_results, search_images(search_query, base_url)

    def search_images(search_query, base_url):
        encoded_query = urllib.parse.quote(search_query)
        image_search_url = f'{base_url}/search?q={encoded_query}&tbm=isch'
        print(f"Image Search URL: {image_search_url}")

        with get_driver() as driver:
            try:
                driver.get(image_search_url)
            except Exception as e:
                print(f"Error navigating to {image_search_url}: {e}")
                return None

            image_urls = driver.execute_script("""
                let scripts = Array.from(document.querySelectorAll('script')).filter(s => s.innerHTML.includes('google.kEXPI'));
                if (scripts.length) {
                    let matches = scripts[0].innerHTML.match(/"([^"]*\\.jpg)"/g);
                    return matches ? matches.slice(0, 3).map(url => url.replace(/"/g, '')) : [];
                }
                return [];
            """)

        for idx, img_url in enumerate(image_urls, 1):
            print(f"Image URL {idx}: {img_url}")
        return image_urls

    def get_html(url):
        with get_driver() as driver:
            try:
                driver.get(url)
                return driver.page_source
            except Exception as e:
                print(f"Error navigating to {url}: {e}")
                return None

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
    #transcript = get_transcript(url)
    #print(transcript)