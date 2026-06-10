"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  Calendar,
  CheckSquare,
  Clipboard,
  Expand,
  FileDown,
  Highlighter,
  Image as ImageIcon,
  Info,
  Italic,
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
import { Note } from "../types/note";
import SideToolbar, { ToolbarFormat } from "./SideToolbar";
import { NOTE_EDITOR_THEME, NOTE_THEME } from "@/shared/theme/notesThemes";
import { formatEditorDate } from "../utils/formatDate";

const noteSwitchTransition = {
  duration: 0.28,
  ease: [0.22, 0.61, 0.36, 1],
} as const;

function EmptyState({ onCreateNote }: { onCreateNote?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        padding: 32,
      }}
    >
      <div
        style={{
          width: "min(440px, 100%)",
          textAlign: "center",
          display: "grid",
          justifyItems: "center",
          gap: 14,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 112,
            height: 112,
            borderRadius: 30,
            display: "grid",
            placeItems: "center",
            color: "#7659D6",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.80), rgba(240,232,255,0.50))",
            border: "1px solid rgba(255,255,255,0.84)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.92), 0 24px 48px rgba(88,78,136,0.13)",
          }}
        >
          <img
            src="/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png"
            alt=""
            style={{
              width: 76,
              height: 76,
              objectFit: "contain",
              filter: "drop-shadow(0 12px 22px rgba(91,66,184,0.18))",
            }}
          />
        </div>
        <div>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 30,
              fontWeight: 760,
              lineHeight: 1.15,
              color: "#18254B",
              letterSpacing: 0,
            }}
          >
            Welcome to Notezy
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.6,
              fontWeight: 540,
              color: "rgba(67,75,119,0.66)",
            }}
          >
            Select a note from the list or create a new note to start writing.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNote}
          style={{
            height: 42,
            padding: "0 18px",
            border: "none",
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #8B5CF6, #6D4DE2)",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 760,
            cursor: "pointer",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.24), 0 14px 28px rgba(109,77,226,0.22)",
          }}
        >
          <span aria-hidden>+</span>
          New Note
        </button>
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
  onChange?: (id: string, title: string, body: string) => void;
  onUpdate?: (id: string, changes: Partial<Note>) => void;
  onDelete?: (id: string) => void;
  onCreateNote?: () => void;
  saveStatus?: "idle" | "saving" | "saved" | "deleted";
};

export default function NoteEditor({
  note,
  onChange,
  onUpdate,
  onDelete,
  onCreateNote,
  saveStatus = "idle",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
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

  if (!note) return <EmptyState onCreateNote={onCreateNote} />;

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
  const editorBaseShadow = `0 0 30px ${t.pin}14, 0 38px 84px rgba(36,42,76,0.17), 0 20px 40px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.98), inset 14px 0 32px rgba(255,255,255,0.28), inset -18px 0 34px rgba(116,82,128,0.045), inset 0 -24px 42px rgba(96,76,52,0.055)`;
  const editorHoverShadow = `0 0 34px ${t.pin}18, 0 44px 92px rgba(36,42,76,0.19), 0 24px 48px rgba(0,0,0,0.10), 0 6px 14px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.98), inset 14px 0 32px rgba(255,255,255,0.30), inset -18px 0 34px rgba(116,82,128,0.052), inset 0 -24px 42px rgba(96,76,52,0.06)`;

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
              "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(252,249,242,0.92))",
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
                repeating-linear-gradient(92deg, rgba(92,73,120,0.012) 0 1px, transparent 1px 34px)
              `,
            }}
          />

          <div
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
        width: 30,
        height: 30,
        border: "none",
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        color: active ? "#7C3AED" : "rgba(58,46,92,0.72)",
        background: active
          ? "linear-gradient(180deg, rgba(252,249,242,0.96), rgba(246,241,232,0.76))"
          : "transparent",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.78), 0 7px 16px rgba(92,72,48,0.10), 0 0 0 1px rgba(139,92,246,0.10)"
          : "none",
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
