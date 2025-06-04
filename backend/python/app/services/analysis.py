from typing import Dict, Any
import json
from openai import OpenAI
from app.config.settings import Settings
from app.models.api import EmpathyResponse, FullAnalysis
from app.services.weaviate_client import get_weaviate_client

settings = Settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)

def analyze_message(message: str) -> Dict[str, Any]:
    try:
        response = client.chat.completions.create(
            model=settings.GPT_MODEL,
            messages=[
                {"role": "system", "content": settings.DEFAULT_EI_PROMPT},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        # Get the response content
        response_text = response.choices[0].message.content

        # Parse the JSON response
        parsed_response = json.loads(response_text)

        # Validate the response structure
        validate_response_structure(parsed_response)

        return parsed_response

    except Exception as e:
        raise Exception(f"Error analyzing message: {str(e)}")

def validate_response_structure(response: Dict[str, Any]) -> None:
    """Validate that the response has the correct structure."""
    required_fields = {
        "analysis": {
            "self_awareness": ["emotional_background", "present_elements", "missing_elements"],
            "self_regulation": ["current_phrasing", "improvement_examples", "alternative_phrases"],
            "empathy": ["missing_elements", "potential_additions", "understanding_examples"],
            "social_skills": ["current_impact", "improvements", "examples"]
        },
        "long_version": None,
        "short_version": None
    }

    def validate_section(data: Dict[str, Any], structure: Dict[str, Any], path: str = "") -> None:
        for key, expected in structure.items():
            if key not in data:
                raise ValueError(f"Missing required field: {path + key}")
            
            if expected is not None:
                if not isinstance(data[key], dict):
                    raise ValueError(f"Field {path + key} should be a dictionary")
                validate_section(data[key], {field: None for field in expected}, f"{path}{key}.")

            # Validate that string fields are non-empty and at least 100 characters
            if expected is None and (not isinstance(data[key], str) or len(data[key]) < 100):
                raise ValueError(f"Field {path + key} should be a non-empty string of at least 100 characters")

    validate_section(response, required_fields)

def store_message_and_response(message: str, response: Dict[str, Any]) -> Dict[str, Any]:
    """Store the message and response in the vector database."""
    try:
        client = get_weaviate_client()
        
        # Create the object to store
        data_object = {
            "message": message,
            "response": response
        }
        
        # Store in Weaviate
        client.data_object.create(
            data_object,
            "Message",
            vector=get_message_embedding(message)
        )
        
        return {"status": "stored"}
        
    except Exception as e:
        raise Exception(f"Error storing message: {str(e)}")

def get_message_embedding(text: str) -> list:
    """Get embedding for a text using OpenAI's embedding model."""
    try:
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        raise Exception(f"Error getting embedding: {str(e)}")

def find_similar_messages(message: str, limit: int = 5) -> list:
    """Find similar messages in the vector database."""
    try:
        client = get_weaviate_client()
        
        # Get embedding for the query
        query_embedding = get_message_embedding(message)
        
        # Search in Weaviate
        result = client.query.get(
            "Message",
            ["message", "response"]
        ).with_near_vector({
            "vector": query_embedding
        }).with_limit(limit).do()
        
        return result["data"]["Get"]["Message"]
        
    except Exception as e:
        raise Exception(f"Error finding similar messages: {str(e)}") 