import { TicketStatus } from "@/types/ticket";
import { CircleDot, Clock, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: TicketStatus | string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalizedStatus = status as TicketStatus;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold gap-2",
  };

  switch (normalizedStatus) {
    case "Open":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${sizeClasses[size]}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Open</span>
        </span>
      );

    case "In Progress":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${sizeClasses[size]}`}
        >
          <Clock className="w-3.5 h-3.5 animate-spin-slow text-amber-600 dark:text-amber-400" />
          <span>In Progress</span>
        </span>
      );

    case "Closed":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Closed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ${sizeClasses[size]}`}
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
  }
}
