"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";

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
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
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
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-950 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all font-sans"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-black dark:hover:text-white"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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

