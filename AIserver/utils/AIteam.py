from groq import Groq
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

def load_player_data(file_path):
    """Load and parse player summaries data"""
    with open(file_path, 'r') as f:
        return json.load(f)

def generate_fantasy_prompt(player_data):
    """Construct the LLM prompt with formatted context"""
    venue_analysis = player_data.get('venue_analysis', '')
    players = {k:v for k,v in player_data.items() if k != 'venue_analysis'}
    
    player_context = []
    for pid, details in players.items():
        if isinstance(details, dict):
            player_context.append(
                f"Player ID: {pid}\nName: {details['name']}\nRole: {details['role']}\nSummary: {details['summary']}\n"
            )
    
    return f"""
    **VENUE ANALYSIS**
    {venue_analysis}

    **PLAYER POOL**
    {''.join(player_context)}
    """, player_context

def query_fantasy_team(prompt_context, query, existing_team=None):
    """Query LLM to generate structured fantasy team"""
    system_message = '''You are an expert IPL fantasy team builder. Return a JSON response following these STRICT rules:

    Note: If editing existing team, modify based on query while maintaining team balance

    1. Team Structure (for each team):
    - 1-2 Wicketkeeper (must have "WK-Batsman" role)
    - 3-5 Batsmen 
    - 3-5 All-Rounders ("Batting Allrounder"/"Bowling Allrounder")
    - 3-5 Bowlers 
    - Exactly 1 Captain and 1 Vice-Captain
    - Total 11 players per team

    2. Response Format:
    {
        "teams": [
            {
                "team": [
                    {
                        "name": str,
                        "role": str,
                        "reason": str,
                        "is_captain": bool,
                        "is_vice_captain": bool
                    }
                ]
            }
        ],
        "strategies": {
            "pace_spin_ratio": str,
            "batting_order": str,
            "venue_adjustments": list[str]
        }
    }'''

    try:
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": f"""
            Context:
            {prompt_context}

            {"Existing team to modify: " + json.dumps(existing_team) if existing_team else "Generate new team(s)"}

            Query: {query}

            Rules:
            1. Return complete, valid JSON only
            2. Each team must have exactly 11 players
            3. Each team must have 1 Captain and 1 Vice-Captain, it should be the best player in the team
            4. Follow role requirements strictly
            5. Include all closing brackets and braces
            6. Ensure JSON is properly formatted
            7. Give the reason on what basis and why you have chosen each player in reason field"""}
        ]

        # Increase max_tokens for multiple teams
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            temperature=0.1,
            response_format={"type": "json_object"},
            max_tokens=4096
        )
        
        # Parse and validate response
        result = json.loads(response.choices[0].message.content)
        
        # Ensure proper structure
        if not isinstance(result.get('teams'), list):
            raise ValueError("Invalid response structure")
            
        # Validate each team
        for team in result['teams']:
            if not isinstance(team.get('team'), list):
                raise ValueError("Invalid team structure")
            if len(team['team']) != 11:
                raise ValueError("Team must have exactly 11 players")
                
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {str(e)}")
        return {"error": "Invalid JSON response from LLM"}
    except Exception as e:
        print(f"Error in query_fantasy_team: {str(e)}")
        return {"error": str(e)}

def handle_team_query(query,match_id, existing_team=None):
    """Handle team generation/modification requests"""
    try:
        # Load data
        player_data = load_player_data(f'./utils/{match_id}_player_summaries.json')
        
        # Generate prompt context
        prompt_context, _ = generate_fantasy_prompt(player_data)
        
        # Get AI-generated team
        result = query_fantasy_team(prompt_context, query, existing_team)
        
        # Validate response
        if isinstance(result, dict) and 'error' in result:
            return result
            
        # Ensure proper structure
        if not isinstance(result.get('teams'), list):
            return {"error": "Invalid response structure"}
            
        return result
        
    except Exception as e:
        print(f"Error in handle_team_query: {str(e)}")
        return {"error": str(e)}

def main():
    # Load data
    player_data = load_player_data('AIserver/utils/player_summaries.json')
    
    # Generate prompt context
    prompt_context, _ = generate_fantasy_prompt(player_data)
    
    # Get AI-generated team
    team = query_fantasy_team(prompt_context, '', None)
    
    # Save output
    with open('fantasy_team.json', 'w') as f:
        json.dump(team, f, indent=2)
    
    print("Fantasy team generated successfully!")

if __name__ == '__main__':
    main()