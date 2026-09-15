import Link from "next/link";
import { TicketListItem } from "@/types/ticket";
import StatusBadge from "./StatusBadge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { User, Calendar, ChevronRight } from "lucide-react";

interface TicketCardProps {
  ticket: TicketListItem;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link
      href={`/tickets/${ticket.ticket_id}`}
      className="block p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 hover:border-black dark:hover:border-white transition-all duration-200 hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.06)]"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-mono text-xs font-bold text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {ticket.ticket_id}
        </span>
        <StatusBadge status={ticket.status} size="sm" />
      </div>

      <h3 className="font-bold text-zinc-950 dark:text-white text-sm line-clamp-2 mb-3">
        {ticket.subject}
      </h3>

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 truncate mr-2">
          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">{ticket.customer_name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" title={formatDate(ticket.created_at)}>
          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{formatRelativeTime(ticket.created_at)}</span>
          <ChevronRight className="w-4 h-4 text-zinc-400 ml-1" />
        </div>
      </div>
    </Link>
  );
}

