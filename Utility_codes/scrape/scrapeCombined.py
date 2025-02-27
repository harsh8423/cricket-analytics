from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import json
import time
import re
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CricketMatchScraper:
    def __init__(self):
        self.driver = None
        self.base_url = None
        self.match_id = None

    def setup_driver(self):
        """Initialize the Chrome WebDriver with manual path."""
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument('--ignore-certificate-errors')
        chrome_options.add_argument('--ignore-ssl-errors')
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

        # Specify the path to chromedriver.exe
        chromedriver_path = "C:\\Users\\ASUS\\Downloads\\chromedriver-win64\\chromedriver.exe"  # Update this path
        service = Service(executable_path=chromedriver_path)
        
        # Initialize driver with options
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
        """Extract basic match details."""
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
            return {}

    def scrape_playing_xi(self):
        """Extract Playing XI for both teams."""
        try:
            # Navigate to Squads page
            squads_tab = self.wait_for_element(By.LINK_TEXT, "Squads")
            if squads_tab:
                self.driver.execute_script("arguments[0].click();", squads_tab)
                time.sleep(2)

            playing_xi = {}
            team_sections = self.driver.find_elements(By.CSS_SELECTOR, "div.cb-col.cb-col-100.cb-squad-list")
            
            for section in team_sections:
                team_name_elem = section.find_element(By.CSS_SELECTOR, "h2")
                team_name = team_name_elem.text.strip() if team_name_elem else "N/A"

                player_list = []
                players = section.find_elements(By.CSS_SELECTOR, "a")
                for player in players:
                    href = player.get_attribute("href")
                    player_id = re.search(r'/profiles/(\d+)/', href).group(1) if href else "N/A"
                    player_list.append({
                        "name": player.text.strip(),
                        "player_id": player_id
                    })

                playing_xi[team_name] = player_list

            return playing_xi
        except Exception as e:
            logger.error(f"Error extracting Playing XI: {e}")
            return {}

    def extract_player_id(self, href):
        """Extract player ID from href."""
        if href:
            match = re.search(r'/profiles/(\d+)/', href)
            return match.group(1) if match else None
        return None

    def scrape_scorecard(self):
        """Scrape match scorecard data."""
        try:
            # Navigate to scorecard page
            scorecard_url = self.base_url.replace("cricket-scores", "live-cricket-scorecard")
            self.driver.get(scorecard_url)
            time.sleep(3)

            innings = self.driver.find_elements(By.CLASS_NAME, "cb-col.cb-col-100.cb-ltst-wgt-hdr")
            scorecard_data = {}

            for idx, inning in enumerate(innings, start=1):
                inning_data = []
                player_rows = inning.find_elements(By.CLASS_NAME, "cb-col-100.cb-scrd-itms")
                
                for row in player_rows:
                    try:
                        player_link = row.find_element(By.TAG_NAME, "a")
                        href = player_link.get_attribute("href")
                        player_id = self.extract_player_id(href)
                    except:
                        player_id = None
                    
                    columns = row.find_elements(By.CLASS_NAME, "cb-col")
                    row_data = [col.text.strip() for col in columns if col.text.strip()]
                    
                    if row_data:
                        if player_id:
                            row_data.append(player_id)
                        inning_data.append(row_data)
                
                is_batting = (idx == 1 or idx == 4)
                if is_batting and len(inning_data) > 3:
                    inning_data = inning_data[:-3]
                
                scorecard_data[f"Inning{idx}"] = inning_data

            return scorecard_data
        except Exception as e:
            logger.error(f"Error scraping scorecard: {e}")
            return {}

    def scrape_commentary(self):
        """Scrape player-wise commentary data."""
        try:
            commentary_url = self.base_url.replace("cricket-scores", "cricket-full-commentary")
            self.driver.get(commentary_url)
            time.sleep(3)

            all_commentary_data = {}
            nav_bar = self.wait_for_element(By.CLASS_NAME, "cb-ful-com-pl")
            innings_buttons = nav_bar.find_elements(By.CSS_SELECTOR, "a.cb-nav-pill-1")

            for innings_index, button in enumerate(innings_buttons):
                innings_name = button.text.strip()
                if "PREVIEW" in innings_name.upper():
                    continue

                logger.info(f"Processing {innings_name}...")
                all_commentary_data[innings_name] = {
                    "batters": {},
                    "bowlers": {}
                }

                ActionChains(self.driver).move_to_element(button).click(button).perform()
                time.sleep(3)

                # Process batters
                batter_elements = self.wait.until(EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope a.cb-stats-lft-ancr[ng-click*='set_filters(3']")))

                for batter in batter_elements:
                    batter_name = batter.text.strip()
                    ActionChains(self.driver).move_to_element(batter).click(batter).perform()
                    time.sleep(2)

                    try:
                        commentary_section = self.wait.until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "div.cb-col.cb-col-67.cb-ful-comm")))
                        commentary_lines = commentary_section.find_elements(By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope")
                        
                        commentary_texts = [line.text.strip() for line in commentary_lines if line.text.strip()]
                        all_commentary_data[innings_name]["batters"][batter_name] = commentary_texts
                    except Exception as e:
                        logger.error(f"Error scraping batter {batter_name}: {e}")
                        all_commentary_data[innings_name]["batters"][batter_name] = []

                # Process bowlers
                bowler_elements = self.driver.find_elements(
                    By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope a.cb-stats-lft-ancr[ng-click*='set_filters(4']")

                for bowler in bowler_elements:
                    bowler_name = bowler.text.strip()
                    ActionChains(self.driver).move_to_element(bowler).click(bowler).perform()
                    time.sleep(2)

                    try:
                        commentary_section = self.wait.until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "div.cb-col.cb-col-67.cb-ful-comm")))
                        commentary_lines = commentary_section.find_elements(By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope")
                        
                        commentary_texts = [line.text.strip() for line in commentary_lines if line.text.strip()]
                        all_commentary_data[innings_name]["bowlers"][bowler_name] = commentary_texts
                    except Exception as e:
                        logger.error(f"Error scraping bowler {bowler_name}: {e}")
                        all_commentary_data[innings_name]["bowlers"][bowler_name] = []

            return all_commentary_data
        except Exception as e:
            logger.error(f"Error scraping commentary: {e}")
            return {}

    def scrape_match(self, match_url: str):
        """Main method to scrape all match data."""
        try:
            self.base_url = match_url
            self.match_id = re.search(r'/cricket-scores/(\d+)/', match_url).group(1)
            
            # Create output directory
            output_dir = f"match_{self.match_id}_data"
            os.makedirs(output_dir, exist_ok=True)
            
            self.setup_driver()
            self.driver.get(match_url)
            time.sleep(3)

            # Scrape all data
            match_details = self.extract_match_details()
            playing_xi = self.scrape_playing_xi()
            scorecard = self.scrape_scorecard()
            commentary = self.scrape_commentary()

            # Save all data
            data_files = {
                "match_details.json": match_details,
                "playing_xi.json": playing_xi,
                "scorecard.json": scorecard,
                "commentary.json": commentary
            }

            for filename, data in data_files.items():
                filepath = os.path.join(output_dir, filename)
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)

            logger.info(f"All match data successfully saved to directory: {output_dir}")

        except Exception as e:
            logger.error(f"Error scraping match: {e}")
        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    MATCH_URL = "https://www.cricbuzz.com/cricket-scores/89763/mi-vs-dc-20th-match-indian-premier-league-2024"
    scraper = CricketMatchScraper()
    scraper.scrape_match(MATCH_URL)