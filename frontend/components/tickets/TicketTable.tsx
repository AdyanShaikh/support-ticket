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
      <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-zinc-200 dark:border-[#2A2C38] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 dark:border-[#2A2C38] animate-pulse flex items-center justify-between">
          <div className="h-4 bg-zinc-200 dark:bg-[#282A36] rounded w-24"></div>
          <div className="h-4 bg-zinc-200 dark:bg-[#282A36] rounded w-16"></div>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-[#252733]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-5 bg-zinc-200 dark:bg-[#282A36] rounded w-20"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-zinc-200 dark:bg-[#282A36] rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-100 dark:bg-[#242632] rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-6 bg-zinc-200 dark:bg-[#282A36] rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-zinc-200 dark:border-[#2A2C38] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-[#181920] text-[10px] uppercase font-mono tracking-wider text-zinc-500 dark:text-[#8E93A6] border-b border-zinc-200 dark:border-[#2A2C38]">
            <tr>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Ticket ID
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Subject
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Customer
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Status
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Created
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-[#252733]">
            {tickets.map((ticket) => (
              <tr
                key={ticket.ticket_id}
                className="group hover:bg-zinc-50/80 dark:hover:bg-[#252834]/70 transition-colors"
              >
                {/* ID */}
                <td className="py-3.5 px-4 font-mono font-bold text-zinc-950 dark:text-[#F0F2F5] whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="hover:underline flex items-center gap-1.5 focus:outline-none"
                  >
                    <span>{ticket.ticket_id}</span>
                  </Link>
                </td>

                {/* Subject */}
                <td className="py-3.5 px-4 font-semibold text-zinc-950 dark:text-[#F0F2F5] max-w-xs md:max-w-md truncate">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors block truncate"
                  >
                    {ticket.subject}
                  </Link>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-4 text-zinc-600 dark:text-[#A0A4B4] whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-zinc-400 dark:text-[#6C7082]" />
                    <span>{ticket.customer_name}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} size="sm" />
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 text-zinc-500 dark:text-[#8E93A6] whitespace-nowrap text-xs font-mono">
                  <div className="flex items-center gap-1.5" title={formatDate(ticket.created_at)}>
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-[#6C7082]" />
                    <span>{formatRelativeTime(ticket.created_at)}</span>
                  </div>
                </td>

                {/* Action arrow */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="p-1.5 rounded-lg text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-[#F0F2F5] group-hover:bg-zinc-100 dark:group-hover:bg-[#282B38] inline-flex items-center transition-all"
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

