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
  const { isCustomer } = useRole();

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
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-zinc-100 dark:border-zinc-800/80">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950 dark:text-white">
            {isCustomer ? "Submit Support Request" : "Create Support Ticket"}
          </h1>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            {isCustomer
              ? "Please describe the issue you are experiencing. A tracking ticket ID will be automatically generated."
              : "Submit a new customer issue. A unique ticket ID will be automatically generated."}
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="m-6 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center gap-3 text-sm text-zinc-900 dark:text-zinc-100">
            <AlertCircle className="w-5 h-5 text-zinc-900 dark:text-zinc-100 shrink-0" />
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        {successTicketId && (
          <div className="m-6 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center gap-3 text-sm text-zinc-900 dark:text-zinc-100">
            <CheckCircle2 className="w-5 h-5 text-black dark:text-white shrink-0" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">
                Ticket created successfully: <span className="font-mono">{successTicketId}</span>
              </p>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Redirecting to ticket details...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="customer_name"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Customer Name</span>
              <span className="text-black dark:text-white">*</span>
            </label>
            <input
              type="text"
              id="customer_name"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-sans"
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="customer_email"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>Customer Email</span>
              <span className="text-black dark:text-white">*</span>
            </label>
            <input
              type="email"
              id="customer_email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-sans"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label
              htmlFor="subject"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Subject</span>
              <span className="text-black dark:text-white">*</span>
            </label>
            <input
              type="text"
              id="subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Unable to login to account"
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-sans"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Issue Description</span>
              <span className="text-black dark:text-white">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete details describing the issue, error messages, and customer impact..."
              className="w-full p-3.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all resize-none font-sans"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 text-xs font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              id="btn-create-ticket-submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white dark:text-black bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-black dark:border-white rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isCustomer ? "Submitting..." : "Creating..."}</span>
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

