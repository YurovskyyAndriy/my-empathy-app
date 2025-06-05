from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime

class SearchRequest(BaseModel):
    text: str
    mode: Literal["edit", "analyze"]
    threshold: float = 0.85
    limit: int = 5

class FeedbackRequest(BaseModel):
    response_id: str
    is_positive: bool

class VectorResponse(BaseModel):
    id: str
    message: str
    response: Dict[str, Any]
    feedback: str = "neutral"
    score: Optional[float] = None

class StoreRequest(BaseModel):
    message: str
    response: Dict[str, Any] 