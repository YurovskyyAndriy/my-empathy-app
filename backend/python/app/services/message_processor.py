import random
from typing import Optional, Dict, Any
import openai
import weaviate
import httpx
from app.config.settings import Settings
from app.models.api import (
    EmpathyResponse, 
    EmpathyAnalysis, 
    StoreMessageResponse, 
    SimilarMessageInfo,
    SelfAwarenessAnalysis,
    SelfRegulationAnalysis,
    SocialSkillsAnalysis,
    FullAnalysis,
    RewrittenMessage
)
from app.prompts import PromptType, get_prompt
import re
import json
import uuid

class MessageProcessor:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
        try:
            self.vector_client = weaviate.Client(
                url=settings.vector_db_url
            )
            self._ensure_schema()
        except Exception as e:
            print(f"Failed to initialize Weaviate client: {e}")
            self.vector_client = None  # We'll handle this in methods that use vector_client
        
    def _ensure_schema(self):
        """Ensure the Weaviate schema exists."""
        try:
            # Try to get the schema first
            schema = self.vector_client.schema.get()
            classes = [c["class"] for c in schema.get("classes", [])]
            if "ChatMessage" in classes:
                print("ChatMessage schema already exists")
                return
                
            # Create schema if it doesn't exist
            class_obj = {
                "class": "ChatMessage",
                "vectorizer": "text2vec-transformers",
                "moduleConfig": {
                    "text2vec-transformers": {
                        "vectorizeClassName": False
                    }
                },
                "properties": [
                    {
                        "name": "message",
                        "dataType": ["text"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": False,
                                "vectorizePropertyName": False
                            }
                        }
                    },
                    {
                        "name": "response",
                        "dataType": ["text"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": True
                            }
                        }
                    },
                    {
                        "name": "feedback",
                        "dataType": ["text"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": True
                            }
                        }
                    },
                    {
                        "name": "type",
                        "dataType": ["text"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": True
                            }
                        }
                    },
                    {
                        "name": "rating",
                        "dataType": ["int"],
                        "moduleConfig": {
                            "text2vec-transformers": {
                                "skip": True
                            }
                        }
                    }
                ]
            }
            self.vector_client.schema.create_class(class_obj)
            print("Successfully created ChatMessage schema")
        except Exception as e:
            print(f"Error ensuring schema: {e}")
            if "already exists" not in str(e):
                raise
        
    def _detect_language(self, text: str) -> str:
        """
        Language detection based on character set and specific Ukrainian characters.
        Returns:
        - 'uk' for Ukrainian
        - 'ru' for Russian
        - 'en' for English
        """
        # Check for Ukrainian specific characters
        if bool(re.search('[іїєґ]', text.lower())):
            return 'uk'
        # Check if text contains Cyrillic characters
        elif bool(re.search('[а-яА-Я]', text)):
            return 'ru'
        return 'en'
        
    def _transform_analysis(self, analysis_data: Dict[str, Any]) -> FullAnalysis:
        """Transform string values into proper nested objects"""
        if isinstance(analysis_data["self_awareness"], str):
            analysis_data["self_awareness"] = {
                "emotional_background": analysis_data["self_awareness"],
                "present_elements": "Не указано",
                "missing_elements": "Не указано"
            }
        
        if isinstance(analysis_data["self_regulation"], str):
            analysis_data["self_regulation"] = {
                "current_phrasing": analysis_data["self_regulation"],
                "improvement_examples": "Не указано",
                "alternative_phrases": "Не указано"
            }
        
        if isinstance(analysis_data["empathy"], str):
            analysis_data["empathy"] = {
                "missing_elements": analysis_data["empathy"],
                "potential_additions": "Не указано",
                "understanding_examples": "Не указано"
            }
        
        if isinstance(analysis_data["social_skills"], str):
            analysis_data["social_skills"] = {
                "current_impact": analysis_data["social_skills"],
                "improvements": "Не указано",
                "examples": "Не указано"
            }
        
        return FullAnalysis(**analysis_data)
        
    async def rewrite_message(self, message: str) -> RewrittenMessage:
        """Rewrite a message to be more empathetic without analysis"""
        try:
            # First check if we have a similar message in vector store
            if self._should_use_vector_store():
                print("Using vector store...")
                vector_response = await self._get_vector_store_response(message, mode="rewrite")
                if vector_response:
                    print(f"Got vector response with score: {vector_response.score}")
                    return RewrittenMessage(
                        long_version=vector_response.long_version,
                        short_version=vector_response.short_version,
                        additional_data=vector_response.additional_data
                    )

            # If no vector response or not using vector store, proceed with OpenAI
            print("Using OpenAI...")
            # Detect message language
            lang = self._detect_language(message)
            
            # Get rewrite prompt
            rewrite_prompt = get_prompt(PromptType.REWRITE, lang)
            
            # Get rewritten versions
            rewrite_completion = self.openai_client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": rewrite_prompt
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            rewrite_text = rewrite_completion.choices[0].message.content
            rewrite_data = json.loads(rewrite_text)
            
            # Create response object
            response = RewrittenMessage(**rewrite_data)
            
            # Store in vector database if available
            if self.vector_client:
                # Get vector representation
                vector = await self._get_message_vector(message)
                
                # Store the message
                result = self.vector_client.data_object.create(
                    class_name="ChatMessage",
                    data_object={
                        "message": message,
                        "response": json.dumps(rewrite_data),
                        "feedback": "positive",
                        "type": "rewrite"
                    },
                    vector=vector
                )
                
                # Add the ID to the response
                response.additional_data = {"id": result}
            
            return response
        except Exception as e:
            print(f"Error rewriting message: {str(e)}")
            raise

    def _should_use_vector_store(self) -> bool:
        """Determine if we should try vector store based on A/B test weights."""
        print(f"A/B test weights - OpenAI: {self.settings.ab_test_openai_weight}, Vector DB: {self.settings.ab_test_vector_db_weight}")
        # Always use vector store if its weight is greater than 0
        should_use = self.settings.ab_test_vector_db_weight > 0
        print(f"Should use vector store: {should_use}")
        return should_use

    async def _get_vector_store_response(self, message: str, mode: str = "analyze") -> Optional[EmpathyResponse]:
        """Try to get a response from vector store."""
        try:
            if not self.vector_client:
                return None

            print(f"Vector store confidence threshold from settings: {self.settings.vector_db_confidence_threshold}")
            # Get vector representation of the message
            vector = await self._get_message_vector(message)

            # Search for similar messages with matching type
            query = (
                self.vector_client.query
                .get("ChatMessage", ["message", "response", "type"])
                .with_near_vector({
                    "vector": vector,
                    "certainty": self.settings.vector_db_confidence_threshold
                })
                .with_where({
                    "operator": "Equal",
                    "path": ["type"],
                    "valueText": mode
                })
                .with_additional(["certainty", "id"])
                .with_limit(1)
            )
            
            result = query.do()
            
            # Check if similar message found
            if messages := result.get("data", {}).get("Get", {}).get("ChatMessage", []):
                message_data = messages[0]
                response_data = json.loads(message_data["response"])
                certainty = message_data["_additional"]["certainty"]
                message_id = message_data["_additional"]["id"]
                
                # Create response object
                response = EmpathyResponse.model_validate(response_data)
                # Add the message ID to additional_data field
                response.additional_data = {"id": message_id}
                # Add certainty as score
                response.score = str(certainty)
                
                return response
                
            return None
        except Exception as e:
            print(f"Error getting vector store response: {e}")
            return None

    async def process_message(self, message: str) -> EmpathyResponse:
        """Process a text message and return empathy analysis"""
        try:
            # Check vector store first based on A/B test
            if self._should_use_vector_store():
                print("Using vector store...")
                vector_response = await self._get_vector_store_response(message, mode="analyze")
                if vector_response:
                    print(f"Got vector response with score: {vector_response.score}")
                    return vector_response

            # If no vector response or not using vector store, proceed with OpenAI
            print("Using OpenAI...")
            lang = self._detect_language(message)
            analyze_prompt = get_prompt(PromptType.ANALYZE, lang)
            
            analysis_completion = self.openai_client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": analyze_prompt
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Get the analysis
            analysis_text = analysis_completion.choices[0].message.content
            analysis_data = json.loads(analysis_text)
            print(f"Got OpenAI analysis: {analysis_data}")
            
            # Then, get the rewritten versions using the rewrite_message method
            rewritten = await self.rewrite_message(message)
            print(f"Got rewritten versions: {rewritten}")
            
            # Combine the results
            result = {
                "analysis": analysis_data,
                "long_version": rewritten.long_version,
                "short_version": rewritten.short_version
            }
            
            # Create response
            response = EmpathyResponse(**result)
            print(f"Created response object: {response}")
            
            # Store successful OpenAI response in vector store
            if self.vector_client:  # Only store if we have a vector client
                print("Attempting to store response in vector store...")
                store_result = await self.store_good_message(message, response, mode="analyze")
                print(f"Store result: {store_result}")
                
                # If the message was stored (not just found similar), the ID will be in additional_data
                if store_result.status == "stored":
                    print(f"Message stored with ID: {response.additional_data['id']}")
                elif store_result.status == "similar_exists" and store_result.similar_message:
                    # Use the ID from the similar message
                    response.additional_data = {"id": store_result.similar_message.response.additional_data["id"]}
                    print(f"Using existing message ID: {response.additional_data['id']}")
            else:
                print("No vector client available, skipping storage")
            
            return response
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            raise

    async def store_good_message(self, message: str, response: EmpathyResponse, mode: str = "analyze") -> StoreMessageResponse:
        """Store a good message-response pair in the vector database if similar doesn't exist"""
        try:
            # Get vector representation of the message
            vector = await self._get_message_vector(message)

            # First check if similar message exists
            query = (
                self.vector_client.query
                .get("ChatMessage", ["message", "response", "type"])
                .with_near_vector({
                    "vector": vector,
                    "certainty": self.settings.vector_db_confidence_threshold
                })
                .with_where({
                    "operator": "Equal",
                    "path": ["type"],
                    "valueText": mode
                })
                .with_additional(["certainty", "id"])
                .with_limit(1)
            )
            
            result = query.do()

            # Check if similar message found
            if messages := result.get("data", {}).get("Get", {}).get("ChatMessage", []):
                similar_message = messages[0]
                response_data = json.loads(similar_message["response"])
                similar_response = EmpathyResponse.model_validate(response_data)
                # Add the ID to the similar message response
                similar_response.additional_data = {"id": similar_message["_additional"]["id"]}
                return StoreMessageResponse(
                    status="similar_exists",
                    similar_message=SimilarMessageInfo(
                        message=similar_message["message"],
                        response=similar_response,
                        similarity=similar_message["_additional"]["certainty"]
                    )
                )
            
            # If no similar message found, store the new one
            response_data = response.model_dump()
            # Remove id field if it's None to avoid Weaviate validation error
            if response_data.get('id') is None:
                del response_data['id']
            # Handle score field
            if response_data.get('score') is None:
                response_data['score'] = "0"  # Default score as string
            else:
                response_data['score'] = str(response_data['score'])
                
            result = self.vector_client.data_object.create(
                class_name="ChatMessage",
                data_object={
                    "message": message,
                    "response": json.dumps(response_data),
                    "feedback": "positive",
                    "type": mode,
                    "rating": 0  # Initial rating
                },
                vector=vector
            )
            
            # Update response with the new ID in additional_data field
            response.additional_data = {"id": result}
            return StoreMessageResponse(status="stored")
                
        except Exception as e:
            print(f"Error in store_good_message: {e}")
            raise

    async def remove_from_vector_db(self, message: str, response: EmpathyResponse):
        """Remove a message-response pair from the vector database"""
        try:
            # Get vector representation
            vector = await self._get_message_vector(message)

            # Find and delete similar vectors
            query = (
                self.vector_client.query
                .get("ChatMessage", ["_additional {id}"])
                .with_near_vector({
                    "vector": vector,
                    "certainty": 0.95  # High certainty for deletion
                })
                .with_limit(1)
            )
            
            result = query.do()

            # Delete if found
            if objects := result.get("data", {}).get("Get", {}).get("ChatMessage", []):
                object_id = objects[0]["_additional"]["id"]
                self.vector_client.data_object.delete(
                    class_name="ChatMessage",
                    uuid=object_id
                )
        except Exception as e:
            print(f"Error in remove_from_vector_db: {e}")
            # Don't raise - removal is optional

    async def _get_message_vector(self, message: str) -> list:
        """Get vector representation of a message using OpenAI embeddings"""
        response = self.openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=message
        )
        return response.data[0].embedding

    def _list_all_objects(self):
        """List all objects in the database for debugging"""
        try:
            result = (
                self.vector_client.query
                .get("ChatMessage", ["message", "response", "feedback"])
                .with_additional(["id"])
                .do()
            )
            print(f"All objects in database: {result}")
            return result
        except Exception as e:
            print(f"Error listing objects: {e}")
            return None

    async def process_feedback(self, message_id: str, liked: bool) -> None:
        """Process feedback for a message"""
        try:
            if not self.vector_client:
                print("Vector client not initialized")
                return
            
            # List all objects for debugging
            print("Current objects in database:")
            self._list_all_objects()
            
            # Validate UUID format
            try:
                uuid_obj = uuid.UUID(message_id)
                message_id = str(uuid_obj)
                print(f"Valid UUID format: {message_id}")
            except ValueError:
                print(f"Invalid UUID format: {message_id}")
                raise ValueError("Invalid message ID format")

            # Get current object to check rating
            result = (
                self.vector_client.query
                .get("ChatMessage", ["rating"])
                .with_where({
                    "operator": "Equal",
                    "path": ["id"],
                    "valueString": message_id
                })
                .do()
            )

            current_rating = 0  # Default rating
            if objects := result.get("data", {}).get("Get", {}).get("ChatMessage", []):
                rating = objects[0].get("rating")
                # Handle None rating
                current_rating = 0 if rating is None else rating

            new_rating = current_rating + (1 if liked else -1)
            print(f"Updating rating from {current_rating} to {new_rating}")
            
            if new_rating <= 0 and not liked:
                # Delete the message if rating is 0 or below and got a dislike
                print(f"Deleting message {message_id} due to negative rating")
                self.vector_client.data_object.delete(
                    class_name="ChatMessage",
                    uuid=message_id
                )
                print(f"Successfully deleted message {message_id}")
            else:
                # Update rating
                print(f"Updating rating to {new_rating} for message {message_id}")
                self.vector_client.data_object.update(
                    uuid=message_id,
                    class_name="ChatMessage",
                    data_object={
                        "rating": new_rating,
                        "feedback": "positive" if liked else "negative"
                    }
                )
                print(f"Successfully updated rating for message {message_id}")
            
            # List objects after update for verification
            print("Objects after update:")
            self._list_all_objects()
        except Exception as e:
            print(f"Error processing feedback: {e}")
            raise

    async def clear_vector_store(self) -> None:
        """Clear all objects from the vector store"""
        try:
            if not self.vector_client:
                print("Vector client not initialized")
                return
                
            # Delete all objects of class ChatMessage
            self.vector_client.batch.delete_objects(
                class_name="ChatMessage",
                where={
                    "operator": "NotNull",
                    "path": ["id"]
                }
            )
            print("Vector store cleared successfully")
        except Exception as e:
            print(f"Error clearing vector store: {e}")
            raise 