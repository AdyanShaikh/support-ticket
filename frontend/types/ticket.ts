export type TicketStatus = "Open" | "In Progress" | "Closed";

export interface TicketListItem {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
}

/**
 * Represents an individual message in a ticket's two-sided conversation (Customer or Agent reply).
 * Bound to the underlying database schema for API compatibility.
 */
export interface NoteItem {
  id: number;
  note_text: string;
  created_at: string;
}

export interface TicketDetail {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at?: string;
  updated_at?: string;
  /** Chronological conversation messages between customer and agent */
  notes: NoteItem[];
}

export interface TicketCreateInput {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
}

export interface TicketCreateResponse {
  ticket_id: string;
  created_at: string;
}

export interface TicketUpdateInput {
  status: TicketStatus;
  /** New reply message to append to the customer-agent conversation */
  notes?: string;
}

export interface TicketUpdateResponse {
  success: boolean;
  updated_at: string;
}

export interface AIAssistantResult {
  summary: string;
  category: string;
  suggested_priority: "Low" | "Medium" | "High" | string;
  suggested_response: string;
  source?: string;
}
