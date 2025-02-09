from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import json
import re
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

class PlayingXIScraper:
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
        self.wait = WebDriverWait(self.driver, 30)  # Increased timeout to 30 seconds

    def wait_for_element(self, by: By, selector: str, retries: int = 3):
        """Wait for and return an element with retries."""
        attempt = 0
        while attempt < retries:
            try:
                return self.wait.until(EC.presence_of_element_located((by, selector)))
            except TimeoutException:
                logger.warning(f"Timeout waiting for element: {selector}, attempt {attempt + 1}/{retries}")
                attempt += 1
                time.sleep(2)  # Pause before retry
        return None

    def extract_team_data(self, selector: str, team_default_name: str):
        """Extract team name and players given a selector."""
        team_data = {"team_name": team_default_name, "players": []}
        team_section = self.wait_for_element(By.CSS_SELECTOR, selector)
        if not team_section:
            logger.warning(f"Failed to locate team section: {selector}. Returning default data.")
            return team_data

        # Extract team name
        try:
            team_name = team_section.find_element(By.TAG_NAME, "h3").text.strip()
            team_data["team_name"] = team_name
        except NoSuchElementException:
            logger.warning(f"Team header (h3) not found for selector: {selector}. Using default name.")

        # Extract players
        players = team_section.find_elements(By.CSS_SELECTOR, "a")
        for player in players:
            href = player.get_attribute("href")
            player_id = None
            if href:
                match = re.search(r"/profiles/(\d+)/", href)
                player_id = match.group(1) if match else "N/A"
            player_name = player.text.strip()
            team_data["players"].append({
                "name": player_name,
                "player_id": player_id or "N/A"
            })

        return team_data

    def scrape_playing_xi(self, url):
        """Main method to scrape Playing XI and save them to a JSON file."""
        try:
            self.setup_driver()
            logger.info(f"Fetching URL: {url}")
            self.driver.get(url)
            time.sleep(5)  # Allow time for the page to load

            # Extract data for both teams
            left_team_selector = "div.cb-play11-lft-col"
            right_team_selector = "div.cb-play11-rt-col"
            left_team = self.extract_team_data(left_team_selector, "Unknown Team 1")
            right_team = self.extract_team_data(right_team_selector, "Unknown Team 2")

            playing_xi = {
                left_team["team_name"]: left_team["players"],
                right_team["team_name"]: right_team["players"]
            }

            # Save to file
            match_id = re.search(r"/cricket-match-squads/(\d+)/", url)
            match_id = match_id.group(1) if match_id else "unknown_match"
            filename = f"playing_xi_{match_id}.json"

            with open(filename, "w", encoding="utf-8") as f:
                json.dump(playing_xi, f, indent=4, ensure_ascii=False)

            logger.info(f"Playing XI successfully saved to '{filename}'")
        except Exception as e:
            logger.error(f"Error scraping Playing XI: {e}")
        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    CHROMEDRIVER_PATH = "C:\\\\webdriver\\\\chromedriver.exe"
    SQUADS_URL = "https://www.cricbuzz.com/cricket-match-squads/89763/mi-vs-dc-20th-match-indian-premier-league-2024"

    scraper = PlayingXIScraper(CHROMEDRIVER_PATH)
    scraper.scrape_playing_xi(SQUADS_URL)
