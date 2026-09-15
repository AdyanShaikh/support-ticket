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

// In-memory SWR (Stale-While-Revalidate) Cache
const listCache = new Map<string, { data: TicketListItem[]; timestamp: number }>();
const detailCache = new Map<string, { data: TicketDetail; timestamp: number }>();
const CACHE_TTL_MS = 30000; // 30 seconds

export function invalidateCache() {
  listCache.clear();
  detailCache.clear();
}

export function getCachedTicket(ticketId: string): TicketDetail | undefined {
  const cached = detailCache.get(ticketId);
  return cached?.data;
}

export async function fetchTickets(
  params?: {
    status?: string;
    search?: string;
  },
  options?: { bypassCache?: boolean }
): Promise<TicketListItem[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "All") {
    query.append("status", params.status);
  }
  if (params?.search && params.search.trim()) {
    query.append("search", params.search.trim());
  }

  const queryString = query.toString();
  const cacheKey = queryString || "ALL";
  const url = `${API_BASE_URL}/api/tickets${queryString ? `?${queryString}` : ""}`;

  // Check cache for instant return
  const cached = listCache.get(cacheKey);
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

  if (isFresh && !options?.bypassCache) {
    // Return cached immediately, trigger background refresh if near TTL
    return cached.data;
  }

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await handleResponse<TicketListItem[]>(res);
  listCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export async function fetchTicket(
  ticketId: string,
  options?: { bypassCache?: boolean }
): Promise<TicketDetail> {
  const cached = detailCache.get(ticketId);
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

  if (isFresh && !options?.bypassCache) {
    return cached.data;
  }

  const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await handleResponse<TicketDetail>(res);
  detailCache.set(ticketId, { data, timestamp: Date.now() });
  return data;
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
  const result = await handleResponse<TicketCreateResponse>(res);
  invalidateCache();
  return result;
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
  const result = await handleResponse<TicketUpdateResponse>(res);
  // Clear cache for this ticket and lists so next reads are fresh
  detailCache.delete(ticketId);
  listCache.clear();
  return result;
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
