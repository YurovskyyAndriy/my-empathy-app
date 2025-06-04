from pydantic import BaseModel
from typing import Optional, Dict, Any

class MessageRequest(BaseModel):
    message: str

class RewrittenMessage(BaseModel):
    long_version: str
    short_version: str

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
    analysis: FullAnalysis | None
    long_version: str
    short_version: str

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