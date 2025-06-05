export interface SelfAwarenessAnalysis {
  emotional_background: string;
  present_elements: string;
  missing_elements: string;
  step_back_analysis: string;
}

export interface SelfRegulationAnalysis {
  current_phrasing: string;
  improvement_examples: string;
  alternative_phrases: string;
}

export interface EmpathyAnalysis {
  missing_elements: string;
  potential_additions: string;
  understanding_examples: string;
}

export interface SocialSkillsAnalysis {
  current_impact: string;
  improvements: string;
  examples: string;
}

export interface Analysis {
  self_awareness: SelfAwarenessAnalysis;
  self_regulation: SelfRegulationAnalysis;
  empathy: EmpathyAnalysis;
  social_skills: SocialSkillsAnalysis;
}

export interface EmpathyResponse {
  id?: string;
  analysis?: Analysis;
  long_version: string;
  short_version: string;
  score?: number;  // Score/similarity from vector store
  additional?: {
    id: string;
  };
}

export interface RewrittenMessage {
  long_version: string;
  short_version: string;
  additional?: {
    id: string;
  };
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  response?: EmpathyResponse;
}

export interface FeedbackRequest {
  message: string;
  response: EmpathyResponse;
  liked: boolean;
}

export interface FeedbackResponse {
  status: string;
  message: string;
} 