"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function NotezyDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => value ? new Date(`${value}T12:00:00`) : new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const today = toDateKey(new Date());

  useEffect(() => {
    if (!open) return;
    const closePicker = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closePicker);
    return () => document.removeEventListener("mousedown", closePicker);
  }, [open]);

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const start = new Date(year, month, 1 - firstDay);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, key: toDateKey(date), currentMonth: date.getMonth() === month };
    });
  }, [visibleMonth]);

  const selectedLabel = value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })
    : "Select a date";
  const moveMonth = (amount: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const selectDate = (key: string) => {
    onChange(key);
    setVisibleMonth(new Date(`${key}T12:00:00`));
    setOpen(false);
  };

  return <div className="task-date-picker" ref={rootRef}>
    <button className={`task-date-trigger${open ? " open" : ""}`} type="button" onClick={() => { if (!open && value) setVisibleMonth(new Date(`${value}T12:00:00`)); setOpen((current) => !current); }} aria-expanded={open} aria-haspopup="dialog">
      <CalendarDays size={15} /><span className={value ? "selected" : ""}>{selectedLabel}</span><ChevronDown size={14} />
    </button>
    <AnimatePresence>{open && <motion.div className="task-date-popover" role="dialog" aria-label="Choose due date" initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: .98 }} transition={{ duration: .16 }}>
      <header><button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={15} /></button><strong>{visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" })}</strong><button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={15} /></button></header>
      <div className="task-date-weekdays">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="task-date-grid">{days.map(({ date, key, currentMonth }) => <button className={`${currentMonth ? "" : "outside"}${key === today ? " today" : ""}${key === value ? " selected" : ""}`} type="button" key={key} onClick={() => selectDate(key)} aria-label={date.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} aria-pressed={key === value}>{date.getDate()}</button>)}</div>
      <footer><button type="button" onClick={() => selectDate(today)}>Today</button>{value && <button type="button" onClick={() => { onChange(""); setOpen(false); }}>Clear date</button>}</footer>
    </motion.div>}</AnimatePresence>
  </div>;
}
