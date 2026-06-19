"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  Clipboard,
  Expand,
  FileDown,
  Highlighter,
  Home,
  Image as ImageIcon,
  Info,
  Italic,
  Briefcase,
  BookOpen,
  Lightbulb,
  List,
  MoreHorizontal,
  Palette,
  Pin,
  Redo2,
  Star,
  Trash2,
  Underline,
  Undo2,
} from "lucide-react";
import { NOTE_TONE_OPTIONS } from "../constants/noteToneOptions";
import { getNoteCategoryLabel, Note, NOTE_CATEGORIES } from "../types/note";
import SideToolbar, { ToolbarFormat } from "./SideToolbar";
import { NOTE_EDITOR_THEME, NOTE_THEME } from "@/shared/theme/notesThemes";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { formatEditorDate } from "../utils/formatDate";

const CATEGORY_CHIP_META = {
  personal: { icon: Home },
  work: { icon: Briefcase },
  journal: { icon: BookOpen },
  ideas: { icon: Lightbulb },
} as const;

const noteSwitchTransition = {
  duration: 0.28,
  ease: [0.22, 0.61, 0.36, 1],
} as const;

function SvgEmptyState({ onCreateNote }: { onCreateNote?: () => void }) {
  const { mode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="note-empty-surface"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 28,
        background:
          mode === "dark"
            ? "#20295A"
            : `
              radial-gradient(circle at 16% 14%, rgba(255,255,255,0.82), transparent 26%),
              radial-gradient(circle at 78% 18%, rgba(211,195,255,0.24), transparent 30%),
              radial-gradient(circle at 72% 86%, rgba(184,214,255,0.20), transparent 34%),
              linear-gradient(145deg, rgba(255,252,247,0.86), rgba(248,246,253,0.72))
            `,
        border:
          mode === "dark"
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.78)",
        boxShadow:
          mode === "dark"
            ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 20px 48px rgba(5,10,24,0.22)"
            : "inset 0 1px 0 rgba(255,255,255,0.92), 0 20px 48px rgba(70,76,116,0.08)",
        opacity: mode === "dark" ? 0.7 : 1,
      }}
    >
      <svg
        className="note-empty-svg"
        viewBox="0 0 1100 620"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <pattern id="notezy-empty-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.05" fill="#7864B0" opacity="0.24" />
          </pattern>
          <linearGradient id="notezy-empty-purple" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#6D4DE2" />
          </linearGradient>
          <linearGradient id="notezy-empty-paper" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#FFFCF7" />
            <stop offset="1" stopColor="#F2EBE1" />
          </linearGradient>
          <filter id="notezy-empty-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#473775" floodOpacity="0.17" />
          </filter>
          <filter id="notezy-empty-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#4C3696" floodOpacity="0.20" />
          </filter>
        </defs>

        <rect width="1100" height="620" fill="url(#notezy-empty-dots)" opacity="0.72" />
        <circle cx="118" cy="456" r="78" fill="#EEE4FF" opacity="0.58" />
        <circle cx="894" cy="132" r="112" fill="#E8E1FF" opacity="0.36" />

        <g filter="url(#notezy-empty-soft-shadow)" transform="translate(96 92) rotate(-8)">
          <rect width="132" height="34" rx="4" fill="#8B5CF6" opacity="0.46" />
          <path d="M0 7 H132 M0 18 H132 M0 29 H132" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="1" />
        </g>

        <g transform="translate(172 167)" fill="none" stroke="#6D4DE2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M84 7 C33 34 22 69 52 84 C78 97 100 78 89 58 C75 32 18 40 7 112" />
          <path d="M4 98 L7 112 L21 106" />
          <path d="M117 0 L125 16 L143 18 L130 31 L134 49 L117 40 L101 49 L105 31 L92 18 L110 16 Z" />
        </g>

        <g filter="url(#notezy-empty-shadow)" transform="translate(780 78) rotate(-2)">
          <rect width="138" height="132" rx="5" fill="#DCC4FF" />
          <circle cx="70" cy="-2" r="14" fill="url(#notezy-empty-purple)" />
          <text x="25" y="48" fill="#4F2D9B" fontFamily="Caveat, Kalam, cursive" fontSize="28">Ideas</text>
          <text x="25" y="80" fill="#4F2D9B" fontFamily="Caveat, Kalam, cursive" fontSize="28">become</text>
          <text x="25" y="112" fill="#4F2D9B" fontFamily="Caveat, Kalam, cursive" fontSize="28">things</text>
          <path d="M105 95 C111 84 128 87 126 101 C124 113 111 116 105 126 C99 116 86 113 84 101 C82 87 99 84 105 95 Z" fill="none" stroke="#6D4DE2" strokeWidth="2" />
        </g>

        <g filter="url(#notezy-empty-shadow)" transform="translate(910 172) rotate(14)">
          <rect width="160" height="204" rx="3" fill="url(#notezy-empty-paper)" />
          <path d="M22 40 H138 M22 66 H138 M22 92 H138 M22 118 H138 M22 144 H138" stroke="#D8CCBD" strokeWidth="1.4" />
          <path d="M34 26 h92" stroke="#EFE7DA" strokeWidth="8" strokeLinecap="round" strokeDasharray="8 9" />
          <path d="M46 84 C66 40 118 54 122 96 C126 126 98 144 88 166 H74 C66 145 38 126 46 84 Z" fill="none" stroke="#5B37C7" strokeWidth="3" />
          <path d="M74 178 H90 M72 188 H92" stroke="#5B37C7" strokeWidth="3" strokeLinecap="round" />
          <path d="M88 50 L86 66 M118 84 L132 74 M48 84 L34 74" stroke="#5B37C7" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        <g filter="url(#notezy-empty-shadow)" transform="translate(704 318) rotate(8)">
          <rect width="204" height="156" rx="5" fill="url(#notezy-empty-paper)" />
          <circle cx="102" cy="-2" r="14" fill="url(#notezy-empty-purple)" />
          <text x="74" y="58" fill="#4F2D9B" fontFamily="Caveat, Kalam, cursive" fontSize="28">Notezy</text>
          <path d="M66 70 C94 82 128 82 154 70" fill="none" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
          <path d="M62 45 L70 28 L78 45 M70 28 L86 36 L100 24 L111 39" fill="none" stroke="#5B37C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M160 38 L166 47 L176 48 L168 55 L171 65 L160 60 L150 65 L153 55 L145 48 L155 47 Z" fill="none" stroke="#7C3AED" strokeWidth="2" />
        </g>

        <g filter="url(#notezy-empty-shadow)" transform="translate(928 402) rotate(8)">
          <rect width="154" height="134" rx="4" fill="#DCC4FF" />
          <text x="32" y="46" fill="#4F2D9B" fontFamily="Caveat, Kalam, cursive" fontSize="28">Focus</text>
          <text x="32" y="78" fill="#4F2D9B" fontFamily="Caveat, Kalam, cursive" fontSize="28">Plan</text>
          <text x="32" y="110" fill="#4F2D9B" fontFamily="Caveat, Kalam, cursive" fontSize="28">Achieve</text>
          <path d="M14 40 l7 7 l13 -17 M14 72 l7 7 l13 -17 M14 104 l7 7 l13 -17" fill="none" stroke="#5B37C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g transform="translate(144 470) rotate(20)" fill="none" stroke="#6D4DE2" strokeWidth="6" strokeLinecap="round">
          <path d="M24 4 C4 4 4 33 24 33 H58 C82 33 82 68 58 68 H15" />
          <path d="M20 18 H58 C68 18 68 53 58 53 H14" strokeOpacity="0.55" />
        </g>

        <g transform="translate(80 490) rotate(-18)" filter="url(#notezy-empty-soft-shadow)">
          <circle cx="54" cy="54" r="52" fill="none" stroke="#8B5CF6" strokeWidth="22" strokeOpacity="0.44" strokeDasharray="10 10" />
          <circle cx="54" cy="54" r="30" fill="rgba(255,255,255,0.38)" />
        </g>

        <g transform="translate(532 126)" filter="url(#notezy-empty-soft-shadow)">
          <path d="M58 0 L112 31 V92 L58 124 L4 92 V31 Z" fill="url(#notezy-empty-purple)" opacity="0.85" />
          <path d="M58 8 L104 35 V88 L58 116 L12 88 V35 Z" fill="#FFFFFF" opacity="0.36" />
          <image href="/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png" x="25" y="27" width="66" height="66" preserveAspectRatio="xMidYMid meet" />
        </g>

        <g transform="translate(494 252)" textAnchor="middle">
          <text x="96" y="0" fill="#18254B" fontFamily="Plus Jakarta Sans, DM Sans, sans-serif" fontSize="29" fontWeight="800">Welcome to</text>
          <text x="236" y="0" fill="#7C3AED" fontFamily="Plus Jakarta Sans, DM Sans, sans-serif" fontSize="29" fontWeight="800">Notezy</text>
          <text x="166" y="36" fill="#596285" fontFamily="DM Sans, sans-serif" fontSize="14" fontWeight="600">Your creative space for notes, ideas</text>
          <text x="166" y="58" fill="#596285" fontFamily="DM Sans, sans-serif" fontSize="14" fontWeight="600">and everything in between.</text>
        </g>
      </svg>

      <div
        className="note-empty-copy"
        style={{
          position: "relative",
          zIndex: 3,
          width: "min(350px, 44%)",
          padding: "clamp(62px, 7vw, 112px) 0 0 clamp(34px, 5vw, 72px)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#18254B",
            fontFamily: "var(--font-hand)",
            fontSize: "clamp(36px, 3.2vw, 58px)",
            fontWeight: 700,
            lineHeight: 0.96,
            letterSpacing: 0,
          }}
        >
          What&apos;s on
          <br />
          <span
            style={{
              color: "#7C3AED",
              position: "relative",
              display: "inline-block",
            }}
          >
            your mind today?
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: -14,
                right: -12,
                bottom: -4,
                height: 16,
                border: "3px solid rgba(124,58,237,0.68)",
                borderTop: "none",
                borderRadius: "0 0 999px 999px",
                transform: "rotate(-2deg)",
              }}
            />
          </span>
        </p>
        <p
          style={{
            margin: "26px 0 0",
            color: "rgba(35,48,91,0.78)",
            fontSize: 14,
            fontWeight: 560,
            lineHeight: 1.62,
            maxWidth: 290,
          }}
        >
          Capture ideas, job opportunities, reminders, and plans before they
          disappear.
        </p>
        <button
          type="button"
          onClick={onCreateNote}
          style={{
            height: 46,
            marginTop: 32,
            padding: "0 24px",
            border: "none",
            borderRadius: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "linear-gradient(135deg, #8B5CF6, #6D4DE2)",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 820,
            cursor: "pointer",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.28), 0 16px 32px rgba(109,77,226,0.28)",
          }}
        >
          <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>
            +
          </span>
          Create First Note
        </button>
        <p
          style={{
            margin: "16px 0 0 30px",
            color: "rgba(92,74,150,0.72)",
            fontFamily: "var(--font-hand)",
            fontSize: 17,
            fontWeight: 600,
            transform: "rotate(-5deg)",
          }}
        >
          Start writing your ideas
        </p>
      </div>

      <div
        className="note-empty-feature-strip"
        style={{
          position: "absolute",
          left: "clamp(22px, 3vw, 42px)",
          right: "clamp(22px, 3vw, 42px)",
          bottom: "clamp(16px, 2vw, 26px)",
          zIndex: 4,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
          borderRadius: 22,
          padding: "16px 18px",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.76), rgba(248,247,253,0.48))",
          border: "1px solid rgba(255,255,255,0.78)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.92), 0 18px 38px rgba(70,76,116,0.10)",
        }}
      >
        {[
          ["All Your Notes", "Access everything in one place", "#8B5CF6", "N"],
          ["Stay Organized", "Categories, tags and tools", "#E66EAD", "C"],
          ["Anywhere Access", "Sync across devices", "#F4B73B", "S"],
          ["Secure & Private", "Your notes are safe", "#35B86B", "P"],
        ].map(([title, subtitle, color, icon]) => (
          <div
            key={title}
            className="note-empty-feature"
            style={{
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                color: "#FFFFFF",
                background: `linear-gradient(145deg, ${color}, ${color}BB)`,
                boxShadow: `0 12px 22px ${color}33, inset 0 1px 0 rgba(255,255,255,0.32)`,
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              {icon}
            </span>
            <span style={{ minWidth: 0, textAlign: "left" }}>
              <strong
                style={{
                  display: "block",
                  color: "#18254B",
                  fontSize: 12.5,
                  fontWeight: 880,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </strong>
              <span
                style={{
                  display: "block",
                  marginTop: 3,
                  color: "rgba(67,75,119,0.68)",
                  fontSize: 11.5,
                  fontWeight: 600,
                  lineHeight: 1.35,
                }}
              >
                {subtitle}
              </span>
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EmptyState({
  onCreateNote,
}: {
  onCreateNote?: () => void;
  recentNotes?: Note[];
}) {
  return <SvgEmptyState onCreateNote={onCreateNote} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "minmax(0, 1fr) auto",
        gap: 18,
        padding: "clamp(18px, 2vw, 28px)",
      }}
    >
      <div
        className="note-empty-hero"
        style={{
          position: "relative",
          minHeight: 0,
          overflow: "hidden",
          borderRadius: 24,
          background: `
            radial-gradient(circle at 16% 14%, rgba(255,255,255,0.82), transparent 26%),
            radial-gradient(circle at 76% 16%, rgba(211,195,255,0.26), transparent 30%),
            radial-gradient(circle at 72% 86%, rgba(184,214,255,0.22), transparent 34%),
            linear-gradient(145deg, rgba(255,252,247,0.92), rgba(248,246,253,0.82))
          `,
          border: "1px solid rgba(255,255,255,0.82)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.94), 0 20px 48px rgba(70,76,116,0.10)",
        }}
      >
        <span
          aria-hidden
          className="note-empty-dot-grid"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.34,
            backgroundImage:
              "radial-gradient(circle, rgba(94,75,158,0.24) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            pointerEvents: "none",
          }}
        />

        <div
          className="note-empty-copy"
          style={{
            position: "relative",
            zIndex: 3,
            width: "min(350px, 46%)",
            padding: "clamp(36px, 4vw, 70px) 0 0 clamp(32px, 4vw, 58px)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#18254B",
              fontFamily: "var(--font-hand)",
              fontSize: "clamp(34px, 3.1vw, 54px)",
              fontWeight: 700,
              lineHeight: 0.96,
              letterSpacing: 0,
            }}
          >
            What&apos;s on
            <br />
            <span
              style={{
                color: "#7C3AED",
                position: "relative",
                display: "inline-block",
              }}
            >
              your mind today?
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: -14,
                  right: -12,
                  bottom: -4,
                  height: 16,
                  border: "3px solid rgba(124,58,237,0.68)",
                  borderTop: "none",
                  borderRadius: "0 0 999px 999px",
                  transform: "rotate(-2deg)",
                }}
              />
            </span>
          </p>
          <p
            style={{
              margin: "26px 0 0",
              color: "rgba(35,48,91,0.78)",
              fontSize: 14,
              fontWeight: 560,
              lineHeight: 1.62,
              maxWidth: 290,
            }}
          >
            Capture ideas, job opportunities, reminders, and plans before they
            disappear.
          </p>
          <button
            type="button"
            onClick={onCreateNote}
            style={{
              height: 46,
              marginTop: 32,
              padding: "0 24px",
              border: "none",
              borderRadius: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "linear-gradient(135deg, #8B5CF6, #6D4DE2)",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 820,
              cursor: "pointer",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.28), 0 16px 32px rgba(109,77,226,0.28)",
            }}
          >
            <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>
              +
            </span>
            Create First Note
          </button>
          <p
            style={{
              margin: "16px 0 0 30px",
              color: "rgba(92,74,150,0.72)",
              fontFamily: "var(--font-hand)",
              fontSize: 17,
              fontWeight: 600,
              transform: "rotate(-5deg)",
            }}
          >
            Start writing your ideas
          </p>
        </div>

        <div className="note-empty-collage" aria-hidden>
          <span className="note-empty-tape note-empty-tape-left" />
          <span className="note-empty-arrow">↯</span>
          <span className="note-empty-spark">✦</span>
          <span className="note-empty-sticky note-empty-sticky-top">
            Ideas
            <br />
            become
            <br />
            things ♡
          </span>
          <span className="note-empty-paper note-empty-paper-lines" />
          <span className="note-empty-card-logo">
            <span>♕</span>
            <strong>Notezy</strong>
          </span>
          <span className="note-empty-sticky note-empty-sticky-checks">
            ✓ Focus
            <br />
            ✓ Plan
            <br />
            ✓ Achieve
          </span>
          <span className="note-empty-paperclip" />
          <span className="note-empty-washi" />
        </div>
      </div>

      <div
        className="note-empty-feature-strip"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
          borderRadius: 22,
          padding: "16px 18px",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.76), rgba(248,247,253,0.48))",
          border: "1px solid rgba(255,255,255,0.78)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.92), 0 18px 38px rgba(70,76,116,0.10)",
        }}
      >
        {[
          ["All Your Notes", "Access everything in one place", "#8B5CF6", "✦"],
          ["Stay Organized", "Categories, tags and tools", "#E66EAD", "◆"],
          ["Anywhere Access", "Sync across devices", "#F4B73B", "☁"],
          ["Secure & Private", "Your notes are safe", "#35B86B", "▣"],
        ].map(([title, subtitle, color, icon]) => (
          <div
            key={title}
            className="note-empty-feature"
          style={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "#FFFFFF",
              background: `linear-gradient(145deg, ${color}, ${color}BB)`,
              boxShadow: `0 12px 22px ${color}33, inset 0 1px 0 rgba(255,255,255,0.32)`,
              fontSize: 17,
              fontWeight: 900,
            }}
          >
            {icon}
          </span>
          <span style={{ minWidth: 0, textAlign: "left" }}>
            <strong
              style={{
                display: "block",
                color: "#18254B",
                fontSize: 12.5,
                fontWeight: 880,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </strong>
            <span
              style={{
                display: "block",
                marginTop: 3,
                color: "rgba(67,75,119,0.68)",
                fontSize: 11.5,
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {subtitle}
            </span>
          </span>
        </div>
        ))}
      </div>
    </motion.div>
  );
}

function getEditableBody(note: Note) {
  const lines = note.content.split("\n");

  if (lines[0]?.trim().startsWith("#")) {
    lines.shift();
  }

  while (lines[0]?.trim() === "") {
    lines.shift();
  }

  return lines.join("\n");
}

type Props = {
  note: Note | null | undefined;
  recentNotes?: Note[];
  onChange?: (id: string, title: string, body: string) => void;
  onUpdate?: (id: string, changes: Partial<Note>) => void;
  onDelete?: (id: string) => void;
  onCreateNote?: () => void;
  saveStatus?: "idle" | "saving" | "saved" | "deleted";
};

export default function NoteEditor({
  note,
  recentNotes,
  onChange,
  onUpdate,
  onDelete,
  onCreateNote,
  saveStatus = "idle",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const historyNoteIdRef = useRef<string | null>(null);
  const loadedEditorNoteIdRef = useRef<string | null>(null);
  const { mode } = useTheme();

  const saveEditorSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (
      editor.contains(range.commonAncestorContainer) ||
      editor === range.commonAncestorContainer
    ) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreEditorSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = savedRangeRef.current;

    if (!editor || !selection) {
      return;
    }

    editor.focus();

    if (!range) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  useEffect(() => {
    const handleSelectionChange = () => saveEditorSelection();

    document.addEventListener("selectionchange", handleSelectionChange);

    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  useEffect(() => {
    if (!note || !editorRef.current) {
      return;
    }

    if (loadedEditorNoteIdRef.current === note.id) {
      return;
    }

    const html = bodyToEditorHtml(getEditableBody(note));

    editorRef.current.innerHTML = html;
    loadedEditorNoteIdRef.current = note.id;
    historyNoteIdRef.current = note.id;
    historyRef.current = [html];
    historyIndexRef.current = 0;
    savedRangeRef.current = null;
  }, [note?.id]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  if (!note) {
    return <EmptyState onCreateNote={onCreateNote} recentNotes={recentNotes} />;
  }

  const t = NOTE_EDITOR_THEME[note.tone] ?? NOTE_EDITOR_THEME.paper;
  const bodyText = getEditableBody(note);
  const saveStatusLabel =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "deleted"
          ? "Deleted"
          : "Edited just now";
  const plainBodyText = bodyText
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = plainBodyText
    ? plainBodyText.split(/\s+/).filter(Boolean).length
    : 0;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const categoryMeta = CATEGORY_CHIP_META[note.category];
  const CategoryIcon = categoryMeta.icon;
  const categoryAccent = t.pin;
  const paperLiftShadow =
    mode === "dark"
      ? "0 20px 60px rgba(0,0,0,0.25)"
      : "0 20px 60px rgba(0,0,0,0.08)";
  const paperHoverLiftShadow =
    mode === "dark"
      ? "0 24px 68px rgba(0,0,0,0.28)"
      : "0 24px 68px rgba(0,0,0,0.10)";
  const editorBaseShadow = `0 0 24px ${t.pin}10, ${paperLiftShadow}, 0 0 0 1px rgba(255,255,255,0.40), inset 0 1px 0 rgba(255,255,255,0.98), inset 14px 0 32px rgba(255,255,255,0.24), inset -18px 0 34px rgba(116,82,128,0.040), inset 0 -24px 42px rgba(96,76,52,0.050)`;
  const editorHoverShadow = `0 0 28px ${t.pin}14, ${paperHoverLiftShadow}, 0 0 0 1px rgba(255,255,255,0.44), inset 0 1px 0 rgba(255,255,255,0.98), inset 14px 0 32px rgba(255,255,255,0.26), inset -18px 0 34px rgba(116,82,128,0.048), inset 0 -24px 42px rgba(96,76,52,0.055)`;

  const pushEditorHistory = (html: string) => {
    const current = historyRef.current[historyIndexRef.current];

    if (html === current) {
      return;
    }

    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(html);

    if (historyRef.current.length > 80) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current += 1;
    }
  };

  const setEditorHtml = (html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }

    onChange?.(note.id, note.title, html);
    saveEditorSelection();

    window.requestAnimationFrame(() => {
      if (editorRef.current && editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    });
  };

  const placeCaretAtEnd = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const insertHtmlAtSelection = (html: string, placeCaretInMarker = false) => {
    restoreEditorSelection();
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

    if (!selection || !range) {
      editorRef.current?.insertAdjacentHTML("beforeend", html);
      syncEditorContent();
      return;
    }

    range.deleteContents();

    const template = document.createElement("template");
    template.innerHTML = html;

    const fragment = template.content;
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);

    const marker = editorRef.current?.querySelector("[data-notezy-caret]");
    const nextRange = document.createRange();

    if (placeCaretInMarker && marker) {
      marker.removeAttribute("data-notezy-caret");
      nextRange.selectNodeContents(marker);
      nextRange.collapse(true);
    } else if (lastNode) {
      nextRange.setStartAfter(lastNode);
      nextRange.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(nextRange);
    savedRangeRef.current = nextRange.cloneRange();
    syncEditorContent();
  };

  const getSelectedEditorText = () => {
    restoreEditorSelection();
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    return text || "List item";
  };

  const insertList = (type: "bullet" | "numbered" | "checklist") => {
    const selectedText = getSelectedEditorText();
    const isPlaceholderList = selectedText === "List item";
    const lines = selectedText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const listStyle =
      "margin:0 0 0 24px;padding-left:20px;line-height:32px;list-style-position:outside;";
    const itemHtml = (line: string, index: number) =>
      `<li${isPlaceholderList && index === 0 ? ' data-notezy-caret="true"' : ""}>${
        isPlaceholderList ? "<br>" : escapeHtml(line)
      }</li>`;

    if (type === "bullet") {
      insertHtmlAtSelection(
        `<ul style="${listStyle}list-style-type:disc;">${lines
          .map(itemHtml)
          .join("")}</ul><div><br></div>`,
        isPlaceholderList,
      );
    }

    if (type === "numbered") {
      insertHtmlAtSelection(
        `<ol style="${listStyle}list-style-type:decimal;">${lines
          .map(itemHtml)
          .join("")}</ol><div><br></div>`,
        isPlaceholderList,
      );
    }

    if (type === "checklist") {
      insertHtmlAtSelection(
        lines
          .map(
            (line, index) =>
              `<div style="line-height:32px;"><label><input type="checkbox" />&nbsp;<span${
                isPlaceholderList && index === 0
                  ? ' data-notezy-caret="true"'
                  : ""
              }>${isPlaceholderList ? "<br>" : escapeHtml(line)}</span></label></div>`,
          )
          .join("") + "<div><br></div>",
        isPlaceholderList,
      );
    }
  };

  const syncEditorContent = () => {
    const html = editorRef.current?.innerHTML ?? "";
    pushEditorHistory(html);
    onChange?.(note.id, note.title, html);
    saveEditorSelection();
  };

  const applyToolbarFormat = (format: ToolbarFormat) => {
    restoreEditorSelection();

    if (format === "attachment-image") {
      imageInputRef.current?.click();
      return;
    }

    if (format === "attachment-file") {
      fileInputRef.current?.click();
      return;
    }

    if (format === "bold") document.execCommand("bold");
    if (format === "italic") document.execCommand("italic");
    if (format === "underline") document.execCommand("underline");
    if (format === "highlight-yellow")
      document.execCommand("backColor", false, "#FFF1A8");
    if (format === "highlight-pink")
      document.execCommand("backColor", false, "#FFD6E0");
    if (format === "highlight-mint")
      document.execCommand("backColor", false, "#D9F3DC");
    if (format === "highlight-blue")
      document.execCommand("backColor", false, "#DDEBFF");
    if (format === "highlight-lavender")
      document.execCommand("backColor", false, "#E9DDFF");
    if (format === "highlight-clear")
      document.execCommand("backColor", false, "transparent");
    if (format === "list-bullet") {
      insertList("bullet");
      return;
    }
    if (format === "list-numbered") {
      insertList("numbered");
      return;
    }
    if (format === "list-checklist") {
      insertList("checklist");
      return;
    }
    syncEditorContent();
  };

  const runNativeEditCommand = (command: "undo" | "redo") => {
    restoreEditorSelection();
    const currentHtml = editorRef.current?.innerHTML ?? "";
    const currentHistoryHtml =
      historyRef.current[historyIndexRef.current] ?? "";

    if (currentHtml && currentHtml !== currentHistoryHtml) {
      pushEditorHistory(currentHtml);
    }

    if (command === "undo" && historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const nextHtml = historyRef.current[historyIndexRef.current] ?? "";
      setEditorHtml(nextHtml);
      placeCaretAtEnd();
      return;
    }

    if (
      command === "redo" &&
      historyIndexRef.current < historyRef.current.length - 1
    ) {
      historyIndexRef.current += 1;
      const nextHtml = historyRef.current[historyIndexRef.current] ?? "";
      setEditorHtml(nextHtml);
      placeCaretAtEnd();
    }
  };

  const insertImageFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      restoreEditorSelection();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${reader.result}" alt="${file.name}" style="display:block;max-width:100%;max-height:220px;border-radius:14px;margin:8px 0;box-shadow:0 12px 28px rgba(45,38,82,.14);" />`,
      );
      syncEditorContent();
    };

    reader.readAsDataURL(file);
  };

  const insertAttachedFile = (file: File) => {
    const size = formatFileSize(file.size);

    insertHtmlAtSelection(
      `<a href="#" data-notezy-attachment="${escapeHtml(file.name)}" style="display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:6px 10px;margin:6px 0;border-radius:12px;background:#FFF8EE;border:1px solid rgba(214,202,184,.9);box-shadow:0 8px 18px rgba(45,38,82,.09);color:#4F4568;text-decoration:none;font-family:var(--font-ui);font-size:13px;font-weight:620;"><span style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;opacity:.58;">File</span><span>${escapeHtml(file.name)}</span><small style="opacity:.62;font-size:11px;">${size}</small></a>`,
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "grid",
        placeItems: "stretch",
        padding: 0,
        overflow: "visible",
      }}
    >
      <AnimatePresence>
        {isFullscreen && (
          <motion.button
            type="button"
            aria-label="Exit fullscreen"
            onClick={() => setIsFullscreen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9990,
              border: "none",
              background: "rgba(24,24,42,0.28)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              cursor: "zoom-out",
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.section
          className="note-editor-paper"
          key={note.id}
          initial={{ opacity: 0, y: 8, scale: 0.998, filter: "blur(2px)" }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            boxShadow: editorBaseShadow,
          }}
          exit={{ opacity: 0, y: -4, scale: 0.998, filter: "blur(2px)" }}
          whileHover={
            isFullscreen
              ? undefined
              : { y: -2, boxShadow: editorHoverShadow }
          }
          transition={{
            ...noteSwitchTransition,
            boxShadow: { duration: 0.22, ease: [0.22, 0.61, 0.36, 1] },
            layout: { duration: 0.24, ease: [0.22, 0.61, 0.36, 1] },
          }}
          style={{
            position: isFullscreen ? "fixed" : "relative",
            top: isFullscreen ? 46 : undefined,
            right: isFullscreen ? 46 : undefined,
            bottom: isFullscreen ? 46 : undefined,
            left: isFullscreen ? 46 : undefined,
            zIndex: isFullscreen ? 9991 : 1,
            width: isFullscreen ? "auto" : "100%",
            height: isFullscreen ? "auto" : "100%",
            minHeight: 0,
            borderRadius: 24,
            background:
              "linear-gradient(145deg, rgba(247,243,235,0.99), rgba(244,241,234,0.94))",
            border: "1px solid rgba(255,255,255,0.94)",
            boxShadow: editorBaseShadow,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.42,
              backgroundImage: `
                radial-gradient(circle at 16% 12%, rgba(139,92,246,0.08), transparent 28%),
                radial-gradient(circle at 78% 14%, rgba(96,165,250,0.08), transparent 30%),
                radial-gradient(circle at 38% 88%, rgba(251,191,36,0.06), transparent 34%),
                linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.014) 100%),
                repeating-radial-gradient(circle at 18% 24%, rgba(88,64,38,0.018) 0 0.7px, transparent 0.7px 5px),
                repeating-linear-gradient(92deg, rgba(92,73,120,0.012) 0 1px, transparent 1px 34px)
              `,
            }}
          />

          <div
            className="note-editor-header"
            style={{
              position: "relative",
              zIndex: 30,
              padding: "20px 42px 1px",
              display: "grid",
              gap: 5,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 18,
                alignItems: "start",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <input
                  aria-label="Note title"
                  className="note-editor-field note-editor-title"
                  value={note.title}
                  placeholder="Untitled Note"
                  onChange={(event) =>
                    onChange?.(note.id, event.target.value, bodyText)
                  }
                  style={{
                    width: "100%",
                    minWidth: 0,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    padding: 0,
                    fontFamily: "var(--font-ui)",
                    fontSize: "clamp(25px, 1.85vw, 32px)",
                    fontWeight: 760,
                    lineHeight: 1.12,
                    color: "#121A34",
                    caretColor: t.pin,
                    letterSpacing: 0,
                  }}
                />

                <div
                  style={{
                    marginTop: 7,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "rgba(69,76,112,0.62)",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Calendar size={15} strokeWidth={1.9} />
                  <span>{formatEditorDate(note.date) || "Today"}</span>
                  <span aria-hidden>•</span>
                  <motion.span
                    key={saveStatusLabel}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16 }}
                    style={{
                      color:
                        saveStatus === "saving"
                          ? t.pin
                          : saveStatus === "deleted"
                            ? "#EF4444"
                            : "inherit",
                    }}
                  >
                    {saveStatusLabel}
                  </motion.span>
                </div>

                <div
                  aria-label="Note metadata"
                  style={{
                    marginTop: 9,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                    color: "rgba(69,76,112,0.56)",
                    fontSize: 11,
                    fontWeight: 680,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "inline-flex",
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Note category"
                      onClick={() => {
                        setCategoryMenuOpen((open) => !open);
                        setColorMenuOpen(false);
                        setMenuOpen(false);
                      }}
                      style={{
                        border: "none",
                        outline: "none",
                        height: 27,
                        padding: "0 10px",
                        borderRadius: 999,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        color: categoryAccent,
                        background: `${categoryAccent}12`,
                        boxShadow: categoryMenuOpen
                          ? `inset 0 1px 0 rgba(255,255,255,0.78), 0 0 0 1px ${categoryAccent}36, 0 8px 18px ${categoryAccent}16`
                          : `inset 0 1px 0 rgba(255,255,255,0.72), 0 0 0 1px ${categoryAccent}22`,
                        fontSize: 11,
                        fontWeight: 820,
                        cursor: "pointer",
                        transition:
                          "background 180ms ease, box-shadow 180ms ease",
                      }}
                    >
                      <CategoryIcon size={13.5} strokeWidth={2.25} />
                      {getNoteCategoryLabel(note.category)}
                      <ChevronDown
                        aria-hidden
                        size={13}
                        strokeWidth={2.3}
                        style={{
                          transform: categoryMenuOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 160ms ease",
                        }}
                      />
                    </button>

                    <EditorCategoryMenu
                      open={categoryMenuOpen}
                      selectedCategory={note.category}
                      accent={categoryAccent}
                      onSelect={(category) => {
                        onUpdate?.(note.id, { category });
                        setCategoryMenuOpen(false);
                      }}
                    />
                  </div>
                  <span>{wordCount} words</span>
                  <span aria-hidden>•</span>
                  <span>{readMinutes} min read</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "rgba(42,50,92,0.72)",
                }}
              >
                <EditorIconButton
                  label={note.pinned ? "Unpin note" : "Pin note"}
                  active={note.pinned}
                  popOnPress
                  icon={<Pin size={19} strokeWidth={2} />}
                  onClick={() => onUpdate?.(note.id, { pinned: !note.pinned })}
                />
                <EditorIconButton
                  label={note.starred ? "Remove favorite" : "Favorite note"}
                  active={note.starred}
                  popOnPress
                  icon={<Star size={19} strokeWidth={2} />}
                  onClick={() =>
                    onUpdate?.(note.id, { starred: !note.starred })
                  }
                />
                <div style={{ position: "relative" }}>
                  <EditorIconButton
                    label="Change color"
                    active={colorMenuOpen}
                    icon={<Palette size={19} strokeWidth={2} />}
                    onClick={() => {
                      setColorMenuOpen((open) => !open);
                      setMenuOpen(false);
                      setCategoryMenuOpen(false);
                    }}
                  />
                  <EditorColorMenu
                    open={colorMenuOpen}
                    note={note}
                    onSelect={(tone) => {
                      onUpdate?.(note.id, { tone });
                      setColorMenuOpen(false);
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <EditorIconButton
                    label="More options"
                    active={menuOpen}
                    icon={<MoreHorizontal size={21} strokeWidth={2.2} />}
                    onClick={() => {
                      setMenuOpen((open) => !open);
                      setColorMenuOpen(false);
                      setCategoryMenuOpen(false);
                    }}
                  />
                  <EditorMenu
                    open={menuOpen}
                    note={note}
                    infoOpen={infoOpen}
                    onToggleInfo={() => setInfoOpen((open) => !open)}
                    onClose={() => setMenuOpen(false)}
                    onDelete={() => onDelete?.(note.id)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="note-editor-content"
            style={{
              position: "relative",
              zIndex: 2,
              flex: 1,
              minHeight: 0,
              margin: "8px 42px 66px",
              borderTop: "none",
              overflow: "hidden",
            }}
          >
            <div
              key={note.id}
              ref={editorRef}
              aria-label="Note body"
              className="note-editor-field note-editor-body"
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Write your note..."
              onBlur={() => {
                saveEditorSelection();
              }}
              onMouseUp={saveEditorSelection}
              onKeyUp={saveEditorSelection}
              onInput={(event) => {
                const html = event.currentTarget.innerHTML;
                pushEditorHistory(html);
                onChange?.(note.id, note.title, html);
                saveEditorSelection();
              }}
              spellCheck
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                minHeight: 0,
                border: "none",
                outline: "none",
                overflowY: "auto",
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 30px, ${t.line} 31px, transparent 32px)`,
                backgroundPosition: "0 0",
                backgroundAttachment: "local",
                padding: "6px 0 34px",
                margin: 0,
                scrollbarWidth: "none",
                fontFamily: "var(--font-hand)",
                fontSize: "clamp(21px, 1.65vw, 27px)",
                fontWeight: 500,
                color: "#18243E",
                lineHeight: "32px",
                caretColor: t.pin,
                whiteSpace: "pre-wrap",
                letterSpacing: 0,
              }}
            />
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            aria-label="Insert image"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                insertImageFile(file);
              }

              event.target.value = "";
            }}
            style={{ display: "none" }}
          />

          <input
            ref={fileInputRef}
            type="file"
            aria-label="Attach file"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                insertAttachedFile(file);
              }

              event.target.value = "";
            }}
            style={{ display: "none" }}
          />

          <SideToolbar
            onFormat={applyToolbarFormat}
            onUndo={() => runNativeEditCommand("undo")}
            onRedo={() => runNativeEditCommand("redo")}
            onFullscreen={() => setIsFullscreen((fullscreen) => !fullscreen)}
            ink="rgba(58,46,92,0.72)"
          />
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function bodyToEditorHtml(body: string) {
  if (/<[a-z][\s\S]*>/i.test(body)) {
    return body;
  }

  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split("\n")
    .map((line) => line || "<br>")
    .join("<br>");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function EditorCategoryMenu({
  open,
  selectedCategory,
  accent,
  onSelect,
}: {
  open: boolean;
  selectedCategory: Note["category"];
  accent: string;
  onSelect: (category: Note["category"]) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
          transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            position: "absolute",
            top: 34,
            left: 0,
            zIndex: 48,
            width: 158,
            padding: 7,
            borderRadius: 14,
            background: "#FFFCF6",
            border: "1px solid rgba(231,224,214,0.96)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,1), 0 18px 36px rgba(50,42,78,0.18), 0 3px 10px rgba(50,42,78,0.10)",
          }}
        >
          {NOTE_CATEGORIES.map((category) => {
            const selected = category.value === selectedCategory;
            const Icon = CATEGORY_CHIP_META[category.value].icon;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => onSelect(category.value)}
                style={{
                  width: "100%",
                  height: 32,
                  border: "none",
                  borderRadius: 10,
                  padding: "0 9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  background: selected ? `${accent}12` : "transparent",
                  color: selected ? accent : "rgba(58,46,92,0.74)",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    minWidth: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icon size={14} strokeWidth={2.15} />
                  {category.label}
                </span>
                {selected && <Check size={14} strokeWidth={2.4} />}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EditorColorMenu({
  open,
  note,
  onSelect,
}: {
  open: boolean;
  note: Note;
  onSelect: (tone: Note["tone"]) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
          transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            zIndex: 42,
            width: 184,
            padding: 10,
            borderRadius: 16,
            background: "#FFFCF6",
            border: "1px solid rgba(231,224,214,0.96)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,1), 0 20px 40px rgba(50,42,78,0.18), 0 4px 12px rgba(50,42,78,0.10)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
            }}
          >
            {NOTE_TONE_OPTIONS.map((option) => {
              const theme = NOTE_THEME[option.tone];
              const selected = note.tone === option.tone;

              return (
                <motion.button
                  key={option.tone}
                  type="button"
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => onSelect(option.tone)}
                  initial={false}
                  animate={{
                    scale: selected ? 1.1 : 1,
                  }}
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 480, damping: 22 }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: selected
                      ? `2px solid ${theme.dot}`
                      : "1px solid rgba(255,255,255,0.92)",
                    background: option.swatch,
                    cursor: "pointer",
                    boxShadow: selected
                      ? `0 0 0 4px ${theme.dot}20, 0 8px 16px rgba(58,46,92,0.13), inset 0 1px 0 rgba(255,255,255,0.76)`
                      : "0 6px 12px rgba(58,46,92,0.09), inset 0 1px 0 rgba(255,255,255,0.74)",
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EditorMenu({
  open,
  note,
  infoOpen,
  onToggleInfo,
  onClose,
  onDelete,
}: {
  open: boolean;
  note: Note;
  infoOpen: boolean;
  onToggleInfo: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const items = [
    {
      label: "Export Note",
      icon: <FileDown size={16} strokeWidth={2} />,
      action: () => {
        downloadFile(
          `${safeFileName(note.title)}.json`,
          JSON.stringify(note, null, 2),
          "application/json",
        );
        onClose();
      },
    },
    {
      label: "Copy Content",
      icon: <Clipboard size={16} strokeWidth={2} />,
      action: async () => {
        await navigator.clipboard?.writeText(getPlainNoteText(note));
        onClose();
      },
    },
    {
      label: "Note Info",
      icon: <Info size={16} strokeWidth={2} />,
      action: onToggleInfo,
    },
    {
      label: "Delete Note",
      icon: <Trash2 size={16} strokeWidth={2} />,
      danger: true,
      action: () => {
        onDelete();
        onClose();
      },
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
          transition={{ duration: 0.16 }}
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            width: 176,
            padding: 6,
            borderRadius: 14,
            zIndex: 40,
            overflow: "hidden",
            isolation: "isolate",
            backgroundColor: "#FFFCF6",
            backgroundImage:
              "linear-gradient(180deg, #FFFCF6 0%, #FBF5EA 100%)",
            border: "1px solid rgba(231,224,214,0.96)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,1), 0 18px 36px rgba(50,42,78,0.22), 0 3px 10px rgba(50,42,78,0.12)",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              style={{
                width: "100%",
                height: 32,
                border: "none",
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "0 9px",
                background: item.danger ? "#FFFCF6" : "#FFFCF6",
                color: item.danger ? "#D94D5B" : "rgba(32,40,77,0.82)",
                fontSize: 12,
                fontWeight: 620,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {infoOpen && (
            <div
              style={{
                margin: "7px 4px 3px",
                padding: "8px 10px",
                borderRadius: 11,
                background: "#FFF8EE",
                color: "rgba(32,40,77,0.68)",
                fontSize: 11,
                fontWeight: 560,
                lineHeight: 1.55,
              }}
            >
              <div>Tone: {note.tone}</div>
              <div>Date: {note.date || "Today"}</div>
              <div>Characters: {getPlainNoteText(note).length}</div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EditorBottomToolbar() {
  const wordCount = 0;
  const characterCount = 0;

  const leftTools = [
    { label: "Bold", icon: <Bold size={20} strokeWidth={2.1} />, active: true },
    { label: "Italic", icon: <Italic size={20} strokeWidth={2.05} /> },
    { label: "Underline", icon: <Underline size={20} strokeWidth={2.05} /> },
    { label: "Highlight", icon: <Highlighter size={20} strokeWidth={2.05} /> },
    { label: "Bulleted list", icon: <List size={20} strokeWidth={2.05} /> },
    { label: "Checklist", icon: <CheckSquare size={20} strokeWidth={2.05} /> },
    { label: "Image", icon: <ImageIcon size={20} strokeWidth={2.05} /> },
  ];

  const rightTools = [
    { label: "Undo", icon: <Undo2 size={20} strokeWidth={2.05} /> },
    { label: "Redo", icon: <Redo2 size={20} strokeWidth={2.05} /> },
    { label: "Fullscreen", icon: <Expand size={20} strokeWidth={2.05} /> },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 36,
        right: 36,
        bottom: 17,
        zIndex: 10,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 12,
        color: "rgba(58,46,92,0.72)",
      }}
    >
      <div style={{ display: "flex", gap: 9 }}>
        {leftTools.map((tool) => (
          <EditorIconButton key={tool.label} {...tool} />
        ))}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 620,
          color: "rgba(69,76,112,0.58)",
          whiteSpace: "nowrap",
          display: "none",
        }}
      >
        Words: {wordCount} <span aria-hidden>•</span> Characters: {characterCount}
      </div>
      <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}>
        {rightTools.map((tool) => (
          <EditorIconButton key={tool.label} {...tool} />
        ))}
      </div>
    </div>
  );
}

function EditorIconButton({
  label,
  icon,
  active,
  popOnPress,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  popOnPress?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      animate={{
        scale: active && popOnPress ? 1.08 : 1,
      }}
      whileHover={{ y: -1, scale: 1.04 }}
      whileTap={
        popOnPress ? { scale: 0.82, rotate: -5 } : { scale: 0.95 }
      }
      transition={{
        type: "spring",
        stiffness: popOnPress ? 520 : 420,
        damping: popOnPress ? 18 : 24,
      }}
      style={{
        width: 32,
        height: 32,
        border: "none",
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        color: active ? "#7C3AED" : "rgba(58,46,92,0.72)",
        background: active
          ? "linear-gradient(180deg, rgba(252,249,242,0.96), rgba(246,241,232,0.76))"
          : "rgba(139,92,246,0.035)",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.78), 0 7px 16px rgba(92,72,48,0.10), 0 0 0 1px rgba(139,92,246,0.10)"
          : "inset 0 1px 0 rgba(255,255,255,0.36), 0 0 0 1px rgba(139,92,246,0.035)",
      }}
    >
      {icon}
    </motion.button>
  );
}

function getPlainNoteText(note: Note) {
  return `${note.title || "Untitled Note"}\n\n${note.content
    .replace(/^# .*\n*/, "")
    .trim()}`;
}

function safeFileName(name: string) {
  return (name || "untitled-note")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function downloadFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
