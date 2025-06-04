from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Literal, Optional, Dict, Any
import openai
import os
from dotenv import load_dotenv
import logging
import json
from app.services.message_processor import MessageProcessor
from app.config.settings import Settings
from app.models.api import (
    MessageRequest,
    RewrittenMessage,
    EmpathyResponse,
    FeedbackRequest,
    StoreMessageResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize settings
settings = Settings()

# Initialize FastAPI app
app = FastAPI(
    title="Empathy App API",
    description="API for the Empathy App that helps improve communication through emotional intelligence",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize message processor
processor = MessageProcessor(settings)

@app.get("/")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/rewriteMessage", response_model=RewrittenMessage)
async def rewrite_message(request: MessageRequest):
    """
    Rewrite a message to be more empathetic without analysis.
    Returns only the rewritten versions (long and short).
    """
    try:
        logger.info("Received rewrite request")
        result = await processor.rewrite_message(request.message)
        logger.info("Successfully rewrote message")
        return result
    except Exception as e:
        logger.error(f"Error in rewrite_message: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyzeMessage", response_model=EmpathyResponse)
async def analyze_message(request: MessageRequest):
    """
    Analyze a message and provide both analysis and rewritten versions.
    Returns full analysis with rewritten versions.
    """
    try:
        logger.info("Received analyze request")
        result = await processor.process_message(request.message)
        logger.info("Successfully analyzed message")
        return result
    except Exception as e:
        logger.error(f"Error in analyze_message: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Submit feedback for a message analysis"""
    try:
        logger.info(f"Received feedback for message {request.message_id}")
        await processor.process_feedback(request.message_id, request.liked)
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error in submit_feedback: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
