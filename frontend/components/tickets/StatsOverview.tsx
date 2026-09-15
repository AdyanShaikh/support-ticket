import { TicketListItem } from "@/types/ticket";
import { Layers, CircleDot, Clock, CheckCircle2 } from "lucide-react";

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
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
      activeRing: "ring-2 ring-indigo-500",
    },
    {
      label: "Open",
      value: openCount,
      filterKey: "Open",
      icon: CircleDot,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      activeRing: "ring-2 ring-emerald-500",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      filterKey: "In Progress",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      activeRing: "ring-2 ring-amber-500",
    },
    {
      label: "Closed",
      value: closedCount,
      filterKey: "Closed",
      icon: CheckCircle2,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
      activeRing: "ring-2 ring-slate-500",
    },
  ];

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
            className={`p-4 rounded-xl border text-left transition-all duration-150 bg-white dark:bg-slate-900 ${
              isActive
                ? `${stat.activeRing} border-transparent shadow-md`
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stat.value}
            </div>
          </button>
        );
      })}
    </div>
  );
}
