from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any

class MessageRequest(BaseModel):
    message: str

class RewrittenMessage(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "long_version": "",
                "short_version": "",
                "additional": None
            }
        }
    )

    long_version: str
    short_version: str
    additional_data: Dict[str, Any] | None = Field(default=None, alias="additional")  # Additional data from Weaviate

class SelfAwarenessAnalysis(BaseModel):
    emotional_background: str
    present_elements: str
    missing_elements: str
    step_back_analysis: str

class SelfRegulationAnalysis(BaseModel):
    current_phrasing: str
    improvement_examples: str
    alternative_phrases: str

class EmpathyAnalysis(BaseModel):
    missing_elements: str
    potential_additions: str
    understanding_examples: str

class SocialSkillsAnalysis(BaseModel):
    current_impact: str
    improvements: str
    examples: str

class FullAnalysis(BaseModel):
    self_awareness: SelfAwarenessAnalysis
    self_regulation: SelfRegulationAnalysis
    empathy: EmpathyAnalysis
    social_skills: SocialSkillsAnalysis

class EmpathyResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": None,
                "analysis": None,
                "long_version": "",
                "short_version": "",
                "score": None,
                "additional": None
            }
        }
    )

    id: str | None = None
    analysis: FullAnalysis | None
    long_version: str
    short_version: str
    score: str | None = None  # Score/certainty from vector store as string
    additional_data: Dict[str, Any] | None = Field(default=None, alias="additional")  # Additional data from Weaviate

class StoreMessageResponse(BaseModel):
    status: str
    similar_message: Optional['SimilarMessageInfo'] = None

class SimilarMessageInfo(BaseModel):
    message: str
    response: EmpathyResponse
    similarity: float

class FeedbackRequest(BaseModel):
    message_id: str
    liked: bool 