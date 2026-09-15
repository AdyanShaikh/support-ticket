"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, Plus, LayoutDashboard, Headphones, User } from "lucide-react";
import { useRole } from "@/context/RoleContext";

export default function Navbar() {
  const pathname = usePathname();
  const { setRole, isAgent, isCustomer } = useRole();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-[#252733]/80 bg-[#F8F9FA]/85 dark:bg-[#14151A]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#22242D] text-[#F0F2F5] dark:bg-[#262835] dark:text-[#F0F2F5] border border-gray-300 dark:border-[#3A3D4E] flex items-center justify-center shadow-xs">
              <LifeBuoy className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 dark:text-[#F0F2F5] tracking-tight text-base sm:text-lg uppercase">
                  Support CRM
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-gray-100 text-gray-700 dark:bg-[#20222B] dark:text-[#A4A8BC] border border-gray-200 dark:border-[#2C2E3B]">
                  {isAgent ? "Agent Workspace" : "Customer Portal"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Skiper Dynamic Island Role Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-[#1C1D25] p-1 rounded-full border border-gray-200 dark:border-[#2A2C38] shadow-xs">
          <button
            type="button"
            id="role-agent-btn"
            onClick={() => setRole("agent")}
            title="Switch to Support Agent View (Full CRM, Status Updates, Notes, AI Triage)"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              isAgent
                ? "bg-white text-gray-900 shadow-xs dark:bg-[#2D303E] dark:text-[#F0F2F5] dark:border dark:border-[#3F4357] font-bold"
                : "text-gray-500 hover:text-gray-900 dark:text-[#8E93A6] dark:hover:text-[#F0F2F5]"
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              isCustomer
                ? "bg-white text-gray-900 shadow-xs dark:bg-[#2D303E] dark:text-[#F0F2F5] dark:border dark:border-[#3F4357] font-bold"
                : "text-gray-500 hover:text-gray-900 dark:text-[#8E93A6] dark:hover:text-[#F0F2F5]"
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
                ? "text-gray-900 dark:text-[#F0F2F5] bg-gray-100 dark:bg-[#22242E]"
                : "text-gray-500 hover:text-gray-900 dark:text-[#8E93A6] dark:hover:text-[#F0F2F5] hover:bg-gray-100 dark:hover:bg-[#1E2028]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/create-ticket"
            className="group relative inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#1E2028] hover:bg-[#2B2D38] text-white dark:bg-[#EAECEF] dark:text-[#14151A] dark:hover:bg-[#D8DBE2] border border-gray-700/50 dark:border-white/20 shadow-xs hover:shadow transition-all duration-150 overflow-hidden cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isCustomer ? "Submit Request" : "New Ticket"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

