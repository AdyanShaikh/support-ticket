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
      return "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold";
    }
    if (p === "medium") {
      return "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-400 dark:border-zinc-600 font-semibold";
    }
    return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 font-medium";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs hover:shadow-[0_0_35px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.08)] transition-all duration-300"
    >
      {/* Vengeance UI Spotlight hover glow layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background:
            "radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.07), transparent 80%)",
        }}
      />

      {/* Vengeance UI CAD Corner Brackets */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-zinc-400/40 dark:border-zinc-500/40 pointer-events-none z-20" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-zinc-400/40 dark:border-zinc-500/40 pointer-events-none z-20" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-zinc-400/40 dark:border-zinc-500/40 pointer-events-none z-20" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-zinc-400/40 dark:border-zinc-500/40 pointer-events-none z-20" />

      {/* Header */}
      <div className="relative z-20 p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              AI Ticket Assistant
            </h3>
            <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              Automated multi-turn triage & reply drafting
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-analyze-ai"
          onClick={handleAnalyze}
          disabled={loading}
          className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white dark:text-black bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-black dark:border-white rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs">
            <p className="font-bold uppercase tracking-wider">AI analysis is currently unavailable.</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-mono">{error}</p>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs space-y-1.5">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Click &quot;Analyze Ticket&quot; to formulate intelligent triage</p>
            <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              Executive summary • Category • Suggested priority • Customer draft
            </p>
          </div>
        )}

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center space-y-2.5 text-xs text-zinc-950 dark:text-zinc-100">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="font-mono">Synthesizing conversation context with Gemini AI...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Badges: Category, Priority, & AI Engine */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                <Tag className="w-3 h-3 text-zinc-500" />
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

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800">
                <Sparkles className="w-3 h-3" />
                <span>Powered by Google Gemini</span>
              </span>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                <FileText className="w-3.5 h-3.5" />
                <span>Issue Summary</span>
              </div>
              <p className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Suggested Response */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <MessageSquareReply className="w-3.5 h-3.5" />
                  <span>Suggested Customer Response</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="font-bold">Copied!</span>
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
                  className="w-full p-3 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none"
                />
              </div>

              {onUseDraft && (
                <button
                  type="button"
                  onClick={() => onUseDraft(result.suggested_response)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white dark:text-black bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-black dark:border-white rounded-xl shadow-xs transition-all"
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

