"use client";

import Link from "next/link";
import { TicketListItem } from "@/types/ticket";
import StatusBadge from "./StatusBadge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { ChevronRight, User, Calendar } from "lucide-react";

interface TicketTableProps {
  tickets: TicketListItem[];
  loading?: boolean;
}

export default function TicketTable({ tickets, loading }: TicketTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 animate-pulse flex items-center justify-between">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return null; // Empty state rendered by parent
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="py-3.5 px-4 font-semibold">
                Ticket ID
              </th>
              <th scope="col" className="py-3.5 px-4 font-semibold">
                Subject
              </th>
              <th scope="col" className="py-3.5 px-4 font-semibold">
                Customer
              </th>
              <th scope="col" className="py-3.5 px-4 font-semibold">
                Status
              </th>
              <th scope="col" className="py-3.5 px-4 font-semibold">
                Created
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {tickets.map((ticket) => (
              <tr
                key={ticket.ticket_id}
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* ID */}
                <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="hover:underline flex items-center gap-1.5 focus:outline-none"
                  >
                    <span>{ticket.ticket_id}</span>
                  </Link>
                </td>

                {/* Subject */}
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs md:max-w-md truncate">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    {ticket.subject}
                  </Link>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ticket.customer_name}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} size="sm" />
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                  <div className="flex items-center gap-1.5" title={formatDate(ticket.created_at)}>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatRelativeTime(ticket.created_at)}</span>
                  </div>
                </td>

                {/* Action arrow */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 inline-flex items-center transition-colors"
                    title={`View ${ticket.ticket_id}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
