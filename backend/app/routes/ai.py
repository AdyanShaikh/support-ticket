from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import ticket_service, ai_service

router = APIRouter(prefix="/api/tickets", tags=["ai"])


@router.post(
    "/{ticket_id}/ai-analyze",
    summary="Analyze ticket using AI Ticket Assistant",
)
async def analyze_ticket_endpoint(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    """
    Standout Feature: Generates an AI triage assessment of the ticket:
    - Summary
    - Category
    - Suggested Priority
    - Suggested Customer Response
    
    Resilient: Gracefully falls back if external AI is unconfigured or unavailable.
    """
    ticket = ticket_service.get_ticket_by_ticket_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} does not exist."
        )

    result = await ai_service.analyze_ticket_content(
        subject=ticket.subject,
        description=ticket.description,
        customer_name=ticket.customer_name
    )
    return result
