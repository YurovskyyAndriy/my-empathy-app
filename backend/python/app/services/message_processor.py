import random
from typing import Optional, Dict, Any
import openai
import weaviate
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

class MessageProcessor:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
        try:
            self.vector_client = weaviate.WeaviateClient(
                connection_params=weaviate.connect.ConnectionParams.from_url(
                    url=settings.vector_db_url,
                    grpc_port=50051  # Default gRPC port for Weaviate
                )
            )
        except Exception as e:
            print(f"Failed to initialize Weaviate client: {e}")
            self.vector_client = None  # We'll handle this in methods that use vector_client
        
    def _detect_language(self, text: str) -> str:
        """
        Simple language detection based on character set.
        Returns 'ru' for Russian, 'en' for English
        """
        # Check if text contains Cyrillic characters
        if bool(re.search('[а-яА-Я]', text)):
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
            
            # Return rewritten message
            return RewrittenMessage(**rewrite_data)
        except Exception as e:
            print(f"Error rewriting message: {str(e)}")
            raise

    async def process_message(self, message: str) -> EmpathyResponse:
        """Process a text message and return empathy analysis"""
        try:
            # Detect message language
            lang = self._detect_language(message)
            
            # First, get the analysis
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
            
            # Then, get the rewritten versions using the rewrite_message method
            rewritten = await self.rewrite_message(message)
            
            # Combine the results
            result = {
                "analysis": analysis_data,
                "long_version": rewritten.long_version,
                "short_version": rewritten.short_version
            }
            
            # Create and return EmpathyResponse
            return EmpathyResponse(**result)
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            raise

    async def transcribe_audio(self, audio_data: bytes) -> str:
        """Transcribe audio using Whisper"""
        try:
            # Save audio data to temporary file
            temp_file = "temp_audio.wav"
            with open(temp_file, "wb") as f:
                f.write(audio_data)

            # Transcribe using Whisper
            with open(temp_file, "rb") as audio_file:
                transcription = self.openai_client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-1"
                )

            # Clean up
            import os
            os.remove(temp_file)

            return transcription.text
        except Exception as e:
            print(f"Error in transcribe_audio: {e}")
            raise

    async def store_good_message(self, message: str, response: EmpathyResponse) -> StoreMessageResponse:
        """Store a good message-response pair in the vector database if similar doesn't exist"""
        try:
            # Get vector representation of the message
            vector = await self._get_message_vector(message)

            # First check if similar message exists
            query = (
                self.vector_client.query
                .get("ChatMessage", ["message", "response"])
                .with_near_vector({
                    "vector": vector,
                    "certainty": self.settings.vector_db_confidence_threshold
                })
                .with_additional(["certainty"])
                .with_limit(1)
            )
            
            result = query.do()

            # Check if similar message found
            if messages := result.get("data", {}).get("Get", {}).get("ChatMessage", []):
                similar_message = messages[0]
                return StoreMessageResponse(
                    status="similar_exists",
                    similar_message=SimilarMessageInfo(
                        message=similar_message["message"],
                        response=EmpathyResponse.parse_obj(similar_message["response"]),
                        similarity=similar_message["_additional"]["certainty"]
                    )
                )
            
            # If no similar message found, store the new one
            self.vector_client.data_object.create(
                class_name="ChatMessage",
                properties={
                    "message": message,
                    "response": response.dict(),
                    "feedback": "positive"
                },
                vector=vector
            )
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

    async def process_feedback(self, message_id: str, liked: bool):
        """Process feedback for a message"""
        try:
            # TODO: Implement feedback processing
            pass
        except Exception as e:
            print(f"Error processing feedback: {e}")
            raise 