import datetime
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload
from app.models.ticket import Ticket
from app.models.note import Note
from app.schemas.ticket import TicketCreate, TicketUpdateRequest
from app.utils.ticket_id import generate_ticket_id


def create_ticket(db: Session, ticket_in: TicketCreate) -> Ticket:
    """
    Creates a new support ticket with an auto-generated unique ticket_id.
    """
    new_ticket_id = generate_ticket_id(db)
    now = datetime.datetime.now(datetime.timezone.utc)

    db_ticket = Ticket(
        ticket_id=new_ticket_id,
        customer_name=ticket_in.customer_name,
        customer_email=ticket_in.customer_email,
        subject=ticket_in.subject,
        description=ticket_in.description,
        status="Open",
        created_at=now,
        updated_at=now,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def list_tickets(
    db: Session,
    status: Optional[str] = None,
    search: Optional[str] = None
) -> List[Ticket]:
    """
    Retrieves tickets with optional status filtering and case-insensitive multi-field search.
    """
    query = db.query(Ticket)

    # Status filter
    if status and status.strip() and status.strip() != "All":
        query = query.filter(Ticket.status == status.strip())

    # Multi-field search across 5 fields
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.customer_name.ilike(term),
                Ticket.ticket_id.ilike(term),
                Ticket.customer_email.ilike(term),
                Ticket.subject.ilike(term),
                Ticket.description.ilike(term),
            )
        )

    # Order newest first
    return query.order_by(Ticket.created_at.desc()).all()


def get_ticket_by_ticket_id(db: Session, ticket_id: str) -> Optional[Ticket]:
    """
    Retrieves a single ticket by human-readable ticket_id along with its notes.
    Uses selectinload for optimal single-query performance.
    """
    return (
        db.query(Ticket)
        .options(selectinload(Ticket.notes))
        .filter(Ticket.ticket_id == ticket_id.strip())
        .first()
    )


def update_ticket_status_and_notes(
    db: Session,
    ticket_id: str,
    update_in: TicketUpdateRequest
) -> Optional[Ticket]:
    """
    Updates a ticket's status, updates timestamp, and appends a note if provided.
    """
    ticket = get_ticket_by_ticket_id(db, ticket_id)
    if not ticket:
        return None

    now = datetime.datetime.now(datetime.timezone.utc)
    ticket.status = update_in.status
    ticket.updated_at = now

    # If note content is provided, persist it
    if update_in.notes:
        note = Note(
            ticket_id=ticket.ticket_id,
            note_text=update_in.notes,
            created_at=now,
        )
        db.add(note)

    db.commit()
    db.refresh(ticket)
    return ticket
