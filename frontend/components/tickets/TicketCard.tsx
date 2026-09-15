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
      className="block p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
          {ticket.ticket_id}
        </span>
        <StatusBadge status={ticket.status} size="sm" />
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 mb-2">
        {ticket.subject}
      </h3>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 truncate mr-2">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{ticket.customer_name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" title={formatDate(ticket.created_at)}>
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formatRelativeTime(ticket.created_at)}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
        </div>
      </div>
    </Link>
  );
}
