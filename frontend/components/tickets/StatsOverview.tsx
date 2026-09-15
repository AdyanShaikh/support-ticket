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
                ? "border-[#2B2D3A] dark:border-[#4F5368] ring-1 ring-[#2B2D3A] dark:ring-[#4F5368] shadow-sm"
                : "border-gray-200 dark:border-[#2A2C38] hover:border-gray-300 dark:hover:border-[#3D4154] hover:shadow-xs"
            }`}
          >
            {/* Vengeance UI Dynamic Mouse-Tracking Spotlight Glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(250px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 0, 0, 0.04), transparent 80%)",
              }}
            />
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:block hidden"
              style={{
                background:
                  "radial-gradient(280px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.05), transparent 80%)",
              }}
            />

            {/* Vengeance UI Technical Corner Brackets */}
            <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-gray-400 dark:border-[#484C61] opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-gray-400 dark:border-[#484C61] opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-gray-400 dark:border-[#484C61] opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-gray-400 dark:border-[#484C61] opacity-40 group-hover:opacity-100 transition-opacity" />

            {/* Top Indicator bar on active */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#2B2D3A] dark:bg-[#7E84A3]" />
            )}

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9DA1B4]">
                {stat.label}
              </span>
              <div
                className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#2B2D3A] text-white dark:bg-[#343748] dark:text-[#F0F2F5]"
                    : "bg-gray-100 text-gray-600 dark:bg-[#252733] dark:text-[#9DA1B4] group-hover:bg-gray-200 dark:group-hover:bg-[#2E3140]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="relative z-10 mt-3 sm:mt-4 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black tracking-tighter font-mono text-gray-900 dark:text-[#F0F2F5]">
                <AnimatedNumber value={stat.value} durationMs={450} />
              </span>
              <span className="text-[10px] font-mono text-gray-400 dark:text-[#7A7E94] uppercase font-semibold">
                {isActive ? "Active Filter" : "Click to filter"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}


