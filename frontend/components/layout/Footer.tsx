import { ShieldCheck, Database, Server, Layout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50/50 py-6 dark:border-slate-800 dark:bg-slate-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Datastraw Technologies — Support CRM Assessment</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-indigo-500" />
            Next.js 15
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-teal-500" />
            FastAPI REST API
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            PostgreSQL / SQLAlchemy
          </span>
        </div>
      </div>
    </footer>
  );
}
