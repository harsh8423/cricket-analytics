import json
from collections import Counter
from statistics import mean, mode, multimode

def load_json_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def save_json_file(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)


def calculate_form(matches, stats_type):
    """Calculate form based on fantasy points for given stats_type"""
    relevant_matches = [
        match for match in matches 
        if match.get('stats_type') == stats_type
    ]
    if not relevant_matches:
        return 0
    
    fantasy_points = [match.get('fantasy_points', 0) for match in relevant_matches]
    return sum(fantasy_points) / len(relevant_matches)

def get_batting_modes(matches):
    """Get two most common batting positions"""
    positions = [
        match.get('batting_position') 
        for match in matches 
        if match.get('batting_position')
    ]
    if not positions:
        return []
    return multimode(positions)[:2]

def get_over_modes(matches):
    """Get two most common over counts"""
    overs = [
        match.get('overs') 
        for match in matches 
        if match.get('overs')
    ]
    if not overs:
        return []
    return multimode(overs)[:2]

class BatsmanAnalyzer:
    def __init__(self, player_data):
        self.data = player_data

    def calculate_metrics(self):
        """Calculate comparison metrics for spin vs pace and left vs right arm"""
        return {
            "spin_vs_pace": self._calculate_spin_pace_metrics(),
            "left_vs_right": self._calculate_left_right_metrics()
        }

    def _calculate_spin_pace_metrics(self):
        spin = self.data.get('spin_vs_pace', {}).get('spin', {})
        pace = self.data.get('spin_vs_pace', {}).get('pace', {})
        
        total_runs = spin.get('runs', 0) + pace.get('runs', 0)
        sr_diff = spin.get('strike_rate', 0) - pace.get('strike_rate', 0)
        runs_proportion = spin.get('runs', 0) / total_runs if total_runs > 0 else 0
        
        # Wickets per ball comparison
        wpb_spin = spin.get('wickets', 0) / spin.get('balls', 1) if spin.get('balls', 0) > 0 else 0
        wpb_pace = pace.get('wickets', 0) / pace.get('balls', 1) if pace.get('balls', 0) > 0 else 0
        wpb_diff = wpb_spin - wpb_pace

        return {
            'strike_rate_diff': round(sr_diff, 2),
            'runs_proportion': round(runs_proportion, 3),
            'wicket_rate_diff': round(wpb_diff, 4)
        }

    def _calculate_left_right_metrics(self):
        left = self.data.get('left_vs_right', {}).get('left_arm', {})
        right = self.data.get('left_vs_right', {}).get('right_arm', {})
        
        total_runs = left.get('runs', 0) + right.get('runs', 0)
        sr_diff = left.get('strike_rate', 0) - right.get('strike_rate', 0)
        runs_proportion = left.get('runs', 0) / total_runs if total_runs > 0 else 0
        
        # Wickets per ball comparison
        wpb_left = left.get('wickets', 0) / left.get('balls', 1) if left.get('balls', 0) > 0 else 0
        wpb_right = right.get('wickets', 0) / right.get('balls', 1) if right.get('balls', 0) > 0 else 0
        wpb_diff = wpb_left - wpb_right

        return {
            'strike_rate_diff': round(sr_diff, 2),
            'runs_proportion': round(runs_proportion, 3),
            'wicket_rate_diff': round(wpb_diff, 4)
        }

def extract_opponent_analysis(player):
    """Extract opponent analysis data"""
    opponent_data = player.get('opponent_analysis', {})
    return {
        name: data.get('wickets', 0)
        for name, data in opponent_data.items()
    }

def calculate_allrounder_form(matches, stats_type):
    """Calculate form for all-rounders based on combined batting and bowling stats"""
    relevant_matches = [
        match for match in matches 
        if (match.get('batting', {}).get('stats_type') == stats_type or 
            match.get('bowling', {}).get('stats_type') == stats_type)
    ]
    
    if not relevant_matches:
        return 0
    
    total_points = 0
    match_count = len(relevant_matches)
    
    for match in relevant_matches:
        # Add batting points if available
        batting = match.get('batting', {})
        bowling = match.get('bowling', {})
        
        total_points += batting.get('fantasy_points', 0)
        total_points += bowling.get('fantasy_points', 0)
    
    return total_points / match_count if match_count > 0 else 0

def calculate_player_stats(player_data):
    processed_players = {}
    
    for player_id, player in player_data.items():
        if not isinstance(player, dict):
            continue
            
        base_info = {
            'player_id': player_id,
            'name': player.get('name', ''),
            'role': player.get('role', ''),
            'team_name': player.get('team_name', ''),
            'batting_style': player.get('batting_style', ''),
            'bowling_style': player.get('bowling_style', '')
        }
        
        role = player.get('role', '')
        if not role:
            continue
        
        # Process All-rounders
        if 'Allrounder' in role:
            matches = player.get('matches', [])
            
            # Calculate batting positions from matches
            batting_positions = [
                match.get('batting', {}).get('batting_position')
                for match in matches
                if match.get('batting', {}).get('batting_position') is not None
            ]
            batting_positions = multimode(batting_positions)[:2] if batting_positions else []
            
            # Calculate usual overs from matches
            usual_overs = [
                match.get('bowling', {}).get('overs')
                for match in matches
                if match.get('bowling', {}).get('overs') is not None
            ]
            usual_overs = multimode(usual_overs)[:2] if usual_overs else []
            
            # Calculate average runs and wickets
            total_runs = sum(match.get('batting', {}).get('runs', 0) for match in matches)
            total_wickets = sum(match.get('bowling', {}).get('wickets', 0) for match in matches)
            match_count = len(matches)
            
            stats = {
                **base_info,
                'recent_form': calculate_allrounder_form(matches, 'recent'),
                'venue_form': calculate_allrounder_form(matches, 'venue'),
                'batting_positions': batting_positions,
                'usual_overs': usual_overs,
                'avg_runs': total_runs / match_count if match_count > 0 else 0,
                'avg_wickets': total_wickets / match_count if match_count > 0 else 0
            }
        
        # Process Batsman and WK-Batsman
        elif role in ['Batsman', 'WK-Batsman']:
            batting_data = player.get('batting', {})
            matches = batting_data.get('matches', [])
            batting_positions = get_batting_modes(matches)
            
            stats = {
                **base_info,
                'recent_form': calculate_form(matches, 'recent'),
                'venue_form': calculate_form(matches, 'venue'),
                'batting_positions': batting_positions,
                'avg_sr': batting_data.get('overall_strike_rate', 0)
            }
            
            # Add opponent analysis if batting position ≤ 4
            if batting_positions and min(batting_positions) <= 4:
                stats['opponent_analysis'] = extract_opponent_analysis(batting_data)
            
            # Add batting analysis if position ≤ 6
            if batting_positions and min(batting_positions) <= 6:
                analyzer = BatsmanAnalyzer(batting_data)
                stats['batting_analysis'] = analyzer.calculate_metrics()
        
        # Process Bowler
        elif role == 'Bowler':
            bowling_data = player.get('bowling', {})
            matches = bowling_data.get('matches', [])
            stats = {
                **base_info,
                'recent_form': calculate_form(matches, 'recent'),
                'venue_form': calculate_form(matches, 'venue'),
                'usual_overs': get_over_modes(matches),
                'balls_per_wicket': bowling_data.get('balls_per_wicket', 0),
                'opponent_analysis': extract_opponent_analysis(bowling_data)
            }
        
        else:
            continue
        
        processed_players[player_id] = stats
    
    return processed_players

def main():
    try:
        # Load player data
        print("Loading player data...")
        player_data = load_json_file('fantasyTeam/transformedData.json')
        
        # Calculate player statistics
        print("Calculating player statistics...")
        player_stats = calculate_player_stats(player_data.get('players', {}))
        
        # Save results
        print("Saving player statistics...")
        save_json_file(player_stats, 'fantasyTeam/playerStats.json')
        print("Player statistics processing completed successfully!")
        
        # Print sample statistics
        if player_stats:
            print("\nSample Player Statistics:")
            sample_player = next(iter(player_stats.values()))
            print(f"Player: {sample_player['name']}")
            print(f"Role: {sample_player['role']}")
            print(f"Recent Form: {sample_player['recent_form']:.2f}")
            print(f"Venue Form: {sample_player['venue_form']:.2f}")
        
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