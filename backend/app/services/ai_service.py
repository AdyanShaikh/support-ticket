import json
import logging
from typing import Dict, Any
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


def generate_fallback_analysis(subject: str, description: str, customer_name: str) -> Dict[str, str]:
    """
    Intelligent heuristic triage analysis when external AI is unconfigured or unavailable.
    Provides category, priority, concise summary, and personalized draft response.
    """
    content = f"{subject} {description}".lower()

    # Determine Category
    if any(k in content for k in ["login", "password", "sign in", "auth", "account", "access", "lock", "credential"]):
        category = "Authentication"
    elif any(k in content for k in ["refund", "charge", "payment", "invoice", "billing", "credit card", "price", "subscription"]):
        category = "Billing & Payments"
    elif any(k in content for k in ["bug", "crash", "error", "broken", "500", "404", "failed", "exception"]):
        category = "Technical Issue"
    elif any(k in content for k in ["shipping", "order", "delivery", "tracking", "package", "warehouse"]):
        category = "Order & Delivery"
    else:
        category = "General Inquiry"

    # Determine Suggested Priority
    if any(k in content for k in ["urgent", "emergency", "asap", "down", "critical", "blocked", "immediately"]):
        priority = "High"
    elif any(k in content for k in ["error", "cannot", "failed", "bug", "refund", "broken"]):
        priority = "Medium"
    else:
        priority = "Low"

    # Generate Concise Summary
    desc_clean = description.strip().replace("\n", " ")
    if len(desc_clean) > 90:
        desc_summary = desc_clean[:87] + "..."
    else:
        desc_summary = desc_clean
    summary = f"Customer reports: '{subject}' - {desc_summary}"

    # Generate Personalized Suggested Response
    first_name = customer_name.strip().split()[0] if customer_name.strip() else "Customer"
    suggested_response = (
        f"Hi {first_name},\n\n"
        f"Thank you for contacting support regarding \"{subject}\". "
        f"Our team has received your ticket and is currently investigating the matter. "
        f"We will follow up with you shortly with next steps or a resolution.\n\n"
        f"Best regards,\nCustomer Support Team"
    )

    return {
        "summary": summary,
        "category": category,
        "suggested_priority": priority,
        "suggested_response": suggested_response,
        "source": "heuristic_fallback" if not settings.AI_API_KEY else "service_fallback"
    }


async def analyze_ticket_content(subject: str, description: str, customer_name: str) -> Dict[str, Any]:
    """
    Analyzes ticket content to generate summary, category, priority, and draft response.
    Uses Google Gemini models with fallback resilience.
    """
    gemini_key = settings.GEMINI_API_KEY or settings.AI_API_KEY
    if not gemini_key:
        return generate_fallback_analysis(subject, description, customer_name)

    prompt = (
        f"You are a professional customer support triage AI assistant. Analyze this ticket:\n"
        f"Customer Name: {customer_name}\n"
        f"Subject: {subject}\n"
        f"Description: {description}\n\n"
        f"Return ONLY a valid JSON object with these 4 keys:\n"
        f"- summary: 1-2 sentence executive summary of the issue\n"
        f"- category: One of 'Authentication', 'Billing & Payments', 'Technical Issue', 'Order & Delivery', 'General Inquiry'\n"
        f"- suggested_priority: One of 'Low', 'Medium', 'High'\n"
        f"- suggested_response: Professional, empathetic draft response to the customer addressing their specific issue."
    )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. Google Gemini API
            gemini_models = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-flash-latest"]
            for model in gemini_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                try:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(raw_text)
                        parsed["source"] = "gemini_ai"
                        return parsed
                    else:
                        logger.info(f"Gemini model {model} returned HTTP {res.status_code}: {res.text[:120]}")
                except Exception as model_err:
                    logger.info(f"Gemini model {model} request failed: {model_err}")
                    continue

            # 2. Fallback: OpenAI compatible endpoint if key is sk-...
            if gemini_key.startswith("sk-"):
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {gemini_key}"}
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    parsed = json.loads(data["choices"][0]["message"]["content"])
                    parsed["source"] = "openai_ai"
                    return parsed

        # If external API calls failed or unconfigured, fallback cleanly
        return generate_fallback_analysis(subject, description, customer_name)
    except Exception as e:
        logger.warning(f"External AI triage failed: {e}. Using resilient fallback triage.")
        return generate_fallback_analysis(subject, description, customer_name)
