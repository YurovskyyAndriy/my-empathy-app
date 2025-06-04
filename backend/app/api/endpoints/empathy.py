from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.empathy_service import EmpathyService

router = APIRouter()
empathy_service = EmpathyService()

class MessageRequest(BaseModel):
    text: str

class MessageResponse(BaseModel):
    status: str
    analysis: str | None = None
    error: str | None = None
    metadata: dict | None = None

@router.post("/analyze", response_model=MessageResponse)
def analyze_message(request: MessageRequest) -> MessageResponse:
    """
    Analyze a message for emotional intelligence aspects.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Message text cannot be empty")
        
    result = empathy_service.analyze_message(request.text)
    
    return MessageResponse(**result) 