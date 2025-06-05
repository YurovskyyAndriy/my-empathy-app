from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.services.weaviate_service import weaviate_service
from app.models.schemas import SearchRequest, StoreRequest, FeedbackRequest, VectorResponse
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Vector storage service for Empathy App",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/search", response_model=List[VectorResponse])
async def search_responses(request: SearchRequest):
    """Search for similar responses in the vector store."""
    try:
        responses = await weaviate_service.search(
            text=request.text,
            mode=request.mode,
            threshold=request.threshold,
            limit=request.limit
        )
        return responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/store", response_model=VectorResponse)
async def store_response(request: StoreRequest):
    """Store a new response in the vector store."""
    try:
        response = await weaviate_service.store(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def update_feedback(request: FeedbackRequest):
    """Update feedback for a response."""
    try:
        logger.info(f"Received feedback request: {request}")
        success = await weaviate_service.update_feedback(
            response_id=request.response_id,
            is_positive=request.is_positive
        )
        if not success:
            logger.error(f"Response not found: {request.response_id}")
            raise HTTPException(status_code=404, detail="Response not found")
        logger.info(f"Successfully updated feedback for response {request.response_id}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error updating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082) 