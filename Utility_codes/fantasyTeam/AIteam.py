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

def query_fantasy_team(prompt_context):
    """Query LLM to generate structured fantasy team"""
    system_message = '''You are an expert IPL fantasy team builder. Return a JSON response following these STRICT rules:

    Note: If not mentioned generate Only one best team by default

    1. Team Structure:
    - 1-2 Wicketkeeper (must have "WK-Batsman" role)
    - 3-5 Batsmen 
    - 3-5 All-Rounders ("Batting Allrounder"/"Bowling Allrounder")
    - 3-5 Bowlers 
    - Exactly 1 Captain and 1 Vice-Captain

    2. Response Format:
    {
    "teams": [
        {
            "team": [
                {
                    "name": "Player Name",
                    "role": "Original Role",
                    "reason": "Max 50-word reason with explanation for selecting the player",
                    "is_captain": true,
                    "is_vice_captain": false
                }
            ]
        }
    ],
    "strategies": {
        "pace_spin_ratio": "e.g., 3 pacers 2 spinners",
        "batting_order": "e.g., Powerplay specialists",
        "venue_adjustments": ["Key venue-based decisions"]
    }
}


    3. Selection Criteria:
    - Prioritize players with highest ("Recent (XX.XX)" + "Venue (XX.XX)") scores
    - Consider "opponent analysis data" in summaries
    - Balance player roles according to venue characteristics'''

    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"""
                Create fantasy team using this context:
                {prompt_context}

                MUST FOLLOW:
                - Valid JSON output only
                - Exactly 11 players
                - 1 Captain/1 Vice-Captain
                - Role requirements
                - Use player IDs from context
                - Base reasons on numerical data in summaries"""}
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
            max_tokens=1024
        )
        
        # Validate and parse JSON
        team_data = json.loads(response.choices[0].message.content)
        return team_data
        
    except Exception as e:
        return {"error": str(e)}

def main():
    # Load data
    player_data = load_player_data('AIserver/utils/player_summaries.json')
    
    # Generate prompt context
    prompt_context, _ = generate_fantasy_prompt(player_data)
    
    # Get AI-generated team
    team = query_fantasy_team(prompt_context)
    
    # Save output
    with open('fantasy_team.json', 'w') as f:
        json.dump(team, f, indent=2)
    
    print("Fantasy team generated successfully!")

if __name__ == '__main__':
    main()