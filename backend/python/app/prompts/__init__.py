from enum import Enum
from typing import Dict

from .analyze import ANALYZE_PROMPT
from .rewrite import REWRITE_PROMPT

class PromptType(Enum):
    ANALYZE = "analyze"
    REWRITE = "rewrite"

PROMPTS: Dict[PromptType, str] = {
    PromptType.ANALYZE: ANALYZE_PROMPT,
    PromptType.REWRITE: REWRITE_PROMPT
}

def get_prompt(prompt_type: PromptType, lang: str = "en") -> str:
    """Get prompt by type and language"""
    prompt = PROMPTS[prompt_type]
    
    if lang == "ru":
        prompt += "\n\nIMPORTANT: Respond in Russian (на русском языке) as the input message is in Russian."
    elif lang == "uk":
        prompt += "\n\nIMPORTANT: Respond in Ukrainian (українською мовою) as the input message is in Ukrainian."
    
    return prompt 