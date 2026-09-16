"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, Plus, LayoutDashboard, Headphones, User } from "lucide-react";
import { useRole } from "@/context/RoleContext";

export default function Navbar() {
  const pathname = usePathname();
  const { setRole, isAgent, isCustomer } = useRole();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/70 dark:border-[#252733]/70 bg-[#F7F7F5]/90 dark:bg-[#16171D]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01]"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-200/70 text-slate-700 dark:bg-[#252834] dark:text-[#7EA8F8] border border-gray-300/40 dark:border-[#323544] flex items-center justify-center shadow-xs">
              <LifeBuoy className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-[#E2E4EB] tracking-tight text-base sm:text-lg">
                  Support CRM
                </span>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200/60 text-slate-700 dark:bg-[#20222B] dark:text-[#9DA1B2] border border-gray-200/70 dark:border-[#2A2C38]">
                  {isAgent ? "Agent Workspace" : "Customer Portal"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Skiper Dynamic Island Role Switcher */}
        <div className="flex items-center bg-slate-200/50 dark:bg-[#1B1D24] p-1 rounded-full border border-gray-200/80 dark:border-[#282A36] shadow-xs">
          <button
            type="button"
            id="role-agent-btn"
            onClick={() => setRole("agent")}
            title="Switch to Support Agent View (Full CRM, Status Updates, Customer ↔ Agent Conversation, AI Triage)"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              isAgent
                ? "bg-white text-slate-800 shadow-xs border border-gray-200/60 dark:bg-[#2B2E3C] dark:text-[#E2E4EB] dark:border-[#3A3D4E]"
                : "text-slate-500 hover:text-slate-800 dark:text-[#8E93A2] dark:hover:text-[#E2E4EB]"
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-[#7EA8F8]" />
            <span>Agent</span>
          </button>

          <button
            type="button"
            id="role-customer-btn"
            onClick={() => setRole("customer")}
            title="Switch to Customer View (Ticket Tracking, Submission, Customer Reply Portal)"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              isCustomer
                ? "bg-white text-slate-800 shadow-xs border border-gray-200/60 dark:bg-[#2B2E3C] dark:text-[#E2E4EB] dark:border-[#3A3D4E]"
                : "text-slate-500 hover:text-slate-800 dark:text-[#8E93A2] dark:hover:text-[#E2E4EB]"
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
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl transition-all ${
              pathname === "/"
                ? "text-slate-800 dark:text-[#E2E4EB] bg-slate-200/60 dark:bg-[#22242F]"
                : "text-slate-600 hover:text-slate-800 dark:text-[#8E93A2] dark:hover:text-[#E2E4EB] hover:bg-slate-100 dark:hover:bg-[#1E202A]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/create-ticket"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-[#343844] hover:bg-[#404654] text-white dark:bg-[#2A2D3B] dark:hover:bg-[#343849] dark:text-[#E2E4EB] border border-[#343844] dark:border-[#393D4E] shadow-xs hover:shadow transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{isCustomer ? "Submit Request" : "New Ticket"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

