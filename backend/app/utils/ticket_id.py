import re
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.ticket import Ticket


def generate_ticket_id(db: Session) -> str:
    """
    Generates a unique, concurrency-safe, human-readable ticket ID (e.g., TKT-001, TKT-002).
    Guarantees that when the database is empty (or after a purge), the next ticket ID starts strictly at TKT-001.
    """
    bind = db.get_bind()
    dialect_name = bind.dialect.name if bind else "sqlite"

    # 1. Fetch all existing ticket_ids to find current maximum numerical ID
    tickets = db.query(Ticket.ticket_id).all()
    max_num = 0
    for (t_id,) in tickets:
        match = re.match(r"^TKT-(\d+)$", t_id)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    # 2. If the database is completely empty, strictly reset and start at TKT-001
    if max_num == 0:
        if dialect_name == "postgresql":
            try:
                db.execute(text("CREATE SEQUENCE IF NOT EXISTS ticket_id_seq START 1;"))
                db.execute(text("SELECT setval('ticket_id_seq', 1, false);"))
                db.commit()
            except Exception:
                db.rollback()
        return "TKT-001"

    # 3. If tickets exist, calculate next sequential ID and synchronize PostgreSQL sequence
    if dialect_name == "postgresql":
        try:
            db.execute(text("CREATE SEQUENCE IF NOT EXISTS ticket_id_seq START 1;"))
            db.execute(text(f"SELECT setval('ticket_id_seq', {max_num}, true);"))
            val = db.execute(text("SELECT nextval('ticket_id_seq')")).scalar()
        except Exception:
            val = max_num + 1

        candidate_id = f"TKT-{val:03d}"
        while db.query(Ticket).filter(Ticket.ticket_id == candidate_id).first():
            val += 1
            candidate_id = f"TKT-{val:03d}"
        return candidate_id
    else:
        # SQLite / standard SQL fallback
        next_val = max_num + 1
        candidate_id = f"TKT-{next_val:03d}"
        while db.query(Ticket).filter(Ticket.ticket_id == candidate_id).first():
            next_val += 1
            candidate_id = f"TKT-{next_val:03d}"
        return candidate_id
