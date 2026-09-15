import { NoteItem } from "@/types/ticket";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Clock, User, MessageCircle, Headphones } from "lucide-react";

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
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#2A2C38]">
        {/* First Message: Customer's Original Issue Description */}
        {initialDescription && (
          <div className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-slate-600 dark:bg-[#7E84A3] border-2 border-slate-100 dark:border-[#2A2C38] flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#14151A]"></div>
            </div>

            {/* Bubble */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#181920] border border-gray-200/80 dark:border-[#2A2C38] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8E93A6]">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-[#F0F2F5]">
                  <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#6C7082]" />
                  <span>{customerName}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200/70 dark:bg-[#242632] text-slate-700 dark:text-[#A0A4B4]">
                    Customer (Initial Request)
                  </span>
                </span>
                {createdAt && (
                  <span
                    className="flex items-center gap-1 font-mono text-slate-400 dark:text-[#6C7082]"
                    title={formatDate(createdAt)}
                  >
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(createdAt)}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-800 dark:text-[#E2E4EB] whitespace-pre-wrap leading-relaxed">
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
                className={`absolute -left-6 top-2 w-4 h-4 rounded-full border-2 border-white dark:border-[#14151A] flex items-center justify-center shadow-xs ${
                  isCustomerSender ? "bg-slate-400 dark:bg-[#6C7082]" : "bg-slate-700 dark:bg-[#7EA8F8]"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#14151A]"></div>
              </div>

              {/* Message bubble */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-2 transition-all ${
                  isCustomerSender
                    ? "bg-slate-50/80 dark:bg-[#181920] border-gray-200/80 dark:border-[#2A2C38] text-slate-800 dark:text-[#E2E4EB]"
                    : "bg-blue-50/40 text-slate-800 dark:bg-[#222530] dark:text-[#F0F2F5] border-blue-100/70 dark:border-[#313545] shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`flex items-center gap-1.5 font-semibold ${
                      isCustomerSender
                        ? "text-slate-800 dark:text-[#F0F2F5]"
                        : "text-slate-800 dark:text-[#F0F2F5]"
                    }`}
                  >
                    {isCustomerSender ? (
                      <>
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-[#6C7082]" />
                        <span>{customerName}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200/70 dark:bg-[#252733] text-slate-700 dark:text-[#A0A4B4]">
                          Customer
                        </span>
                      </>
                    ) : (
                      <>
                        <Headphones className="w-3.5 h-3.5 text-blue-600 dark:text-[#7EA8F8]" />
                        <span>Support Staff</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100/70 text-blue-800 dark:bg-[#2C303E] dark:text-[#7EA8F8]">
                          Agent
                        </span>
                      </>
                    )}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-mono text-[11px] ${
                      isCustomerSender
                        ? "text-slate-400 dark:text-[#6C7082]"
                        : "text-slate-400 dark:text-[#8E93A6]"
                    }`}
                    title={formatDate(note.created_at)}
                  >
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(note.created_at)}
                  </span>
                </div>
                <p
                  className={`text-sm whitespace-pre-wrap leading-relaxed ${
                    isCustomerSender
                      ? "text-slate-700 dark:text-[#D1D5DB]"
                      : "text-slate-800 dark:text-[#E2E4EB] font-normal"
                  }`}
                >
                  {text}
                </p>
              </div>
            </div>
          );
        })}

        {notes.length === 0 && !initialDescription && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-[#2A2C38] bg-zinc-50 dark:bg-[#181920]">
            <MessageCircle className="w-8 h-8 mx-auto text-zinc-400 dark:text-[#6C7082] mb-2" />
            <p className="text-sm font-mono font-medium text-zinc-600 dark:text-[#8E93A6]">
              No messages in conversation yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

