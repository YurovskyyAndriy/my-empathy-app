from openai import OpenAI
from app.core.config import settings
from typing import Dict, Any

class EmpathyService:
    def __init__(self):
        self.system_prompt = """You are an expert in emotional intelligence analysis. 
        Analyze the given reply focusing on four aspects:
        1. Self-awareness
        2. Self-regulation
        3. Empathy
        4. Social skills
        Provide a brief analysis for each aspect."""

    def analyze_message(self, message: str) -> Dict[str, Any]:
        """
        Analyze a message for emotional intelligence aspects.
        
        Args:
            message: The message text to analyze
            
        Returns:
            Dict containing analysis results and metadata
        """
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": f"Analyze this reply: {message}"}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return {
                "status": "success",
                "analysis": response.choices[0].message.content,
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