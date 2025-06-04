from openai import OpenAI
from app.core.config import settings

def test_openai_connection():
    """Test OpenAI API connection and analyze a sample reply."""
    
    # Initialize OpenAI client
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    # Sample reply to analyze
    test_reply = """Эх @Andriy.Yurovskyy, заполняю анкету, и жаль, что ты со мной не посоветовался.
    Нельзя давать разные варианты ответов по оценке прогресса разных направлений деятельности в команде."""

    # System prompt to set the context
    system_prompt = """You are an expert in emotional intelligence analysis. 
    Analyze the given reply focusing on four aspects:
    1. Self-awareness
    2. Self-regulation
    3. Empathy
    4. Social skills
    Provide a brief analysis for each aspect."""

    try:
        # Make API call
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",  # Using GPT-4 Turbo
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this reply: {test_reply}"}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Print the response
        print("\nAPI Response:")
        print("Token usage:", response.usage)
        print("\nAnalysis:")
        print(response.choices[0].message.content)
        
        return True, response
        
    except Exception as e:
        print(f"Error: {e}")
        return False, None

if __name__ == "__main__":
    success, response = test_openai_connection()
    print(f"\nTest {'successful' if success else 'failed'}") 