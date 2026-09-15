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
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-[#2A2C38]">
        {/* First Message: Customer's Original Issue Description */}
        {initialDescription && (
          <div className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-zinc-900 dark:bg-[#7E84A3] border-2 border-zinc-200 dark:border-[#2A2C38] flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#14151A]"></div>
            </div>

            {/* Bubble */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-[#181920] border border-zinc-200 dark:border-[#2A2C38] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-[#8E93A6]">
                <span className="flex items-center gap-1.5 font-bold text-zinc-950 dark:text-[#F0F2F5]">
                  <User className="w-3.5 h-3.5 text-zinc-500 dark:text-[#6C7082]" />
                  <span>{customerName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-zinc-200 dark:bg-[#242632] text-zinc-800 dark:text-[#A0A4B4]">
                    Customer (Initial Request)
                  </span>
                </span>
                {createdAt && (
                  <span
                    className="flex items-center gap-1 font-mono text-zinc-400 dark:text-[#6C7082]"
                    title={formatDate(createdAt)}
                  >
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(createdAt)}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-900 dark:text-[#E2E4EB] whitespace-pre-wrap leading-relaxed">
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
                  isCustomerSender ? "bg-zinc-500 dark:bg-[#6C7082]" : "bg-zinc-900 dark:bg-[#7EA8F8]"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#14151A]"></div>
              </div>

              {/* Message bubble */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-2 transition-all ${
                  isCustomerSender
                    ? "bg-zinc-100 dark:bg-[#181920] border-zinc-200 dark:border-[#2A2C38] text-zinc-900 dark:text-[#E2E4EB]"
                    : "bg-zinc-900 text-white dark:bg-[#222530] dark:text-[#F0F2F5] border border-zinc-900 dark:border-[#313545] shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`flex items-center gap-1.5 font-bold ${
                      isCustomerSender
                        ? "text-zinc-950 dark:text-[#F0F2F5]"
                        : "text-white dark:text-[#F0F2F5]"
                    }`}
                  >
                    {isCustomerSender ? (
                      <>
                        <User className="w-3.5 h-3.5 text-zinc-500 dark:text-[#6C7082]" />
                        <span>{customerName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-zinc-200 dark:bg-[#252733] text-zinc-800 dark:text-[#A0A4B4]">
                          Customer
                        </span>
                      </>
                    ) : (
                      <>
                        <Headphones className="w-3.5 h-3.5 text-[#7EA8F8]" />
                        <span>Support Staff</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-white/20 dark:bg-[#2C303E] text-white dark:text-[#7EA8F8]">
                          Agent
                        </span>
                      </>
                    )}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-mono text-[11px] ${
                      isCustomerSender
                        ? "text-zinc-400 dark:text-[#6C7082]"
                        : "text-zinc-400 dark:text-[#8E93A6]"
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
                      ? "text-zinc-800 dark:text-[#D1D5DB]"
                      : "text-zinc-100 dark:text-[#E2E4EB] font-medium"
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

