import requests
from bs4 import BeautifulSoup

def get_player_info(player_id):
    """
    Scrapes player information from Cricbuzz profile page
    
    Args:
        player_id (str): Player ID from Cricbuzz URL
        
    Returns:
        dict: Dictionary containing role, batting style and bowling style
    """
    
    # Construct the URL
    url = f"https://www.cricbuzz.com/profiles/{player_id}"
    
    try:
        # Send GET request
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the div containing personal information
        info_div = soup.find('div', class_='cb-hm-rght')
        
        # Initialize dictionary to store player info
        player_info = {}
        
        # Extract role, batting style and bowling style
        div_elements = info_div.find_all('div', class_='cb-col')
        
        for i in range(len(div_elements)-1):
            current_div = div_elements[i]
            next_div = div_elements[i+1]
            
            if 'Role' in current_div.text:
                player_info['role'] = next_div.text.strip()
            elif 'Batting Style' in current_div.text:
                player_info['batting_style'] = next_div.text.strip()
            elif 'Bowling Style' in current_div.text:
                player_info['bowling_style'] = next_div.text.strip()
                
        return player_info
        
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
    except Exception as e:
        print(f"Error processing data: {e}")
        return None

# Example usage
if __name__ == "__main__":
    player_id = "11813"
    player_info = get_player_info(player_id)
    
    if player_info:
        print("Player Information:")
        print(f"Role: {player_info.get('role', 'Not found')}")
        print(f"Batting Style: {player_info.get('batting_style', 'Not found')}")
        print(f"Bowling Style: {player_info.get('bowling_style', 'Not found')}")