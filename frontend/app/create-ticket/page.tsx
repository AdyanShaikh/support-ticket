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
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-500 hover:text-slate-800 dark:text-[#8E93A6] dark:hover:text-[#F0F2F5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="relative bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200/80 dark:border-[#282A36] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-gray-100 dark:border-[#282A36]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-[#E2E4EB]">
            {isCustomer ? "Submit Support Request" : "Create Support Ticket"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8E93A4] mt-1">
            {isCustomer
              ? "Please describe the issue you are experiencing. A tracking ticket ID will be automatically generated."
              : "Submit a new customer issue. A unique ticket ID will be automatically generated."}
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="m-6 p-4 rounded-xl bg-rose-50/70 dark:bg-[#251A1E] border border-rose-200/70 dark:border-[#4E242B] flex items-center gap-3 text-sm text-rose-800 dark:text-[#F87171]">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        {successTicketId && (
          <div className="m-6 p-4 rounded-xl bg-emerald-50/70 dark:bg-[#1A2621] border border-emerald-200/70 dark:border-[#274436] flex items-center gap-3 text-sm text-emerald-800 dark:text-[#34D399]">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#34D399] shrink-0" />
            <div>
              <p className="font-medium text-xs">
                Ticket created successfully: <span className="font-mono">{successTicketId}</span>
              </p>
              <p className="text-xs text-emerald-700 dark:text-[#6EE7B7]">
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
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-[#9DA1B2]"
            >
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#6C7082]" />
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
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 dark:bg-[#181921] border border-gray-200/80 dark:border-[#2C2E3C] rounded-xl text-slate-800 dark:text-[#E2E4EB] placeholder-slate-400 dark:placeholder-[#6C7082] focus:outline-none focus:border-slate-400 dark:focus:border-[#565B72] focus:ring-1 focus:ring-slate-400/20 dark:focus:ring-[#565B72]/30 transition-all font-sans"
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="customer_email"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-[#9DA1B2]"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-[#6C7082]" />
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
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 dark:bg-[#181921] border border-gray-200/80 dark:border-[#2C2E3C] rounded-xl text-slate-800 dark:text-[#E2E4EB] placeholder-slate-400 dark:placeholder-[#6C7082] focus:outline-none focus:border-slate-400 dark:focus:border-[#565B72] focus:ring-1 focus:ring-slate-400/20 dark:focus:ring-[#565B72]/30 transition-all font-sans"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label
              htmlFor="subject"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-[#9DA1B2]"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-[#6C7082]" />
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
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 dark:bg-[#181921] border border-gray-200/80 dark:border-[#2C2E3C] rounded-xl text-slate-800 dark:text-[#E2E4EB] placeholder-slate-400 dark:placeholder-[#6C7082] focus:outline-none focus:border-slate-400 dark:focus:border-[#565B72] focus:ring-1 focus:ring-slate-400/20 dark:focus:ring-[#565B72]/30 transition-all font-sans"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-[#9DA1B2]"
            >
              <AlignLeft className="w-3.5 h-3.5 text-slate-400 dark:text-[#6C7082]" />
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
              className="w-full p-3.5 text-sm bg-slate-50/70 dark:bg-[#181921] border border-gray-200/80 dark:border-[#2C2E3C] rounded-xl text-slate-800 dark:text-[#E2E4EB] placeholder-slate-400 dark:placeholder-[#6C7082] focus:outline-none focus:border-slate-400 dark:focus:border-[#565B72] focus:ring-1 focus:ring-slate-400/20 dark:focus:ring-[#565B72]/30 transition-all resize-none font-sans"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-[#282A36] flex items-center justify-end gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 text-xs font-medium text-slate-500 dark:text-[#8E93A2] hover:text-slate-800 dark:hover:text-[#E2E4EB] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              id="btn-create-ticket-submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-xl bg-[#343844] hover:bg-[#404654] text-white dark:bg-[#2A2D3B] dark:hover:bg-[#343849] dark:text-[#E2E4EB] border border-[#343844] dark:border-[#383C4E] shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
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

