import json
import re
from collections import defaultdict

def load_json_file(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
        # Add debug print to check data structure
        print(f"Loaded data type: {type(data)}")
        if isinstance(data, dict):
            print("Keys in data:", list(data.keys()))
        elif isinstance(data, list):
            print(f"Number of items in list: {len(data)}")
            if data:
                print(f"First item type: {type(data[0])}")
        return data

def load_js_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
        # Remove module.exports = and convert to valid JSON
        content = re.sub(r'^module\.exports\s*=\s*', '', content)
        # Remove trailing semicolon if present
        content = re.sub(r';$', '', content)
        return json.loads(content)

def save_json_file(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def categorize_players_by_role(player_data):
    categorized_data = {}
    
    # Handle different input formats
    if isinstance(player_data, str):
        try:
            player_data = json.loads(player_data)
        except json.JSONDecodeError:
            print("Error: player_data is a string but not valid JSON")
            return {}
    
    # Convert dictionary to list if necessary
    if isinstance(player_data, dict):
        player_data = list(player_data.values())
    
    if not isinstance(player_data, list):
        print(f"Error: Unexpected player_data type: {type(player_data)}")
        return {}
    
    for player in player_data:
        if isinstance(player, str):
            try:
                player = json.loads(player)
            except json.JSONDecodeError:
                print(f"Warning: Skipping invalid player data: {player[:100]}...")
                continue
        
        if not isinstance(player, dict):
            print(f"Warning: Skipping non-dict player data of type: {type(player)}")
            continue
            
        player_id = str(player.get('player_id', 0))
        if not player_id or player_id == '0':
            print(f"Warning: Skipping player with invalid ID: {player}")
            continue
            
        player_copy = player.copy()
        role = player_copy.get('role', 'Unknown')
        
        # Remove bowling stats for batsmen and WK-batsmen
        if role in ['Batsman', 'WK-Batsman']:
            if 'bowling' in player_copy:
                del player_copy['bowling']
        
        # Remove batting stats for bowlers
        elif role == 'Bowler':
            if 'batting' in player_copy:
                del player_copy['batting']
        
        # For all-rounders, combine batting and bowling stats by match_id
        elif 'Allrounder' in role:
            combined_matches = defaultdict(lambda: {'batting': {}, 'bowling': {}})
            
            # Process batting stats
            batting_matches = player_copy.get('batting', {}).get('matches', [])
            if isinstance(batting_matches, list):
                for match in batting_matches:
                    if isinstance(match, dict):
                        match_id = match.get('match_id')
                        if match_id:
                            combined_matches[match_id]['batting'] = {
                                'runs': match.get('runs', 0),
                                'stats_type': match.get('stats_type'),
                                'balls': match.get('balls', 0),
                                'strike_rate': match.get('strike_rate', 0),
                                'fantasy_points': match.get('fantasy_points', 0),
                                'batting_position': match.get('batting_position', 0)
                            }
            
            # Process bowling stats
            bowling_matches = player_copy.get('bowling', {}).get('matches', [])
            if isinstance(bowling_matches, list):
                for match in bowling_matches:
                    if isinstance(match, dict):
                        match_id = match.get('match_id')
                        if match_id:
                            combined_matches[match_id]['bowling'] = {
                                'overs': match.get('overs', 0),
                                'runs': match.get('runs', 0),
                                'wickets': match.get('wickets', 0),
                                'economy': match.get('economy', 0),
                                'stats_type': match.get('stats_type'),
                                'fantasy_points': match.get('fantasy_points', 0)
                            }
            
            # Convert combined matches back to list
            player_copy['matches'] = [
                {
                    'match_id': match_id,
                    'batting': match_data['batting'],
                    'bowling': match_data['bowling']
                }
                for match_id, match_data in combined_matches.items()
            ]
            
            # Remove original batting and bowling sections
            if 'batting' in player_copy:
                del player_copy['batting']
            if 'bowling' in player_copy:
                del player_copy['bowling']
        
        categorized_data[player_id] = player_copy
    
    return categorized_data

def calculate_bowling_ratings(data, innings_type='overall'):
    def calculate_field_rating(actual, average, max_points):
        if average == 0:
            return 0
        # Calculate percentage difference from average
        percentage_diff = ((average - actual) / average) * 100
        points= max_points+ max_points*(percentage_diff/100)
        
        # Ensure rating doesn't go below 0 or above max_points
        return points
    
    # Extract spin and pace data
    spin_data = next((stat for stat in data if 
        stat.get('innings', '').lower().replace(' ', '') == innings_type.lower() and 
        stat.get('bowler_type', '').lower() == 'spin'), {})
    
    pace_data = next((stat for stat in data if 
        stat.get('innings', '').lower().replace(' ', '') == innings_type.lower() and 
        stat.get('bowler_type', '').lower() == 'pace'), {})
    
    if not spin_data or not pace_data:
        return {'spin': 0, 'pace': 0}
    
    # Calculate averages
    avg_runs_per_wicket = (spin_data['runs_per_wicket'] + pace_data['runs_per_wicket']) / 2
    avg_balls_per_wicket = (spin_data['balls_per_wicket'] + pace_data['balls_per_wicket']) / 2
    avg_strike_rate = (spin_data['strike_rate'] + pace_data['strike_rate']) / 2
    avg_economy = (spin_data['economy_rate'] + pace_data['economy_rate']) / 2
    
    # Calculate ratings for spin
    spin_rating = (
        calculate_field_rating(spin_data['runs_per_wicket'], avg_runs_per_wicket, 30) +
        calculate_field_rating(spin_data['balls_per_wicket'], avg_balls_per_wicket, 40) +
        calculate_field_rating(spin_data['strike_rate'], avg_strike_rate, 15) +
        calculate_field_rating(spin_data['economy_rate'], avg_economy, 15)
    )
    
    # Calculate ratings for pace
    pace_rating = (
        calculate_field_rating(pace_data['runs_per_wicket'], avg_runs_per_wicket, 30) +
        calculate_field_rating(pace_data['balls_per_wicket'], avg_balls_per_wicket, 40) +
        calculate_field_rating(pace_data['strike_rate'], avg_strike_rate, 15) +
        calculate_field_rating(pace_data['economy_rate'], avg_economy, 15)
    )
    
    return {
        'spin':round(spin_rating/2),
        'pace':round(pace_rating/2)
    }

def process_venue_stats(processed_data):
    venue_stats = {}
    venue_data = processed_data.get('match_summary', {}).get('venue_stats', [])
    
    if not venue_data:
        return {}
    
    # Calculate ratings for each innings type
    venue_stats = {
        'overall': calculate_bowling_ratings(venue_data, 'overall'),
        'innings1': calculate_bowling_ratings(venue_data, 'Inning1'),
        'innings2': calculate_bowling_ratings(venue_data, 'Inning2')
    }
    
    return venue_stats

def process_match_scorecards():
    # Dummy scorecard data
    scorecards = [
        {
            "match_id": 1,
            "innings1": {"runs": 207, "wickets": 6},
            "innings2": {"runs": 167, "wickets": 4},
            "chasing_team_won": False
        },
        {
            "match_id": 2,
            "innings1": {"runs": 185, "wickets": 6},
            "innings2": {"runs": 189, "wickets": 5},
            "chasing_team_won": True
        },
        {
            "match_id": 3,
            "innings1": {"runs": 156, "wickets": 7},
            "innings2": {"runs": 157, "wickets": 3},
            "chasing_team_won": True
        },
        {
            "match_id": 4,
            "innings1": {"runs": 198, "wickets": 5},
            "innings2": {"runs": 182, "wickets": 8},
            "chasing_team_won": False
        },
        {
            "match_id": 5,
            "innings1": {"runs": 176, "wickets": 6},
            "innings2": {"runs": 145, "wickets": 10},
            "chasing_team_won": False
        }
    ]
    
    # Calculate statistics
    total_first_innings = sum(match["innings1"]["runs"] for match in scorecards)
    total_second_innings = sum(match["innings2"]["runs"] for match in scorecards)
    total_first_innings_wickets = sum(match["innings1"]["wickets"] for match in scorecards)
    total_second_innings_wickets = sum(match["innings2"]["wickets"] for match in scorecards)
    chasing_wins = sum(1 for match in scorecards if match["chasing_team_won"])
    
    match_stats = {
        "scorecards": scorecards,
        "statistics": {
            "average_first_innings_runs": total_first_innings / len(scorecards),
            "average_second_innings_runs": total_second_innings / len(scorecards),
            "average_first_innings_wickets": total_first_innings_wickets / len(scorecards),
            "average_second_innings_wickets": total_second_innings_wickets / len(scorecards),
            "chasing_success_rate": (chasing_wins / len(scorecards)) * 100,
            "total_matches": len(scorecards)
        }
    }
    
    return match_stats

def main():
    try:
        # Load data
        print("Loading player data...")
        player_data = load_json_file('backend/utils/playerWiseData.json')
        
        print("Loading processed data...")
        processed_data = load_js_file('backend/utils/processedData.js')
        
        # Process player data
        print("Categorizing players...")
        categorized_players = categorize_players_by_role(player_data)
        
        # Process venue stats
        print("Processing venue stats...")
        venue_stats = process_venue_stats(processed_data)
        
        # Process match scorecards
        print("Processing match scorecards...")
        match_stats = process_match_scorecards()
        
        # Combine results
        final_data = {
            'players': categorized_players,
            'venue_stats': venue_stats,
            'match_stats': match_stats
        }
        
        # Save results
        print("Saving results...")
        save_json_file(final_data, 'backend/utils/transformedData.json')
        print("Data processing completed successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e.filename}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {str(e)}")
    except Exception as e:
        print(f"Error: An unexpected error occurred - {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()