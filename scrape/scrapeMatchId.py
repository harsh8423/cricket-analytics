from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import json
import re

def scrape_match_ids(url):
    # Setup WebDriver
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 10)

    matches_data = []

    try:
        # Load the page
        driver.get(url)
        
        # Wait for match links to be present
        match_links = wait.until(EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "a.text-hvr-underline[href*='/cricket-scores/']")))

        for link in match_links:
            href = link.get_attribute('href')
            
            # Extract match ID using regex
            match_id_match = re.search(r'/cricket-scores/(\d+)/', href)
            if match_id_match:
                match_id = int(match_id_match.group(1))  # Convert to integer
                
                # Create URLs
                match_data = {
                    "matchId": match_id,
                    "title": link.text.strip(),
                    "urls": {
                        "commentary_1": f"https://www.cricbuzz.com/api/cricket-match/{match_id}/full-commentary/1",
                        "commentary_2": f"https://www.cricbuzz.com/api/cricket-match/{match_id}/full-commentary/2",
                        "scorecard": f"https://www.cricbuzz.com/api/html/cricket-scorecard/{match_id}"
                    }
                }
                matches_data.append(match_data)
                print(f"Processed match ID: {match_id}")

        # Save to JSON file
        with open("match_ids.json", "w", encoding="utf-8") as f:
            json.dump({"matches": matches_data}, f, indent=4, ensure_ascii=False)
            
        print(f"\nSuccessfully scraped {len(matches_data)} matches")
        print("Data saved to match_ids.json")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        driver.quit()

if __name__ == "__main__":
    series_url = "https://www.cricbuzz.com/cricket-series/5945/indian-premier-league-2023/matches"
    scrape_match_ids(series_url)