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
      {isCustomer && (
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-zinc-900 dark:text-zinc-100">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse shrink-0"></span>
            <span>
              <strong>Customer Portal View:</strong> You are viewing tickets as a customer. Staff internal notes, status overrides, and AI triage actions are restricted to agents.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRole("agent")}
            className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white hover:underline shrink-0"
          >
            Switch to Agent View →
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white uppercase">
            {isCustomer ? "Customer Portal" : "Support Queue"}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
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
            className="p-2.5 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-800 disabled:opacity-50"
            title="Refresh ticket list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-black dark:text-white" : ""}`} />
          </button>

          <Link
            href="/create-ticket"
            className="group relative inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 border border-black dark:border-white shadow-xs hover:shadow transition-all duration-150 overflow-hidden"
          >
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white dark:border-black opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white dark:border-black opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-start gap-3 text-sm text-zinc-900 dark:text-zinc-100">
          <AlertCircle className="w-5 h-5 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold uppercase tracking-wider">Unable to fetch support tickets</p>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-0.5">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-2 text-xs font-mono font-bold text-black dark:text-white underline hover:no-underline"
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
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-pulse space-y-3"
                  >
                    <div className="flex justify-between">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              tickets.map((t) => <TicketCard key={t.ticket_id} ticket={t} />)
            )}
          </div>

          {/* Empty States */}
          {!loading && tickets.length === 0 && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-3">
              {debouncedSearch || status !== "All" ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                    No tickets match your filter
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Try adjusting your search query or reset your status filter to view other tickets.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatus("All");
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-bold uppercase text-black dark:text-white hover:underline"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-600 dark:text-zinc-300">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                    No tickets found
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    There are currently no tickets in the database. Create the first support ticket to get started.
                  </p>
                  <Link
                    href="/create-ticket"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white dark:text-black bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl shadow-xs"
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

