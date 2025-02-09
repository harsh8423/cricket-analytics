from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json


def scrape_full_commentary(match_url):
    # Setup WebDriver options
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")  # Run in headless mode for faster execution
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        # Load the match page
        driver.get(match_url)
        wait = WebDriverWait(driver, 15)

        # Wait until navigation bar (innings tab) is loaded
        nav_bar = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "cb-ful-com-pl")))

        # Find all innings buttons
        innings_buttons = nav_bar.find_elements(By.CSS_SELECTOR, "a.cb-nav-pill-1")
        if not innings_buttons:
            raise Exception("No innings buttons found. Check if the page structure has changed.")

        commentary_data = {}

        # Loop through all innings tabs
        for button in innings_buttons:
            # Extract the innings name
            innings_name = button.text.strip()
            print(f"Processing {innings_name}...")

            # Click the button to load the corresponding innings' commentary
            ActionChains(driver).move_to_element(button).click(button).perform()
            time.sleep(3)  # Allow time for data to load dynamically

            # Wait for the commentary section to load
            try:
                commentary_section = wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.cb-col.cb-col-67.cb-ful-comm"))
                )
                # Find all commentary lines
                commentary_lines = commentary_section.find_elements(By.CSS_SELECTOR, "div.cb-col.cb-col-100.ng-scope")
                
                # Extract commentary text from each line
                commentary_texts = []
                for line in commentary_lines:
                    text = line.text.strip()
                    if text:  # Skip empty lines
                        commentary_texts.append(text)
                
                # Save commentary for the current innings
                commentary_data[innings_name] = commentary_texts

            except Exception as e:
                print(f"No commentary found for {innings_name}. Error: {e}")
                commentary_data[innings_name] = []

        # Save commentary data to a JSON file
        with open("match_commentary.json", "w", encoding="utf-8") as file:
            json.dump(commentary_data, file, ensure_ascii=False, indent=4)

        print("Commentary data successfully saved to 'match_commentary.json'.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        driver.quit()


# Usage
if __name__ == "__main__":
    match_url = "https://www.cricbuzz.com/cricket-full-commentary/89763/mi-vs-dc-20th-match-indian-premier-league-2024"
    scrape_full_commentary(match_url)
