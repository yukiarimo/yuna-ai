from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import urllib.parse

def search_web(search_query, url, processData):
    # Encode the search query to ensure it's a valid URL
    encoded_query = urllib.parse.quote(search_query)
    search_url = f'{url}/search?q={encoded_query}'

    print(f"Search URL: {search_url}")  # Debugging line

    if processData == False:
        # Setup Selenium
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Ensure GUI is off
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # Choose Chrome Browser
        webdriver_service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=webdriver_service, options=chrome_options)

        try:
            driver.get(search_url)
        except Exception as e:
            print(f"Error navigating to {search_url}: {e}")
            driver.quit()
            return None, None, None

        # Define JavaScript functions
        extract_answer_js = """
        function extractAnswer() {
            var answerElement = document.querySelector('.kno-rdesc > span');
            if (!answerElement) {
                answerElement = document.querySelector('.hgKElc');
            }

            if (answerElement) {
                return answerElement.textContent.trim();
            } else {
                return 'Answer not found.';
            }
        }
        return extractAnswer();
        """

        extract_search_results_js = """
        function extractSearchResults() {
            const searchResults = document.querySelectorAll('.g');
            let results = [];
            searchResults.forEach((result) => {
                const linkElement = result.querySelector('.yuRUbf a');
                const titleElement = result.querySelector('.yuRUbf a h3');
                const descriptionElement = result.querySelector('.VwiC3b');

                if (linkElement && titleElement && descriptionElement) {
                    const link = linkElement.href;
                    const title = titleElement.textContent.trim();
                    const description = descriptionElement.textContent.trim();

                    results.push({
                        'Link': link,
                        'Title': title,
                        'Description': description
                    });
                }
            });
            return results;
        }
        return extractSearchResults();
        """

        # Execute JavaScript and get the results
        answer = driver.execute_script(extract_answer_js)
        search_results = driver.execute_script(extract_search_results_js)

        driver.quit()

        return answer, search_results, search_images(search_query, url)

def search_images(search_query, url):
    # Encode the search query to ensure it's a valid URL
    encoded_query = urllib.parse.quote(search_query)
    image_search_url = f'{url}/search?q={encoded_query}&tbm=isch'

    print(f"Image Search URL: {image_search_url}")  # Debugging line

    # Setup Selenium
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Ensure GUI is off
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Choose Chrome Browser
    webdriver_service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=webdriver_service, options=chrome_options)

    try:
        driver.get(image_search_url)
    except Exception as e:
        print(f"Error navigating to {image_search_url}: {e}")
        driver.quit()
        return None

    extract_image_urls_js = """
    var doc = document;
    let scripts = doc.body.getElementsByTagName('script');
    let targetScript;

    for (let script of scripts) {
        if (script.innerHTML.includes('google.kEXPI')) {
            targetScript = script;
            break;
        }
    }

    if (targetScript) {
        let text = targetScript.innerHTML;
        let pattern = /"([^"]*\\.jpg)"/g;
        let matches = text.match(pattern);
        return matches ? matches.slice(0, 3).map(url => url.replace(/"/g, '')) : [];
        } else {
        return [];
    }
    """

    image_urls = driver.execute_script(extract_image_urls_js)

    # Print all matched URLs
    for i, url in enumerate(image_urls):
        print(f"Image URL {i+1}: {url}")

    driver.quit()

    return image_urls

def get_html(url):
    # Setup Selenium
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Ensure GUI is off
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Choose Chrome Browser
    webdriver_service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=webdriver_service, options=chrome_options)

    try:
        driver.get(url)
        html = driver.page_source
    except Exception as e:
        print(f"Error navigating to {url}: {e}")
        driver.quit()
        return None

    driver.quit()

    return html