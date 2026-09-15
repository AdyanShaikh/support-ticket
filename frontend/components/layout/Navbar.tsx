"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, Plus, LayoutDashboard, Headphones, User } from "lucide-react";
import { useRole } from "@/context/RoleContext";

export default function Navbar() {
  const pathname = usePathname();
  const { setRole, isAgent, isCustomer } = useRole();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-xs">
              <LifeBuoy className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-zinc-950 dark:text-white tracking-tight text-base sm:text-lg uppercase">
                  Support CRM
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                  {isAgent ? "Agent Workspace" : "Customer Portal"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Skiper Dynamic Island Role Switcher */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <button
            type="button"
            id="role-agent-btn"
            onClick={() => setRole("agent")}
            title="Switch to Support Agent View (Full CRM, Status Updates, Notes, AI Triage)"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              isAgent
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              isCustomer
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
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
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              pathname === "/"
                ? "text-black dark:text-white bg-zinc-100 dark:bg-zinc-900"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/create-ticket"
            className="group relative inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 border border-black dark:border-white shadow-xs hover:shadow transition-all duration-150 overflow-hidden"
          >
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white dark:border-black opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white dark:border-black opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isCustomer ? "Submit Request" : "New Ticket"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

