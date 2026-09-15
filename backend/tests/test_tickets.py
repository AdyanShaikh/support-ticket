import pytest


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_ticket_success(client):
    payload = {
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "subject": "Unable to login",
        "description": "I cannot access my account."
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "ticket_id" in data
    assert data["ticket_id"] == "TKT-001"
    assert "created_at" in data


def test_unique_sequential_ticket_ids(client):
    # Create first ticket
    res1 = client.post("/api/tickets", json={
        "customer_name": "Alice Smith",
        "customer_email": "alice@example.com",
        "subject": "First Issue",
        "description": "First description"
    })
    assert res1.status_code == 201
    assert res1.json()["ticket_id"] == "TKT-001"

    # Create second ticket
    res2 = client.post("/api/tickets", json={
        "customer_name": "Bob Jones",
        "customer_email": "bob@example.com",
        "subject": "Second Issue",
        "description": "Second description"
    })
    assert res2.status_code == 201
    assert res2.json()["ticket_id"] == "TKT-002"

    # Create third ticket
    res3 = client.post("/api/tickets", json={
        "customer_name": "Charlie Brown",
        "customer_email": "charlie@example.com",
        "subject": "Third Issue",
        "description": "Third description"
    })
    assert res3.status_code == 201
    assert res3.json()["ticket_id"] == "TKT-003"


def test_list_tickets(client):
    # Insert tickets
    client.post("/api/tickets", json={
        "customer_name": "Sarah Connor",
        "customer_email": "sarah@example.com",
        "subject": "System Warning",
        "description": "Server temperature is high."
    })
    client.post("/api/tickets", json={
        "customer_name": "Kyle Reese",
        "customer_email": "kyle@example.com",
        "subject": "Network Glitch",
        "description": "Cannot connect to gateway."
    })

    res = client.get("/api/tickets")
    assert res.status_code == 200
    tickets = res.json()
    assert len(tickets) == 2
    
    # Verify contract: contains ticket_id, customer_name, subject, status, created_at
    item = tickets[0]
    assert "ticket_id" in item
    assert "customer_name" in item
    assert "subject" in item
    assert "status" in item
    assert "created_at" in item
    # Should not leak full description in dashboard listing
    assert "description" not in item


def test_search_tickets(client):
    client.post("/api/tickets", json={
        "customer_name": "John Refund",
        "customer_email": "refund@company.org",
        "subject": "Need invoice",
        "description": "Detailed billing question"
    })
    client.post("/api/tickets", json={
        "customer_name": "Alice Tech",
        "customer_email": "alice@company.org",
        "subject": "Database down",
        "description": "The postgres server crashed"
    })

    # Search by customer name
    r_name = client.get("/api/tickets?search=Refund")
    assert len(r_name.json()) == 1
    assert r_name.json()[0]["customer_name"] == "John Refund"

    # Search by email
    r_email = client.get("/api/tickets?search=alice@company")
    assert len(r_email.json()) == 1
    assert r_email.json()[0]["customer_name"] == "Alice Tech"

    # Search by description
    r_desc = client.get("/api/tickets?search=postgres")
    assert len(r_desc.json()) == 1
    assert r_desc.json()[0]["customer_name"] == "Alice Tech"

    # Search nonexistent
    r_none = client.get("/api/tickets?search=nonexistenttermxyz")
    assert len(r_none.json()) == 0


def test_filter_tickets_by_status(client):
    t1 = client.post("/api/tickets", json={
        "customer_name": "User 1",
        "customer_email": "u1@example.com",
        "subject": "Subject 1",
        "description": "Desc 1"
    }).json()["ticket_id"]

    t2 = client.post("/api/tickets", json={
        "customer_name": "User 2",
        "customer_email": "u2@example.com",
        "subject": "Subject 2",
        "description": "Desc 2"
    }).json()["ticket_id"]

    # Update t2 to 'Closed'
    client.put(f"/api/tickets/{t2}", json={"status": "Closed"})

    # Filter Open
    r_open = client.get("/api/tickets?status=Open")
    assert len(r_open.json()) == 1
    assert r_open.json()[0]["ticket_id"] == t1

    # Filter Closed
    r_closed = client.get("/api/tickets?status=Closed")
    assert len(r_closed.json()) == 1
    assert r_closed.json()[0]["ticket_id"] == t2

    # Filter All
    r_all = client.get("/api/tickets?status=All")
    assert len(r_all.json()) == 2


def test_get_ticket_detail_and_notes(client):
    create_res = client.post("/api/tickets", json={
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "subject": "Unable to login",
        "description": "I cannot access my account."
    })
    ticket_id = create_res.json()["ticket_id"]

    # Detail before notes
    detail_res = client.get(f"/api/tickets/{ticket_id}")
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["ticket_id"] == ticket_id
    assert data["customer_name"] == "John Doe"
    assert data["customer_email"] == "john@example.com"
    assert data["subject"] == "Unable to login"
    assert data["description"] == "I cannot access my account."
    assert data["status"] == "Open"
    assert data["notes"] == []

    # Update status and add a note
    update_res = client.put(f"/api/tickets/{ticket_id}", json={
        "status": "In Progress",
        "notes": "Customer contacted support and requested an update."
    })
    assert update_res.status_code == 200
    assert update_res.json()["success"] is True

    # Check detail after note
    detail_after = client.get(f"/api/tickets/{ticket_id}")
    assert detail_after.json()["status"] == "In Progress"
    notes = detail_after.json()["notes"]
    assert len(notes) == 1
    assert notes[0]["note_text"] == "Customer contacted support and requested an update."
    assert "created_at" in notes[0]


def test_invalid_ticket_id_not_found(client):
    res = client.get("/api/tickets/TKT-999")
    assert res.status_code == 404
    assert res.json() == {"detail": "Ticket TKT-999 does not exist."}

    put_res = client.put("/api/tickets/TKT-999", json={"status": "Closed"})
    assert put_res.status_code == 404
    assert put_res.json() == {"detail": "Ticket TKT-999 does not exist."}


def test_validation_errors(client):
    # Invalid email
    res1 = client.post("/api/tickets", json={
        "customer_name": "John",
        "customer_email": "invalid-email-address",
        "subject": "Sub",
        "description": "Desc"
    })
    assert res1.status_code == 422

    # Missing required field
    res2 = client.post("/api/tickets", json={
        "customer_name": "John",
        "customer_email": "john@example.com",
        "subject": "Sub"
    })
    assert res2.status_code == 422

    # Invalid status value
    create_res = client.post("/api/tickets", json={
        "customer_name": "John",
        "customer_email": "john@example.com",
        "subject": "Sub",
        "description": "Desc"
    })
    t_id = create_res.json()["ticket_id"]
    res3 = client.put(f"/api/tickets/{t_id}", json={"status": "InvalidStatus"})
    assert res3.status_code == 422


def test_ai_ticket_assistant_endpoint(client):
    # Create ticket
    create_res = client.post("/api/tickets", json={
        "customer_name": "Jane Watson",
        "customer_email": "jane@example.com",
        "subject": "Forgot password and locked out",
        "description": "I entered the wrong password and now my account is locked."
    })
    t_id = create_res.json()["ticket_id"]

    ai_res = client.post(f"/api/tickets/{t_id}/ai-analyze")
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert "summary" in ai_data
    assert "category" in ai_data
    assert "suggested_priority" in ai_data
    assert "suggested_response" in ai_data
    assert ai_data["category"] == "Authentication"
    assert "Jane" in ai_data["suggested_response"]


def test_combined_search_and_status_filtering(client):
    # Ticket 1: Open, John, login
    t1 = client.post("/api/tickets", json={
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "subject": "Unable to login",
        "description": "Account issue"
    }).json()["ticket_id"]

    # Ticket 2: Closed, John, refund
    t2 = client.post("/api/tickets", json={
        "customer_name": "John Smith",
        "customer_email": "smith@example.com",
        "subject": "Refund requested",
        "description": "Please refund me"
    }).json()["ticket_id"]
    client.put(f"/api/tickets/{t2}", json={"status": "Closed"})

    # Ticket 3: Open, Alice, refund
    t3 = client.post("/api/tickets", json={
        "customer_name": "Alice Wonderland",
        "customer_email": "alice@example.com",
        "subject": "Refund question",
        "description": "Question on returns"
    }).json()["ticket_id"]

    # Search john + status Open -> should only match t1
    res = client.get("/api/tickets?status=Open&search=john")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["ticket_id"] == t1

    # Search refund + status Closed -> should only match t2
    res_refund_closed = client.get("/api/tickets?status=Closed&search=refund")
    assert res_refund_closed.status_code == 200
    assert len(res_refund_closed.json()) == 1
    assert res_refund_closed.json()[0]["ticket_id"] == t2

