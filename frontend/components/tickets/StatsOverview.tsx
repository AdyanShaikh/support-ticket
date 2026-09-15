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
            className={`group relative p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 bg-white dark:bg-zinc-950 overflow-hidden ${
              isActive
                ? "border-black dark:border-white ring-1 ring-black dark:ring-white shadow-[0_0_30px_-5px_rgba(0,0,0,0.14)] dark:shadow-[0_0_35px_-5px_rgba(255,255,255,0.12)]"
                : "border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.05)]"
            }`}
          >
            {/* Vengeance UI Dynamic Mouse-Tracking Spotlight Glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(250px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 0, 0, 0.05), transparent 80%)",
              }}
            />
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:block hidden"
              style={{
                background:
                  "radial-gradient(280px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.09), transparent 80%)",
              }}
            />

            {/* Vengeance UI Technical Corner Brackets */}
            <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-zinc-400 dark:border-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-zinc-400 dark:border-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-zinc-400 dark:border-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-zinc-400 dark:border-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity" />

            {/* Top Indicator bar on active */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-black dark:bg-white" />
            )}

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </span>
              <div
                className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="relative z-10 mt-3 sm:mt-4 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black tracking-tighter font-mono text-zinc-950 dark:text-white">
                <AnimatedNumber value={stat.value} durationMs={450} />
              </span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                {isActive ? "Active Filter" : "Click to filter"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}


