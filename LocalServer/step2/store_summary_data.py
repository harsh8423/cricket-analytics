import json
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from pymongo import MongoClient
from pymongo.collection import Collection
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Environment variables
google_api_key = os.getenv("GOOGLE_API_KEY")
mongodb_uri = os.getenv("MONGODB_URI")

if not google_api_key:
    raise ValueError("Google API key not found in environment variables.")
if not mongodb_uri:
    raise ValueError("MongoDB URI not found in environment variables.")

def get_mongodb_collection() -> Collection:
    """Get MongoDB collection instance."""
    client = MongoClient(mongodb_uri)
    db = client['cricket']
    return db['players_summaries']

def load_player_summaries(file_path: str) -> Dict:
    """Load player summaries from JSON file."""
    with open(file_path, "r", encoding='utf-8') as f:
        return json.load(f)

def create_player_documents(player_summaries: Dict) -> List[Dict[str, Any]]:
    """Create player documents with embeddings for MongoDB."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    documents = []
    
    for player_id, player_data in player_summaries.items():
        player_name = player_data.get("name", "Unknown")
        summary = player_data.get("summary", "No summary available.")
        
        # Create the text that will be embedded
        text_to_embed = f"Player ID: {player_id}\nName: {player_name}\n\n{summary}"
        
        try:
            # Generate embedding
            embedding_vector = embeddings.embed_query(text_to_embed)
            
            # Create document
            document = {
                "player_id": player_id,
                "name": player_name,
                "summary": summary,
                "full_text": text_to_embed,
                "embedding": embedding_vector
            }
            documents.append(document)
            print(f"Created embedding for player: {player_name}")
        except Exception as e:
            print(f"Error creating embedding for player {player_name}: {str(e)}")
    
    return documents

def store_player_documents(documents: List[Dict[str, Any]]) -> None:
    """Store or update player documents in MongoDB."""
    try:
        collection = get_mongodb_collection()
        
        for doc in documents:
            # Check if document exists
            existing_doc = collection.find_one({"player_id": doc["player_id"]})
            
            if existing_doc:
                # Update existing document
                collection.update_one(
                    {"player_id": doc["player_id"]},
                    {
                        "$set": {
                            "full_text": doc["full_text"],
                            "embedding": doc["embedding"],
                            "summary": doc["summary"]
                        }
                    }
                )
                print(f"Updated document for player: {doc['name']}")
            else:
                # Insert new document
                collection.insert_one(doc)
                print(f"Inserted new document for player: {doc['name']}")
                
    except Exception as e:
        print(f"Error storing documents in MongoDB: {str(e)}")

def main():
    try:
        # Load player summaries
        file_path = "LocalServer/step1/player_summaries.json"  # Update this path
        print("Loading player summaries...")
        player_summaries = load_player_summaries(file_path)
        
        # Create player documents with embeddings
        print("Creating player documents with embeddings...")
        player_documents = create_player_documents(player_summaries)
        
        print("Storing/updating documents in MongoDB...")
        store_player_documents(player_documents)
        
        print("Data storage process completed successfully!")
    except Exception as e:
        print(f"Error in main execution: {str(e)}")

if __name__ == "__main__":
    main()
