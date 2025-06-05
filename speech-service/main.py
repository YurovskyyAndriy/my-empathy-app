from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import whisper  # This is actually openai-whisper
import os
import logging
from dotenv import load_dotenv
import torch
from concurrent.futures import ThreadPoolExecutor
import asyncio
import signal
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize thread pool for transcription
executor = ThreadPoolExecutor(max_workers=2)

# Initialize Whisper model with optimized settings
try:
    logger.info("Loading Whisper model...")
    model = whisper.load_model(
        "tiny",  # Using tiny model for faster processing
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
    logger.info(f"Whisper model loaded successfully on {model.device}")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {e}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="Speech Service API",
    description="Speech-to-text service using Whisper",
    version="1.0.0"
)

# Configure CORS with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Speech service starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Speech service shutting down...")
    executor.shutdown(wait=True)

def signal_handler(sig, frame):
    logger.info(f"Received signal {sig}, shutting down gracefully...")
    executor.shutdown(wait=False)
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(model.device),
        "model_type": "tiny"
    }

ALLOWED_AUDIO_TYPES = {
    'audio/webm',
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg'
}

def transcribe_file(file_path: str):
    """Run transcription in a separate thread"""
    try:
        # Use faster settings for initial transcription
        result = model.transcribe(
            file_path,
            fp16=False,  # Disable FP16 since it's not supported on CPU
            language='ru',  # Set expected language
            task='transcribe',
            best_of=1,  # Reduce beam search
            beam_size=1,  # Reduce beam size
            temperature=0.0,  # Reduce randomness
            compression_ratio_threshold=2.4,
            no_speech_threshold=0.6,
            condition_on_previous_text=False,
            initial_prompt=None
        )
        return result
    except Exception as e:
        logger.error(f"Transcription error in thread: {e}")
        raise

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.content_type in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {file.content_type}. Supported formats: {', '.join(ALLOWED_AUDIO_TYPES)}"
        )

    temp_file_path = None
    try:
        # Save the uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        logger.info(f"Saving uploaded file to {temp_file_path}")
        
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")
            
        with open(temp_file_path, "wb") as buffer:
            buffer.write(content)
        
        # Run transcription in thread pool
        logger.info("Starting transcription...")
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(executor, transcribe_file, temp_file_path)
        logger.info("Transcription completed successfully")
        
        if not result or not result.get("text"):
            raise HTTPException(status_code=500, detail="Transcription produced no text")
        
        return JSONResponse(content={
            "text": result["text"].strip(),
            "language": result.get("language", "unknown")
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                logger.error(f"Failed to clean up temporary file: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5005,
        log_level="info",
        workers=1,  # Use single worker to prevent model loading issues
        loop="asyncio"
    )
