from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import json
import time
import re
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CricketMatchScraper:
    def __init__(self, chromedriver_path: str):
        self.chromedriver_path = chromedriver_path
        self.driver = None
        self.wait = None

    def setup_driver(self):
        """Initialize the Chrome WebDriver with optimal settings."""
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")

        service = Service(self.chromedriver_path)
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 20)

    def wait_for_element(self, by: By, selector: str, timeout: int = 20):
        """Wait for and return an element with better error handling."""
        try:
            return self.wait.until(EC.presence_of_element_located((by, selector)))
        except TimeoutException:
            logger.warning(f"Timeout waiting for element: {selector}")
            return None

    def extract_match_details(self):
        """Extract basic match details like venue, date & time, teams, scores, and result."""
        try:
            # Venue
            venue_element = self.wait_for_element(By.CSS_SELECTOR, "span.text-hvr-underline.text-gray span[itemprop='name']")
            venue = venue_element.text.strip() if venue_element else "N/A"

            # Date and Time
            date_time_element = self.wait_for_element(By.CSS_SELECTOR, "span[itemprop='startDate']")
            date_time = date_time_element.get_attribute("content") if date_time_element else "N/A"

            # Teams
            team_element = self.wait_for_element(By.CSS_SELECTOR, "h1.cb-nav-hdr.cb-font-18.line-ht24")
            teams_text = team_element.text.strip() if team_element else ""
            team1_name, team2_name = "N/A", "N/A"
            if " vs " in teams_text:
                team1_name, team2_name = teams_text.split(" vs ")[0:2]

            score_elements = self.driver.find_elements(By.CSS_SELECTOR, "h2.cb-min-tm")
            team1_score = score_elements[0].text.strip() if len(score_elements) > 0 else "N/A"
            team2_score = score_elements[1].text.strip() if len(score_elements) > 1 else "N/A"

            # Result
            result_element = self.driver.find_elements(By.CSS_SELECTOR, "div.cb-col.cb-col-100.cb-min-stts.cb-text-complete")
            result = result_element[1].text.strip() if result_element else "N/A"

            # Player of the Match
            potm_element = self.wait_for_element(By.CSS_SELECTOR, "a.cb-link-undrln.ng-binding")
            player_of_match = potm_element.text.strip() if potm_element else "N/A"

            return {
                "venue": venue,
                "date_time": date_time,
                "team1_name": team1_name,
                "team2_name": team2_name,
                "team1_score": team1_score,
                "team2_score": team2_score,
                "result": result,
                "player_of_the_match": player_of_match
            }

        except Exception as e:
            logger.error(f"Error extracting match details: {e}")
            return {
                "venue": "N/A",
                "date_time": "N/A",
                "team1_name": "N/A",
                "team2_name": "N/A",
                "team1_score": "N/A",
                "team2_score": "N/A",
                "result": "N/A",
                "player_of_the_match": "N/A"
            }


    def scrape_match(self, url):
        """Main method to scrape match details and save them to a JSON file."""
        try:
            self.setup_driver()
            self.driver.get(url)
            time.sleep(3)  # Wait for page to load

            match_details = self.extract_match_details()

            match_data = {
                **match_details,
            }

            match_id = re.search(r'/cricket-scores/(\d+)/', url).group(1)
            filename = f"match_{match_id}_details.json"

            with open(filename, "w", encoding="utf-8") as f:
                json.dump(match_data, f, indent=4, ensure_ascii=False)

            logger.info(f"Match details successfully saved to '{filename}'")

        except Exception as e:
            logger.error(f"Error scraping match: {e}")

        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    CHROMEDRIVER_PATH = "C:\\webdriver\\chromedriver.exe"
    MATCH_URL = "https://www.cricbuzz.com/cricket-scores/89763/mi-vs-dc-20th-match-indian-premier-league-2024"

    scraper = CricketMatchScraper(CHROMEDRIVER_PATH)
    scraper.scrape_match(MATCH_URL)
