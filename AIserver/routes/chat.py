from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.query_service import process_user_query

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/message', methods=['POST'])
@jwt_required()
def send_message():
    current_user_id = get_jwt_identity()
    message = request.json.get('message')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
        
    response = process_user_query(message)
    return jsonify(response), 200 