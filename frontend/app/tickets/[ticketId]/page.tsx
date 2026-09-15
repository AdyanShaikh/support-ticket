"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import Link from "next/link";
import { TicketDetail, TicketStatus, NoteItem } from "@/types/ticket";
import { fetchTicket, updateTicket } from "@/lib/api";
import StatusBadge from "@/components/tickets/StatusBadge";
import NotesTimeline from "@/components/tickets/NotesTimeline";
import AIAssistantCard from "@/components/tickets/AIAssistantCard";
import { formatDate } from "@/lib/utils";
import { useRole } from "@/context/RoleContext";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Calendar,
  RefreshCw,
  Send,
  Headphones,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ArrowRightLeft,
} from "lucide-react";

interface TicketDetailPageProps {
  params: Promise<{ ticketId: string }>;
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.ticketId;

  const { setRole, isAgent, isCustomer } = useRole();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update & Reply Form State
  const [status, setStatus] = useState<TicketStatus>("Open");
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const data = await fetchTicket(ticketId);
        setTicket(data);
        setStatus(data.status);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load ticket details.";
        if (isInitial) {
          setError(msg);
        }
      } finally {
        if (isInitial) {
          setInitialLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [ticketId]
  );

  useEffect(() => {
    loadTicket(true);
  }, [loadTicket]);

  // Smooth scroll to latest message when notes change
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = noteText.trim();

    if (!trimmedText && isCustomer) {
      setUpdateError("Please type a message before sending your reply.");
      return;
    }

    if (!trimmedText && status === ticket?.status) {
      return;
    }

    setUpdating(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    let formattedNote: string | undefined = undefined;
    if (trimmedText) {
      if (isCustomer) {
        formattedNote = `[Customer]: ${trimmedText}`;
      } else {
        formattedNote = `[Agent]: ${trimmedText}`;
      }
    }

    // If customer replies to a closed ticket, reopen it to In Progress
    const targetStatus: TicketStatus =
      isCustomer && ticket?.status === "Closed" && trimmedText
        ? "In Progress"
        : isCustomer
        ? ticket?.status || "Open"
        : status;

    // OPTIMISTIC SEAMLESS UPDATE:
    // Append the message immediately to the UI with zero flicker and zero page reload
    if (formattedNote && ticket) {
      const optimisticNote: NoteItem = {
        id: Date.now(),
        note_text: formattedNote,
        created_at: new Date().toISOString(),
      };
      setTicket({
        ...ticket,
        status: targetStatus,
        notes: [...ticket.notes, optimisticNote],
      });
      scrollToBottom();
    } else if (ticket) {
      setTicket({
        ...ticket,
        status: targetStatus,
      });
    }

    // Reset textarea immediately so the user can continue typing seamlessly
    setNoteText("");

    try {
      await updateTicket(ticketId, {
        status: targetStatus,
        notes: formattedNote,
      });

      setUpdateSuccess(true);
      // Silently sync database state in background WITHOUT unmounting or reloading the page
      await loadTicket(false);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update ticket.";
      setUpdateError(msg);
      // Re-sync on failure
      await loadTicket(false);
    } finally {
      setUpdating(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center space-y-3 text-zinc-500 dark:text-[#8E93A6]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-[#F0F2F5]" />
        <p className="text-xs font-mono">Loading conversation for {ticketId}...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-black dark:text-[#8E93A6] dark:hover:text-[#F0F2F5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="p-8 rounded-2xl bg-white dark:bg-[#1E2028] border border-zinc-200 dark:border-[#2A2C38] text-center space-y-3 shadow-xs">
          <AlertCircle className="w-10 h-10 mx-auto text-zinc-900 dark:text-[#F0F2F5]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-[#F0F2F5]">Ticket Not Found</h2>
          <p className="text-xs font-mono text-zinc-500 dark:text-[#8E93A6] max-w-md mx-auto">
            {error || `Ticket ${ticketId} could not be located in the system.`}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white dark:text-[#14151A] bg-zinc-900 dark:bg-[#EAECEF] hover:bg-zinc-800 dark:hover:bg-white rounded-xl shadow-xs"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Bar Navigation & Role Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-black dark:text-[#8E93A6] dark:hover:text-[#F0F2F5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Persona Banner */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-zinc-100 dark:bg-[#1E2028] text-zinc-900 dark:text-[#F0F2F5] border border-zinc-200 dark:border-[#2A2C38]">
            {isCustomer ? (
              <>
                <User className="w-3.5 h-3.5 text-zinc-500 dark:text-[#6C7082]" />
                <span>Viewing as Customer: {ticket.customer_name}</span>
              </>
            ) : (
              <>
                <Headphones className="w-3.5 h-3.5 text-[#7EA8F8]" />
                <span>Viewing as Support Agent</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setRole(isCustomer ? "agent" : "customer")}
            className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-zinc-500 hover:text-black dark:text-[#8E93A6] dark:hover:text-[#F0F2F5] px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-[#2A2C38] hover:bg-zinc-100 dark:hover:bg-[#1E2028] transition-colors"
            title="Toggle role view"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Switch to {isCustomer ? "Agent" : "Customer"}</span>
          </button>

          <button
            type="button"
            onClick={() => loadTicket(false)}
            disabled={refreshing}
            className="p-1.5 text-zinc-500 hover:text-black dark:text-[#8E93A6] dark:hover:text-[#F0F2F5] hover:bg-zinc-100 dark:hover:bg-[#1E2028] rounded-lg transition-colors border border-zinc-200 dark:border-[#2A2C38] text-xs flex items-center gap-1 disabled:opacity-50"
            title="Refresh ticket messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-zinc-900 dark:text-[#F0F2F5]" : ""}`} />
            <span className="hidden sm:inline font-mono">Sync</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1E2028] p-6 rounded-2xl border border-zinc-200 dark:border-[#2A2C38] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-bold text-zinc-950 dark:text-[#F0F2F5] bg-zinc-100 dark:bg-[#181920] px-3 py-1 rounded-xl border border-zinc-200 dark:border-[#2A2C38]">
              {ticket.ticket_id}
            </span>
            <StatusBadge status={ticket.status} size="md" />
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 dark:text-[#8E93A6]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-[#6C7082]" />
              <span>Created: {formatDate(ticket.created_at || ticket.notes[0]?.created_at || new Date().toISOString())}</span>
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-[#F0F2F5] tracking-tight">
          {ticket.subject}
        </h1>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Details, 2-Sided Conversation Thread & Seamless Reply Box */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <div className="bg-white dark:bg-[#1E2028] p-5 rounded-2xl border border-zinc-200 dark:border-[#2A2C38] shadow-xs">
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-[#8E93A6] mb-3">
              Customer Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-[#E2E4EB]">
                <User className="w-4 h-4 text-zinc-400 dark:text-[#6C7082]" />
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 dark:text-[#6C7082]">Customer</div>
                  <div className="font-bold text-zinc-950 dark:text-[#F0F2F5]">{ticket.customer_name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-[#E2E4EB]">
                <Mail className="w-4 h-4 text-zinc-400 dark:text-[#6C7082]" />
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 dark:text-[#6C7082]">Email Address</div>
                  <a
                    href={`mailto:${ticket.customer_email}`}
                    className="font-medium hover:underline text-zinc-950 dark:text-[#7EA8F8]"
                  >
                    {ticket.customer_email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Sided Conversation Thread */}
          <div className="bg-white dark:bg-[#1E2028] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-[#2A2C38] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#2A2C38]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-500 dark:text-[#7EA8F8]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-[#F0F2F5]">
                  2-Sided Conversation Thread ({ticket.notes.length + (ticket.description ? 1 : 0)})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8E93A6]">
                Customer & Staff
              </span>
            </div>

            <NotesTimeline
              customerName={ticket.customer_name}
              initialDescription={ticket.description}
              createdAt={ticket.created_at || ticket.notes[0]?.created_at}
              notes={ticket.notes}
            />
            <div ref={messagesEndRef} />
          </div>

          {/* Seamless Reply Box */}
          <div className="bg-white dark:bg-[#1E2028] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-[#2A2C38] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCustomer ? (
                  <User className="w-4 h-4 text-zinc-500 dark:text-[#6C7082]" />
                ) : (
                  <Headphones className="w-4 h-4 text-[#7EA8F8]" />
                )}
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-[#F0F2F5]">
                  {isCustomer
                    ? `Reply to Support (as ${ticket.customer_name})`
                    : "Reply to Customer / Update Ticket (as Support Staff)"}
                </h2>
              </div>

              {isCustomer && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-[#8E93A6]">
                  <span>Current Status:</span>
                  <StatusBadge status={ticket.status} size="sm" />
                </div>
              )}
            </div>

            {updateSuccess && (
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#181920] border border-zinc-300 dark:border-[#2A2C38] flex items-center gap-2 text-xs font-mono text-zinc-900 dark:text-[#F0F2F5] animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {isCustomer
                    ? "Your message was sent to support."
                    : "Ticket updated and reply sent to thread."}
                </span>
              </div>
            )}

            {updateError && (
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#181920] border border-zinc-300 dark:border-[#52252B] flex items-center gap-2 text-xs font-mono text-zinc-900 dark:text-[#F87171]">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Agent Status Selector */}
              {isAgent && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="status-select"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-[#A0A4B4]"
                  >
                    Ticket Status
                  </label>
                  <select
                    id="status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#181920] border border-zinc-200 dark:border-[#2E303D] rounded-xl text-zinc-950 dark:text-[#F0F2F5] focus:outline-none focus:border-zinc-800 dark:focus:border-[#7E84A3] focus:ring-1 focus:ring-zinc-800 dark:focus:ring-[#7E84A3]"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              )}

              {/* Closed Ticket Notice for Customer */}
              {isCustomer && ticket.status === "Closed" && (
                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#181920] border border-zinc-300 dark:border-[#2A2C38] text-xs text-zinc-900 dark:text-[#F0F2F5]">
                  <span className="font-bold uppercase tracking-wider">Note:</span> This ticket is currently closed. Sending a reply will automatically reopen it to <strong>In Progress</strong> for our support engineers.
                </div>
              )}

              {/* Message Reply Textarea */}
              <div className="space-y-1.5">
                <label
                  htmlFor="add-note-input"
                  className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-[#A0A4B4]"
                >
                  <span className="flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-zinc-500 dark:text-[#7EA8F8]" />
                    <span>
                      {isCustomer
                        ? "Your Message to Support"
                        : "Reply to Customer or Internal Update"}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6C7082] font-normal hidden sm:inline">
                    Ctrl + Enter to send
                  </span>
                </label>
                <textarea
                  id="add-note-input"
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleUpdate(e);
                    }
                  }}
                  placeholder={
                    isCustomer
                      ? "Type your message or response here..."
                      : "Type your reply to the customer or internal staff note here..."
                  }
                  className="w-full p-3.5 text-sm bg-zinc-50 dark:bg-[#181920] border border-zinc-200 dark:border-[#2E303D] rounded-xl text-zinc-950 dark:text-[#F0F2F5] placeholder-zinc-400 dark:placeholder-[#6C7082] focus:outline-none focus:border-zinc-800 dark:focus:border-[#7E84A3] focus:ring-1 focus:ring-zinc-800 dark:focus:ring-[#7E84A3] transition-all resize-none font-sans"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8E93A6]">
                  {isCustomer
                    ? "Customer replies are instantly posted to the thread"
                    : "Replies are saved and status updated in real time"}
                </span>
                <button
                  type="submit"
                  id="btn-update-ticket-submit"
                  disabled={updating}
                  className="group/btn relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white dark:text-[#14151A] bg-zinc-900 dark:bg-[#EAECEF] hover:bg-zinc-800 dark:hover:bg-white border border-zinc-900 dark:border-[#EAECEF] rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 overflow-hidden cursor-pointer"
                >
                  <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white dark:border-[#14151A] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white dark:border-[#14151A] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  {updating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isCustomer
                          ? ticket.status === "Closed"
                            ? "Reopen & Send Reply"
                            : "Send Reply"
                          : "Send Reply & Update Status"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: AI Assistant (Agent) or Helpdesk Summary (Customer) */}
        <div className="space-y-6">
          {isCustomer ? (
            <div className="bg-white dark:bg-[#1E2028] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-[#2A2C38] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-[#F0F2F5]">
                <ShieldCheck className="w-5 h-5 text-[#7EA8F8]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-[#F0F2F5]">
                  Customer Support Hub
                </h2>
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#8E93A6] leading-relaxed font-sans">
                Your request is securely registered in our system under reference{" "}
                <strong className="font-mono text-zinc-950 dark:text-[#F0F2F5]">
                  {ticket.ticket_id}
                </strong>
                .
              </p>
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#181920] border border-zinc-200 dark:border-[#2A2C38] text-xs text-zinc-800 dark:text-[#D1D5DB] space-y-1.5">
                <p className="font-bold uppercase tracking-wider">Seamless Conversation:</p>
                <p className="text-zinc-600 dark:text-[#8E93A6] leading-relaxed">
                  Support agents reply directly in this conversation. Messages update live without refreshing your browser.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 dark:border-[#2A2C38] text-xs text-zinc-400 dark:text-[#8E93A6] flex items-center justify-between">
                <span>Testing roles?</span>
                <button
                  type="button"
                  onClick={() => setRole("agent")}
                  className="font-mono font-bold text-zinc-950 dark:text-[#7EA8F8] hover:underline"
                >
                  Switch to Agent view →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Standout Feature: AI Ticket Assistant with 1-Click Draft Insert */}
              <AIAssistantCard
                ticketId={ticket.ticket_id}
                onUseDraft={(draft) => {
                  setNoteText(draft);
                  document.getElementById("add-note-input")?.focus();
                }}
              />

              {/* Quick Staff Info */}
              <div className="bg-white dark:bg-[#1E2028] p-5 rounded-2xl border border-zinc-200 dark:border-[#2A2C38] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-[#A0A4B4]">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#E8B668]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-[#8E93A6]">
                    Agent Actions Guide
                  </h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#8E93A6] leading-relaxed">
                  Click <strong>Analyze Ticket</strong> above to automatically determine sentiment, priority, and generate a draft response. You can insert the AI draft directly into your reply box with 1 click.
                </p>
                <div className="pt-2 border-t border-zinc-100 dark:border-[#2A2C38] text-xs text-zinc-400 dark:text-[#8E93A6] flex items-center justify-between">
                  <span>Testing customer view?</span>
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className="font-mono font-bold text-zinc-950 dark:text-[#7EA8F8] hover:underline"
                  >
                    Switch to Customer view →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

