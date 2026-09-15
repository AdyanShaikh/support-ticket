import { TicketStatus } from "@/types/ticket";
import { CircleDot, Clock, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: TicketStatus | string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalizedStatus = status as TicketStatus;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs font-semibold gap-2",
    lg: "px-3.5 py-1.5 text-xs font-bold tracking-wider gap-2.5",
  };

  switch (normalizedStatus) {
    case "Open":
      return (
        <span
          className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-xs transition-all ${sizeClasses[size]}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white dark:bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white dark:bg-black"></span>
          </span>
          <span>Open</span>
        </span>
      );

    case "In Progress":
      return (
        <span
          className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider border border-zinc-900 dark:border-zinc-300 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 shadow-xs transition-all ${sizeClasses[size]}`}
        >
          <Clock className="w-3 h-3 animate-spin text-zinc-900 dark:text-zinc-100 [animation-duration:3s]" />
          <span>In Progress</span>
        </span>
      );

    case "Closed":
      return (
        <span
          className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider bg-zinc-100 text-zinc-400 dark:bg-zinc-900/80 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800 transition-all ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          <span>Closed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 ${sizeClasses[size]}`}
        >
          <CircleDot className="w-3 h-3" />
          <span>{status}</span>
        </span>
      );
  }
}

