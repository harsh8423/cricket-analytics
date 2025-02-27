from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

def scrape_player_commentary(match_url):
    # Setup WebDriver options
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 15)

    try:
        # Load the match page
        driver.get(match_url)
        
        # Dictionary to store all commentary data
        all_commentary_data = {}

        # Wait until navigation bar is loaded
        nav_bar = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "cb-ful-com-pl")))
        innings_buttons = nav_bar.find_elements(By.CSS_SELECTOR, "a.cb-nav-pill-1")

        if not innings_buttons:
            raise Exception("No innings buttons found.")

        # Process each innings
        for innings_index, button in enumerate(innings_buttons):
            innings_name = button.text.strip()
            if "PREVIEW" in innings_name.upper():
                continue

            print(f"\nProcessing {innings_name}...")
            all_commentary_data[innings_name] = {
                "batters": {},
                "bowlers": {}
            }

            # Click the innings button
            ActionChains(driver).move_to_element(button).click(button).perform()
            time.sleep(3)

            # Process batters
            print("Processing batters...")
            batter_elements = wait.until(EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope a.cb-stats-lft-ancr[ng-click*='set_filters(3']")))

            for batter in batter_elements:
                batter_name = batter.text.strip()
                print(f"  Scraping commentary for batter: {batter_name}")
                
                # Click on batter name
                ActionChains(driver).move_to_element(batter).click(batter).perform()
                time.sleep(2)

                # Get batter's commentary
                try:
                    commentary_section = wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "div.cb-col.cb-col-67.cb-ful-comm")))
                    commentary_lines = commentary_section.find_elements(By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope")
                    
                    commentary_texts = []
                    for line in commentary_lines:
                        text = line.text.strip()
                        if text:
                            commentary_texts.append(text)
                    
                    all_commentary_data[innings_name]["batters"][batter_name] = commentary_texts
                except Exception as e:
                    print(f"    Error scraping batter {batter_name}: {e}")
                    all_commentary_data[innings_name]["batters"][batter_name] = []

            # Process bowlers
            print("Processing bowlers...")
            bowler_elements = driver.find_elements(
                By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope a.cb-stats-lft-ancr[ng-click*='set_filters(4']")

            for bowler in bowler_elements:
                bowler_name = bowler.text.strip()
                print(f"  Scraping commentary for bowler: {bowler_name}")
                
                # Click on bowler name
                ActionChains(driver).move_to_element(bowler).click(bowler).perform()
                time.sleep(2)

                # Get bowler's commentary
                try:
                    commentary_section = wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "div.cb-col.cb-col-67.cb-ful-comm")))
                    commentary_lines = commentary_section.find_elements(By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope")
                    
                    commentary_texts = []
                    for line in commentary_lines:
                        text = line.text.strip()
                        if text:
                            commentary_texts.append(text)
                    
                    all_commentary_data[innings_name]["bowlers"][bowler_name] = commentary_texts
                except Exception as e:
                    print(f"    Error scraping bowler {bowler_name}: {e}")
                    all_commentary_data[innings_name]["bowlers"][bowler_name] = []

        # Save all commentary data to a JSON file
        with open("player_commentary.json", "w", encoding="utf-8") as file:
            json.dump(all_commentary_data, file, ensure_ascii=False, indent=4)

        print("\nCommentary data successfully saved to 'player_commentary.json'")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        driver.quit()

# Usage
if __name__ == "__main__":
    match_url = "https://www.cricbuzz.com/cricket-full-commentary/89763/mi-vs-dc-20th-match-indian-premier-league-2024"
    scrape_player_commentary(match_url)