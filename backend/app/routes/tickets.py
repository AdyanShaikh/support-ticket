from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.ticket import (
    TicketCreate,
    TicketCreateResponse,
    TicketListResponse,
    TicketDetailResponse,
    TicketUpdateRequest,
    TicketUpdateResponse,
)
from app.services import ticket_service

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post(
    "",
    response_model=TicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new support ticket",
)
def create_ticket_endpoint(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a new support ticket with an auto-generated unique ID (e.g. TKT-001).
    """
    ticket = ticket_service.create_ticket(db=db, ticket_in=ticket_in)
    return ticket


@router.get(
    "",
    response_model=List[TicketListResponse],
    summary="List all tickets with optional status filtering and search",
)
def list_tickets_endpoint(
    status: Optional[str] = Query(None, description="Filter by status: Open, In Progress, Closed, or All"),
    search: Optional[str] = Query(None, description="Search across customer_name, ticket_id, email, subject, description"),
    db: Session = Depends(get_db)
):
    """
    Returns an array of tickets matching the query parameters.
    """
    tickets = ticket_service.list_tickets(db=db, status=status, search=search)
    return tickets


@router.get(
    "/{ticket_id}",
    response_model=TicketDetailResponse,
    summary="Get complete ticket details by ticket ID",
)
def get_ticket_endpoint(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns complete ticket details including associated notes.
    """
    ticket = ticket_service.get_ticket_by_ticket_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} does not exist."
        )
    return ticket


@router.put(
    "/{ticket_id}",
    response_model=TicketUpdateResponse,
    summary="Update ticket status and/or append internal note",
)
def update_ticket_endpoint(
    ticket_id: str,
    update_in: TicketUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates the ticket status and creates a new note record if note text is provided.
    """
    ticket = ticket_service.update_ticket_status_and_notes(
        db=db,
        ticket_id=ticket_id,
        update_in=update_in
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} does not exist."
        )
    return TicketUpdateResponse(
        success=True,
        updated_at=ticket.updated_at
    )
