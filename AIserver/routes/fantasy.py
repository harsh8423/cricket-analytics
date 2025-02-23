from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.AIteam import handle_team_query

fantasy_bp = Blueprint('fantasy', __name__)

@fantasy_bp.route('/team', methods=['POST'])
@jwt_required()
def generate_team():
    current_user_id = get_jwt_identity()
    data = request.json
    query = data.get('query')
    existing_team = data.get('existing_team')
    is_editing = data.get('is_editing', False)
    total_teams = data.get('total_teams', 1)
    
    # If editing a specific team in multiple teams, only generate one team
    if is_editing and existing_team:
        result = handle_team_query(query, existing_team)
    else:
        # For new teams, generate the requested number of teams
        result = handle_team_query(query, None)
    
    return jsonify(result) 