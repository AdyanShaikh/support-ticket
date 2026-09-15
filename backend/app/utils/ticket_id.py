import re
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.ticket import Ticket


def generate_ticket_id(db: Session) -> str:
    """
    Generates a unique, concurrency-safe, human-readable ticket ID (e.g., TKT-001, TKT-002).
    In PostgreSQL, utilizes a dedicated sequence (ticket_id_seq) for zero collisions.
    In SQLite (used for local testing), calculates the maximum numerical suffix with safe fallback.
    """
    bind = db.get_bind()
    dialect_name = bind.dialect.name if bind else "sqlite"

    if dialect_name == "postgresql":
        # Initialize sequence if it doesn't exist
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS ticket_id_seq START 1;"))
        # Sync sequence with max ticket_id if sequence is at 1 and tickets exist
        val = db.execute(text("SELECT nextval('ticket_id_seq')")).scalar()
        
        # Verify no collision (in case existing tickets were inserted prior to sequence)
        existing = db.query(Ticket).filter(Ticket.ticket_id == f"TKT-{val:03d}").first()
        while existing:
            val = db.execute(text("SELECT nextval('ticket_id_seq')")).scalar()
            existing = db.query(Ticket).filter(Ticket.ticket_id == f"TKT-{val:03d}").first()
            
        return f"TKT-{val:03d}"
    else:
        # SQLite / standard SQL fallback
        max_num = 0
        # Fetch all ticket_ids to parse the numeric suffix reliably
        tickets = db.query(Ticket.ticket_id).all()
        for (t_id,) in tickets:
            match = re.match(r"^TKT-(\d+)$", t_id)
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num

        next_val = max_num + 1
        candidate_id = f"TKT-{next_val:03d}"
        
        # Double check collision
        while db.query(Ticket).filter(Ticket.ticket_id == candidate_id).first():
            next_val += 1
            candidate_id = f"TKT-{next_val:03d}"

        return candidate_id
