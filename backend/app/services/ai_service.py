import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


def format_conversation_history(description: str, customer_name: str, notes: Optional[List[Any]] = None) -> str:
    """
    Formats the complete chronological conversation thread (initial issue + customer/agent replies)
    for multi-turn conversational AI reasoning.
    """
    convo_lines = [f"Customer ({customer_name}) [Initial Issue]:\n{description.strip()}"]
    if notes:
        for n in notes:
            text = n.note_text if hasattr(n, "note_text") else (n.get("note_text") if isinstance(n, dict) else str(n))
            text = text.strip()
            if text.startswith("[Customer]:"):
                convo_lines.append(f"Customer ({customer_name}):\n{text[11:].strip()}")
            elif text.startswith("[Customer]"):
                convo_lines.append(f"Customer ({customer_name}):\n{text[10:].strip()}")
            elif text.startswith("[Agent]:"):
                convo_lines.append(f"Support Agent:\n{text[8:].strip()}")
            elif text.startswith("[Agent]"):
                convo_lines.append(f"Support Agent:\n{text[7:].strip()}")
            else:
                convo_lines.append(f"Agent Message:\n{text}")
    return "\n\n---\n\n".join(convo_lines)


def generate_fallback_analysis(
    subject: str,
    description: str,
    customer_name: str,
    notes: Optional[List[Any]] = None,
    status: Optional[str] = None,
) -> Dict[str, str]:
    """
    Intelligent heuristic triage analysis when external AI is unconfigured or unavailable.
    Provides category, priority, concise summary, and personalized draft response.
    """
    # Combine subject, description and all conversation messages for keyword scanning
    combined_notes = " ".join(
        [n.note_text if hasattr(n, "note_text") else (n.get("note_text", "") if isinstance(n, dict) else str(n)) for n in (notes or [])]
    )
    content = f"{subject} {description} {combined_notes}".lower()

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
    elif any(k in content for k in ["error", "cannot", "failed", "bug", "refund", "broken", "locked"]):
        priority = "Medium"
    else:
        priority = "Low"

    # Generate Concise Summary
    desc_clean = description.strip().replace("\n", " ")
    if len(desc_clean) > 90:
        desc_summary = desc_clean[:87] + "..."
    else:
        desc_summary = desc_clean

    num_replies = len(notes) if notes else 0
    if num_replies > 0:
        summary = f"Customer reports '{subject}' ({num_replies} follow-up messages in conversation thread)."
    else:
        summary = f"Customer reports: '{subject}' - {desc_summary}"

    # Generate Personalized Suggested Response
    first_name = customer_name.strip().split()[0] if customer_name.strip() else "Customer"
    if num_replies > 0:
        suggested_response = (
            f"Hi {first_name},\n\n"
            f"Thank you for the update. Our support engineers are actively reviewing your latest message regarding \"{subject}\". "
            f"We are working on resolving the remaining steps and will follow up with you as soon as possible.\n\n"
            f"Best regards,\nCustomer Support Team"
        )
    else:
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
        "source": "heuristic_fallback" if not (settings.GEMINI_API_KEY or settings.AI_API_KEY) else "service_fallback"
    }


async def analyze_ticket_content(
    subject: str,
    description: str,
    customer_name: str,
    notes: Optional[List[Any]] = None,
    status: Optional[str] = None
) -> Dict[str, Any]:
    """
    Analyzes full ticket content & complete conversation thread using Google Gemini
    to generate highly contextual summary, category, priority, and conversational draft response.
    """
    gemini_key = settings.GEMINI_API_KEY or settings.AI_API_KEY
    if not gemini_key:
        return generate_fallback_analysis(subject, description, customer_name, notes=notes, status=status)

    convo_text = format_conversation_history(description, customer_name, notes)

    prompt = (
        f"You are a professional customer support triage AI assistant working for Tech Support.\n"
        f"Analyze this support ticket and the full conversation history to date:\n\n"
        f"Customer Name: {customer_name}\n"
        f"Ticket Subject: {subject}\n"
        f"Current Ticket Status: {status or 'In Progress'}\n\n"
        f"=== CONVERSATION HISTORY (Chronological) ===\n"
        f"{convo_text}\n"
        f"=== END CONVERSATION HISTORY ===\n\n"
        f"INSTRUCTIONS:\n"
        f"1. Consider the ENTIRE conversation progression, including any previous replies, steps already attempted, and new information provided in the thread.\n"
        f"2. Formulate a personalized, empathetic, and highly contextual next reply for the Support Agent to send to {customer_name}.\n"
        f"   - If this is mid-conversation with follow-up messages from the customer, directly address their latest questions or issues without repeating initial canned greetings.\n"
        f"   - If this is a new ticket without replies yet, provide a warm, professional initial triage response.\n"
        f"3. Return ONLY a valid JSON object with these 4 keys:\n"
        f"- summary: 1-2 sentence executive summary of current issue state based on the whole conversation\n"
        f"- category: One of 'Authentication', 'Billing & Payments', 'Technical Issue', 'Order & Delivery', 'General Inquiry'\n"
        f"- suggested_priority: One of 'Low', 'Medium', 'High'\n"
        f"- suggested_response: Professional draft response answering the customer's latest question directly."
    )

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. Google Gemini API (gemini-2.5-flash with fallbacks)
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
        return generate_fallback_analysis(subject, description, customer_name, notes=notes, status=status)
    except Exception as e:
        logger.warning(f"External AI triage failed: {e}. Using resilient fallback triage.")
        return generate_fallback_analysis(subject, description, customer_name, notes=notes, status=status)
