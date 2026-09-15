"use client";

import { useEffect, useState } from "react";
import { Search, X, SlidersHorizontal, Command } from "lucide-react";

interface SearchAndFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
}

const statusOptions: { label: string; value: string }[] = [
  { label: "All Tickets", value: "All" },
  { label: "Open", value: "Open" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
];

export default function SearchAndFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: SearchAndFilterProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || ""));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("ticket-search-input") as HTMLInputElement | null;
        if (el) {
          el.focus();
          el.select();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#1E2028] p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 dark:border-[#282A36] shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#6C7082]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          id="ticket-search-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Ticket ID, Customer, Subject, or description..."
          className="w-full pl-10 pr-16 py-2.5 text-xs sm:text-sm bg-white/70 dark:bg-[#181921] border border-gray-200/80 dark:border-[#2C2E3C] rounded-xl text-slate-800 dark:text-[#E2E4EB] placeholder-slate-400 dark:placeholder-[#6C7082] focus:outline-none focus:border-slate-400 dark:focus:border-[#565B72] focus:ring-1 focus:ring-slate-400/20 dark:focus:ring-[#565B72]/30 transition-all font-sans"
        />

        {/* Clear Search or Keyboard Shortcut Indicator */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-[#E2E4EB] transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById("ticket-search-input")?.focus()}
              className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 dark:bg-[#222430] text-slate-500 dark:text-[#8E93A2] border border-gray-200 dark:border-[#303342] hover:border-slate-400 dark:hover:border-[#565B72] transition-colors"
              title={`Press ${isMac ? "⌘K" : "Ctrl+K"} to focus search`}
            >
              {isMac ? <Command className="w-2.5 h-2.5" /> : <span>Ctrl</span>}
              <span>K</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Island Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-200/50 dark:bg-[#181921] rounded-xl border border-gray-200/60 dark:border-[#262834]">
        <div className="hidden sm:flex items-center text-slate-400 dark:text-[#6C7082] pl-2 pr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
        {statusOptions.map((opt) => {
          const isActive =
            status === opt.value || (opt.value === "All" && (!status || status === "All"));
          return (
            <button
              key={opt.value}
              type="button"
              id={`filter-status-${opt.value.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 sm:px-3.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-white text-slate-800 shadow-xs border border-gray-200/60 dark:bg-[#2B2E3C] dark:text-[#E2E4EB] font-medium"
                  : "text-slate-600 dark:text-[#8E93A2] hover:text-slate-900 dark:hover:text-[#E2E4EB] hover:bg-slate-200/40 dark:hover:bg-[#20222C] font-normal"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


