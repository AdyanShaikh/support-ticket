"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase();
    if (p === "high") return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    if (p === "medium") return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  };

  return (
    <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-indigo-100 dark:border-indigo-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              AI Ticket Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated triage & response draft
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-analyze-ai"
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-xs hover:shadow transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{result ? "Re-analyze" : "Analyze Ticket"}</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 text-sm">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs">
            <p className="font-semibold">AI analysis is currently unavailable.</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">{error}</p>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs space-y-1">
            <p>Click &quot;Analyze Ticket&quot; to generate an instant triage:</p>
            <p className="text-slate-400 dark:text-slate-500">
              Executive summary • Category • Suggested priority • Customer draft
            </p>
          </div>
        )}

        {loading && (
          <div className="py-6 flex flex-col items-center justify-center space-y-2 text-xs text-indigo-600 dark:text-indigo-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Analyzing ticket contents and formulating triage recommendations...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Badges: Category, Priority, & AI Engine */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                <Tag className="w-3 h-3 text-slate-500" />
                <span>{result.category}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${getPriorityColor(
                  result.suggested_priority
                )}`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Priority: {result.suggested_priority}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Powered by Google Gemini</span>
              </span>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Issue Summary</span>
              </div>
              <p className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Suggested Response */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <MessageSquareReply className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Suggested Customer Response</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Copied!
                      </span>
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
                  className="w-full p-2.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
                />
              </div>

              {onUseDraft && (
                <button
                  type="button"
                  onClick={() => onUseDraft(result.suggested_response)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 rounded-lg transition-all"
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
