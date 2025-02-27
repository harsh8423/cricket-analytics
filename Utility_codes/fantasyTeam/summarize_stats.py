import json
from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class StatsAnalyzer:
    def __init__(self, api_key):
        """Initialize with Groq API key"""
        self.client = Groq(api_key=api_key)
        self.summary_file = "fantasyTeam/player_summaries.json"
    
    def create_player_prompt(self, player_data):
        """Create prompt for player statistics"""
        name = player_data.get('name', '')
        role = player_data.get('role', '')
        
        prompt = f"Analyze the following cricket statistics for {name} ({role}):\n\n"
        
        # Basic info
        prompt += "PLAYER INFORMATION:\n"
        prompt += f"- Team: {player_data.get('team_name', '')}\n"
        prompt += f"- Batting Style: {player_data.get('batting_style', '')}\n"
        prompt += f"- Bowling Style: {player_data.get('bowling_style', '')}\n"
        
        # Form data
        prompt += "\nFORM STATISTICS:\n"
        prompt += f"- Recent Form (Fantasy Points): {player_data.get('recent_form', 0):.2f}\n"
        prompt += f"- Venue Form (Fantasy Points): {player_data.get('venue_form', 0):.2f}\n"
        
        # Role-specific stats
        if role in ['Batsman', 'WK-Batsman']:
            prompt += "\nBATTING STATISTICS:\n"
            batting_positions = player_data.get('batting_positions', [])
            prompt += f"- Batting Positions: {batting_positions if batting_positions else 'No data'}\n"
            prompt += f"- Average Strike Rate: {player_data.get('avg_sr', 0):.2f}\n"
            
            # Add batting analysis if available
            batting_analysis = player_data.get('batting_analysis', {})
            if batting_analysis:
                spin_pace = batting_analysis.get('spin_vs_pace', {})
                if spin_pace:
                    prompt += "\nSPIN VS PACE:\n"
                    prompt += f"- Strike Rate Difference: {spin_pace.get('strike_rate_diff', 0):.2f}\n"
                    prompt += f"- Runs Proportion vs Spin: {spin_pace.get('runs_proportion', 0):.3f}\n"
                    prompt += f"- Wicket Rate Difference: {spin_pace.get('wicket_rate_diff', 0):.4f}\n"
                
                left_right = batting_analysis.get('left_vs_right', {})
                if left_right:
                    prompt += "\nLEFT VS RIGHT ARM:\n"
                    prompt += f"- Strike Rate Difference: {left_right.get('strike_rate_diff', 0):.2f}\n"
                    prompt += f"- Runs Proportion vs Left: {left_right.get('runs_proportion', 0):.3f}\n"
                    prompt += f"- Wicket Rate Difference: {left_right.get('wicket_rate_diff', 0):.4f}\n"
            
            # Add opponent analysis if available
            opponent_analysis = player_data.get('opponent_analysis', {})
            if opponent_analysis:
                prompt += "\nHEAD-TO-HEAD ANALYSIS:\n"
                for bowler, wickets in opponent_analysis.items():
                    prompt += f"- vs {bowler}: {wickets} wickets\n"
        
        elif role == 'Bowler':
            prompt += "\nBOWLING STATISTICS:\n"
            usual_overs = player_data.get('usual_overs', [])
            prompt += f"- Usual Overs: {usual_overs if usual_overs else 'No data'}\n"
            prompt += f"- Balls per Wicket: {player_data.get('balls_per_wicket', 0):.2f}\n"
            
            # Add opponent analysis
            opponent_analysis = player_data.get('opponent_analysis', {})
            if opponent_analysis:
                prompt += "\nHEAD-TO-HEAD ANALYSIS:\n"
                for batsman, wickets in opponent_analysis.items():
                    prompt += f"- vs {batsman}: {wickets} wickets\n"
        
        elif 'Allrounder' in role:
            prompt += "\nALL-ROUNDER STATISTICS:\n"
            batting_positions = player_data.get('batting_positions', [])
            usual_overs = player_data.get('usual_overs', [])
            prompt += f"- Batting Positions: {batting_positions if batting_positions else 'No data'}\n"
            prompt += f"- Usual Overs: {usual_overs if usual_overs else 'No data'}\n"
            prompt += f"- Average Runs: {player_data.get('avg_runs', 0):.2f}\n"
            prompt += f"- Average Wickets: {player_data.get('avg_wickets', 0):.2f}\n"
            
            # Add batting analysis if available
            batting_analysis = player_data.get('batting_analysis', {})
            if batting_analysis:
                spin_pace = batting_analysis.get('spin_vs_pace', {})
                if spin_pace:
                    prompt += "\nSPIN VS PACE:\n"
                    prompt += f"- Strike Rate Difference: {spin_pace.get('strike_rate_diff', 0):.2f}\n"
                    prompt += f"- Runs Proportion vs Spin: {spin_pace.get('runs_proportion', 0):.3f}\n"
        
        prompt += "\nProvide a concise, data-driven statistical summary focusing on the player's role and current form. Use numerical formats and avoid descriptive language."
        
        return prompt
    
    def create_venue_prompt(self, venue_data, match_stats):
        """Create prompt for venue and match statistics"""
        prompt = "Analyze the following venue and match statistics:\n\n"
        
        # Venue stats
        prompt += "VENUE STATISTICS:\n"
        prompt += f"Overall Bowling Split:\n"
        prompt += f"- Spin: {venue_data['overall']['spin']}%\n"
        prompt += f"- Pace: {venue_data['overall']['pace']}%\n\n"
        
        prompt += f"First Innings Bowling Split:\n"
        prompt += f"- Spin: {venue_data['innings1']['spin']}%\n"
        prompt += f"- Pace: {venue_data['innings1']['pace']}%\n\n"
        
        prompt += f"Second Innings Bowling Split:\n"
        prompt += f"- Spin: {venue_data['innings2']['spin']}%\n"
        prompt += f"- Pace: {venue_data['innings2']['pace']}%\n\n"
        
        # Match stats
        prompt += "MATCH STATISTICS:\n"
        prompt += f"- Average First Innings Score: {match_stats['average_first_innings_runs']}\n"
        prompt += f"- Average Second Innings Score: {match_stats['average_second_innings_runs']}\n"
        prompt += f"- Average First Innings Wickets: {match_stats['average_first_innings_wickets']}\n"
        prompt += f"- Average Second Innings Wickets: {match_stats['average_second_innings_wickets']}\n"
        prompt += f"- Chasing Success Rate: {match_stats['chasing_success_rate']}%\n"
        prompt += f"- Total Matches Analyzed: {match_stats['total_matches']}\n"
        
        prompt += "\nProvide a detailed, human-readable analysis of the venue and match statistics, focusing on patterns and trends that could impact match outcomes."
        
        return prompt
    
    def get_ai_summary(self, prompt):
        """Get AI-generated summary using Groq"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": """
                    Provide a brief, data-driven statistics without any additional content or comment in the following format:

                    For Batsmen/WK-Batsmen:
                    1. Form: Recent (fantasy pts) | Venue (fantasy pts)
                    2. Batting: Position(s) | SR
                    3. opponent analysis data
                    4. batting analysis data with consise short summary

                    For Bowlers:
                    1. Form: Recent (fantasy pts) | Venue (fantasy pts)
                    2. Bowling: Usual overs | Balls/Wicket
                    3. opponent analysis data

                    For All-rounders:
                    1. Form: Recent (fantasy pts) | Venue (fantasy pts)
                    2. Batting: Avg runs | Position(s)
                    3. Bowling: Avg wickets | Usual overs
                    4. vs Spin/Pace: SR diff | Runs% (if available)

                    Use statistical notation:
                    - Numbers with 2 decimal places
                    - ">" or "<" for comparisons
                    - Use "N/A" for missing data
                    
                    Keep each line focused on specific metrics.
                    Avoid descriptive language, use pure statistics.
                    """
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            response = self.client.chat.completions.create(
                model='llama-3.1-8b-instant',
                messages=messages,
                temperature=0.2,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def analyze_data(self, player_stats, venue_stats, match_stats):
        """Analyze all players and venue/match statistics"""
        summaries = {}
        
        # Analyze players
        print("Analyzing player statistics...")
        for player_id, player_data in player_stats.items():
            prompt = self.create_player_prompt(player_data)
            summary = self.get_ai_summary(prompt)
            summaries[player_id] = {
                "name": player_data['name'],
                "role": player_data['role'],
                "summary": summary
            }
            print(f"Processed {player_data['name']}")
        
        # Analyze venue and match stats
        print("\nAnalyzing venue and match statistics...")
        venue_prompt = self.create_venue_prompt(venue_stats, match_stats)
        venue_summary = self.get_ai_summary(venue_prompt)
        summaries['venue_analysis'] = venue_summary
        
        # Save summaries
        print("\nSaving summaries...")
        with open(self.summary_file, 'w') as f:
            json.dump(summaries, f, indent=2)
        
        print("Analysis completed successfully!")

def main():
    try:
        # Load data
        print("Loading data...")
        with open('fantasyTeam/playerStats.json', 'r') as f:
            player_stats = json.load(f)
        
        with open('fantasyTeam//transformedData.json', 'r') as f:
            data = json.load(f)
            venue_stats = data['venue_stats']
            match_stats = data['match_stats']['statistics']
        
        # Initialize and run analyzer
        analyzer = StatsAnalyzer(api_key=os.getenv("GROQ_API_KEY"))
        analyzer.analyze_data(player_stats, venue_stats, match_stats)
        
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e.filename}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {str(e)}")
    except Exception as e:
        print(f"Error: An unexpected error occurred - {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 