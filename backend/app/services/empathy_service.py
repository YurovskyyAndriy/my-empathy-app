from openai import OpenAI
from app.core.config import settings
from typing import Dict, Any, Optional
import httpx
import random

class EmpathyService:
    def __init__(self):
        self.system_prompt = """You are an expert in emotional intelligence analysis. 
        Analyze the given reply focusing on four aspects:
        1. Self-awareness
        2. Self-regulation
        3. Empathy
        4. Social skills
        Provide a brief analysis for each aspect."""
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.vector_store_url = settings.VECTOR_DB_URL

    async def _get_vector_store_response(self, message: str, mode: str) -> Optional[Dict[str, Any]]:
        """Try to get a response from vector store."""
        if not self.vector_store_url:
            return None

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.vector_store_url}/search",
                    json={
                        "text": message,
                        "mode": mode,
                        "threshold": settings.VECTOR_DB_CONFIDENCE_THRESHOLD,
                        "limit": 1
                    }
                )
                response.raise_for_status()
                results = response.json()
                return results[0] if results else None
            except Exception as e:
                print(f"Vector store error: {e}")
                return None

    async def _store_successful_response(self, question: str, answer: str, mode: str) -> None:
        """Store successful response in vector store."""
        if not self.vector_store_url:
            return

        async with httpx.AsyncClient() as client:
            try:
                await client.post(
                    f"{self.vector_store_url}/store",
                    json={
                        "question": question,
                        "answer": answer,
                        "mode": mode,
                        "source": "openai"
                    }
                )
            except Exception as e:
                print(f"Error storing response: {e}")

    def _should_use_vector_store(self) -> bool:
        """Determine if we should try vector store based on A/B test weights."""
        total_weight = (
            settings.AB_TEST_OPENAI_WEIGHT +
            settings.AB_TEST_VECTOR_DB_WEIGHT
        )
        if total_weight == 0:
            return False
            
        return random.randint(1, total_weight) <= settings.AB_TEST_VECTOR_DB_WEIGHT

    async def analyze_message(self, message: str, mode: str = "analyze") -> Dict[str, Any]:
        """
        Analyze a message for emotional intelligence aspects.
        
        Args:
            message: The message text to analyze
            mode: The analysis mode ("edit" or "analyze")
            
        Returns:
            Dict containing analysis results and metadata
        """
        try:
            # Check vector store first based on A/B test
            if self._should_use_vector_store():
                vector_response = await self._get_vector_store_response(message, mode)
                if vector_response:
                    return {
                        "status": "success",
                        "analysis": vector_response["answer"],
                        "source": "vector",
                        "response_id": vector_response["id"]
                    }

            # Fall back to OpenAI
            system_content = self.system_prompt if mode == "analyze" else (
                "Rewrite the message to make it more empathetic. Return ONLY the rewritten message."
            )
            
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            answer = response.choices[0].message.content
            
            # Store successful OpenAI response
            await self._store_successful_response(message, answer, mode)
            
            return {
                "status": "success",
                "analysis": answer,
                "source": "openai",
                "metadata": {
                    "token_usage": {
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens,
                        "total_tokens": response.usage.total_tokens
                    }
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            } 