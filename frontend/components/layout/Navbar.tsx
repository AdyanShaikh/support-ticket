"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, Plus, Ticket, Headphones, User } from "lucide-react";
import { useRole } from "@/context/RoleContext";

export default function Navbar() {
  const pathname = usePathname();
  const { role, setRole, isAgent, isCustomer } = useRole();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <LifeBuoy className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  Support CRM
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  {isAgent ? "Agent Workspace" : "Customer Portal"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* 2-Button Role Toggle (Agent vs Customer) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <button
            type="button"
            id="role-agent-btn"
            onClick={() => setRole("agent")}
            title="Switch to Support Agent View (Full CRM, Status Updates, Notes, AI Triage)"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isAgent
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Agent</span>
          </button>

          <button
            type="button"
            id="role-customer-btn"
            onClick={() => setRole("customer")}
            title="Switch to Customer View (Ticket Tracking, Submission, Staff Notes Hidden)"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isCustomer
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              pathname === "/"
                ? "text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 dark:text-indigo-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/create-ticket"
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
              isCustomer
                ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isCustomer ? "Submit Request" : "New Ticket"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
