"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { TicketListItem } from "@/types/ticket";
import { fetchTickets } from "@/lib/api";
import StatsOverview from "@/components/tickets/StatsOverview";
import SearchAndFilter from "@/components/tickets/SearchAndFilter";
import TicketTable from "@/components/tickets/TicketTable";
import TicketCard from "@/components/tickets/TicketCard";
import { Plus, RefreshCw, AlertCircle, Inbox, Search } from "lucide-react";
import { useRole } from "@/context/RoleContext";

export default function DashboardPage() {
  const [allTickets, setAllTickets] = useState<TicketListItem[]>([]);
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("All");

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Main fetch query with deduplication, smart caching, and instant status filtering
  const loadData = useCallback(async (bypassCache = false) => {
    setLoading(true);
    setError(null);
    try {
      const hasSearch = Boolean(debouncedSearch.trim());
      const hasStatus = status !== "All";

      if (!hasSearch && !hasStatus) {
        // Single unified request on default dashboard load (50% reduction in network requests)
        const data = await fetchTickets(undefined, { bypassCache });
        setAllTickets(data);
        setTickets(data);
      } else if (!hasSearch && hasStatus) {
        // Instant in-memory filter if allTickets already cached
        if (allTickets.length > 0 && !bypassCache) {
          const filtered = allTickets.filter((t) => t.status === status);
          setTickets(filtered);
          setLoading(false);
          return;
        }
        const [filteredData, allData] = await Promise.all([
          fetchTickets({ status }, { bypassCache }),
          allTickets.length > 0 ? Promise.resolve(allTickets) : fetchTickets(undefined, { bypassCache }),
        ]);
        setTickets(filteredData);
        setAllTickets(allData);
      } else {
        // Search query active: query backend
        const [searchedData, allData] = await Promise.all([
          fetchTickets(
            {
              status: hasStatus ? status : undefined,
              search: debouncedSearch.trim(),
            },
            { bypassCache }
          ),
          allTickets.length > 0 ? Promise.resolve(allTickets) : fetchTickets(undefined, { bypassCache }),
        ]);
        setTickets(searchedData);
        setAllTickets(allData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load support tickets.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch, allTickets.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true);
  };

  const { isAgent, isCustomer, setRole } = useRole();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Customer Mode Banner */}
      {/* Customer Mode Banner */}
      {isCustomer && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 dark:bg-[#1B2232] border border-blue-200/60 dark:border-[#27354E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-blue-950 dark:text-[#D3E1FA]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
            <span>
              <strong>Customer Portal:</strong> You are viewing tickets as a customer. Reply directly to agents in the conversation thread while status overrides and AI triage actions are restricted to agents.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRole("agent")}
            className="text-xs font-semibold text-blue-700 dark:text-[#7EA8F8] hover:underline shrink-0"
          >
            Switch to Agent View →
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-[#E2E4EB]">
            {isCustomer ? "Customer Portal" : "Support Queue"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8E93A4] mt-1">
            {isCustomer
              ? "Track your submitted tickets, check resolution progress, or open a new request."
              : "Real-time ticket queue, active investigations, and customer communication."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-[#8E93A2] dark:hover:text-[#E2E4EB] hover:bg-slate-100 dark:hover:bg-[#1E2028] rounded-xl transition-colors border border-gray-200/80 dark:border-[#282A36] disabled:opacity-50 cursor-pointer"
            title="Refresh ticket list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-slate-700 dark:text-[#E2E4EB]" : ""}`} />
          </button>

          <Link
            href="/create-ticket"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-xl bg-[#343844] hover:bg-[#404654] text-white dark:bg-[#2A2D3B] dark:hover:bg-[#343849] dark:text-[#E2E4EB] border border-[#343844] dark:border-[#383C4E] shadow-xs hover:shadow transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{isCustomer ? "Submit Request" : "Create Ticket"}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <StatsOverview
        tickets={allTickets}
        currentStatus={status}
        onSelectStatus={(newStatus) => setStatus(newStatus)}
      />

      {/* Search & Filter Toolbar */}
      <SearchAndFilter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {/* Error State */}
      {error && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-[#251A1E] border border-rose-200 dark:border-[#4E242B] flex items-start gap-3 text-sm text-rose-900 dark:text-[#F87171]">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to fetch support tickets</p>
            <p className="text-xs text-rose-700 dark:text-[#FCA5A5] mt-0.5">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-2 text-xs font-medium text-rose-900 dark:text-[#F87171] underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Ticket List View */}
      {!error && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <TicketTable tickets={tickets} loading={loading} />
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1E2028] border border-gray-200/80 dark:border-[#282A36] animate-pulse space-y-3"
                  >
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 dark:bg-[#282A36] rounded w-20"></div>
                      <div className="h-4 bg-gray-200 dark:bg-[#282A36] rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-[#282A36] rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-[#242632] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              tickets.map((t) => <TicketCard key={t.ticket_id} ticket={t} />)
            )}
          </div>

          {/* Empty States */}
          {!loading && tickets.length === 0 && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-[#282A36] bg-white dark:bg-[#1E2028] shadow-xs space-y-3">
              {debouncedSearch || status !== "All" ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#181921] flex items-center justify-center mx-auto text-gray-400 dark:text-[#8E93A2]">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-[#E2E4EB]">
                    No tickets match your filter
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8E93A4] max-w-sm mx-auto">
                    Try adjusting your search query or reset your status filter to view other tickets.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatus("All");
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-[#E2E4EB] hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#181921] flex items-center justify-center mx-auto text-slate-400 dark:text-[#8E93A2]">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-[#E2E4EB]">
                    No tickets found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8E93A4] max-w-sm mx-auto">
                    There are currently no tickets in the database. Create the first support ticket to get started.
                  </p>
                  <Link
                    href="/create-ticket"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white dark:text-[#E2E4EB] bg-[#343844] dark:bg-[#2A2D3B] hover:bg-[#404654] dark:hover:bg-[#343849] rounded-xl shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Ticket</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

