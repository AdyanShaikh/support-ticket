# Support CRM System — Production Full-Stack Platform

> Production-grade, full-stack Customer Support CRM platform built with **Next.js 15 (App Router)**, **FastAPI**, **PostgreSQL / SQLAlchemy**, and a **Zero-Crash AI Ticket Assistant** powered by Google Gemini with heuristic fallback resilience.

---

## 1. Live Deployments

| Component | Production URL | Description |
| :--- | :--- | :--- |
| **Web Application** | [https://support-ticket-nine.vercel.app](https://support-ticket-nine.vercel.app) | Production Next.js 15 frontend deployed on Vercel |
| **REST API Engine** | [https://web-production-adbb2.up.railway.app](https://web-production-adbb2.up.railway.app) | Production FastAPI backend containerized on Railway |
| **Interactive API Docs** | [https://web-production-adbb2.up.railway.app/docs](https://web-production-adbb2.up.railway.app/docs) | Live OpenAPI / Swagger UI testbed |
| **Alternative API Docs** | [https://web-production-adbb2.up.railway.app/redoc](https://web-production-adbb2.up.railway.app/redoc) | Live ReDoc schema documentation |
| **Demo Video Walkthrough** | [https://youtu.be/ua-qTpfndhc](https://youtu.be/ua-qTpfndhc) | Comprehensive video demonstration & architecture walkthrough |

---

## 2. Executive Overview

The **Support CRM System** is an enterprise-oriented customer service management application designed to handle high-frequency support workflows. It bridges real-time customer request submissions with an agent investigation workspace featuring two-way chronological conversations, status lifecycle tracking, and instant AI-assisted triage.

### Core Capabilities for Interview Demonstration
1. **Instant 2-Button Role Switcher (`Agent` vs `Customer`)**: Seamlessly switch perspectives directly in the navigation bar without authentication friction, allowing interviewers to instantly test both workflows.
2. **2-Sided Chronological Conversation Thread**: Visual distinction between customer statements and internal agent notes, formatted as a unified chronological dialogue feed.
3. **Automated Sequential Ticket IDs**: Concurrency-safe ticket numbering (`TKT-001`, `TKT-002`, `TKT-003`, ...) powered by monotonic database sequencing.
4. **AI Ticket Assistant (Standout Feature)**: On-demand AI triage generating a 2-sentence summary, category classification, suggested priority, and a 1-click draft response inserter directly into the agent reply composer.
5. **Zero-Crash Heuristic Fallback Engine**: If external LLM APIs experience rate limits, latency spikes, or invalid keys, the backend automatically fails over to an internal rule-based heuristic triage engine without throwing a 500 error or interrupting CRM workflows.
6. **Optimized Performance Architecture**: In-memory SWR (Stale-While-Revalidate) client caching, 300ms debounced search, single-roundtrip database aggregations, and ORM `selectinload` optimization preventing N+1 query bottlenecks.
7. **Soothing Visual Design System**: Calm, glare-free dark slate / graphite and soft off-white themes engineered for extended 8+ hour support agent shifts without eye strain.

---

## 3. End-to-End System Architecture

```text
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|                                                                                       |
|   Next.js 15 App Router (React 19, TypeScript, Tailwind CSS)                          |
|   ├── RoleContext (Agent vs Customer State)                                           |
|   ├── SWR In-Memory TTL Cache (30s Freshness Window, Background Revalidation)          |
|   ├── Debounced Multi-Field Search & KPI Status Filters                                |
|   └── Soothing Glare-Free Color Palette & Responsive Breakpoints                      |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | HTTPS / JSON (CORS Enabled)
                                            v
+---------------------------------------------------------------------------------------+
|                                APPLICATION BACKEND                                    |
|                                                                                       |
|   FastAPI ASGI Server (Python 3.12 / 3.14, Uvicorn, Pydantic v2)                      |
|   ├── Middleware Stack (CORS Dynamic Regex, GZip Compression >= 1000b)                |
|   ├── Ticket Service (CRUD Operations, Status Transitions, Atomic ID Generation)      |
|   ├── AI Service Layer (Gemini 1.5/2.0 REST Integration + JSON Output Parsing)        |
|   └── Heuristic Triage Engine (Zero-Downtime Rule-Based Fallback)                     |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | SQLAlchemy 2.0 ORM / Connection Pool
                                            v
+---------------------------------------------------------------------------------------+
|                                    DATA PERSISTENCE                                   |
|                                                                                       |
|   Relational Database (PostgreSQL on Production / SQLite for Isolated Testing)        |
|   ├── [tickets] Table: Core metadata, check constraints, indexed lookup keys          |
|   ├── [notes] Table: Chronological replies & staff notes                              |
|   └── Foreign Key Relationship: tickets (1) ──< (N) notes [ON DELETE CASCADE]         |
+---------------------------------------------------------------------------------------+
```

---

## 4. Technology Stack & Technical Justification

### Frontend Architecture
- **Next.js 15 (App Router)**: Leverages React 19 server and client components for optimal bundle splitting, instant route transitions, and fast hydration.
- **TypeScript**: Strict type safety across all API request/response payloads, UI state interfaces, and context providers.
- **Tailwind CSS v4**: Modular utility-first design system with customized HSL-based color variables, custom scrollbars, and fluid responsive grids.
- **Lucide React**: Lightweight, consistent icon set providing immediate visual hierarchy across ticket statuses and priority indicators.

### Backend Architecture
- **FastAPI**: High-performance asynchronous Python web framework built on Starlette and Pydantic v2. Provides automatic OpenAPI 3.1 spec generation and native async execution.
- **SQLAlchemy 2.0**: Enterprise ORM with strict typing, connection pooling, and explicit relationship loading (`selectinload`) to eliminate N+1 query problems.
- **Pydantic v2**: Lightning-fast C-extension based data validation enforcing strict email validation, string trimming, and enumeration bounds.
- **Uvicorn**: Production ASGI web server running asynchronous event loops for maximum I/O throughput.
- **Pytest & Starlette TestClient**: Comprehensive automated test suite ensuring zero regressions across edge cases and database transitions.

### Persistence Layer
- **PostgreSQL (Production via Supabase / Railway)**: ACID-compliant relational storage with foreign key constraints, check constraints, and B-tree indexes.
- **SQLite (Development & Automated Testing)**: Lightweight, zero-config relational database enabling sub-second test runs in CI environments.

---

## 5. Database Schema & Data Integrity

The data layer strictly enforces a normalized 2-table schema with relational constraints:

```text
+----------------------------------------------------+
|                      tickets                       |
+----------------------------------------------------+
| id             | INT          | PK, Autoincrement  |
| ticket_id      | VARCHAR(32)  | UNIQUE, INDEXED    |
| customer_name  | VARCHAR(255) | NOT NULL           |
| customer_email | VARCHAR(255) | NOT NULL           |
| subject        | VARCHAR(255) | NOT NULL           |
| description    | TEXT         | NOT NULL           |
| status         | VARCHAR(50)  | NOT NULL, CHECK    |
| created_at     | TIMESTAMP    | NOT NULL, UTC      |
| updated_at     | TIMESTAMP    | NOT NULL, UTC      |
+----------------------------------------------------+
                          | 1
                          |
                          | N (ON DELETE CASCADE)
                          v
+----------------------------------------------------+
|                       notes                        |
+----------------------------------------------------+
| id             | INT          | PK, Autoincrement  |
| ticket_id      | VARCHAR(32)  | FK -> tickets      |
| note_text      | TEXT         | NOT NULL           |
| created_at     | TIMESTAMP    | NOT NULL, UTC      |
+----------------------------------------------------+
```

### Relational Constraints & Invariants
1. **Status Enum Check Constraint**: Enforced at the database engine level via `CheckConstraint("status IN ('Open', 'In Progress', 'Closed')", name="check_ticket_status")`.
2. **Referential Integrity & Cascade Deletes**: `notes.ticket_id` references `tickets.ticket_id` with `ondelete="CASCADE"`. SQLAlchemy relationship specifies `cascade="all, delete-orphan"`, guaranteeing no orphaned records exist.
3. **SQLite Foreign Key Enforcement**: Activated via SQLite event listener `PRAGMA foreign_keys=ON` on engine connection to mirror PostgreSQL referential behavior locally.

---

## 6. Complete REST API Specification

### 1. List / Search / Filter Tickets
- **Route**: `GET /api/tickets`
- **Query Parameters**:
  - `status` *(optional)*: `Open` | `In Progress` | `Closed` | `All`
  - `search` *(optional)*: Case-insensitive query matching `customer_name`, `ticket_id`, `customer_email`, `subject`, or `description`.
- **Response** (`200 OK`):
  ```json
  [
    {
      "ticket_id": "TKT-001",
      "customer_name": "Sarah Connor",
      "subject": "Subscription renewal failed",
      "status": "In Progress",
      "created_at": "2026-09-15T19:11:47Z"
    }
  ]
  ```

### 2. Create Ticket
- **Route**: `POST /api/tickets`
- **Request Body**:
  ```json
  {
    "customer_name": "Sarah Connor",
    "customer_email": "sarah@skynet-defense.com",
    "subject": "Subscription renewal failed",
    "description": "Payment was processed on my credit card but my account still indicates expired status."
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "ticket_id": "TKT-001",
    "created_at": "2026-09-15T19:11:47Z"
  }
  ```

### 3. Get Ticket Details
- **Route**: `GET /api/tickets/{ticket_id}`
- **Response** (`200 OK`):
  ```json
  {
    "ticket_id": "TKT-001",
    "customer_name": "Sarah Connor",
    "customer_email": "sarah@skynet-defense.com",
    "subject": "Subscription renewal failed",
    "description": "Payment was processed on my credit card but my account still indicates expired status.",
    "status": "In Progress",
    "created_at": "2026-09-15T19:11:47Z",
    "notes": [
      {
        "id": 1,
        "note_text": "[Agent]: Investigating the payment gateway logs with Stripe.",
        "created_at": "2026-09-15T19:15:22Z"
      }
    ]
  }
  ```

### 4. Update Status & Append Note
- **Route**: `PUT /api/tickets/{ticket_id}`
- **Request Body**:
  ```json
  {
    "status": "Closed",
    "notes": "Resolved. Invoice sync error corrected and subscription active."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "updated_at": "2026-09-15T19:30:00Z"
  }
  ```

### 5. AI Ticket Assistant Triage
- **Route**: `POST /api/tickets/{ticket_id}/ai-analyze`
- **Response** (`200 OK`):
  ```json
  {
    "summary": "Customer charged for subscription renewal but account shows expired status.",
    "category": "Billing & Payments",
    "suggested_priority": "High",
    "suggested_response": "Hi Sarah, thank you for reaching out. We apologize for the delay. We are currently checking the billing transaction with our payment provider to ensure your subscription is activated immediately."
  }
  ```

### 6. Delete Single Ticket
- **Route**: `DELETE /api/tickets/{ticket_id}`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Ticket TKT-001 deleted successfully."
  }
  ```

### 7. Purge All Tickets (Database Maintenance)
- **Route**: `DELETE /api/tickets/purge` or `DELETE /api/tickets`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "deleted_count": 5,
    "message": "Successfully purged 5 ticket(s)."
  }
  ```

---

## 7. Standout Feature: AI Ticket Assistant & Resilient Fallback

### The Engineering Problem
Customer support agents spend 30–40% of their handling time performing manual triage: parsing long customer narratives, tagging categories, assessing urgency, and typing repetitive standard greetings.

### The Solution
The **AI Ticket Assistant** provides one-click triage directly inside the ticket detail view:
1. **Executive Summary**: Synthesizes complex issues into a 1–2 sentence executive overview.
2. **Category Classification**: Classifies issues into `Billing & Payments`, `Authentication`, `Technical Issue`, `Order & Delivery`, or `General Inquiry`.
3. **Suggested Priority**: Triage recommendation (`High`, `Medium`, `Low`) based on business urgency keywords (e.g. security, downtime, payments).
4. **Contextual Draft Response**: Generates a polite, personalized message addressing the customer by name with appropriate resolution steps.
5. **1-Click Insertion**: Agents can click **"Insert into Reply"** to copy the AI draft into the note textarea for immediate editing and dispatch.

### Zero-Crash Resilient Fallback Architecture
External LLM APIs introduce real-world failure modes: network partitions, strict rate limits (HTTP 429), expired API quotas, or invalid keys. The Support CRM system implements a **fault-tolerant layered fallback**:

```text
                                [ POST /ai-analyze ]
                                          |
                                          v
                              +-----------------------+
                              | Check API Key & Model |
                              +-----------------------+
                                          |
                   Has Key?               |              No Key?
             +----------------------------+----------------------------+
             |                                                         |
             v                                                         v
  +----------------------+                                  +---------------------+
  | Query Gemini API     |                                  | Rule-Based          |
  | (Timeout: 10s)       |                                  | Heuristic Triage    |
  +----------------------+                                  | Engine              |
             |                                              +---------------------+
     Success | Failure / Timeout / Quota Exceeded                      |
             +----------------------------+                            |
             |                            |                            |
             v                            +----------------------------+
  +----------------------+                                             |
  | Parse Structured     |                                             |
  | JSON Output          |                                             |
  +----------------------+                                             |
             |                                                         |
             +----------------------------+----------------------------+
                                          |
                                          v
                            [ Return Valid Triage JSON ]
                            (Never Throws 500 Error)
```

- **Heuristic Engine Mechanics**: Evaluates lexical tokens across `subject` and `description` (e.g., `"refund"`, `"invoice"`, `"charge"` -> Billing; `"login"`, `"password"`, `"2fa"` -> Authentication; `"bug"`, `"error"`, `"crash"` -> Technical). Priority is calculated via severity scoring.

---

## 8. Frontend Engineering Highlights

### In-Memory SWR Client Cache
To eliminate redundant HTTP traffic and provide instantaneous page transitions, `frontend/lib/api.ts` implements an in-memory TTL cache:
- **30-Second Cache Window**: Navigation between the queue and ticket details serves cached data instantly without layout shift.
- **Automatic Invalidation on Mutation**: Creating a ticket, updating status, appending a note, or deleting tickets automatically purges stale entries.
- **Bypass Flag**: The manual **Refresh** button explicitly sends `bypassCache: true` to force network revalidation.

### Debounced Multi-Field Search
- The search bar queries across 5 distinct attributes (`customer_name`, `ticket_id`, `customer_email`, `subject`, `description`).
- Input is debounced by 300ms, preventing server flooding during keystrokes.

### Calm, Glare-Free Color Palette
Designed specifically for high-stress operational environments:
- **Dark Theme**: Rich charcoal-graphite background (`#111217`), elevated surfaces (`#181921`, `#1E2028`), muted graphite borders (`#282A36`), and soft off-white text (`#E2E4EB`).
- **Light Theme**: Soft pearl-warm gray background (`#F4F5F7`), clean white card containers (`#FFFFFF`), light border contours (`#E2E4E9`), and deep charcoal typography (`#1E2028`).
- **Zero Eye Strain**: Eliminates stark pure black (`#000000`) and blinding pure white contrasts.

---

## 9. Local Setup & Quickstart Guide

### Prerequisites
- **Python**: 3.12+ (or 3.14)
- **Node.js**: 18+ (20 or 22 LTS recommended)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/AdyanShaikh/support-ticket.git
cd support-ticket
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests (13 tests)
pytest -v tests/

# Launch development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*Backend runs locally at `http://127.0.0.1:8000` with Swagger docs at `/docs`.*

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend runs locally at `http://localhost:3000`.*

---

## 10. Environment Variables Configuration

### Backend (`backend/.env`)
```bash
# Relational database URL (PostgreSQL in production, SQLite locally)
DATABASE_URL=sqlite:///./support_crm.db

# Allowed CORS origins (comma-separated or regex pattern)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://support-ticket-nine.vercel.app

# Optional Gemini API Key (Leaves fallback engine active if blank)
AI_API_KEY=
GEMINI_API_KEY=

# Server Port
PORT=8000
```

### Frontend (`frontend/.env.local`)
```bash
# Backend REST API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 11. Automated Test Suite

The backend contains a 13-test Pytest suite located in `backend/tests/test_tickets.py`:

```bash
cd backend
pytest -v tests/
```

### Coverage Scope:
- `test_health_check`: Validates API liveness probe (`GET /health`).
- `test_create_ticket_success`: Verifies schema validation and 201 creation response.
- `test_unique_sequential_ticket_ids`: Asserts sequential numbering (`TKT-001`, `TKT-002`, `TKT-003`).
- `test_list_tickets`: Verifies lightweight summary payload (descriptions omitted in listing for bandwidth efficiency).
- `test_list_tickets_status_filter`: Validates status isolation (`Open`, `In Progress`, `Closed`).
- `test_search_tickets`: Tests case-insensitive matching across customer name, email, subject, description.
- `test_combined_search_and_status_filtering`: Validates compound SQL queries.
- `test_get_ticket_details`: Verifies full detail payload including nested notes array.
- `test_update_ticket_status_and_add_note`: Tests atomic status change and note creation.
- `test_invalid_email_validation`: Tests Pydantic rejection on malformed email addresses.
- `test_ticket_not_found`: Validates proper 404 HTTP exceptions.
- `test_delete_single_ticket`: Verifies single-record deletion and cascading note cleanup.
- `test_purge_all_tickets`: Verifies mass table truncation and reset.

---

## 12. Production Deployment Architecture

### Backend Deployment (Railway)
- **Containerization**: Root `Dockerfile` with Python 3.12-slim base image.
- **Dynamic Port Interceptor**: Custom uvicorn startup wrapper intercepting `$PORT` environment variables assigned dynamically by Railway.
- **Nixpacks / Railway Config**: `railway.json` defining deployment restarts on failure with automatic health checks.
- **Auto-Deployments**: Continuous deployment triggered on every push to branch `main`.

### Frontend Deployment (Vercel)
- **Root Directory**: `frontend/`
- **Build Command**: `next build`
- **Turbopack Optimization**: Sub-second bundle compilation and dynamic route prerendering.
- **Environment**: Configured with `NEXT_PUBLIC_API_URL=https://web-production-adbb2.up.railway.app`.

---

## 13. Technical Interview Questions & Architectural Defense

### Q1: Why did you choose FastAPI over Flask or Django?
**Answer**:  
FastAPI provides native asynchronous ASGI support, allowing concurrent I/O operations without thread pool exhaustion. Through Pydantic v2, it validates all incoming payloads at the C-extension level, preventing malformed data from ever reaching database transactions. Additionally, FastAPI automatically outputs OpenAPI 3.1 contracts, ensuring synchronized type definitions with the frontend TypeScript interfaces.

### Q2: How do you prevent race conditions when generating sequential ticket IDs (`TKT-001`)?
**Answer**:  
A naive implementation calculating `count + 1` fails under concurrency or when tickets are deleted. In this project:
1. In PostgreSQL, ticket generation utilizes an atomic database sequence (`ticket_id_seq`) or database-level lock.
2. In SQLite/fallback environments, generation performs a numerical regex extraction on the maximum existing ticket suffix (`MAX(SUBSTR(ticket_id, 5))`) within an isolated transaction, guaranteeing monotonic, collision-proof increments.

### Q3: How did you solve the N+1 query problem when fetching tickets and their notes?
**Answer**:  
When querying a ticket and its associated conversation notes, standard ORM relationships default to lazy loading, causing a secondary SQL query for every single ticket retrieved. We configured SQLAlchemy's `selectinload(Ticket.notes)` inside `ticket_service.py`. This executes an optimized two-query batch retrieval (`SELECT ... FROM tickets` followed by `SELECT ... FROM notes WHERE ticket_id IN (...)`), reducing database roundtrips to an absolute constant O(1).

### Q4: How is LLM downtime or quota exhaustion handled?
**Answer**:  
External AI dependencies are treated as non-critical enhancements. The AI service layer wraps external requests in a 10-second timeout. If the API key is missing, network calls fail, or HTTP 429 quota limits are hit, the system automatically falls back to an internal rule-based heuristic triage engine. The API consistently returns an HTTP 200 with structured categorization, ensuring support agents are never blocked by third-party outages.

### Q5: How would you scale this system to 100,000 tickets per day?
**Answer**:  
1. **Read Replicas & Connection Pooling**: Implement PgBouncer for PostgreSQL connection pooling and route read queries (`GET /api/tickets`) to read replicas.
2. **Search Indexing**: Transition multi-field search from `ILIKE` queries to PostgreSQL Full-Text Search with GIN indexes (`tsvector`), or offload to Elasticsearch/OpenSearch.
3. **Asynchronous Background Workers**: Decouple AI triage from the synchronous request-response cycle by enqueueing tasks to Celery or Redis RQ and updating the frontend via WebSockets or Server-Sent Events (SSE).
4. **Partitioning**: Partition the `tickets` and `notes` tables by `created_at` (e.g. monthly partitions) to keep active query indexes warm in RAM.

---

## 14. License & Author

- **Author**: Adyan Shaikh
- **Repository**: [https://github.com/AdyanShaikh/support-ticket](https://github.com/AdyanShaikh/support-ticket)
- **License**: MIT
