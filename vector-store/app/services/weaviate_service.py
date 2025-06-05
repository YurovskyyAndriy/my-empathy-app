import weaviate
from datetime import datetime, timezone
from app.core.config import settings
from app.models.schemas import VectorResponse, StoreRequest
import logging
import uuid

logger = logging.getLogger(__name__)

class WeaviateService:
    def __init__(self):
        self.client = weaviate.Client(
            url=f"http://{settings.WEAVIATE_HOST}:{settings.WEAVIATE_PORT}"
        )
        self._ensure_schema()
    
    def _list_collections(self):
        """List all collections in Weaviate."""
        try:
            schema = self.client.schema.get()
            collection_names = [c["class"] for c in schema["classes"]] if schema.get("classes") else []
            logger.info(f"Available collections: {collection_names}")
            return collection_names
        except Exception as e:
            logger.error(f"Error listing collections: {e}")
            return []
    
    def _ensure_schema(self):
        """Ensure the Weaviate schema exists."""
        logger.info(f"Ensuring schema for class: {settings.WEAVIATE_CLASS_NAME}")
        
        try:
            # Try to get the schema first
            schema = self.client.schema.get()
            classes = [c["class"] for c in schema.get("classes", [])]
            if settings.WEAVIATE_CLASS_NAME in classes:
                logger.info(f"Collection {settings.WEAVIATE_CLASS_NAME} already exists")
                return
        except Exception as e:
            logger.error(f"Error getting schema: {e}")
            
        # Collection doesn't exist, create it
        logger.info(f"Creating new collection: {settings.WEAVIATE_CLASS_NAME}")
        try:
            class_obj = {
                "class": settings.WEAVIATE_CLASS_NAME,
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
                        "dataType": ["object"],
                        "properties": [
                            {
                                "name": "analysis",
                                "dataType": ["object"]
                            },
                            {
                                "name": "long_version",
                                "dataType": ["text"]
                            },
                            {
                                "name": "short_version",
                                "dataType": ["text"]
                            },
                            {
                                "name": "id",
                                "dataType": ["text"]
                            },
                            {
                                "name": "certainty",
                                "dataType": ["number"]
                            }
                        ]
                    },
                    {
                        "name": "feedback",
                        "dataType": ["text"]
                    }
                ]
            }
            self.client.schema.create_class(class_obj)
            logger.info(f"Successfully created collection: {settings.WEAVIATE_CLASS_NAME}")
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            # Don't raise the error if collection already exists
            if "already exists" not in str(e):
                raise

    async def search(self, text: str, mode: str, threshold: float = 0.85, limit: int = 5) -> list[VectorResponse]:
        """Search for similar responses."""
        try:
            logger.info(f"Starting search with text: {text}, mode: {mode}, limit: {limit}")
            # Get all objects with similarity score
            result = (
                self.client.query
                .get(settings.WEAVIATE_CLASS_NAME, [
                    "message",
                    "feedback",
                    "response { analysis { empathy { missing_elements potential_additions understanding_examples } self_awareness { emotional_background missing_elements present_elements step_back_analysis } self_regulation { alternative_phrases current_phrasing improvement_examples } social_skills { current_impact examples improvements } } long_version short_version certainty }"
                ])
                .with_bm25(
                    query=text,
                    properties=["message"]
                )
                .with_limit(limit)
                .with_additional(["id", "score"])
                .do()
            )
            
            logger.info(f"Search result: {result}")
            
            responses = []
            if result and "data" in result and "Get" in result["data"]:
                objects = result["data"]["Get"][settings.WEAVIATE_CLASS_NAME]
                logger.info(f"Found {len(objects)} objects")
                for item in objects:
                    score_str = item.get("_additional", {}).get("score", "0")
                    try:
                        score = float(score_str)
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid score value: {score_str}")
                        score = 0
                    
                    # Only include results with score above threshold
                    if score >= settings.VECTOR_DB_CONFIDENCE_THRESHOLD:
                        response_obj = item.get("response", {})
                        response_data = {
                            "id": item.get("_additional", {}).get("id"),  # Add ID at the root level
                            "message": item.get("message"),
                            "response": response_obj,
                            "feedback": item.get("feedback", "neutral"),
                            "score": score
                        }
                        responses.append(VectorResponse(**response_data))
                logger.info(f"Filtered to {len(responses)} objects above threshold {settings.VECTOR_DB_CONFIDENCE_THRESHOLD}")
            else:
                logger.warning(f"No results found or invalid response format: {result}")
            
            return responses
        except Exception as e:
            logger.error(f"Error searching: {e}")
            raise

    async def store(self, request: StoreRequest) -> VectorResponse:
        """Store a new response."""
        try:
            # Generate UUID for the new object
            new_id = str(uuid.uuid4())
            
            properties = {
                "message": request.message,
                "response": request.response,
                "feedback": "neutral",
                "_additional": {
                    "id": new_id
                }
            }
            
            # Create object with properties
            result = self.client.data_object.create(
                data_object=properties,
                class_name=settings.WEAVIATE_CLASS_NAME,
                uuid=new_id  # Explicitly set the UUID
            )
            
            if not result:
                raise Exception("Failed to store object in Weaviate")
                
            return VectorResponse(id=new_id, **properties)
        except Exception as e:
            logger.error(f"Error storing: {e}")
            raise

    def _list_all_objects(self):
        """List all objects in the database for debugging."""
        try:
            result = (
                self.client.query
                .get(settings.WEAVIATE_CLASS_NAME, ["message", "response", "feedback"])
                .with_additional(["id"])
                .do()
            )
            logger.info(f"All objects in database: {result}")
            return result
        except Exception as e:
            logger.error(f"Error listing objects: {e}")
            return None

    async def update_feedback(self, response_id: str, is_positive: bool) -> bool:
        """Update feedback for a response."""
        try:
            # Validate UUID format
            try:
                uuid_obj = uuid.UUID(response_id)
                logger.info(f"Valid UUID format for response_id: {response_id}")
            except ValueError:
                logger.error(f"Invalid UUID format: {response_id}")
                return False

            # Debug: List all objects
            debug_result = self._list_all_objects()
            logger.info(f"Debug - all objects before update: {debug_result}")

            # Try direct update without querying first
            try:
                feedback_value = "positive" if is_positive else "negative"
                logger.info(f"Attempting direct update to {feedback_value} for object {response_id}")
                
                self.client.data_object.update(
                    uuid=str(uuid_obj),
                    class_name=settings.WEAVIATE_CLASS_NAME,
                    data_object={
                        "feedback": feedback_value
                    }
                )
                logger.info(f"Successfully updated feedback for {response_id} to {feedback_value}")
                return True
                
            except Exception as e:
                logger.error(f"Error updating object: {e}")
                return False
            
        except Exception as e:
            logger.error(f"Unexpected error updating feedback: {e}")
            return False

weaviate_service = WeaviateService() 