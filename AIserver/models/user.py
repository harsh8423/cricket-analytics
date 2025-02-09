from flask import current_app
from bson import ObjectId
from datetime import datetime

class User:
    def __init__(self, email, name, picture, google_id):
        self.email = email
        self.name = name
        self.picture = picture
        self.google_id = google_id
        self.created_at = datetime.utcnow()
        self.id = None

    def save(self):
        """Save user to database"""
        db = current_app.config['db']
        user_data = {
            'email': self.email,
            'name': self.name,
            'picture': self.picture,
            'google_id': self.google_id,
            'created_at': self.created_at
        }
        result = db.users.insert_one(user_data)
        self.id = result.inserted_id
        return self.id

    @staticmethod
    def get_by_email(email):
        """Get user by email"""
        db = current_app.config['db']
        user_data = db.users.find_one({'email': email})
        if user_data:
            user = User(
                email=user_data['email'],
                name=user_data['name'],
                picture=user_data['picture'],
                google_id=user_data['google_id']
            )
            user.id = user_data['_id']
            return user
        return None

    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        db = current_app.config['db']
        user_data = db.users.find_one({'_id': ObjectId(user_id)})
        if user_data:
            user = User(
                email=user_data['email'],
                name=user_data['name'],
                picture=user_data['picture'],
                google_id=user_data['google_id']
            )
            user.id = user_data['_id']
            return user
        return None 