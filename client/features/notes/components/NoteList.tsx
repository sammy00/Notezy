"use client";

import { motion } from "framer-motion";
import { Note } from "../types/note";
import NoteCard from "./NoteCard";

type Props = {
  notes?: Note[];
  activeId: string;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onFavorite: (note: Note) => void;
  onPin: (note: Note) => void;
  isLoading?: boolean;
  newNoteId?: string;
  viewMode: "list" | "grid";
  isTrashView?: boolean;
};

export default function NoteList({
  notes,
  activeId,
  onSelect,
  onDelete,
  onRestore,
  onPermanentDelete,
  onDuplicate,
  onFavorite,
  onPin,
  isLoading,
  newNoteId,
  viewMode,
  isTrashView,
}: Props) {
  const safeNotes = Array.isArray(notes) ? notes : [];

  if (isLoading) {
    return <NoteListSkeleton viewMode={viewMode} />;
  }

  if (safeNotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        style={{
          minHeight: viewMode === "grid" ? 360 : 420,
          display: "grid",
          placeItems: "center",
          padding: viewMode === "grid" ? "44px 24px" : "34px 10px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(100%, 280px)",
            minHeight: 300,
            borderRadius: 30,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.58), rgba(245,241,255,0.30))",
            border: "1px solid rgba(255,255,255,0.72)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.82), 0 18px 42px rgba(88,78,136,0.10)",
          }}
        >
          <motion.div
            aria-hidden
            animate={{ y: [0, -5, 0], rotate: [-0.6, -0.2, -0.6] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative",
              width: 132,
              height: 118,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: "18px 5px 2px 24px",
                borderRadius: "18px 18px 8px 8px",
                background: "#C4DFE5",
                transform: "rotate(5deg)",
                boxShadow: "0 18px 28px rgba(75,74,122,0.13)",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: "10px 21px 8px 8px",
                borderRadius: "18px 18px 8px 8px",
                background: "#FCDCE1",
                transform: "rotate(-6deg)",
                boxShadow: "0 16px 26px rgba(75,74,122,0.11)",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: "0 14px 16px 14px",
                borderRadius: "18px 18px 7px 7px",
                background: "#F0D9EF",
                border: "1px solid rgba(255,255,255,0.84)",
                boxShadow:
                  "0 10px 18px rgba(75,74,122,0.13), inset 0 1px 0 rgba(255,255,255,0.88)",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: 18,
                height: 18,
                borderRadius: "50%",
                transform: "translateX(-50%)",
                background:
                  "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.95), #8B6CE6 52%, #5B42B8)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.75) inset, 0 6px 10px rgba(63,45,128,0.22)",
              }}
            />
          </motion.div>

          <div style={{ position: "relative", zIndex: 1, padding: "0 22px" }}>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 20,
                fontWeight: 680,
                lineHeight: 1.2,
                color: "#18254B",
              }}
            >
              No notes yet
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.55,
                fontWeight: 520,
                color: "rgba(67,75,119,0.68)",
              }}
            >
              Start writing your ideas.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      viewMode === "grid" ? "repeat(3, minmax(0, 1fr))" : "minmax(0, 1fr)",

    gridAutoRows: viewMode === "grid" ? "166px" : "156px",

    gap: viewMode === "grid" ? 22 : 20,

    paddingTop: 8,
    paddingBottom: 44,
    paddingLeft: 2,
    paddingRight: viewMode === "grid" ? 2 : 0,
    width: "100%",
    boxSizing: "border-box",
    alignItems: "stretch",
  }}
>
      {safeNotes.map((note, index) => (
        <NoteCard
          key={note.id}
          note={note}
          index={index}
          isActive={activeId === note.id}
          isNew={newNoteId === note.id}
          onSelect={() => onSelect(note)}
          onDelete={() => onDelete(note.id)}
          onRestore={() => onRestore(note.id)}
          onPermanentDelete={() => onPermanentDelete(note.id)}
          onDuplicate={() => onDuplicate(note.id)}
          onFavorite={() => onFavorite(note)}
          onPin={() => onPin(note)}
          viewMode={viewMode}
          isTrashView={isTrashView}
        />
      ))}
    </div>
  );
}

function NoteListSkeleton({ viewMode }: { viewMode: "list" | "grid" }) {
  const count = viewMode === "grid" ? 6 : 4;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          viewMode === "grid" ? "repeat(3, minmax(0, 1fr))" : "minmax(0, 1fr)",
        gridAutoRows: viewMode === "grid" ? "166px" : "156px",
        gap: viewMode === "grid" ? 22 : 20,
        paddingTop: 8,
        paddingBottom: 44,
        paddingLeft: 2,
        paddingRight: viewMode === "grid" ? 2 : 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: index * 0.04 }}
          style={{
            height: "100%",
            borderRadius: "18px 18px 8px 8px",
            overflow: "hidden",
            background:
              index % 3 === 0
                ? "#EAF2FF"
                : index % 3 === 1
                  ? "#F7DADB"
                  : "#E8DDF5",
            border: "1px solid rgba(255,255,255,0.68)",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.82)",
            opacity: 0.58,
            padding: viewMode === "grid" ? "22px 24px" : "28px",
          }}
        >
          <motion.div
            animate={{ opacity: [0.35, 0.72, 0.35] }}
            transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <span
              style={{
                width: "46%",
                height: 18,
                borderRadius: 999,
                background: "rgba(255,255,255,0.68)",
              }}
            />
            <span
              style={{
                width: "78%",
                height: 11,
                borderRadius: 999,
                background: "rgba(255,255,255,0.48)",
              }}
            />
            <span
              style={{
                width: "58%",
                height: 11,
                borderRadius: 999,
                background: "rgba(255,255,255,0.42)",
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
