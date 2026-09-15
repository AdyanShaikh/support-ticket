import {
  TicketListItem,
  TicketDetail,
  TicketCreateInput,
  TicketCreateResponse,
  TicketUpdateInput,
  TicketUpdateResponse,
  AIAssistantResult,
} from "@/types/ticket";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(", ");
        }
      }
    } catch {
      // JSON parse failed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status);
  }
  return response.json();
}

export async function fetchTickets(params?: {
  status?: string;
  search?: string;
}): Promise<TicketListItem[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "All") {
    query.append("status", params.status);
  }
  if (params?.search && params.search.trim()) {
    query.append("search", params.search.trim());
  }

  const queryString = query.toString();
  const url = `${API_BASE_URL}/api/tickets${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<TicketListItem[]>(res);
}

export async function fetchTicket(ticketId: string): Promise<TicketDetail> {
  const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<TicketDetail>(res);
}

export async function createTicket(
  data: TicketCreateInput
): Promise<TicketCreateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<TicketCreateResponse>(res);
}

export async function updateTicket(
  ticketId: string,
  data: TicketUpdateInput
): Promise<TicketUpdateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<TicketUpdateResponse>(res);
}

export async function analyzeTicketWithAI(
  ticketId: string
): Promise<AIAssistantResult> {
  const res = await fetch(
    `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}/ai-analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return handleResponse<AIAssistantResult>(res);
}
