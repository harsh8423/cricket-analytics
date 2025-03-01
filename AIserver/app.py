from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.fantasy import fantasy_bp
from pymongo import MongoClient

app = Flask(__name__)
app.config.from_object(Config)

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://cricgenius.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize JWT
jwt = JWTManager(app)

# Initialize MongoDB and add it to app config
mongodb_client = MongoClient(app.config['MONGODB_URI'])
app.config['mongodb_client'] = mongodb_client
app.config['db'] = mongodb_client.cricket

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(fantasy_bp, url_prefix='/api/fantasy')

if __name__ == '__main__':
    app.run(debug=True)
