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
    <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      {/* Vengeance UI Corner Ticks */}
      <span className="absolute top-1.5 left-1.5 w-1 h-1 border-t border-l border-zinc-400 dark:border-zinc-600 opacity-30 pointer-events-none" />
      <span className="absolute top-1.5 right-1.5 w-1 h-1 border-t border-r border-zinc-400 dark:border-zinc-600 opacity-30 pointer-events-none" />
      <span className="absolute bottom-1.5 left-1.5 w-1 h-1 border-b border-l border-zinc-400 dark:border-zinc-600 opacity-30 pointer-events-none" />
      <span className="absolute bottom-1.5 right-1.5 w-1 h-1 border-b border-r border-zinc-400 dark:border-zinc-600 opacity-30 pointer-events-none" />

      {/* Search Input with stark contrast */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          id="ticket-search-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Ticket ID, Customer, Subject, or description..."
          className="w-full pl-10 pr-16 py-2.5 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-950 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-sans"
        />

        {/* Clear Search or Vengeance UI Keyboard Shortcut Indicator */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById("ticket-search-input")?.focus()}
              className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-300/80 dark:border-zinc-700/80 hover:border-black dark:hover:border-white transition-colors"
              title={`Press ${isMac ? "⌘K" : "Ctrl+K"} to focus search`}
            >
              {isMac ? <Command className="w-2.5 h-2.5" /> : <span>Ctrl</span>}
              <span>K</span>
            </button>
          )}
        </div>
      </div>

      {/* Skiper-style Floating Island Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="hidden sm:flex items-center text-zinc-400 dark:text-zinc-500 pl-2 pr-1">
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
              className={`px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80"
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


