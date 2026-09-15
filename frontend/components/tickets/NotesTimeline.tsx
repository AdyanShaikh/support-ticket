import { NoteItem } from "@/types/ticket";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { MessageSquare, Clock, Shield } from "lucide-react";

interface NotesTimelineProps {
  notes: NoteItem[];
}

export default function NotesTimeline({ notes }: NotesTimelineProps) {
  if (notes.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No notes yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Add an internal note or status update using the action panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {notes.map((note) => (
          <div key={note.id} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            </div>

            {/* Note bubble */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  Support Agent
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
                {note.note_text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
