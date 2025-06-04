from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Literal, Optional
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Empathy App API",
    description="API for the Empathy App that helps improve communication through emotional intelligence",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AnalyzeRequest(BaseModel):
    text: str
    mode: Literal["edit", "analyze"]

class AudioTranscriptionRequest(BaseModel):
    audio_data: str  # Base64 encoded audio data

class AnalysisResponse(BaseModel):
    original: str
    result: str
    emotional_context: Optional[dict] = None

# OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to Empathy App API"}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_message(request: AnalyzeRequest):
    try:
        if request.mode == "edit":
            system_message = """You are an emotional intelligence expert. 
            Rewrite the following message to make it more empathetic and emotionally intelligent.
            Return ONLY the rewritten message without any explanations."""
        else:  # mode == "analyze"
            system_message = """You are an emotional intelligence expert. Analyze the following message and provide:
            1. Emotional Tone Analysis: Identify the emotional undertones and their potential impact
            2. Areas for Improvement: Specific suggestions for increasing empathy and emotional intelligence
            3. Rewritten Version: A more emotionally intelligent version of the message
            
            Format your response with clear headers and bullet points."""
        
        # Get emotional context using separate API call
        emotion_response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Analyze the emotional context of this message. Return a JSON object with keys: primary_emotion, intensity (1-10), tone, potential_impact"},
                {"role": "user", "content": request.text}
            ],
            response_format={ "type": "json_object" }
        )
        emotional_context = emotion_response.choices[0].message.content
        
        # Get main analysis
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": request.text}
            ]
        )
        
        return AnalysisResponse(
            original=request.text,
            result=response.choices[0].message.content,
            emotional_context=emotional_context
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save the uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Transcribe using Whisper
        with open(temp_file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1"
            )
        
        # Clean up temp file
        os.remove(temp_file_path)
        
        return JSONResponse(content={
            "text": transcription.text
        })
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 