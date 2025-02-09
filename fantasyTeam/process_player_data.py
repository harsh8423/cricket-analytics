import json
from collections import defaultdict

def process_players(input_file, output_file):
    # Load player data
    with open(input_file, 'r') as f:
        players_data = json.load(f)

    processed_players = {}

    for player_id, player in players_data.items():
        role = player['role'].lower()
        new_player = {
            'player_id': player_id,
            'name': player['name'],
            'role': role,
            'team': player['team_name'],
            'batting_style': player['batting_style'],
            'bowling_style': player['bowling_style']
        }

        # Task 1: Remove irrelevant stats based on role
        if 'batsman' in role or 'wk' in role:
            new_player['batting'] = player['batting']
            new_player.pop('bowling_style', None)
        elif 'bowler' in role and 'allrounder' not in role:
            new_player['bowling'] = player['bowling']
            new_player.pop('batting_style', None)
        else:  # All-rounders
            # Task 2: Combine match stats
            combined_matches = defaultdict(dict)
            
            # Process bowling matches
            for match in player['bowling']['matches']:
                combined_matches[match['match_id']]['bowling'] = {
                    k: match[k] for k in ['runs', 'overs', 'wickets', 'economy', 'fantasy_points']
                }
                
            # Process batting matches
            for match in player['batting']['matches']:
                combined_matches[match['match_id']]['batting'] = {
                    k: match[k] for k in ['runs', 'balls', 'strike_rate', 'fantasy_points', 'batting_position']
                }
            
            # Convert to list format
            new_player['matches'] = [
                {'match_id': k, **v} for k, v in combined_matches.items()
            ]
            
            # Add aggregated stats
            new_player['batting'] = {
                k: v for k, v in player['batting'].items() if k != 'matches'
            }
            new_player['bowling'] = {
                k: v for k, v in player['bowling'].items() if k != 'matches'
            }

        processed_players[player_id] = new_player

    # Save processed player data
    with open(output_file, 'w') as f:
        json.dump(processed_players, f, indent=2)

def calculate_venue_ratings(processed_data):
    venue_stats = processed_data['match_summary']['venue_stats']
    ratings = {'overall': {}, 'inning1': {}, 'inning2': {}}
    
    weights = {
        'runs_per_wicket': 30,
        'balls_per_wicket': 40,
        'strike_rate': 15,
        'economy': 15
    }

    for inning in ['overall', 'inning1', 'inning2']:
        spin = next(s for s in venue_stats if s['innings'] == inning and s['bowler_type'] == 'spin')
        pace = next(p for p in venue_stats if p['innings'] == inning and p['bowler_type'] == 'pace')

        inning_ratings = {'spin': {}, 'pace': {}}
        
        for metric in weights:
            spin_val = spin[metric]
            pace_val = pace[metric]
            avg = (spin_val + pace_val) / 2
            
            # Calculate percentage difference from average
            spin_pct = ((spin_val - avg) / avg) * 100 if avg != 0 else 0
            pace_pct = ((pace_val - avg) / avg) * 100 if avg != 0 else 0
            
            # Calculate points
            base_points = weights[metric]
            spin_points = base_points + (base_points * spin_pct / 100)
            pace_points = base_points + (base_points * pace_pct / 100)
            
            inning_ratings['spin'][metric] = max(0, min(100, spin_points))
            inning_ratings['pace'][metric] = max(0, min(100, pace_points))

        # Calculate total ratings
        ratings[inning]['spin'] = round(sum(inning_ratings['spin'].values()), 2)
        ratings[inning]['pace'] = round(sum(inning_ratings['pace'].values()), 2)

    return ratings

def main():
    # Process player data
    # process_players('backend/utils/playerWiseData.json', 'processed_players.json')
    
    # Load and process venue data
    with open('backend/utils/processedData.json', 'r') as f:
        processed_data = json.load(f)
    
    venue_ratings = calculate_venue_ratings(processed_data)
    
    # Save venue ratings
    with open('venue_ratings.json', 'w') as f:
        json.dump(venue_ratings, f, indent=2)

if __name__ == "__main__":
    main()