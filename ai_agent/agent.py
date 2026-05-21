"""
Lifeway Programs AI Marketing Agent
Powered by Claude. Generates social media, email, SEO, lead follow-up, and Google Ads content.
"""
import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

LIFEWAY_CONTEXT = """
Lifeway Programs (lifewayprograms.org) is a faith-based nonprofit community health organization
serving underserved communities. Services include:
- Mental Health Support (therapy, counseling, psychiatric care)
- Medical Support (primary care, wellness, IV therapy)
- Social Services (case management, housing, food assistance, resource support)
- Spiritual Support (prayer, faith-based counseling)
- Employment Support (job placement, career coaching)
- Food Support (food distribution, nutrition programs)
- Wellness Support (holistic health)

Values: compassion, community, faith, dignity, accessibility.
Tone: warm, hopeful, inclusive, faith-forward but welcoming to all.
Location: South Florida. Serves primarily Hispanic/Latino and underserved communities.
Languages: English and Spanish.
"""

SYSTEM_PROMPT = f"""You are a marketing specialist for Lifeway Programs, a faith-based nonprofit.

{LIFEWAY_CONTEXT}

Always write content that is:
- Warm, compassionate, and hopeful
- Inclusive and welcoming to all backgrounds
- Clear about available services
- Compliant with HIPAA (never reference specific clients or cases)
- Consistent with Lifeway's faith-forward but non-exclusionary brand voice
"""


def generate(prompt: str, max_tokens: int = 1024) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def social_post(platform: str, topic: str, service: str = None, include_cta: bool = True) -> dict:
    """Generate a social media post."""
    limits = {"facebook": 500, "instagram": 300, "twitter": 280, "linkedin": 600}
    limit = limits.get(platform.lower(), 300)

    prompt = f"""Write a {platform} post about: {topic}
{"Service focus: " + service if service else ""}
Character limit: ~{limit} characters.
{"Include a clear call-to-action." if include_cta else ""}
Include 3-5 relevant hashtags at the end.
Format: just the post text, ready to publish."""

    return {
        "platform": platform,
        "topic": topic,
        "content": generate(prompt, 512),
    }


def email_campaign(campaign_type: str, audience: str, subject_hint: str = None) -> dict:
    """Draft a full email campaign."""
    prompt = f"""Write a complete marketing email for Lifeway Programs.
Campaign type: {campaign_type}
Target audience: {audience}
{"Subject hint: " + subject_hint if subject_hint else ""}

Include:
1. Subject line (compelling, <50 chars)
2. Preview text (<90 chars)
3. Email body (warm greeting, main message, 2-3 key points, CTA button text)
4. Sign-off

Format clearly with labels for each section."""

    return {
        "campaign_type": campaign_type,
        "audience": audience,
        "content": generate(prompt, 1024),
    }


def seo_blog_post(topic: str, target_keywords: list = None, word_count: int = 600) -> dict:
    """Generate an SEO-optimized blog post."""
    keywords_str = ", ".join(target_keywords) if target_keywords else "community health, mental health support, nonprofit services"

    prompt = f"""Write an SEO-optimized blog post for Lifeway Programs.
Topic: {topic}
Target keywords: {keywords_str}
Target word count: ~{word_count} words

Include:
- SEO title (60 chars max)
- Meta description (155 chars max)
- H1 heading
- 3-4 H2 sections with body content
- Natural keyword integration
- Conclusion with CTA to contact Lifeway Programs

Format with clear section labels."""

    return {
        "topic": topic,
        "keywords": target_keywords,
        "content": generate(prompt, 2048),
    }


def lead_followup(inquiry_type: str, details: str = None, language: str = "english") -> dict:
    """Draft a lead follow-up response to an inquiry."""
    lang_note = "Write in Spanish." if language.lower() == "spanish" else "Write in English."

    prompt = f"""Draft a follow-up message to someone who inquired about Lifeway Programs services.
Inquiry type: {inquiry_type}
{"Additional details: " + details if details else ""}
{lang_note}

The message should:
- Be warm and welcoming (not clinical or corporate)
- Acknowledge their inquiry specifically
- Briefly describe relevant services
- Provide clear next steps (schedule appointment, call, visit website)
- Feel personal, not like a template
- Be 150-250 words

Format: just the message, ready to send."""

    return {
        "inquiry_type": inquiry_type,
        "language": language,
        "content": generate(prompt, 512),
    }


def google_ads_campaign(service: str, goal: str = "appointments") -> dict:
    """Generate a complete Google Ads campaign for a service."""
    prompt = f"""Create a Google Ads campaign for Lifeway Programs.
Service: {service}
Campaign goal: {goal}

Provide:
1. Campaign name
2. 5 headlines (30 chars max each) — mark the strongest 3
3. 3 descriptions (90 chars max each)
4. 10 keywords (mix of broad, phrase, exact match — label each)
5. 3 negative keywords
6. Recommended bid strategy
7. Suggested audience targeting

Format clearly with labels and character counts."""

    return {
        "service": service,
        "goal": goal,
        "content": generate(prompt, 1024),
    }


def content_calendar(month: str, services_focus: list = None) -> dict:
    """Generate a monthly social media content calendar."""
    services = ", ".join(services_focus) if services_focus else "all services"

    prompt = f"""Create a social media content calendar for Lifeway Programs for {month}.
Services to highlight: {services}

Create a 4-week calendar with:
- 3 posts per week (Monday, Wednesday, Friday)
- Mix of platforms (Facebook, Instagram, LinkedIn)
- Variety: educational, testimonial-style, service spotlight, community, faith/inspiration
- Include post topic, platform, and content type for each

Format as a clear weekly table or list."""

    return {
        "month": month,
        "services": services_focus,
        "content": generate(prompt, 2048),
    }


if __name__ == "__main__":
    import sys
    print("Lifeway Programs AI Marketing Agent")
    print("====================================")

    if len(sys.argv) < 2:
        print("\nUsage examples:")
        print("  python agent.py social facebook 'mental health awareness'")
        print("  python agent.py email 'donation appeal' donors")
        print("  python agent.py blog 'community mental health resources'")
        print("  python agent.py lead 'mental health services'")
        print("  python agent.py ads 'mental health therapy'")
        print("  python agent.py calendar 'June 2026'")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "social" and len(sys.argv) >= 4:
        result = social_post(sys.argv[2], sys.argv[3])
        print(f"\n[{result['platform'].upper()} POST]\n{result['content']}")

    elif cmd == "email" and len(sys.argv) >= 4:
        result = email_campaign(sys.argv[2], sys.argv[3])
        print(f"\n[EMAIL CAMPAIGN: {result['campaign_type']}]\n{result['content']}")

    elif cmd == "blog" and len(sys.argv) >= 3:
        result = seo_blog_post(sys.argv[2])
        print(f"\n[BLOG POST]\n{result['content']}")

    elif cmd == "lead" and len(sys.argv) >= 3:
        result = lead_followup(sys.argv[2])
        print(f"\n[LEAD FOLLOW-UP]\n{result['content']}")

    elif cmd == "ads" and len(sys.argv) >= 3:
        result = google_ads_campaign(sys.argv[2])
        print(f"\n[GOOGLE ADS CAMPAIGN]\n{result['content']}")

    elif cmd == "calendar" and len(sys.argv) >= 3:
        result = content_calendar(sys.argv[2])
        print(f"\n[CONTENT CALENDAR: {result['month']}]\n{result['content']}")

    else:
        print("Unknown command. Run without args to see usage.")
