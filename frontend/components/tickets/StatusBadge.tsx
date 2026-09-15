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
          className={`inline-flex items-center rounded-full font-medium bg-blue-50 text-blue-700 dark:bg-[#1A2338] dark:text-[#7EA8F8] border border-blue-200 dark:border-[#2B3958] shadow-xs transition-all ${sizeClasses[size]}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span>Open</span>
        </span>
      );

    case "In Progress":
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-amber-50 text-amber-800 dark:bg-[#282117] dark:text-[#E8B668] border border-amber-200 dark:border-[#423622] shadow-xs transition-all ${sizeClasses[size]}`}
        >
          <Clock className="w-3 h-3 animate-spin text-amber-600 dark:text-[#E8B668] [animation-duration:3s]" />
          <span>In Progress</span>
        </span>
      );

    case "Closed":
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-gray-100 text-gray-600 dark:bg-[#1E202A] dark:text-[#8E93A6] border border-gray-200 dark:border-[#2B2D3A] transition-all ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3 h-3 text-gray-400 dark:text-[#6F7386]" />
          <span>Closed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-gray-100 text-gray-600 dark:bg-[#1E202A] dark:text-[#8E93A6] border border-gray-200 dark:border-[#2B2D3A] ${sizeClasses[size]}`}
        >
          <CircleDot className="w-3 h-3" />
          <span>{status}</span>
        </span>
      );
  }
}

