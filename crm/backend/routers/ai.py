from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from auth import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


class GenerateRequest(BaseModel):
    tool: str
    platform: Optional[str] = "Facebook"
    topic: Optional[str] = ""
    service: Optional[str] = ""
    audience: Optional[str] = ""
    subject_hint: Optional[str] = ""
    keywords: Optional[str] = ""
    inquiry_type: Optional[str] = ""
    language: Optional[str] = "english"
    month: Optional[str] = ""
    campaign_type: Optional[str] = ""


LIFEWAY_CONTEXT = """
Lifeway Programs (lifewayprograms.org) is a faith-based nonprofit in South Florida serving
underserved communities with: mental health therapy, primary medical care, social services,
spiritual support, employment support, food assistance, and wellness programs.
Tone: warm, compassionate, inclusive, faith-forward but welcoming to all backgrounds.
Serves Hispanic/Latino and underserved communities. Languages: English & Spanish.
"""

SYSTEM = f"You are a marketing specialist for Lifeway Programs.\n\n{LIFEWAY_CONTEXT}"


@router.post("/generate")
async def generate(req: GenerateRequest, _=Depends(get_current_user)):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not set. Add it to crm/backend/.env")

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
    except ImportError:
        raise HTTPException(status_code=503, detail="anthropic package not installed")

    prompts = {
        "social": f"Write a {req.platform} post about: {req.topic}. Service focus: {req.service or 'general'}. ~300 chars. Include 3-5 hashtags.",
        "email": f"Write a complete email campaign. Type: {req.campaign_type or req.audience}. Audience: {req.audience}. Subject hint: {req.subject_hint}. Include: subject line, preview text, body, CTA, sign-off.",
        "blog": f"Write an SEO blog post about: {req.topic}. Keywords: {req.keywords or 'community health, nonprofit services'}. ~600 words. Include SEO title, meta description, H1, 3 H2 sections, CTA.",
        "lead": f"Write a warm follow-up message to someone who inquired about {req.inquiry_type} services. {'Write in Spanish.' if req.language == 'spanish' else ''} 150-250 words, personal tone, clear next steps.",
        "ads": f"Create a Google Ads campaign for {req.service} services, goal: {req.topic or 'appointments'}. Include 5 headlines (30 chars max), 3 descriptions (90 chars max), 10 keywords with match types, negatives, bid strategy.",
        "calendar": f"Create a 4-week social media content calendar for {req.month}. Services: {req.topic or 'all services'}. 3 posts/week (Mon/Wed/Fri), mix of platforms and content types. Format as a clear schedule.",
    }

    prompt = prompts.get(req.tool, f"Help with {req.tool} marketing for Lifeway Programs.")

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return {"content": message.content[0].text}
