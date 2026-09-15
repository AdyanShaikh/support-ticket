# Support CRM System

> Full-Stack Customer Support Ticketing CRM System built with **Next.js 15**, **FastAPI**, **PostgreSQL / SQLAlchemy**, and an **AI Ticket Assistant** standout feature.

---

## 1. Overview

The **Support CRM System** is a production-grade, full-stack customer support management platform designed to streamline support ticket triage, customer issue tracking, status workflows, and internal team collaboration.

Evaluators can immediately:
1. **View Ticket Queue**: Real-time dashboard with KPI summary counters.
2. **Search Tickets**: Instant debounced search across all 5 fields (`customer_name`, `ticket_id`, `customer_email`, `subject`, `description`).
3. **Filter Tickets**: Filter by core statuses (`Open`, `In Progress`, `Closed`, and `All`).
4. **Create Tickets**: Submit support requests with auto-generated, human-readable IDs (`TKT-001`, `TKT-002`, ...).
5. **Inspect Ticket Details**: Dedicated view containing customer details, issue description, and full notes history.
6. **Update Status**: Update lifecycle status (`Open` → `In Progress` → `Closed`) with instant database persistence.
7. **Add Notes / Comments**: Append internal team comments associated with the ticket.
8. **AI Ticket Assistant (Standout Feature)**: On-demand AI triage providing issue summary, category classification, suggested priority, and a one-click copyable customer response draft.
9. **Persistence**: All state is backed by a relational database; refreshing preserves all tickets, updates, and notes.

---

## 2. Features

- **Automated Human-Readable Ticket IDs**: Concurrency-safe backend ID generation formatted as `TKT-001`, `TKT-002`, etc.
- **Dynamic Dashboard**: Responsive metrics cards, interactive search bar, and status filter tabs.
- **Case-Insensitive Multi-Field Search**: Searches across customer name, ticket ID, email, subject, and description.
- **Strict Status Lifecycle**: Strictly enforces the required statuses (`Open`, `In Progress`, `Closed`).
- **Detailed Ticket Inspection**: Dedicated route (`/tickets/[ticketId]`) showing full customer metadata, timestamps, and activity history.
- **Internal Collaboration Notes**: Real-time append of internal investigation notes with author tags and timestamps.
- **Standout Feature — AI Ticket Assistant**:
  - Automatically assesses the ticket content.
  - Returns issue summary, category, suggested priority, and a personalized draft response.
  - **Zero-Crash Resilience**: Decoupled from external API availability. If external LLM keys are absent or down, seamlessly falls back to a built-in heuristic triage engine without interrupting CRM functionality.
- **Accessibility & UX**: Semantic HTML, distinct accessible badges, responsive table and card layouts, loading skeletons, and empty states.

---

## 3. Architecture

```text
                     ┌─────────────────────────────────────────┐
                     │          Next.js 15 Frontend            │
                     │  (App Router, TypeScript, Tailwind CSS) │
                     └────────────────────┬────────────────────┘
                                          │
                                          │ REST API / JSON
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │            FastAPI Backend              │
                     │    (Pydantic v2, Python 3.12 / 3.14)    │
                     └────────────────────┬────────────────────┘
                                          │
                                          │ SQLAlchemy 2.0 ORM
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │           Relational Database           │
                     │       PostgreSQL (Production)           │
                     │     [tickets] 1 ────< * [notes]         │
                     └─────────────────────────────────────────┘
```

---

## 4. Tech Stack

- **Frontend**:
  - [Next.js 15](https://nextjs.org/) (App Router, Server Components & Client Hooks)
  - [React 19](https://react.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/) (Modern iconography)
- **Backend**:
  - [Python](https://www.python.org/) (FastAPI framework)
  - [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Relational ORM & connection pooling)
  - [Pydantic v2](https://docs.pydantic.dev/) (Strict request/response schema validation)
  - [Uvicorn](https://www.uvicorn.org/) (ASGI production server)
  - [Psycopg v3](https://www.psycopg.org/) (PostgreSQL database adapter)
  - [Pytest](https://docs.pytest.org/) (Comprehensive automated testing suite)
- **Database**:
  - **PostgreSQL** in production (Supabase / Neon / Railway)
  - SQLite support for fast, isolated automated test suites.

---

## 5. Database Schema

The database strictly adheres to the exact two-table requirement:

### `tickets` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Autoincrement | Synthetic primary key |
| `ticket_id` | String(32) | Unique, Indexed, Not Null | Formatted identifier (e.g. `TKT-001`) |
| `customer_name` | String(255) | Not Null | Customer's full name |
| `customer_email` | String(255) | Not Null | Validated email address |
| `subject` | String(255) | Not Null | Issue title/subject |
| `description` | Text | Not Null | Full issue description |
| `status` | String(50) | Not Null, CheckConstraint | Value in `('Open', 'In Progress', 'Closed')` |
| `created_at` | DateTime (UTC) | Not Null | Timestamp of ticket creation |
| `updated_at` | DateTime (UTC) | Not Null | Timestamp of last status/note update |

### `notes` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Autoincrement | Unique note identifier |
| `ticket_id` | String(32) | Foreign Key (`tickets.ticket_id`), On Delete CASCADE | Parent ticket association |
| `note_text` | Text | Not Null | Comment content |
| `created_at` | DateTime (UTC) | Not Null | Timestamp of note creation |

**Relationship**:
```text
tickets (1) ─────────── (Many) notes
```
*Foreign key constraint prevents orphaned notes; deleting or cascading ensures data integrity.*

---

## 6. REST API Documentation

### 1. Create Ticket
- **Endpoint**: `POST /api/tickets`
- **Request Body**:
  ```json
  {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "subject": "Unable to login",
    "description": "I cannot access my account."
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "ticket_id": "TKT-001",
    "created_at": "2026-09-15T12:30:00Z"
  }
  ```

### 2. List / Search / Filter Tickets
- **Endpoint**: `GET /api/tickets`
- **Query Parameters**:
  - `status` *(optional)*: `Open`, `In Progress`, `Closed`, or `All`
  - `search` *(optional)*: Case-insensitive query across customer name, ticket ID, email, subject, and description.
- **Example**: `GET /api/tickets?status=Open&search=john`
- **Response** (`200 OK`):
  ```json
  [
    {
      "ticket_id": "TKT-001",
      "customer_name": "John Doe",
      "subject": "Unable to login",
      "status": "Open",
      "created_at": "2026-09-15T12:30:00Z"
    }
  ]
  ```

### 3. Get Ticket Details
- **Endpoint**: `GET /api/tickets/{ticket_id}`
- **Example**: `GET /api/tickets/TKT-001`
- **Response** (`200 OK`):
  ```json
  {
    "ticket_id": "TKT-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "subject": "Unable to login",
    "description": "I cannot access my account.",
    "status": "Open",
    "notes": [
      {
        "id": 1,
        "note_text": "Customer contacted support.",
        "created_at": "2026-09-15T12:35:00Z"
      }
    ]
  }
  ```

### 4. Update Ticket Status & Add Note
- **Endpoint**: `PUT /api/tickets/{ticket_id}`
- **Request Body**:
  ```json
  {
    "status": "In Progress",
    "notes": "Investigating the issue."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "updated_at": "2026-09-15T12:40:00Z"
  }
  ```

### 5. Standout Feature: AI Ticket Assistant
- **Endpoint**: `POST /api/tickets/{ticket_id}/ai-analyze`
- **Response** (`200 OK`):
  ```json
  {
    "summary": "Customer cannot access their account.",
    "category": "Authentication",
    "suggested_priority": "High",
    "suggested_response": "Hi John, thank you for contacting support regarding \"Unable to login\"..."
  }
  ```

---

## 7. Local Setup Instructions

### Prerequisites
- Python 3.12+ (or 3.14)
- Node.js 18+ (Node 20 / 22 / 24)
- Git

### Clone Repository
```bash
git clone https://github.com/AdyanShaikh/support-ticket.git
cd support-ticket
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest -v tests/

# Start FastAPI server (runs on http://127.0.0.1:8000)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the Support CRM dashboard.

---

## 8. Environment Variables

Create `.env` in `backend/` and `.env.local` in `frontend/` (reference `.env.example`):

### Backend (`backend/.env`)
```bash
# Database URL (PostgreSQL in production, SQLite in local development)
DATABASE_URL=sqlite:///./support_crm.db

# CORS Allowed Origins (comma-separated list)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional AI API key (Gemini or OpenAI format).
# Leave blank to use heuristic fallback engine without external dependencies.
AI_API_KEY=

# Server Port
PORT=8000
```

### Frontend (`frontend/.env.local`)
```bash
# URL of the running FastAPI backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 9. Production Deployment Guide

### Database (Supabase / Neon PostgreSQL)
1. Create a free PostgreSQL project at [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
2. Copy the Connection URI (e.g. `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`).

### Backend (Railway / Render)
1. Connect the GitHub repository to Railway or Render.
2. Set root directory to `backend/`.
3. Set Build Command to `pip install -r requirements.txt`.
4. Set Start Command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `CORS_ORIGINS`: Your deployed frontend URL (e.g. `https://support-crm.vercel.app`).
   - `AI_API_KEY`: *(Optional)* Your Gemini/OpenAI API key.

### Frontend (Vercel)
1. Connect the repository to [Vercel](https://vercel.com/).
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://support-backend.up.railway.app`).
4. Deploy!

---

## 10. Standout Feature: AI Ticket Assistant

### What was added
An **AI Ticket Assistant** panel integrated into the ticket detail page (`/tickets/[ticketId]`).

### Why it is useful
Support agents in busy environments face high ticket volumes. Manually reading lengthy descriptions to extract the root issue, tag the correct department, assign priority, and type standard greeting responses creates bottlenecks.  
The assistant solves this with one click by providing:
1. **Executive Summary**: 1–2 sentence essence of the customer's issue.
2. **Category Classification**: Automatic categorization (`Authentication`, `Billing & Payments`, `Technical Issue`, `Order & Delivery`, `General Inquiry`).
3. **Suggested Priority**: Triage recommendation (`Low`, `Medium`, `High`).
4. **Draft Customer Response**: Professional, empathetic response ready to be copied into customer replies.

### Tradeoffs Considered
- **Reliability vs. Third-Party Dependency**: External AI APIs can experience rate limits, network timeouts, or invalid keys. The assistant is built with an **intelligent heuristic fallback engine**. If `AI_API_KEY` is missing or fails, the endpoint automatically returns an accurate heuristic triage rather than crashing with a 500 error or blocking core CRM operations.
- **Security**: Customer data is minimized, and API keys are stored strictly server-side, never exposed to the client.

---

## 11. Engineering Decisions & Challenges

### Concurrency-Safe Ticket IDs
- **Problem**: Naive `TKT-{count + 1}` causes collision bugs if tickets are deleted or created simultaneously by concurrent agents.
- **Solution**: Implemented sequence-backed generation. In PostgreSQL, a native sequence (`ticket_id_seq`) provides atomic increments. In SQLite/test modes, a regex-based max numerical suffix scan ensures monotonic, non-colliding increments.

### Relational Schema Normalization
- Adhered strictly to the assessment specification: exactly two tables (`tickets` and `notes`).
- Enforced database constraints:
  - Unique index on `ticket_id`
  - Foreign key constraint with `ON DELETE CASCADE` from `notes.ticket_id` to `tickets.ticket_id`
  - Check constraint on `status IN ('Open', 'In Progress', 'Closed')`.

### Responsive & Accessible UX
- Mobile-first approach: Large screens render a high-density table view with sortable visual indicators; mobile screens render stacked ticket cards.
- Status badges include both text, distinguishable colors, and semantic icons to ensure accessibility for color-impaired users.

---

## 12. Automated Testing Suite

The backend includes a comprehensive Pytest suite in `backend/tests/test_tickets.py` covering:
- Health check endpoints
- Ticket creation (`POST /api/tickets`)
- Sequential ticket ID generation (`TKT-001`, `TKT-002`, `TKT-003`)
- Dashboard ticket listing schema validation (ensuring descriptions are not over-fetched)
- Multi-field search across customer name, email, ticket ID, subject, and description
- Status filtering (`Open`, `In Progress`, `Closed`, `All`)
- Combined search + status filtering
- Ticket details with and without notes
- Status update and note persistence
- Input validation failures (invalid email, missing required fields, invalid status)
- 404 handling on nonexistent ticket IDs
- AI Ticket Assistant triage & fallback resilience

To execute tests:
```bash
cd backend
pytest -v tests/
```

---

## 13. Future Improvements

With additional time, future iterations would include:
1. **Email Ingestion Webhook**: Automatically turn incoming support emails into support tickets.
2. **SLA Breach Monitoring**: Real-time warning badges for tickets exceeding a 4-hour first-response SLA.
3. **Agent Assignment**: Ability to assign tickets to individual support team members.
4. **File & Screenshot Attachments**: Support for image uploads directly stored in S3/Cloud Storage.
