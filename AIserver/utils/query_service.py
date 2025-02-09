from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from groq import Groq
import os
from pymongo import MongoClient
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Environment variables
google_api_key = os.getenv("GOOGLE_API_KEY")
mongodb_uri = "mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/cricket"
groq_api_key = os.getenv("GROQ_API_KEY")

# Initialize the Groq client
client = Groq(api_key=groq_api_key)

def get_mongodb_collection():
    """Get MongoDB collection instance."""
    client = MongoClient(mongodb_uri)
    db = client['cricket']
    return db['players_summaries']

def search_similar_players(query: str, limit: int = 2) -> List[Dict]:
    """Search for similar players using vector similarity."""
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        query_embedding = embeddings.embed_query(query)
        
        collection = get_mongodb_collection()

        # Vector search pipeline
        pipeline = [
                        {
            "$vectorSearch": {
                "index": "vector_index",
                "limit": limit,
                "numCandidates":10,
                "path": "embedding",
                "queryVector": query_embedding
            }
            },
            {
                "$project": {
                    "_id": 0,
                    "player_id": 1,
                    "name": 1,
                    "summary": 1,
                    "full_text": 1,
                    "score": {"$meta": "searchScore"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        print(results)
        return results
    except Exception as e:
        print(f"Error in vector search: {str(e)}")
        return []

def get_player_context(player_query: str, top_k: int = 2) -> List[Document]:
    """Get player context using vector similarity search."""
    results = search_similar_players(player_query, top_k)
    
    documents = []
    for result in results:
        doc = Document(
            page_content=result['full_text'],
            metadata={"player_id": result['player_id'], "name": result['name']}
        )
        documents.append(doc)
    
    return documents

def query_ai_model(question: str, context: str) -> str:
    """Query the AI model with a user question and relevant context."""
    prompt = f"""
    You are an expert cricket analyst with deep knowledge of the game. Your role is to analyze match data and provide insightful responses to questions.
    
    ### Context:
    {context}
    
    ### Question:
    {question}
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", 
                 "content": "You are an expert cricket analyst. Analyze match data and provide insightful responses."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=512
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error querying AI model: {str(e)}"

def process_user_query(user_question: str) -> Dict[str, str]:
    """Process the user question and return the response."""
    try:
        # Get relevant context
        relevant_docs = get_player_context(user_question)
        
        if not relevant_docs:
            return {
                "status": "error",
                "message": "No relevant context found for the question."
            }
        
        # Combine context from all relevant documents
        relevant_context = "\n".join([doc.page_content for doc in relevant_docs])
        
        # Get AI response
        ai_response = query_ai_model(user_question, relevant_context)
        
        return {
            "status": "success",
            "question": user_question,
            "response": ai_response,
            "context": relevant_context
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error processing query: {str(e)}"
        }

def main():
    """Main function to test the query service."""
    test_questions = [
        "in which phase powerplay or death overs Mohammed Siraj has good bowling stats?",
        "which batsmen is better shubhman gill or gaikwad?",
    ]
    
    for question in test_questions:
        print(f"\nProcessing question: {question}")
        result = process_user_query(question)
        
        if result["status"] == "success":
            print("\nAI Response:")
            print(result["response"])
        else:
            print("\nError:")
            print(result["message"])

if __name__ == "__main__":
    main()