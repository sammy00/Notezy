"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Briefcase, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleDot, ClipboardCheck,
  Clock3, Copy, ExternalLink, Filter, Flag, FolderOpen, LayoutGrid, Link2, List, LoaderCircle, MoreHorizontal,
  Plus, Search, SlidersHorizontal, Trash2, X, Zap,
} from "lucide-react";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { showToast } from "@/shared/toast";
import { getNoteCategoryLabel, NoteCategory } from "@/features/notes/types/note";
import { Note } from "@/features/notes/types/note";
import { fetchNotes } from "@/features/notes/api/notesApi";
import { ApplicationStatus, createTask, deleteTask, fetchTasks, getTasksCacheKey, Task, updateTask } from "./tasksApi";
import TaskTemplatePicker, { TaskTemplate } from "./TaskTemplatePicker";
import { NotezyDatePicker } from "./NotezyDatePicker";

const COUNTS_EVENT = "notezy:update-category-counts";
const SEARCH_EVENT = "notezy:set-note-search";
const NEW_TASK_EVENT = "notezy:create-task";
type View = "list" | "board" | "calendar";
type Scope = "today" | "upcoming" | "completed" | "overdue" | "important";

const readCache = (): Task[] => {
  try {
    const value = localStorage.getItem(getTasksCacheKey());
    return value ? (JSON.parse(value) as Task[]) : [];
  } catch { return []; }
};
const writeCache = (tasks: Task[]) => localStorage.setItem(getTasksCacheKey(), JSON.stringify(tasks));
const dateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const todayKey = () => dateKey();
const dateTimeInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function NotezyReminderPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [datePart = "", timePart = "09:00"] = value.split("T");
  return <div className="task-reminder-picker"><NotezyDatePicker value={datePart} onChange={(date) => onChange(date ? `${date}T${timePart || "09:00"}` : "")} /><NotezyTimePicker value={timePart || "09:00"} onChange={(time) => onChange(datePart ? `${datePart}T${time}` : `${dateKey()}T${time}`)} /></div>;
}

function NotezyTimePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const slots = useMemo(() => Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2);
    const minutes = index % 2 ? 30 : 0;
    const key = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const label = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
    return { key, label };
  }), []);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const label = new Date(2000, 0, 1, Number(value.slice(0, 2)), Number(value.slice(3, 5))).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  return <div className="task-time-picker" ref={rootRef}><button className={open ? "open" : ""} type="button" onClick={() => setOpen((current) => !current)}><Clock3 size={13} /><span>{label}</span><ChevronDown size={12} /></button><AnimatePresence>{open && <motion.div className="task-time-popover" initial={{ opacity: 0, y: -5, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }} transition={{ duration: .15 }}>{slots.map((slot) => <button className={slot.key === value ? "selected" : ""} type="button" key={slot.key} onClick={() => { onChange(slot.key); setOpen(false); }}>{slot.label}{slot.key === value && <Check size={11} />}</button>)}</motion.div>}</AnimatePresence></div>;
}
const dueKey = (task: Task) => {
  if (!task.dueDate) return "";
  const dueDate = new Date(task.dueDate);
  return Number.isNaN(dueDate.getTime()) ? "" : dateKey(dueDate);
};
const isTaskCompleted = (task: Task) => task.completed || task.status === "completed";
const isToday = (task: Task) => Boolean(dueKey(task)) && dueKey(task) === todayKey();
const isUpcoming = (task: Task) => !isTaskCompleted(task) && Boolean(dueKey(task)) && dueKey(task) > todayKey();
const isOverdue = (task: Task) => !isTaskCompleted(task) && Boolean(dueKey(task)) && dueKey(task) < todayKey();
const isMyDay = (task: Task) => !isTaskCompleted(task) && (task.myDay || isToday(task));
const dueLabel = (task: Task) => {
  if (!task.dueDate) return "No date";
  if (isOverdue(task)) return "Overdue";
  if (dueKey(task) === todayKey()) return "Today";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(task.dueDate));
};
const checklistItems = (items: string[]) => items.map((text) => ({ id: crypto.randomUUID(), text, completed: false }));

export default function TaskWorkspace() {
  const { mode } = useTheme();
  const router = useRouter();
  const dark = mode === "dark";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<View>("list");
  const [scope, setScope] = useState<Scope>("today");
  const [query, setQuery] = useState("");
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState<Task | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | "all">("all");
  const [sortNewest, setSortNewest] = useState(true);
  const quickAddRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      const cached = readCache();
      setTasks(cached);
      setIsLoading(false);
    });
    void fetchTasks().then((next) => {
      if (!cancelled) { setTasks(next); writeCache(next); }
    }).catch((error) => console.warn("Using cached tasks.", error))
      .finally(() => !cancelled && setIsLoading(false));
    void fetchNotes().then((next) => !cancelled && setNotes(next)).catch(() => undefined);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    const search = (event: Event) => {
      const nextQuery = (event as CustomEvent<{ query?: string }>).detail?.query ?? "";
      setQuery(nextQuery);
      if (nextQuery.trim()) setView("list");
    };
    window.addEventListener(SEARCH_EVENT, search);
    return () => window.removeEventListener(SEARCH_EVENT, search);
  }, []);

  const openCount = tasks.filter((task) => !isTaskCompleted(task)).length;
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(COUNTS_EVENT, { detail: { mainCounts: { tasks: openCount } } }));
  }, [openCount]);

  const stats = useMemo(() => {
    const week = new Date(); week.setDate(week.getDate() + 7);
    return {
      today: tasks.filter(isMyDay).length,
      upcoming: tasks.filter((task) => isUpcoming(task) && dueKey(task) <= dateKey(week)).length,
      completed: tasks.filter(isTaskCompleted).length,
      overdue: tasks.filter(isOverdue).length,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...tasks].filter((task) => {
      const scopeMatch = scope === "completed" ? isTaskCompleted(task)
        : scope === "overdue" ? isOverdue(task)
        : scope === "important" ? !isTaskCompleted(task) && task.priority === "high"
          : scope === "upcoming" ? isUpcoming(task)
            : isMyDay(task);
      const searchableText = [task.title, task.description, task.category, task.priority, task.status, task.relatedNoteTitle, task.checklist.map((item) => item.text).join(" "), task.jobApplication?.company, task.jobApplication?.position, task.jobApplication?.location, task.jobApplication?.source, task.jobApplication?.status].filter(Boolean).join(" ").toLowerCase();
      return (normalized || scopeMatch)
        && (normalized || categoryFilter === "all" || task.category === categoryFilter)
        && (!normalized || searchableText.includes(normalized));
    }).sort((a, b) => {
      const left = a.updatedAt ?? a.createdAt ?? "";
      const right = b.updatedAt ?? b.createdAt ?? "";
      return sortNewest ? right.localeCompare(left) : left.localeCompare(right);
    });
  }, [categoryFilter, query, scope, sortNewest, tasks]);

  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;

  const saveTask = useCallback(async (id: string, changes: Partial<Task>) => {
    const previous = tasks;
    const next = tasks.map((task) => task.id === id ? { ...task, ...changes } : task);
    setTasks(next); writeCache(next);
    try {
      const saved = await updateTask(id, changes);
      setTasks((current) => { const synced = current.map((task) => task.id === id ? saved : task); writeCache(synced); return synced; });
    } catch (error) {
      console.warn("Task update failed.", error); setTasks(previous); writeCache(previous); showToast("Task could not be updated");
    }
  }, [tasks]);

  const addTask = async (
    title = newTask.trim(),
    details: Partial<Omit<Task, "id" | "title" | "createdAt" | "updatedAt">> = {},
  ) => {
    if (!title || isAdding) return;
    setIsAdding(true);
    const { category = "personal", ...taskDetails } = details;
    const dueDate = taskDetails.dueDate ?? new Date().toISOString();
    const optimisticTask: Task = {
      id: `optimistic-${crypto.randomUUID()}`,
      title,
      completed: taskDetails.completed ?? taskDetails.status === "completed",
      status: taskDetails.status ?? "not-started",
      priority: taskDetails.priority ?? "medium",
      category,
      dueDate,
      description: taskDetails.description ?? "",
      checklist: taskDetails.checklist ?? [],
      relatedNoteId: taskDetails.relatedNoteId ?? "",
      relatedNoteTitle: taskDetails.relatedNoteTitle ?? "",
      myDay: taskDetails.myDay ?? false,
      template: taskDetails.template ?? "",
      jobApplication: taskDetails.jobApplication,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((current) => { const next = [optimisticTask, ...current]; writeCache(next); return next; });
    setNewTask("");
    setScope(optimisticTask.completed ? "completed" : dueKey(optimisticTask) > todayKey() ? "upcoming" : "today");
    setIsAdding(false);
    showToast("Task Created");

    void createTask(title, category, { ...taskDetails, dueDate }).then((saved) => {
      setTasks((current) => {
        const next = current.map((task) => task.id === optimisticTask.id ? saved : task);
        writeCache(next);
        return next;
      });
      setSelectedId((current) => current === optimisticTask.id ? saved.id : current);
    }).catch((error) => {
      console.warn("Task creation failed.", error);
      setTasks((current) => {
        const next = current.filter((task) => task.id !== optimisticTask.id);
        writeCache(next);
        return next;
      });
      setSelectedId((current) => current === optimisticTask.id ? "" : current);
      showToast("Task could not be saved");
    });

    return optimisticTask;
  };

  const openTaskDraft = useCallback((date = dateKey()) => {
    const dueDate = date.includes("T") ? date : new Date(`${date}T12:00:00`).toISOString();
    const now = new Date().toISOString();
    setTemplateDraft({ id: `template-draft-${crypto.randomUUID()}`, title: "Untitled Task", completed: false, status: "not-started", priority: "medium", category: "personal", dueDate, description: "", checklist: [], relatedNoteId: "", relatedNoteTitle: "", myDay: dueKey({ dueDate } as Task) === todayKey(), template: "", createdAt: now, updatedAt: now });
  }, []);

  useEffect(() => {
    const createTask = () => openTaskDraft();
    window.addEventListener(NEW_TASK_EVENT, createTask);
    return () => window.removeEventListener(NEW_TASK_EVENT, createTask);
  }, [openTaskDraft]);

  const applyTemplate = async (template?: TaskTemplate) => {
    setTemplateOpen(false);
    if (!template) { requestAnimationFrame(() => openTaskDraft()); return; }
    const now = new Date().toISOString();
    setTemplateDraft({
      id: `template-draft-${crypto.randomUUID()}`,
      title: template.title,
      completed: false,
      status: "not-started",
      category: template.category,
      priority: template.priority,
      dueDate: now,
      description: template.description,
      checklist: checklistItems(template.checklist),
      template: template.id,
      jobApplication: template.jobApplication,
      relatedNoteId: "",
      relatedNoteTitle: "",
      myDay: false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const commitTemplateDraft = (changes: Partial<Task>) => {
    if (!templateDraft) return;
    const completeDraft = { ...templateDraft, ...changes };
    const { id: _id, title, createdAt: _createdAt, updatedAt: _updatedAt, category, ...details } = completeDraft;
    void _id; void _createdAt; void _updatedAt;
    void addTask(title, { ...details, category });
    setTemplateDraft(null);
  };

  const removeTask = async (task: Task) => {
    const previous = tasks; const next = tasks.filter((item) => item.id !== task.id);
    setTasks(next); writeCache(next); setSelectedId("");
    try { await deleteTask(task.id); showToast("Task Deleted"); }
    catch { setTasks(previous); writeCache(previous); showToast("Task could not be deleted"); }
  };

  const toggleTaskSelection = (id: string) => setSelectedTasks((current) => current.includes(id) ? current.filter((taskId) => taskId !== id) : [...current, id]);

  const bulkUpdate = async (changes: Partial<Task>) => {
    if (!selectedTasks.length) return;
    // Snapshot the selection because the toolbar closes before API requests finish.
    const ids = new Set(selectedTasks);
    const previous = tasks;
    const next = tasks.map((task) => ids.has(task.id) ? { ...task, ...changes } : task);
    setTasks(next); writeCache(next); setSelectedTasks([]);
    try {
      const savedTasks = await Promise.all(selectedTasks.map((id) => updateTask(id, changes)));
      const savedById = new Map(savedTasks.map((task) => [task.id, task]));
      setTasks((current) => { const synced = current.map((task) => savedById.get(task.id) ?? task); writeCache(synced); return synced; });
      showToast(`${selectedTasks.length} tasks updated`);
    } catch (error) {
      console.warn("Bulk task update failed.", error); setTasks(previous); writeCache(previous); showToast("Tasks could not be updated", "error");
    }
  };

  const bulkDelete = async () => {
    if (!selectedTasks.length) return;
    const ids = new Set(selectedTasks);
    const previous = tasks;
    setTasks((current) => { const next = current.filter((task) => !ids.has(task.id)); writeCache(next); return next; });
    setSelectedTasks([]);
    try {
      await Promise.all([...ids].map(deleteTask));
      showToast(`${ids.size} tasks deleted`);
    } catch (error) {
      console.warn("Bulk task delete failed.", error); setTasks(previous); writeCache(previous); showToast("Tasks could not be deleted", "error");
    }
  };

  const duplicateTask = async (task: Task) => {
    const copy = await addTask(`${task.title} Copy`, { ...task, checklist: task.checklist.map((item) => ({ ...item, id: crypto.randomUUID() })) });
    if (copy) setSelectedId(copy.id);
  };

  const text = dark ? "#F6F2FF" : "#172142";
  const muted = dark ? "#A5B0CA" : "#727B99";

  const templateTask = templateDraft ?? (selectedTask?.template ? selectedTask : null);
  if (templateTask) {
    const isDraft = Boolean(templateDraft);
    return <TaskDetails fullPage task={templateTask} notes={notes} onClose={() => { setTemplateDraft(null); setSelectedId(""); }} onSave={(changes) => isDraft ? setTemplateDraft((current) => current ? { ...current, ...changes } : current) : void saveTask(templateTask.id, changes)} onCommit={isDraft ? commitTemplateDraft : undefined} onDelete={() => isDraft ? setTemplateDraft(null) : void removeTask(templateTask)} onDuplicate={() => isDraft ? undefined : void duplicateTask(templateTask)} onOpenNote={(noteId) => { window.dispatchEvent(new CustomEvent("notezy:open-note", { detail: { noteId } })); router.push("/app"); }} />;
  }

  return (
    <motion.section className="tasks-v2" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>
      <header className="tasks-v2-header">
        <div className="tasks-v2-title"><span><ClipboardCheck size={25} /></span><div><h1 style={{ color: text }}>Tasks</h1><p style={{ color: muted }}>Stay organized and get things done.</p></div></div>
        <div className="tasks-v2-actions">
          <div className="tasks-filter-wrap"><button type="button" onClick={() => setFilterOpen((open) => !open)}><Filter size={15} /> Filter</button>
            {filterOpen && <div className="tasks-filter-popover">{(["all", "personal", "work", "journal", "ideas"] as const).map((item) => <button key={item} className={categoryFilter === item ? "active" : ""} onClick={() => { setCategoryFilter(item); setFilterOpen(false); }}>{item === "all" ? "All workspaces" : getNoteCategoryLabel(item)}</button>)}</div>}
          </div>
          <button type="button" onClick={() => setSortNewest((value) => !value)}><SlidersHorizontal size={15} /> Sort</button>
          <button className="templates" type="button" onClick={() => setTemplateOpen(true)}><ClipboardCheck size={15} /> Templates</button>
          <button className="primary" type="button" onClick={() => openTaskDraft()}><Plus size={16} /> New Task</button>
        </div>
      </header>

      <div className="tasks-stats">
        <Stat active={scope === "today"} icon={<CalendarDays />} value={stats.today} label="Today" detail="Today’s focus" tone="orange" onClick={() => { setScope("today"); setView("list"); }} />
        <Stat active={scope === "upcoming"} icon={<Clock3 />} value={stats.upcoming} label="Upcoming" detail="Next 7 days" tone="amber" onClick={() => { setScope("upcoming"); setView("list"); }} />
        <Stat active={scope === "completed"} icon={<CheckCircle2 />} value={stats.completed} label="Completed" detail="All time" tone="green" onClick={() => { setScope("completed"); setView("list"); }} />
        <Stat active={scope === "overdue"} icon={<Flag />} value={stats.overdue} label="Overdue" detail="Needs attention" tone="red" onClick={() => { setScope("overdue"); setView("list"); }} />
      </div>

      <div className="tasks-viewbar">
        <div>{(["list", "board", "calendar"] as View[]).map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item === "list" ? <List /> : item === "board" ? <LayoutGrid /> : <CalendarDays />}{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
        <label><Search size={15} /><input value={query} onChange={(event) => window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: { query: event.target.value } }))} placeholder="Search tasks..." /></label>
      </div>

      <AnimatePresence>{selectedTasks.length > 0 && <motion.div className="tasks-bulk-bar" initial={{ opacity: 0, y: -7, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .98 }}><strong>{selectedTasks.length} selected</strong><button type="button" onClick={() => void bulkUpdate({ completed: true, status: "completed" })}><CheckCircle2 /> Mark Complete</button><button type="button" onClick={() => void bulkUpdate({ priority: "high" })}><Flag /> Important</button><button type="button" onClick={() => void bulkUpdate({ myDay: true, dueDate: new Date().toISOString() })}><CalendarDays /> Move to Today</button><label>Priority<select defaultValue="" onChange={(event) => { if (event.target.value) void bulkUpdate({ priority: event.target.value as Task["priority"] }); }}><option value="" disabled>Change</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><button className="danger" type="button" onClick={() => void bulkDelete()}><Trash2 /> Delete</button><button className="cancel" type="button" onClick={() => setSelectedTasks([])}><X /> Cancel</button></motion.div>}</AnimatePresence>

      {view === "list" && <TaskList tasks={visibleTasks} scope={scope} setScope={setScope} loading={isLoading} text={text} muted={muted} selectedTasks={selectedTasks} onToggleSelection={toggleTaskSelection} onToggle={(task) => void saveTask(task.id, { completed: !task.completed, status: task.completed ? "not-started" : "completed" })} onSelect={setSelectedId} onQuickAdd={() => quickAddRef.current?.focus()} onNew={() => openTaskDraft()} onTemplates={() => setTemplateOpen(true)} />}
      {view === "board" && <TaskBoard tasks={tasks.filter((task) => categoryFilter === "all" || task.category === categoryFilter)} text={text} muted={muted} onSelect={setSelectedId} onNew={() => openTaskDraft()} />}
      {view === "calendar" && <TaskCalendar tasks={tasks} text={text} muted={muted} onSelect={setSelectedId} onNew={openTaskDraft} />}

      <form className="tasks-quick-entry" onSubmit={(event) => { event.preventDefault(); void addTask(); }}><Plus size={16} /><input ref={quickAddRef} value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a new task..." /><button disabled={!newTask.trim() || isAdding}>{isAdding ? <LoaderCircle className="animate-spin" size={15} /> : "Add"}</button></form>

      <TaskTemplatePicker open={templateOpen} onClose={() => setTemplateOpen(false)} onSelect={(template) => void applyTemplate(template)} />
      <AnimatePresence>{selectedTask && <TaskDetails key={selectedTask.id} task={selectedTask} notes={notes} onClose={() => setSelectedId("")} onSave={(changes) => void saveTask(selectedTask.id, changes)} onDelete={() => void removeTask(selectedTask)} onDuplicate={() => void duplicateTask(selectedTask)} onOpenNote={(noteId) => { window.dispatchEvent(new CustomEvent("notezy:open-note", { detail: { noteId } })); router.push("/app"); }} />}</AnimatePresence>
    </motion.section>
  );
}

function Stat({ icon, value, label, detail, tone, active, onClick }: { icon: React.ReactNode; value: number; label: string; detail: string; tone: string; active?: boolean; onClick: () => void }) {
  return <button type="button" className={`tasks-stat${active ? " active" : ""}`} onClick={onClick}><span className={`tone-${tone}`}>{icon}</span><strong>{value}</strong><div><b>{label}</b><small>{detail}</small></div></button>;
}

function TaskList({ tasks, scope, setScope, loading, text, muted, selectedTasks, onToggleSelection, onToggle, onSelect, onQuickAdd, onNew, onTemplates }: { tasks: Task[]; scope: Scope; setScope: (scope: Scope) => void; loading: boolean; text: string; muted: string; selectedTasks: string[]; onToggleSelection: (id: string) => void; onToggle: (task: Task) => void; onSelect: (id: string) => void; onQuickAdd: () => void; onNew: () => void; onTemplates: () => void }) {
  const longPressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const beginLongPress = (id: string) => {
    longPressed.current = false;
    // Long press enters selection mode on touch devices without completing the task.
    longPressTimer.current = window.setTimeout(() => { longPressed.current = true; onToggleSelection(id); }, 450);
  };
  const endLongPress = () => { if (longPressTimer.current) window.clearTimeout(longPressTimer.current); longPressTimer.current = null; };
  return <div className="tasks-list-surface">
    <div className="tasks-scope-tabs">{(["today", "upcoming", "completed", "overdue", "important"] as Scope[]).map((item) => <button className={scope === item ? "active" : ""} key={item} onClick={() => setScope(item)}>{item === "today" ? "Today" : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
    <div className="tasks-table-head"><span></span><span>Task</span><span>Workspace</span><span>Priority</span><span>Status</span><span>Due date</span></div>
    <div className="tasks-table-body">{loading ? <Empty loading text={text} muted={muted} /> : tasks.length ? tasks.map((task) => <motion.div layout className={`tasks-table-row${selectedTasks.includes(task.id) ? " selected" : ""}`} key={task.id} onClick={() => onSelect(task.id)}>
      <button className={`task-checkbox ${task.completed || selectedTasks.includes(task.id) ? "checked" : ""}${selectedTasks.includes(task.id) ? " selected" : ""}`} onPointerDown={() => beginLongPress(task.id)} onPointerUp={endLongPress} onPointerCancel={endLongPress} onPointerLeave={endLongPress} onClick={(event) => { event.stopPropagation(); endLongPress(); if (longPressed.current) { longPressed.current = false; return; } if (event.ctrlKey || event.metaKey || selectedTasks.length) onToggleSelection(task.id); else onToggle(task); }} title={selectedTasks.length ? "Select task" : "Complete task (Ctrl/Cmd-click to select)"}>{(task.completed || selectedTasks.includes(task.id)) && <Check size={13} />}</button>
      <strong className={task.completed ? "completed" : ""} style={{ color: text }}>{task.title}</strong>
      <span className="tasks-related-note">{task.relatedNoteTitle || getNoteCategoryLabel(task.category)}</span>
      <span className={`tasks-priority ${task.priority}`}>{task.priority}</span>
      <span className={`tasks-status ${isOverdue(task) ? "overdue" : task.status}`}>{isOverdue(task) ? "Overdue" : task.status.replace("-", " ")}</span>
      <span className={isOverdue(task) || dueKey(task) === todayKey() ? "due-alert" : ""}>{dueLabel(task)}</span>
    </motion.div>) : <Empty text={text} muted={muted} onNew={onNew} onTemplates={onTemplates} />}</div>
    <button className="tasks-add-row" onClick={onQuickAdd}><Plus size={14} /> Add new task</button>
  </div>;
}

function TaskBoard({ tasks, text, muted, onSelect, onNew }: { tasks: Task[]; text: string; muted: string; onSelect: (id: string) => void; onNew: () => void }) {
  const columns = [
    { id: "not-started", label: "Not Started", tasks: tasks.filter((task) => !isOverdue(task) && task.status === "not-started") },
    { id: "in-progress", label: "In Progress", tasks: tasks.filter((task) => !isOverdue(task) && task.status === "in-progress") },
    { id: "completed", label: "Completed", tasks: tasks.filter((task) => task.status === "completed") },
    { id: "overdue", label: "Overdue", tasks: tasks.filter(isOverdue) },
  ];
  return <div className="tasks-board">{columns.map((column) => <section key={column.id} className={`tasks-board-column column-${column.id}`}><header><b style={{ color: text }}>{column.label}</b><span>{column.tasks.length}</span><MoreHorizontal size={15} /></header><div>{column.tasks.map((task) => <button className="tasks-board-card" key={task.id} onClick={() => onSelect(task.id)}><strong style={{ color: text }}>{task.title}</strong><small style={{ color: muted }}>{task.relatedNoteTitle || getNoteCategoryLabel(task.category)}</small><footer><span className={`tasks-priority ${task.priority}`}>{task.priority}</span><time className={isOverdue(task) ? "due-alert" : ""}>{dueLabel(task)}</time></footer></button>)}</div><button className="tasks-board-add" onClick={onNew}><Plus size={13} /> Add task</button></section>)}</div>;
}

function TaskCalendar({ tasks, text, muted, onSelect, onNew }: { tasks: Task[]; text: string; muted: string; onSelect: (id: string) => void; onNew: (date?: string) => void }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const firstDayOffset = month.getDay();
  const gridStart = new Date(month.getFullYear(), month.getMonth(), 1 - firstDayOffset);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    return { date, key, currentMonth: date.getMonth() === month.getMonth(), tasks: tasks.filter((task) => dueKey(task) === key) };
  });
  const moveMonth = (amount: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));

  return <div className="tasks-month-calendar"><header><div><button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={15} /></button><button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={15} /></button><h2 style={{ color: text }}>{month.toLocaleDateString("en", { month: "long", year: "numeric" })}</h2></div><button className="today" type="button" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button></header><div className="tasks-calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div><div className="tasks-calendar-grid">{days.map((day) => <section className={`${day.currentMonth ? "" : "outside"}${day.key === todayKey() ? " today" : ""}`} key={day.key}><button className="day-number" type="button" onClick={() => onNew(day.key)} title="Create task on this date">{day.date.getDate()}</button><div>{day.tasks.slice(0, 3).map((task) => <button className={`calendar-task priority-${task.priority}${task.completed ? " completed" : ""}`} type="button" key={task.id} onClick={() => onSelect(task.id)} title={task.title}><i /><span style={{ color: text }}>{task.title}</span></button>)}{day.tasks.length > 3 && <small style={{ color: muted }}>+{day.tasks.length - 3} more</small>}</div></section>)}</div></div>;
}

function Empty({ loading, text, muted, onNew, onTemplates }: { loading?: boolean; text: string; muted: string; onNew?: () => void; onTemplates?: () => void }) {
  return <div className="tasks-empty">{loading ? <LoaderCircle className="animate-spin" /> : <span className="tasks-empty-icon"><ClipboardCheck /></span>}<strong style={{ color: text }}>{loading ? "Loading tasks..." : "Start organizing your work"}</strong><span style={{ color: muted }}>{loading ? "Gathering your workspace." : "Create your first task or use a template."}</span>{!loading && <div><button className="primary" type="button" onClick={onNew}><Plus size={13} /> New Task</button><button type="button" onClick={onTemplates}>Use a template</button></div>}</div>;
}

function TaskDetails({ task, notes, onClose, onSave, onCommit, onDelete, onDuplicate, onOpenNote, fullPage = false }: { task: Task; notes: Note[]; onClose: () => void; onSave: (changes: Partial<Task>) => void; onCommit?: (changes: Partial<Task>) => void; onDelete: () => void; onDuplicate: () => void; onOpenNote: (noteId: string) => void; fullPage?: boolean }) {
  const [itemText, setItemText] = useState("");
  const [draft, setDraft] = useState(() => ({
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: dueKey(task),
    category: task.category,
    relatedNoteId: task.relatedNoteId ?? "",
    myDay: task.myDay,
    description: task.description,
    jobCompany: task.jobApplication?.company ?? "",
    jobPosition: task.jobApplication?.position ?? "",
    jobLocation: task.jobApplication?.location ?? "",
    jobSource: task.jobApplication?.source ?? "LinkedIn",
    jobAppliedDate: task.jobApplication?.appliedDate ? dateKey(new Date(task.jobApplication.appliedDate)) : "",
    jobStatus: task.jobApplication?.status ?? "applied" as ApplicationStatus,
    jobReminderAt: dateTimeInputValue(task.jobApplication?.reminderAt),
  }));
  const done = task.checklist.filter((item) => item.completed).length;
  const updateChecklist = (checklist: Task["checklist"]) => onSave({ checklist });
  const saveAndClose = () => {
    const relatedNote = notes.find((note) => note.id === draft.relatedNoteId);
    (onCommit ?? onSave)({
      title: draft.title.trim() || "Untitled Task",
      status: draft.status,
      completed: draft.status === "completed",
      priority: draft.priority,
      dueDate: draft.dueDate ? new Date(`${draft.dueDate}T12:00:00`).toISOString() : undefined,
      category: draft.category,
      relatedNoteId: draft.relatedNoteId,
      relatedNoteTitle: relatedNote?.title ?? "",
      myDay: draft.myDay,
      description: draft.description,
      jobApplication: task.template === "job" ? {
        company: draft.jobCompany.trim(),
        position: draft.jobPosition.trim(),
        location: draft.jobLocation.trim(),
        source: draft.jobSource,
        appliedDate: draft.jobAppliedDate ? new Date(`${draft.jobAppliedDate}T12:00:00`).toISOString() : undefined,
        status: draft.jobStatus,
        reminderAt: draft.jobReminderAt ? new Date(draft.jobReminderAt).toISOString() : undefined,
      } : task.jobApplication,
    });
    onClose();
  };
  if (task.template === "job") {
    const stageNames = ["Resume", "Application", "Assessment", "Interview", "Follow-up"];
    const stages = stageNames.map((name, index) => ({
      name,
      item: task.checklist[index],
      completed: task.checklist[index]?.completed ?? false,
    }));
    const firstPending = stages.findIndex((stage) => !stage.completed);
    const currentIndex = firstPending === -1 ? stages.length - 1 : firstPending;
    const currentStep = stages[currentIndex];
    const nextStep = stages[Math.min(currentIndex + 1, stages.length - 1)];
    const companyInitials = draft.jobCompany.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "JA";
    const updateJobChecklist = (checklist: Task["checklist"]) => {
      const pendingIndex = checklist.findIndex((item) => !item.completed);
      const automaticStatus: ApplicationStatus = pendingIndex === 2 ? "assessment" : pendingIndex >= 3 ? "interview" : "applied";
      const nextStatus = draft.jobStatus === "offer" || draft.jobStatus === "rejected" ? draft.jobStatus : automaticStatus;
      setDraft((current) => ({ ...current, jobStatus: nextStatus }));
      onSave({ checklist, jobApplication: {
        company: draft.jobCompany,
        position: draft.jobPosition,
        location: draft.jobLocation,
        source: draft.jobSource,
        appliedDate: draft.jobAppliedDate ? new Date(`${draft.jobAppliedDate}T12:00:00`).toISOString() : undefined,
        status: nextStatus,
        reminderAt: draft.jobReminderAt ? new Date(draft.jobReminderAt).toISOString() : undefined,
      } });
    };

    return <motion.div className={fullPage ? "task-template-fullpage" : "task-detail-backdrop"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => !fullPage && event.target === event.currentTarget && onClose()}>
      <motion.aside className="task-detail-panel task-job-panel" initial={{ x: fullPage ? 0 : 45, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: fullPage ? 0 : 45, opacity: 0 }}>
        {fullPage && <button className="task-template-back" type="button" onClick={onClose}><ArrowLeft size={14} /> Back to Tasks</button>}
        <header><button className={`task-checkbox ${draft.status === "completed" ? "checked" : ""}`} onClick={() => setDraft((current) => ({ ...current, status: current.status === "completed" ? "not-started" : "completed" }))}>{draft.status === "completed" && <Check size={13} />}</button><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Company - Position" /><div><button onClick={onDuplicate} title="Duplicate"><Copy /></button><button onClick={onDelete} title="Delete"><Trash2 /></button>{!fullPage && <button onClick={onClose} title="Close"><X /></button>}</div></header>

        <section className="task-job-meta"><div className="task-company-avatar" aria-label={`${draft.jobCompany || "Company"} avatar`}>{companyInitials}</div><label><span>Company</span><input value={draft.jobCompany} onChange={(event) => setDraft((current) => ({ ...current, jobCompany: event.target.value }))} placeholder="Company name" /></label><label><span>Position</span><input value={draft.jobPosition} onChange={(event) => setDraft((current) => ({ ...current, jobPosition: event.target.value }))} placeholder="Role" /></label><label><span>Location</span><input value={draft.jobLocation} onChange={(event) => setDraft((current) => ({ ...current, jobLocation: event.target.value }))} placeholder="City, Country" /></label><label><span>Source</span><select value={draft.jobSource} onChange={(event) => setDraft((current) => ({ ...current, jobSource: event.target.value }))}><option>LinkedIn</option><option>Company Careers</option><option>Indeed</option><option>Referral</option><option>Recruiter</option><option>Other</option></select></label><label><span>Applied</span><NotezyDatePicker value={draft.jobAppliedDate} onChange={(value) => setDraft((current) => ({ ...current, jobAppliedDate: value }))} /></label></section>

        <section className="task-job-timeline" aria-label="Application progress">
          {stages.map((stage, index) => <div className={`task-job-stage${stage.completed ? " completed" : ""}${index === currentIndex ? " current" : ""}`} key={stage.name}>
            <button type="button" onClick={() => stage.item && updateJobChecklist(task.checklist.map((item, itemIndex) => itemIndex === index ? { ...item, completed: !item.completed } : item))}>{stage.completed ? <Check size={14} /> : index + 1}</button>
            <b>{stage.name}</b><small>{stage.completed ? "Completed" : index === currentIndex ? "In Progress" : "Pending"}</small>
          </div>)}
        </section>

        <div className="task-job-content">
          <section className="task-job-current"><div className="task-current-heading"><span><Briefcase size={18} /></span><div><small>Current Step</small><h3>{currentStep?.item?.text || currentStep?.name}</h3></div></div><p>{currentIndex === 0 ? "Prepare a focused resume for this opportunity." : currentIndex === 1 ? "Submit the application and confirm every detail." : currentIndex === 2 ? "Finish the assessment and review your answers." : currentIndex === 3 ? "Prepare examples and questions for the interview." : "Send a thoughtful follow-up to the hiring team."}</p><div className="task-job-current-stats"><span><b>{done} / {task.checklist.length}</b><small>Completed</small></span><span><b>{nextStep?.item?.text || nextStep?.name}</b><small>Next Action</small></span></div>{draft.dueDate && <time>Due: {new Date(`${draft.dueDate}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</time>}</section>

          <section className="task-job-checklist"><header><b>Checklist</b><span>{done} / {task.checklist.length} completed</span><i><span style={{ width: `${task.checklist.length ? done / task.checklist.length * 100 : 0}%` }} /></i></header><div>{task.checklist.map((item) => <label key={item.id}><button className={`task-checkbox ${item.completed ? "checked" : ""}`} onClick={() => updateJobChecklist(task.checklist.map((entry) => entry.id === item.id ? { ...entry, completed: !entry.completed } : entry))}>{item.completed && <Check size={12} />}</button><input className={item.completed ? "completed" : ""} defaultValue={item.text} onBlur={(event) => { const text = event.target.value.trim(); if (text && text !== item.text) updateJobChecklist(task.checklist.map((entry) => entry.id === item.id ? { ...entry, text } : entry)); }} /><button className="task-checklist-delete" type="button" title="Delete checklist item" onClick={() => updateJobChecklist(task.checklist.filter((entry) => entry.id !== item.id))}><Trash2 size={13} /></button></label>)}</div><form onSubmit={(event) => { event.preventDefault(); if (!itemText.trim()) return; updateJobChecklist([...task.checklist, { id: crypto.randomUUID(), text: itemText.trim(), completed: false }]); setItemText(""); }}><Plus size={14} /><input value={itemText} onChange={(event) => setItemText(event.target.value)} placeholder="Add checklist item" /></form></section>

          <div className="task-job-side"><section><h3>Details</h3><Field label="Status"><select className={`job-status-${draft.jobStatus}`} value={draft.jobStatus} onChange={(event) => setDraft((current) => ({ ...current, jobStatus: event.target.value as ApplicationStatus }))}><option value="applied">Applied</option><option value="assessment">Assessment</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="rejected">Rejected</option></select></Field><Field label="Priority"><select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Task["priority"] }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></Field><Field label="Due Date"><NotezyDatePicker value={draft.dueDate} onChange={(value) => setDraft((current) => ({ ...current, dueDate: value }))} /></Field><Field label="Workspace"><select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as NoteCategory }))}><option value="personal">Personal</option><option value="work">Work</option><option value="journal">Journal</option><option value="ideas">Ideas</option></select></Field><Field label="Reminder"><NotezyReminderPicker value={draft.jobReminderAt} onChange={(value) => setDraft((current) => ({ ...current, jobReminderAt: value }))} /></Field><Field label="Related Note"><select value={draft.relatedNoteId} onChange={(event) => setDraft((current) => ({ ...current, relatedNoteId: event.target.value }))}><option value="">None</option>{notes.map((note) => <option key={note.id} value={note.id}>{note.title}</option>)}</select></Field>{task.relatedNoteId && <button className="task-open-note" type="button" onClick={() => onOpenNote(task.relatedNoteId ?? "")}><ExternalLink size={13} /> Open Note</button>}</section><section className="task-job-notes"><h3>Notes</h3><textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Add company notes, contacts, and interview details..." /></section></div>
        </div>
        <footer className="task-detail-footer"><button className="primary" type="button" onClick={saveAndClose}><Check size={14} /> Save Application</button></footer>
      </motion.aside>
    </motion.div>;
  }
  return <motion.div className={fullPage ? "task-template-fullpage" : "task-detail-backdrop"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => !fullPage && event.target === event.currentTarget && onClose()}>
    <motion.aside className={`task-detail-panel${fullPage ? " task-template-page-panel" : ""}`} initial={{ x: fullPage ? 0 : 45, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: fullPage ? 0 : 45, opacity: 0 }}>
      {fullPage && <button className="task-template-back" type="button" onClick={onClose}><ArrowLeft size={14} /> Back to Tasks</button>}
      <header><button className={`task-checkbox ${draft.status === "completed" ? "checked" : ""}`} onClick={() => setDraft((current) => ({ ...current, status: current.status === "completed" ? "not-started" : "completed" }))}>{draft.status === "completed" && <Check size={13} />}</button><div className="task-title-editor"><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Untitled Task" /><div className="task-title-meta"><span>{getNoteCategoryLabel(draft.category)}</span><i /> <span>{draft.priority[0].toUpperCase() + draft.priority.slice(1)} priority</span>{draft.dueDate && <><i /><span>{new Date(`${draft.dueDate}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span></>}</div><small>{!task.id.startsWith("template-draft-") && task.updatedAt ? `Last edited ${new Date(task.updatedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}` : "Not saved yet"}</small></div><div><button onClick={onDuplicate} title="Duplicate"><Copy /></button><button onClick={onDelete} title="Delete"><Trash2 /></button>{!fullPage && <button onClick={onClose} title="Close"><X /></button>}</div></header>
      <div className="task-detail-content"><section className="task-detail-fields">
        <h2>Task Properties</h2>
        <Field icon={<CircleDot />} label="Status"><select className={`task-property-select status-${draft.status}`} value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as Task["status"] }))}><option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></Field>
        <Field icon={<Zap />} label="Priority"><select className={`task-property-select priority-${draft.priority}`} value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as Task["priority"] }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></Field>
        <Field icon={<CalendarDays />} label="Due Date"><NotezyDatePicker value={draft.dueDate} onChange={(value) => setDraft((current) => ({ ...current, dueDate: value }))} /></Field>
        <Field icon={<FolderOpen />} label="Workspace"><select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as NoteCategory }))}><option value="personal">Personal</option><option value="work">Work</option><option value="journal">Journal</option><option value="ideas">Ideas</option></select></Field>
        <Field icon={<Link2 />} label="Related Note"><select value={draft.relatedNoteId} onChange={(event) => setDraft((current) => ({ ...current, relatedNoteId: event.target.value }))}><option value="">None</option>{notes.map((note) => <option key={note.id} value={note.id}>{note.title}</option>)}</select></Field>
        {task.relatedNoteId && <button className="task-open-note" type="button" onClick={() => onOpenNote(task.relatedNoteId ?? "")}><ExternalLink size={13} /> Open Note</button>}
        <label className="task-detail-my-day"><input type="checkbox" checked={draft.myDay} onChange={(event) => setDraft((current) => ({ ...current, myDay: event.target.checked }))} /> Add to My Day</label>
        <label className="task-description"><b>Description</b><textarea value={draft.description} placeholder="Add details about this task..." onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
      </section><section className="task-detail-checklist"><header><b>Checklist</b><span>{done} / {task.checklist.length} Completed</span><i><span style={{ width: `${task.checklist.length ? done / task.checklist.length * 100 : 0}%` }} /></i></header>
        {!task.checklist.length && <div className="task-checklist-empty"><div style={{ background: "conic-gradient(#8b5cf6 0%, #ececf5 0)" }}><span>0%</span></div><strong>No checklist steps yet</strong><p>Add focused steps to make this task easier to finish.</p></div>}
        <div>{task.checklist.map((item) => <label key={item.id}><button className={`task-checkbox ${item.completed ? "checked" : ""}`} onClick={() => updateChecklist(task.checklist.map((entry) => entry.id === item.id ? { ...entry, completed: !entry.completed } : entry))}>{item.completed && <Check size={12} />}</button><input className={item.completed ? "completed" : ""} defaultValue={item.text} onBlur={(event) => { const text = event.target.value.trim(); if (text && text !== item.text) updateChecklist(task.checklist.map((entry) => entry.id === item.id ? { ...entry, text } : entry)); }} /><button className="task-checklist-delete" type="button" title="Delete checklist item" onClick={() => updateChecklist(task.checklist.filter((entry) => entry.id !== item.id))}><Trash2 size={13} /></button></label>)}</div>
        <form onSubmit={(event) => { event.preventDefault(); if (!itemText.trim()) return; updateChecklist([...task.checklist, { id: crypto.randomUUID(), text: itemText.trim(), completed: false }]); setItemText(""); }}><Plus size={14} /><input value={itemText} onChange={(event) => setItemText(event.target.value)} placeholder="Add checklist item" /></form>
      </section></div>
      <footer className="task-detail-footer"><button className="primary" type="button" onClick={saveAndClose}><Check size={14} /> Save Task</button></footer>
    </motion.aside>
  </motion.div>;
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) { return <label className="task-detail-field"><span>{icon}{label}</span>{children}</label>; }
