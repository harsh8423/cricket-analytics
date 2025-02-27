import pandas as pd
import json
from typing import Dict, List, Any
from datetime import datetime
import numpy as np
from collections import defaultdict

match_id= json.load(open('LocalServer/match_id.json'))['match_id']

class EnhancedCricketAnalyzer:
    def __init__(self, player_data: Dict, venue_data: Dict):
        self.player_data = player_data
        self.venue_data = venue_data
        self.recent_matches_count = 5
        
    def calculate_player_form(self, player_data: Dict, match_type: str = 'recent') -> Dict:
        """Calculate detailed player form statistics"""
        batting_stats = defaultdict(int)
        bowling_stats = defaultdict(int)
        
        if 'batting' in player_data and 'matches' in player_data['batting']:
            matches = [m for m in player_data['batting']['matches'] if m['stats_type'] == match_type]
            if matches:
                batting_stats.update({
                    'total_runs': sum(m['runs'] for m in matches),
                    'total_balls': sum(m['balls'] for m in matches),
                    'total_matches': len(matches),
                    'fifties': sum(1 for m in matches if m['runs'] >= 50),
                    'hundreds': sum(1 for m in matches if m['runs'] >= 100),
                    'avg_position': sum(m.get('batting_position', 11) for m in matches) / len(matches),
                    'strike_rate': sum(m['runs'] for m in matches) / sum(m['balls'] for m in matches) * 100 if sum(m['balls'] for m in matches) > 0 else 0,
                    'fantasy_points': sum(m['fantasy_points'] for m in matches)
                })
        
        if 'bowling' in player_data and 'matches' in player_data['bowling']:
            matches = [m for m in player_data['bowling']['matches'] if m['stats_type'] == match_type]
            if matches:
                bowling_stats.update({
                    'wickets': sum(m['wickets'] for m in matches),
                    'overs': sum(m['overs'] for m in matches),
                    'runs_conceded': sum(m['runs'] for m in matches),
                    'economy': sum(m['runs'] for m in matches) / sum(m['overs'] for m in matches) if sum(m['overs'] for m in matches) > 0 else 0,
                    'fantasy_points': sum(m['fantasy_points'] for m in matches),
                    'matches': len(matches)
                })
        
        return {
            'batting': dict(batting_stats),
            'bowling': dict(bowling_stats),
            'name': player_data.get('name', ''),
            'role': player_data.get('role', ''),
            'team': player_data.get('team_name', '')
        }

    def get_top_performers(self) -> Dict:
        """Get top performers in various categories"""
        top_performers = {
            'batsmen': [],
            'bowlers': [],
            'all_rounders': [],
            'form_players': []
        }
        
        for player_id, data in self.player_data.items():
            form = self.calculate_player_form(data)
            
            # Batting analysis
            if form['batting'].get('total_runs', 0) > 100:
                top_performers['batsmen'].append({
                    'name': form['name'],
                    'runs': form['batting']['total_runs'],
                    'strike_rate': round(form['batting']['strike_rate'], 2),
                    'fantasy_points': form['batting']['fantasy_points']
                })
                
            # Bowling analysis
            if form['bowling'].get('wickets', 0) >= 3:
                top_performers['bowlers'].append({
                    'name': form['name'],
                    'wickets': form['bowling']['wickets'],
                    'economy': round(form['bowling']['economy'], 2),
                    'fantasy_points': form['bowling']['fantasy_points']
                })
                
            # All-rounder analysis
            if (form['batting'].get('total_runs', 0) > 50 and 
                form['bowling'].get('wickets', 0) >= 2):
                top_performers['all_rounders'].append({
                    'name': form['name'],
                    'runs': form['batting']['total_runs'],
                    'wickets': form['bowling']['wickets'],
                    'fantasy_points': form['batting']['fantasy_points'] + form['bowling']['fantasy_points']
                })
                
            # Form players (based on fantasy points)
            total_fantasy_points = (form['batting'].get('fantasy_points', 0) + 
                                  form['bowling'].get('fantasy_points', 0))
            if total_fantasy_points > 100:
                top_performers['form_players'].append({
                    'name': form['name'],
                    'fantasy_points': total_fantasy_points,
                    'role': form['role']
                })
        
        # Sort all lists by relevant metrics
        top_performers['batsmen'].sort(key=lambda x: x['fantasy_points'], reverse=True)
        top_performers['bowlers'].sort(key=lambda x: x['fantasy_points'], reverse=True)
        top_performers['all_rounders'].sort(key=lambda x: x['fantasy_points'], reverse=True)
        top_performers['form_players'].sort(key=lambda x: x['fantasy_points'], reverse=True)
        
        return top_performers

    def analyze_venue_trends(self) -> Dict:
        """Analyze venue trends and patterns"""
        venue_stats = self.venue_data['match_summary']['venue_stats']
        toss_analysis = self.venue_data['match_summary']['venue_analysis']
        
        # Analyze toss impact
        toss_decisions = [match['toss_decision'] for match in toss_analysis]
        toss_winners = [match['winner'] for match in toss_analysis]
        
        venue_trends = {
            'pitch_behavior': {
                'pace_bowling': next((stat for stat in venue_stats 
                                    if stat['innings'] == 'Overall' and 
                                    stat['bowler_type'] == 'pace'), {}),
                'spin_bowling': next((stat for stat in venue_stats 
                                    if stat['innings'] == 'Overall' and 
                                    stat['bowler_type'] == 'spin'), {})
            },
            'toss_analysis': {
                'batting_first_wins': sum(1 for w in toss_winners if w == 'Batting Team'),
                'bowling_first_wins': sum(1 for w in toss_winners if w == 'Bowling Team'),
                'preferred_choice': max(set(toss_decisions), key=toss_decisions.count)
            },
            'scoring_patterns': {
                'first_innings': next((stat for stat in venue_stats 
                                     if stat['innings'] == 'Inning1' and 
                                     stat['bowler_type'] == 'pace'), {}),
                'second_innings': next((stat for stat in venue_stats 
                                      if stat['innings'] == 'Inning2' and 
                                      stat['bowler_type'] == 'pace'), {})
            }
        }
        
        return venue_trends

    def get_phase_specialists(self) -> Dict:
        """Identify specialists for different phases of the game"""
        specialists = {
            'powerplay': {'batsmen': [], 'bowlers': []},
            'middle': {'batsmen': [], 'bowlers': []},
            'death': {'batsmen': [], 'bowlers': []}
        }

        for player_id, data in self.player_data.items():
            # Batting phase analysis
            if 'batting' in data and 'phase_stats' in data['batting']:
                for phase in ['powerplay', 'middle', 'death']:
                    phase_stats = data['batting']['phase_stats'].get(phase)  # Safely get phase stats
                    if phase_stats and phase_stats.get('balls', 0) > 20:  # Ensure stats exist and meet the criteria
                        strike_rate = phase_stats.get('strike_rate', 0)
                        if strike_rate > 150:  # High strike rate threshold
                            specialists[phase]['batsmen'].append({
                                'name': data['name'],
                                'strike_rate': round(strike_rate, 2),
                                'runs': phase_stats.get('runs', 0)
                            })

            # Bowling phase analysis
            if 'bowling' in data and 'phase_stats' in data['bowling']:
                for phase in ['powerplay', 'middle', 'death']:
                    phase_stats = data['bowling']['phase_stats'].get(phase)  # Safely get phase stats
                    if phase_stats and phase_stats.get('balls', 0) > 24:  # Ensure stats exist and meet the criteria
                        economy = (phase_stats.get('runs', 0) * 6) / phase_stats.get('balls', 1)  # Avoid division by zero
                        if economy < 8:  # Good economy threshold
                            specialists[phase]['bowlers'].append({
                                'name': data['name'],
                                'economy': round(economy, 2),
                                'wickets': phase_stats.get('wickets', 0)
                            })
 
        # Sort specialists by their respective metrics
        for phase in specialists:
            specialists[phase]['batsmen'].sort(key=lambda x: x['strike_rate'], reverse=True)
            specialists[phase]['bowlers'].sort(key=lambda x: x['economy'])
            
        return specialists

    def generate_captain_picks(self) -> Dict:
        """Generate captain and vice-captain recommendations"""
        player_scores = []
        
        for player_id, data in self.player_data.items():
            form = self.calculate_player_form(data)
            
            # Calculate weighted score based on recent performance
            score = (
                form['batting'].get('fantasy_points', 0) * 0.6 +  # 60% weight to batting
                form['bowling'].get('fantasy_points', 0) * 0.4    # 40% weight to bowling
            )
            
            if score > 0:
                player_scores.append({
                    'name': form['name'],
                    'role': form['role'],
                    'score': score,
                    'form_rating': 'Excellent' if score > 200 else 'Good' if score > 100 else 'Average',
                    'batting_points': form['batting'].get('fantasy_points', 0),
                    'bowling_points': form['bowling'].get('fantasy_points', 0)
                })
        
        player_scores.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            'captain_picks': player_scores[:3],  # Top 3 captain options
            'differential_picks': [p for p in player_scores[3:8] if p['score'] > 50]  # Next 5 good performers
        }

    def generate_complete_insights(self) -> Dict:
        """Generate comprehensive match insights"""
        top_performers = self.get_top_performers()
        venue_trends = self.analyze_venue_trends()
        phase_specialists = self.get_phase_specialists()
        captain_picks = self.generate_captain_picks()
        
        insights = {
            'match_insights': {
                'top_performers': top_performers,
                'venue_analysis': venue_trends,
                'phase_specialists': phase_specialists,
                'captain_recommendations': captain_picks,
                'head_to_head': self.venue_data['match_summary']['head_to_head_analysis'],
                'generated_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            'fantasy_tips': [
                "Pick players batting in top 4 for this high-scoring venue",
                f"Prefer {venue_trends['toss_analysis']['preferred_choice']} first specialists based on toss analysis",
                "Include at least 2 all-rounders in your team",
                "Pick death over specialists for maximum points",
                "Consider pitch behavior while selecting spinner vs pacer ratio"
            ]
        }
        
        return insights

def save_insights_to_file(insights: Dict, filename: str = f'LocalServer/step4/{match_id}_match_insights.json'):
    """Save insights to a JSON file"""
    with open(filename, 'w') as f:
        json.dump(insights, f, indent=2)
    print(f"Insights saved to {filename}")

def main(player_data_file: str, venue_data_file: str):
    """Main function to run the analysis"""
    # Load data
    with open(player_data_file, 'r') as f:
        player_data = json.load(f)
    with open(venue_data_file, 'r') as f:
        venue_data = json.load(f)
    
    # Create analyzer instance
    analyzer = EnhancedCricketAnalyzer(player_data, venue_data)
    
    # Generate insights
    insights = analyzer.generate_complete_insights()
    
    # Save insights to file
    save_insights_to_file(insights)
    
    return insights

# Example usage
if __name__ == "__main__":
    insights = main(f"LocalServer/step3/{match_id}_playerWiseData.json", f"LocalServer/step3/{match_id}_processedData.json")
    print("Analysis complete! Check match_insights.json for detailed insights.")