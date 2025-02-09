from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import json
import time
import re

# Path to ChromeDriver
CHROMEDRIVER_PATH = "C:\webdriver\chromedriver.exe"

# URL of the IPL squads page
URL = "https://www.cricbuzz.com/cricket-series/9237/indian-premier-league-2025/squads"

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    service = Service(CHROMEDRIVER_PATH)
    return webdriver.Chrome(service=service, options=chrome_options)

def extract_player_id(href):
    if href:
        match = re.search(r'/profiles/(\d+)/', href)
        return match.group(1) if match else None
    return None

def scrape_squad_data():
    driver = setup_driver()
    teams_data = []
    players_data = []
    
    try:
        driver.get(URL)
        time.sleep(3)  # Initial load wait
        
        # Find all team links in the sidebar
        team_links = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.cb-col.cb-col-100.cb-series-brdr.cb-stats-lft-ancr"))
        )
        
        for team_link in team_links:
            team_id = team_link.get_attribute('id')
            team_name = team_link.text.strip()
            
            # Click on team link
            driver.execute_script("arguments[0].click();", team_link)
            time.sleep(2)  # Wait for squad to load
            
            # Initialize team players list
            team_players = []
            
            # Find all player elements
            player_elements = driver.find_elements(By.CSS_SELECTOR, "a.cb-col.cb-col-50")
            
            for player in player_elements:
                href = player.get_attribute('href')
                player_id = int(extract_player_id(href))
                
                if player_id:
                    # Add player to team's players list
                    team_players.append(player_id)
                    
                    # Get player name and role
                    name_element = player.find_element(By.CSS_SELECTOR, "div.cb-font-16")
                    role_element = player.find_element(By.CSS_SELECTOR, "div.cb-text-gray")
                    
                    player_data = {
                        "_id": player_id,
                        "name": name_element.text.strip(),
                        "role": role_element.text.strip(),
                        "matches": []  # Initialize empty matches array as per schema
                    }
                    players_data.append(player_data)
            
            # Create team data
            team_data = {
                "_id": team_id,
                "team_name": team_name,
                "players": team_players,
                "matches": []  # Initialize empty matches array as per schema
            }
            teams_data.append(team_data)
            
        # Save teams data to JSON file
        with open('teams.json', 'w', encoding='utf-8') as f:
            json.dump(teams_data, f, indent=4, ensure_ascii=False)
            
        # Save players data to JSON file
        with open('players.json', 'w', encoding='utf-8') as f:
            json.dump(players_data, f, indent=4, ensure_ascii=False)
            
        print("Data successfully scraped and saved to teams.json and players.json")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    scrape_squad_data()