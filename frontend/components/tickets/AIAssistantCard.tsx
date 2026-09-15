"use client";

import { useState, useRef } from "react";
import { AIAssistantResult } from "@/types/ticket";
import { analyzeTicketWithAI } from "@/lib/api";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Tag,
  AlertTriangle,
  FileText,
  MessageSquareReply,
  CornerDownLeft,
} from "lucide-react";

interface AIAssistantCardProps {
  ticketId: string;
  onUseDraft?: (draft: string) => void;
}

export default function AIAssistantCard({ ticketId, onUseDraft }: AIAssistantCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeTicketWithAI(ticketId);
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "AI analysis is currently unavailable.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.suggested_response) return;
    navigator.clipboard.writeText(result.suggested_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityStyle = (priority: string) => {
    const p = priority?.toLowerCase();
    if (p === "high") {
      return "bg-rose-500/10 text-rose-600 dark:text-[#F87171] border-rose-200 dark:border-[#52252B] font-bold";
    }
    if (p === "medium") {
      return "bg-amber-500/10 text-amber-600 dark:text-[#FBBF24] border-amber-200 dark:border-[#4E3917] font-semibold";
    }
    return "bg-slate-500/10 text-slate-600 dark:text-[#94A3B8] border-slate-200 dark:border-[#2D3344] font-medium";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl border border-gray-200/80 dark:border-[#2A2C38] bg-white dark:bg-[#1E2028] overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
    >
      {/* Soft spotlight hover glow layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background:
            "radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.02), transparent 80%)",
        }}
      />

      {/* Header */}
      <div className="relative z-20 p-4 sm:p-5 border-b border-gray-100 dark:border-[#2A2C38] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-[#282B38] dark:text-[#7EA8F8] border border-indigo-100/80 dark:border-[#35394B] shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F0F2F5]">
              AI Ticket Assistant
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-[#8E93A6]">
              Automated triage & response recommendation
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-analyze-ai"
          onClick={handleAnalyze}
          disabled={loading}
          className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white dark:text-[#E2E4EB] bg-[#343844] dark:bg-[#2A2D3B] hover:bg-[#404654] dark:hover:bg-[#343849] border border-[#343844] dark:border-[#383C4E] rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{result ? "Re-analyze" : "Analyze Ticket"}</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="relative z-20 p-4 sm:p-5 space-y-4 text-sm">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-[#1E2028] border border-rose-200/60 dark:border-[#353849] text-rose-800 dark:text-[#F0F2F5] text-xs">
            <p className="font-semibold">AI analysis is currently unavailable.</p>
            <p className="text-slate-500 dark:text-[#8E93A6] mt-1 font-mono">{error}</p>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="py-8 text-center text-slate-500 dark:text-[#8E93A6] text-xs space-y-1.5">
            <p className="font-medium text-slate-700 dark:text-[#D1D5DB]">Click &quot;Analyze Ticket&quot; to formulate intelligent triage</p>
            <p className="text-[11px] text-slate-400 dark:text-[#6C7082]">
              Executive summary • Category • Suggested priority • Customer draft
            </p>
          </div>
        )}

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center space-y-2.5 text-xs text-slate-700 dark:text-[#F0F2F5]">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600 dark:text-[#7EA8F8]" />
            <p className="font-mono">Synthesizing conversation context with Gemini AI...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Badges: Category, Priority, & AI Engine */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-[#181920] text-slate-700 dark:text-[#A0A4B4] border border-gray-200/80 dark:border-[#2A2C38]">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{result.category}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border ${getPriorityStyle(
                  result.suggested_priority
                )}`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Priority: {result.suggested_priority}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-[#181920] text-slate-700 dark:text-[#F0F2F5] border border-gray-200/80 dark:border-[#2A2C38]">
                <Sparkles className="w-3 h-3 text-amber-500 dark:text-[#E8B668]" />
                <span>Powered by Google Gemini</span>
              </span>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#A0A4B4]">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Issue Summary</span>
              </div>
              <p className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#181920] border border-gray-200/70 dark:border-[#2A2C38] text-xs text-slate-700 dark:text-[#D1D5DB] leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Suggested Response */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-[#A0A4B4]">
                <span className="flex items-center gap-1.5">
                  <MessageSquareReply className="w-3.5 h-3.5 text-slate-400" />
                  <span>Suggested Customer Response</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-[#8E93A6] hover:text-slate-800 dark:hover:text-[#F0F2F5] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Draft</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={5}
                  value={result.suggested_response}
                  className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50/70 dark:bg-[#181920] border border-gray-200/80 dark:border-[#2E303D] text-slate-800 dark:text-[#F0F2F5] resize-none focus:outline-none"
                />
              </div>

              {onUseDraft && (
                <button
                  type="button"
                  onClick={() => onUseDraft(result.suggested_response)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white dark:text-[#E2E4EB] bg-[#343844] dark:bg-[#2A2D3B] hover:bg-[#404654] dark:hover:bg-[#343849] border border-[#343844] dark:border-[#383C4E] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Insert Draft into Reply Box</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

