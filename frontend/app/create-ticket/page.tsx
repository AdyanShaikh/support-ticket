"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTicket } from "@/lib/api";
import { useRole } from "@/context/RoleContext";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  FileText,
  AlignLeft,
} from "lucide-react";

export default function CreateTicketPage() {
  const router = useRouter();
  const { isAgent, isCustomer } = useRole();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!customerEmail.trim()) {
      setError("Customer email is required.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(customerEmail.trim())) {
      setError("Please enter a valid customer email address.");
      return;
    }
    if (!subject.trim()) {
      setError("Ticket subject is required.");
      return;
    }
    if (!description.trim()) {
      setError("Ticket description is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await createTicket({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        subject: subject.trim(),
        description: description.trim(),
      });

      setSuccessTicketId(res.ticket_id);
      // Brief pause for UX success feedback then redirect to new ticket
      setTimeout(() => {
        router.push(`/tickets/${res.ticket_id}`);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create ticket.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isCustomer ? "Submit a Support Request" : "Create Support Ticket"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isCustomer
              ? "Please describe the issue you are experiencing. A tracking ticket ID will be automatically generated."
              : "Submit a new customer issue. A unique ticket ID will be automatically generated."}
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="m-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-sm text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        {successTicketId && (
          <div className="m-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-sm text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold text-xs">
                Ticket created successfully: <span className="font-mono">{successTicketId}</span>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Redirecting to ticket details...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="customer_name"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="customer_name"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="customer_email"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Email</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="customer_email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label
              htmlFor="subject"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Subject</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Unable to login to account"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Issue Description</span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete details describing the issue, error messages, and customer impact..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              id="btn-create-ticket-submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 ${
                isCustomer
                  ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isCustomer ? "Submitting Request..." : "Creating Ticket..."}</span>
                </>
              ) : (
                <span>{isCustomer ? "Submit Support Request" : "Create Ticket"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
