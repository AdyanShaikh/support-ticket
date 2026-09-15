"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { TicketDetail, TicketStatus } from "@/types/ticket";
import { fetchTicket, updateTicket } from "@/lib/api";
import StatusBadge from "@/components/tickets/StatusBadge";
import NotesTimeline from "@/components/tickets/NotesTimeline";
import AIAssistantCard from "@/components/tickets/AIAssistantCard";
import { formatDate, formatRelativeTime } from "@/lib/utils";
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

  const { role, setRole, isAgent, isCustomer } = useRole();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update & Reply Form State
  const [status, setStatus] = useState<TicketStatus>("Open");
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTicket(ticketId);
      setTicket(data);
      setStatus(data.status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load ticket details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() && isCustomer) {
      setUpdateError("Please type a message before sending your reply.");
      return;
    }

    setUpdating(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      const trimmedText = noteText.trim();
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

      await updateTicket(ticketId, {
        status: targetStatus,
        notes: formattedNote,
      });

      setUpdateSuccess(true);
      setNoteText("");
      // Refresh ticket details to retrieve newly appended messages & timestamps
      await loadTicket();
      setTimeout(() => setUpdateSuccess(false), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update ticket.";
      setUpdateError(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm">Loading ticket {ticketId}...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ticket Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {error || `Ticket ${ticketId} could not be located in the system.`}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Active Persona Banner */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isCustomer
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
            }`}
          >
            {isCustomer ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Viewing as Customer: {ticket.customer_name}</span>
              </>
            ) : (
              <>
                <Headphones className="w-3.5 h-3.5" />
                <span>Viewing as Support Agent</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setRole(isCustomer ? "agent" : "customer")}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle role view"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Switch to {isCustomer ? "Agent" : "Customer"}</span>
          </button>

          <button
            type="button"
            onClick={loadTicket}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-1"
            title="Refresh ticket"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
              {ticket.ticket_id}
            </span>
            <StatusBadge status={ticket.status} size="md" />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created: {formatDate(ticket.created_at || ticket.notes[0]?.created_at || new Date().toISOString())}</span>
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {ticket.subject}
        </h1>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Details, 2-Sided Conversation Thread & Reply Box (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Customer Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="text-xs text-slate-400">Customer</div>
                  <div className="font-medium">{ticket.customer_name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="text-xs text-slate-400">Email Address</div>
                  <a
                    href={`mailto:${ticket.customer_email}`}
                    className="font-medium hover:underline text-indigo-600 dark:text-indigo-400"
                  >
                    {ticket.customer_email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Sided Conversation Thread */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2-Sided Conversation Thread ({ticket.notes.length + (ticket.description ? 1 : 0)})
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Customer & Support Staff
              </span>
            </div>

            <NotesTimeline
              customerName={ticket.customer_name}
              initialDescription={ticket.description}
              createdAt={ticket.created_at || ticket.notes[0]?.created_at}
              notes={ticket.notes}
            />
          </div>

          {/* Dedicated Reply Box (Available for BOTH Customer and Agent) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCustomer ? (
                  <User className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Headphones className="w-4 h-4 text-indigo-500" />
                )}
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {isCustomer
                    ? `Reply to Support (as ${ticket.customer_name})`
                    : "Reply to Customer / Update Ticket (as Support Staff)"}
                </h2>
              </div>

              {isCustomer && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Current Status:</span>
                  <StatusBadge status={ticket.status} size="sm" />
                </div>
              )}
            </div>

            {updateSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {isCustomer
                    ? "Your reply has been added to the ticket thread."
                    : "Ticket updated and reply sent to thread."}
                </span>
              </div>
            )}

            {updateError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
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
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Ticket Status
                  </label>
                  <select
                    id="status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              )}

              {/* Closed Ticket Notice for Customer */}
              {isCustomer && ticket.status === "Closed" && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Note:</span> This ticket is currently closed. Sending a reply will automatically reopen it to <strong>In Progress</strong> for our support engineers.
                </div>
              )}

              {/* Message Reply Textarea */}
              <div className="space-y-1.5">
                <label
                  htmlFor="add-note-input"
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {isCustomer
                      ? "Your Message to Support"
                      : "Reply to Customer or Internal Update"}
                  </span>
                </label>
                <textarea
                  id="add-note-input"
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    isCustomer
                      ? "Type your question or additional details here..."
                      : "Type your reply to the customer or internal staff note here..."
                  }
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  id="btn-update-ticket-submit"
                  disabled={updating}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 ${
                    isCustomer
                      ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                      : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
                  }`}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending message...</span>
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
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Customer Support Hub
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your request is securely registered in our system under reference{" "}
                <strong className="font-mono text-indigo-600 dark:text-indigo-400">
                  {ticket.ticket_id}
                </strong>
                .
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5">
                <p className="font-semibold">How conversation works:</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Support agents reply directly in this conversation. You can respond at any time using the reply box below the thread.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Testing roles?</span>
                <button
                  type="button"
                  onClick={() => setRole("agent")}
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
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
                  // Smooth scroll to reply box
                  document.getElementById("add-note-input")?.focus();
                }}
              />

              {/* Quick Staff Info */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Agent Actions Guide
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Click <strong>Analyze Ticket</strong> above to automatically determine sentiment, priority, and generate a draft response. You can insert the AI draft directly into your reply box with 1 click.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Testing customer view?</span>
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
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
