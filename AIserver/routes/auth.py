from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests
from models.user import User
from config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/google', methods=['POST'])
def google_signin():
    token = request.json.get('token')
    
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), Config.GOOGLE_CLIENT_ID)

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')

        # Check if user exists
        existing_user = User.get_by_email(idinfo['email'])
        
        if existing_user:
            access_token = create_access_token(identity=str(existing_user.id))
            return jsonify({
                'token': access_token,
                'userId': str(existing_user.id)
            }), 200
        
        # Create new user
        user = User(
            email=idinfo['email'],
            name=idinfo['name'],
            picture=idinfo['picture'],
            google_id=idinfo['sub'],
        )
        user_id = user.save()
        
        # Create JWT token
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            'token': access_token,
            'userId': str(user_id)
        }), 200

    except ValueError as e:
        return jsonify({'error': 'Invalid token'}), 401

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    current_user_id = get_jwt_identity()
    return jsonify({'id': current_user_id}), 200 