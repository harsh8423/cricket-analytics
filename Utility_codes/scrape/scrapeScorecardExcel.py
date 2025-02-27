from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time

# Path to ChromeDriver (Update this with your driver path)
CHROMEDRIVER_PATH = "C:\webdriver\chromedriver.exe"

# URL of the IPL match scorecard
URL = "https://www.cricbuzz.com/live-cricket-scorecard/89763/mi-vs-dc-20th-match-indian-premier-league-2024"

# Configure Chrome options for Selenium
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode (no browser UI)
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

# Function to scrape match scorecard
def scrape_ipl_scorecard(url):
    # Start WebDriver
    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        # Load the webpage
        driver.get(url)
        time.sleep(3)  # Wait for page to load
        
        # Extract all innings scorecard tables
        innings = driver.find_elements(By.CLASS_NAME, "cb-col.cb-col-100.cb-ltst-wgt-hdr")
        match_data = []
        
        # Loop through each inning to collect scorecard
        for inning in innings:
            rows = inning.find_elements(By.TAG_NAME, "div")
            inning_data = []
            for row in rows:
                # Fetch player, dismissal info, runs, balls, etc.
                columns = row.find_elements(By.CLASS_NAME, "cb-col")
                row_data = [col.text.strip() for col in columns if col.text.strip()]
                if row_data:
                    inning_data.append(row_data)
            match_data.append(inning_data)
        
        # Store the data in a structured format
        structured_data = {}
        for idx, inning in enumerate(match_data):
            df = pd.DataFrame(inning)
            structured_data[f"Inning_{idx+1}"] = df
        
        # Save to Excel
        with pd.ExcelWriter("ipl_match_scorecard.xlsx") as writer:
            for inning_name, df in structured_data.items():
                df.to_excel(writer, sheet_name=inning_name, index=False)
        
        print("Scorecard data successfully saved to 'ipl_match_scorecard.xlsx'.")
    
    except Exception as e:
        print(f"An error occurred: {e}")
    
    finally:
        driver.quit()

# Call the function
scrape_ipl_scorecard(URL)
