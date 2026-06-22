"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardPlus, X } from "lucide-react";
import { NoteCategory } from "@/features/notes/types/note";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { JobApplicationData } from "./tasksApi";

export type TaskTemplate = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: NoteCategory;
  title: string;
  priority: "low" | "medium" | "high";
  checklist: string[];
  jobApplication?: JobApplicationData;
};

const TASK_TEMPLATES: TaskTemplate[] = [
  { id: "job", emoji: "💼", name: "Job Application", description: "Track every step from resume to follow-up.", title: "TomTom - Frontend Engineer", category: "work", priority: "high", checklist: ["Update Resume", "Submit Application", "Complete Assessment", "Schedule Interview", "Send Follow-up"], jobApplication: { company: "TomTom", position: "Frontend Engineer", location: "Madrid, Spain", source: "LinkedIn", appliedDate: new Date().toISOString(), status: "applied" } },
  { id: "meeting", emoji: "👥", name: "Meeting Actions", description: "Turn meeting decisions into clear follow-ups.", title: "Meeting Follow-up", category: "work", priority: "medium", checklist: ["Send Notes", "Assign Action Items", "Update Documentation", "Schedule Next Meeting"] },
  { id: "study", emoji: "📚", name: "Study Plan", description: "Build a focused and repeatable study session.", title: "Study Session", category: "personal", priority: "medium", checklist: ["Learn Topic", "Practice Exercises", "Review Notes", "Complete Quiz"] },
  { id: "weekly", emoji: "📅", name: "Weekly Planner", description: "Give every weekday a clear focus.", title: "Weekly Planner", category: "personal", priority: "high", checklist: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  { id: "routine", emoji: "☀️", name: "Personal Routine", description: "Structure a balanced day from morning to evening.", title: "Daily Routine", category: "personal", priority: "low", checklist: ["Morning — Exercise", "Morning — Journal", "Afternoon — Deep Work", "Evening — Review Day"] },
];

export default function TaskTemplatePicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (template?: TaskTemplate) => void }) {
  const [mounted, setMounted] = useState(false);
  const { mode } = useTheme();
  const dark = mode === "dark";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose, open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="task-template-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
          <motion.section className="task-template-dialog" data-theme={mode} role="dialog" aria-modal="true" aria-labelledby="task-template-title" initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} transition={{ duration: .24, ease: [0.22, 0.61, 0.36, 1] }}>
            <div className="task-template-heading">
              <div>
                <h2 id="task-template-title">Choose a Task Template</h2>
                <p>Start with a useful workflow or create one blank task.</p>
              </div>
              <button type="button" aria-label="Close task templates" onClick={onClose}><X size={17} /></button>
            </div>
            <div className="task-template-grid">
              <TemplateCard name="Blank Task" description="Write one task from scratch." blank onClick={() => onSelect()} dark={dark} />
              {TASK_TEMPLATES.map((template) => <TemplateCard key={template.id} emoji={template.emoji} name={template.name} description={template.description} onClick={() => onSelect(template)} dark={dark} />)}
            </div>
            <p className="task-template-tip">Templates create editable tasks only inside your Tasks workspace.</p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function TemplateCard({ emoji, name, description, onClick, blank, dark }: { emoji?: string; name: string; description: string; onClick: () => void; blank?: boolean; dark: boolean }) {
  return (
    <motion.button type="button" className="task-template-card" onClick={onClick} whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: .97 }} transition={{ type: "spring", stiffness: 280, damping: 23 }}>
      <span>{blank ? <ClipboardPlus size={18} color={dark ? "#C5B4FF" : "#7C5CE0"} /> : emoji}</span>
      <strong>{name}</strong>
      <small>{description}</small>
    </motion.button>
  );
}
