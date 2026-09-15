"use client";

import { TicketListItem } from "@/types/ticket";
import { Layers, CircleDot, Clock, CheckCircle2 } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface StatsOverviewProps {
  tickets: TicketListItem[];
  currentStatus: string;
  onSelectStatus: (status: string) => void;
}

export default function StatsOverview({
  tickets,
  currentStatus,
  onSelectStatus,
}: StatsOverviewProps) {
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const closedCount = tickets.filter((t) => t.status === "Closed").length;

  const stats = [
    {
      label: "Total Tickets",
      value: total,
      filterKey: "All",
      icon: Layers,
    },
    {
      label: "Open Tickets",
      value: openCount,
      filterKey: "Open",
      icon: CircleDot,
    },
    {
      label: "In Progress",
      value: inProgressCount,
      filterKey: "In Progress",
      icon: Clock,
    },
    {
      label: "Closed",
      value: closedCount,
      filterKey: "Closed",
      icon: CheckCircle2,
    },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive =
          currentStatus === stat.filterKey ||
          (stat.filterKey === "All" && (!currentStatus || currentStatus === "All"));

        return (
          <button
            key={stat.label}
            type="button"
            onClick={() => onSelectStatus(stat.filterKey)}
            onMouseMove={handleMouseMove}
            className={`group relative p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 bg-white dark:bg-[#1E2028] overflow-hidden cursor-pointer ${
              isActive
                ? "border-slate-300 dark:border-[#4B5065] ring-1 ring-slate-300/50 dark:ring-[#4B5065]/40 shadow-xs"
                : "border-gray-200/70 dark:border-[#282A36] hover:border-gray-300 dark:hover:border-[#353846] hover:shadow-xs"
            }`}
          >
            {/* Soft Ambient Diffused Glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(220px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 0, 0, 0.02), transparent 80%)",
              }}
            />
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:block hidden"
              style={{
                background:
                  "radial-gradient(250px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.035), transparent 80%)",
              }}
            />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-[#9DA1B2]">
                {stat.label}
              </span>
              <div
                className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-700 dark:bg-[#2B2F3D] dark:text-[#7EA8F8]"
                    : "bg-slate-50 text-slate-400 dark:bg-[#22242F] dark:text-[#9DA1B2] group-hover:bg-slate-100 dark:group-hover:bg-[#282A38]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10 mt-3 sm:mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800 dark:text-[#E2E4EB]">
                <AnimatedNumber value={stat.value} durationMs={450} />
              </span>
              <span className="text-[11px] text-slate-400 dark:text-[#727688]">
                {isActive ? "Active filter" : "Filter"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}


