import { NoteItem } from "@/types/ticket";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Clock, Shield, User, MessageCircle, Headphones } from "lucide-react";

interface NotesTimelineProps {
  customerName: string;
  initialDescription?: string;
  createdAt?: string;
  notes: NoteItem[];
}

export default function NotesTimeline({
  customerName,
  initialDescription,
  createdAt,
  notes,
}: NotesTimelineProps) {
  // Parse note sender and clean text
  const parseNote = (rawText: string) => {
    if (rawText.startsWith("[Customer]:")) {
      return {
        sender: "customer",
        text: rawText.replace("[Customer]:", "").trim(),
      };
    }
    if (rawText.startsWith("[Customer]")) {
      return {
        sender: "customer",
        text: rawText.replace("[Customer]", "").trim(),
      };
    }
    if (rawText.startsWith("[Agent]:")) {
      return {
        sender: "agent",
        text: rawText.replace("[Agent]:", "").trim(),
      };
    }
    if (rawText.startsWith("[Agent]")) {
      return {
        sender: "agent",
        text: rawText.replace("[Agent]", "").trim(),
      };
    }
    return {
      sender: "agent",
      text: rawText,
    };
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {/* First Message: Customer's Original Issue Description */}
        {initialDescription && (
          <div className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>

            {/* Bubble */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{customerName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Customer (Initial Request)
                  </span>
                </span>
                {createdAt && (
                  <span
                    className="flex items-center gap-1 text-slate-400"
                    title={formatDate(createdAt)}
                  >
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(createdAt)}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {initialDescription}
              </p>
            </div>
          </div>
        )}

        {/* Chronological Replies */}
        {notes.map((note) => {
          const { sender, text } = parseNote(note.note_text);
          const isCustomerSender = sender === "customer";

          return (
            <div key={note.id} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-6 top-2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs ${
                  isCustomerSender ? "bg-emerald-500" : "bg-indigo-600"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>

              {/* Message bubble */}
              <div
                className={`p-4 rounded-2xl border shadow-xs space-y-2 transition-all ${
                  isCustomerSender
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60"
                    : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span
                    className={`flex items-center gap-1.5 font-semibold ${
                      isCustomerSender
                        ? "text-emerald-800 dark:text-emerald-300"
                        : "text-indigo-800 dark:text-indigo-300"
                    }`}
                  >
                    {isCustomerSender ? (
                      <>
                        <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{customerName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          Customer
                        </span>
                      </>
                    ) : (
                      <>
                        <Headphones className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Support Agent</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          Staff
                        </span>
                      </>
                    )}
                  </span>
                  <span
                    className="flex items-center gap-1 text-slate-400"
                    title={formatDate(note.created_at)}
                  >
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(note.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {text}
                </p>
              </div>
            </div>
          );
        })}

        {notes.length === 0 && !initialDescription && (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <MessageCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No messages in conversation yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
