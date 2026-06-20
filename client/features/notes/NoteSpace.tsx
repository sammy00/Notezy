"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  SlidersHorizontal,
  Grid2X2,
  List as ListIcon,
  Circle,
  Lightbulb,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import {
  getNoteCategoryLabel,
  Note,
  NoteCategory,
  normalizeNoteCategory,
} from "./types/note";
import { useTheme } from "@/shared/theme/ThemeProvider";
import {
  createNote as createNoteApi,
  deleteNote as deleteNoteApi,
  fetchNotes,
  fetchTrashedNotes,
  isPersistedNoteId,
  updateNote as updateNoteApi,
} from "./api/notesApi";
import { getStoredAuthUser } from "@/features/auth/authClient";
import { showToast } from "@/shared/toast";

const NEW_NOTE_EVENT = "notezy:create-note";
const NOTE_FILTER_EVENT = "notezy:set-note-filter";
const NOTE_SEARCH_EVENT = "notezy:set-note-search";
const NOTE_CATEGORY_EVENT = "notezy:update-note-category";
const NOTE_CATEGORY_COUNTS_EVENT = "notezy:update-category-counts";
const SHOW_NOTES_EVENT = "notezy:show-notes";
const NOTES_CACHE_KEY = "notezy-notes-cache";

type SaveStatus = "idle" | "saving" | "saved" | "error" | "deleted";
type NoteFilter = "all" | "favorites" | "pinned" | "tasks" | "trash" | "category";

const hasChecklist = (note: Note) =>
  note.content.split("\n").some((line) =>
    /^\s*(?:[-*]\s*)?(?:\[[ xX]\]|✓|✔|☐|☑)\s+/.test(line),
  );

function createBlankNote(category: NoteCategory = "personal"): Note {
  return {
    id: `note-${Date.now()}-${crypto.randomUUID()}`,
    title: "Untitled Note",
    preview: "",
    content: "# Untitled Note\n\n",
    tone: "paper",
    date: "Today",
    starred: false,
    pinned: false,
    archived: false,
    trashed: false,
    category: normalizeNoteCategory(category),
  };
}

function toCreatePayload(note: Note): Omit<Note, "id" | "date"> {
  const { id, date, ...payload } = note;
  void id;
  void date;
  return payload;
}

function getNotesCacheKey() {
  const userId = getStoredAuthUser()?.id;
  return userId ? `${NOTES_CACHE_KEY}:${userId}` : NOTES_CACHE_KEY;
}

function readCachedNotes() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const cachedNotes = localStorage.getItem(getNotesCacheKey());

    if (!cachedNotes) {
      return [];
    }

    const parsedNotes = JSON.parse(cachedNotes);
    return Array.isArray(parsedNotes)
      ? (parsedNotes as Note[]).map((note) => ({
          ...note,
          category: normalizeNoteCategory(note.category),
        }))
      : [];
  } catch {
    return [];
  }
}

function cacheNotes(notes: Note[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getNotesCacheKey(), JSON.stringify(notes));
}

function WorkspaceEmptyState({
  onCreateNote,
  title = "Your ideas deserve",
  titleAccent = "a home.",
  description = "Capture notes, plans, opportunities, and reminders before they disappear.",
}: {
  onCreateNote: () => void;
  title?: string;
  titleAccent?: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
      className="note-empty-surface"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        borderRadius: 22,
      }}
    >
      <div className="empty-panel">
        <div className="brand-orbit">
          <div className="empty-logo">N</div>
          <Sparkles className="sparkle s1" />
          <Sparkles className="sparkle s2" />
          <Circle className="sparkle s3" />
          <Sparkles className="sparkle s4" />
        </div>

        <h1>
          {title} <span>{titleAccent}</span>
        </h1>
        <p>{description}</p>

        <button type="button" onClick={onCreateNote}>
          <span aria-hidden>+</span>
          Create New Note
        </button>

        <div className="shortcut">
          Press <kbd>Ctrl N</kbd> to create
        </div>

        <div className="footer-line" aria-hidden>
          <Lightbulb />
          <span />
          <em>From idea to note.</em>
          <span />
          <NotebookPen />
        </div>
      </div>
    </motion.div>
  );
}

export default function NoteWorkspace() {
  const { mode, colors } = useTheme();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeId, setActiveId] = useState<string>("");
  const [newNoteId, setNewNoteId] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<NoteFilter>("all");
  const [activeCategory, setActiveCategory] = useState<NoteCategory | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const isCreatingNoteRef = useRef(false);
  const saveStatusTimeoutRef = useRef<number | null>(null);
  const textSaveTimeoutRef = useRef<number | null>(null);
  const pendingTextSaveRef = useRef<{
    id: string;
    changes: Partial<Note>;
  } | null>(null);
  const persistNoteChangesRef = useRef<
    (id: string, changes: Partial<Note>, notify?: boolean) => void
  >(() => undefined);

  const visibleNotes = useMemo(() => {
    const filteredBySidebar =
      activeFilter === "favorites"
        ? notes.filter((note) => !note.trashed && note.starred)
        : activeFilter === "pinned"
          ? notes.filter((note) => !note.trashed && note.pinned)
        : activeFilter === "tasks"
          ? notes.filter((note) => !note.trashed && hasChecklist(note))
          : activeFilter === "trash"
            ? notes.filter((note) => note.trashed)
          : activeFilter === "category"
            ? notes.filter(
                (note) =>
                  !note.trashed &&
                  note.category === activeCategory,
              )
          : notes.filter((note) => !note.trashed);
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return filteredBySidebar;
    }

    return filteredBySidebar.filter((note) => {
      const searchableText = [
        note.title,
        note.preview,
        note.content,
        note.category,
        note.date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeCategory, activeFilter, notes, searchQuery]);
  const notesTitle =
    searchQuery.trim()
      ? "Search Results"
      : activeFilter === "favorites"
        ? "Favorites"
        : activeFilter === "pinned"
        ? "Pinned"
        : activeFilter === "tasks"
          ? "Tasks"
          : activeFilter === "trash"
            ? "Trash"
          : activeFilter === "category"
            ? activeCategory
              ? getNoteCategoryLabel(activeCategory)
              : "Category"
          : "Notes";
  const notesSubtitle =
    searchQuery.trim()
      ? `${visibleNotes.length} result${visibleNotes.length === 1 ? "" : "s"} for "${searchQuery.trim()}"`
      : `${visibleNotes.length} note${visibleNotes.length === 1 ? "" : "s"}`;
  const isCategoryEmpty =
    activeFilter === "category" && Boolean(activeCategory) && visibleNotes.length === 0;
  const categoryEmptyTitle =
    isCategoryEmpty && activeCategory
      ? `No ${getNoteCategoryLabel(activeCategory).toLowerCase()} notes yet`
      : undefined;
  const categoryEmptyDescription =
    isCategoryEmpty && activeCategory
      ? activeCategory === "journal"
        ? "Start documenting your thoughts."
        : `Create your first ${getNoteCategoryLabel(activeCategory).toLowerCase()} note.`
      : undefined;
  const selectedNote =
    visibleNotes.find((note) => note.id === activeId) ?? null;

  useEffect(() => {
    const counts: Record<NoteCategory, number> = {
      personal: 0,
      work: 0,
      journal: 0,
      ideas: 0,
    };

    notes.forEach((note) => {
      if (!note.trashed) {
        counts[note.category] += 1;
      }
    });

    const activeNotes = notes.filter((note) => !note.trashed);

    window.dispatchEvent(
      new CustomEvent(NOTE_CATEGORY_COUNTS_EVENT, {
        detail: {
          counts,
          mainCounts: {
            all: activeNotes.length,
            favorites: activeNotes.filter((note) => note.starred).length,
            pinned: activeNotes.filter((note) => note.pinned).length,
            tasks: activeNotes.filter(hasChecklist).length,
          },
        },
      }),
    );
  }, [notes]);

  const showSaveStatus = (status: SaveStatus) => {
    if (saveStatusTimeoutRef.current) {
      window.clearTimeout(saveStatusTimeoutRef.current);
    }

    setSaveStatus(status);

    if (status === "saved" || status === "deleted") {
      saveStatusTimeoutRef.current = window.setTimeout(
        () => setSaveStatus("idle"),
        1800,
      );
    }
  };

  const createAndSelectNote = useCallback(async () => {
    if (isCreatingNoteRef.current) {
      return;
    }

    isCreatingNoteRef.current = true;
    showSaveStatus("saving");
    const blankNote = createBlankNote(
      activeFilter === "category" && activeCategory ? activeCategory : "personal",
    );

    setNotes((currentNotes) => {
      const nextNotes = [blankNote, ...currentNotes];
      cacheNotes(nextNotes);
      return nextNotes;
    });
    setActiveId(blankNote.id);
    setActiveFilter("all");
    setActiveCategory("");
    setSearchQuery("");
    window.dispatchEvent(
      new CustomEvent(NOTE_SEARCH_EVENT, { detail: { query: "" } }),
    );
    setNewNoteId(blankNote.id);
    setViewMode("list");
    window.setTimeout(() => setNewNoteId(""), 650);

    try {
      const savedNote = await createNoteApi(toCreatePayload(blankNote));

      setNotes((currentNotes) => {
        const nextNotes = currentNotes.map((note) =>
          note.id === blankNote.id ? savedNote : note,
        );
        cacheNotes(nextNotes);
        return nextNotes;
      });
      setActiveId(savedNote.id);
      showSaveStatus("saved");
    } catch (error) {
      console.warn("New note is local until the API is available.", error);
      showSaveStatus("saved");
    } finally {
      isCreatingNoteRef.current = false;
    }
  }, [activeCategory, activeFilter]);

  useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      const cachedNotes = readCachedNotes();

      if (cachedNotes.length > 0) {
        setNotes(cachedNotes);
        setIsLoadingNotes(false);
      }

      try {
        const [apiNotes, trashedNotes] = await Promise.all([
          fetchNotes(),
          fetchTrashedNotes(),
        ]);
        const allApiNotes = [...apiNotes, ...trashedNotes];

        if (cancelled) {
          return;
        }

        if (allApiNotes.length === 0) {
          cacheNotes([]);
          setNotes([]);
          setActiveId("");
          setIsLoadingNotes(false);
          return;
        }

        setNotes(allApiNotes);
        cacheNotes(allApiNotes);
        setActiveId((currentActiveId) =>
          allApiNotes.some((note) => note.id === currentActiveId)
            ? currentActiveId
            : "",
        );
        setIsLoadingNotes(false);
      } catch (error) {
        console.warn("Using local notes because API notes could not load.", error);
        setNotes(cachedNotes);
        setActiveId("");
        setIsLoadingNotes(false);
      }
    };

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleCreateNote = () => void createAndSelectNote();

    window.addEventListener(NEW_NOTE_EVENT, handleCreateNote);

    return () => window.removeEventListener(NEW_NOTE_EVENT, handleCreateNote);
  }, [createAndSelectNote]);

  useEffect(() => {
    const handleFilterChange = (event: Event) => {
      const detail = (event as CustomEvent<{
        filter?: NoteFilter;
        category?: string;
      }>).detail;
      const filter = detail?.filter;

      if (
        filter === "all" ||
        filter === "favorites" ||
        filter === "pinned" ||
        filter === "tasks" ||
        filter === "trash"
      ) {
        setActiveFilter(filter);
        setActiveCategory("");
      }

      if (filter === "category" && detail?.category) {
        setActiveFilter("category");
        setActiveCategory(normalizeNoteCategory(detail.category));
      }
    };

    window.addEventListener(NOTE_FILTER_EVENT, handleFilterChange);

    return () =>
      window.removeEventListener(NOTE_FILTER_EVENT, handleFilterChange);
  }, []);

  useEffect(() => {
    const handleSearchChange = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;

      setSearchQuery(query ?? "");
    };

    window.addEventListener(NOTE_SEARCH_EVENT, handleSearchChange);

    return () =>
      window.removeEventListener(NOTE_SEARCH_EVENT, handleSearchChange);
  }, []);

  useEffect(() => {
    const showNotesList = () => {
      setActiveId("");
      setViewMode("list");
    };

    window.addEventListener(SHOW_NOTES_EVENT, showNotesList);
    return () => window.removeEventListener(SHOW_NOTES_EVENT, showNotesList);
  }, []);

  useEffect(() => {
    const handleCategoryUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{
        action?: "rename" | "delete";
        oldCategory?: string;
        newCategory?: string;
        category?: string;
      }>).detail;

      if (detail?.action === "rename" && detail.oldCategory && detail.newCategory) {
        setNotes((currentNotes) => {
          const nextNotes = currentNotes.map((note) =>
            note.category === normalizeNoteCategory(detail.oldCategory)
              ? { ...note, category: normalizeNoteCategory(detail.newCategory) }
              : note,
          );
          cacheNotes(nextNotes);

          nextNotes
            .filter(
              (note, index) =>
                currentNotes[index]?.category !== note.category &&
                isPersistedNoteId(note.id),
            )
            .forEach((note) => {
              void updateNoteApi(note.id, { category: note.category }).catch(
                (error) =>
                  console.warn("Category rename could not be persisted.", error),
              );
            });

          return nextNotes;
        });
        setActiveFilter("category");
        setActiveCategory(normalizeNoteCategory(detail.newCategory));
      }

      if (detail?.action === "delete" && detail.category) {
        setNotes((currentNotes) => {
          const fallbackCategory = normalizeNoteCategory("personal");
          const nextNotes = currentNotes.map((note) =>
            note.category === normalizeNoteCategory(detail.category)
              ? { ...note, category: fallbackCategory }
              : note,
          );
          cacheNotes(nextNotes);

          nextNotes
            .filter(
              (note, index) =>
                currentNotes[index]?.category !== note.category &&
                isPersistedNoteId(note.id),
            )
            .forEach((note) => {
              void updateNoteApi(note.id, { category: "personal" }).catch(
                (error) =>
                  console.warn("Category delete could not be persisted.", error),
              );
            });

          return nextNotes;
        });
        setActiveFilter("all");
        setActiveCategory("");
        setActiveId("");
      }
    };

    window.addEventListener(NOTE_CATEGORY_EVENT, handleCategoryUpdate);

    return () =>
      window.removeEventListener(NOTE_CATEGORY_EVENT, handleCategoryUpdate);
  }, []);

  useEffect(() => {
    return () => {
      if (textSaveTimeoutRef.current) {
        window.clearTimeout(textSaveTimeoutRef.current);
      }

      if (saveStatusTimeoutRef.current) {
        window.clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  const persistNoteChanges = (
    id: string,
    changes: Partial<Note>,
    notify = false,
  ) => {
    if (pendingTextSaveRef.current?.id === id) {
      pendingTextSaveRef.current = null;
    }

    if (!isPersistedNoteId(id)) {
      showSaveStatus("saved");
      if (notify) showToast("Note Saved");
      return;
    }

    void updateNoteApi(id, changes)
      .then(() => {
        showSaveStatus("saved");
        if (notify) showToast("Note Saved");
      })
      .catch((error) => {
        console.warn("Note update could not be persisted.", error);
        showSaveStatus("error");
      });
  };
  useEffect(() => {
    persistNoteChangesRef.current = persistNoteChanges;
  });

  const updateNote = (id: string, changes: Partial<Note>) => {
    const previousNotes = notes;
    showSaveStatus("saving");

    setNotes((currentNotes) => {
      const nextNotes = currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...changes,
            }
          : note,
      );
      cacheNotes(nextNotes);
      return nextNotes;
    });

    if (!isPersistedNoteId(id)) {
      showSaveStatus("saved");
      return;
    }

    void updateNoteApi(id, changes)
      .then(() => showSaveStatus("saved"))
      .catch((error) => {
        console.warn("Note update could not be persisted.", error);
        setNotes(previousNotes);
        cacheNotes(previousNotes);
        showSaveStatus("error");
      });
  };

  const updateNoteText = (id: string, title: string, body: string) => {
    const trimmedTitle = title.trim() || "Untitled Note";
    const plainBody = stripNoteHtml(body);
    const preview = plainBody
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join("\n");

    const changes = {
      title,
      preview,
      content: `# ${trimmedTitle}\n\n${body}`,
    };

    showSaveStatus("saving");
    setNotes((currentNotes) => {
      const nextNotes = currentNotes.map((note) =>
        note.id === id ? { ...note, ...changes } : note,
      );
      cacheNotes(nextNotes);
      return nextNotes;
    });

    if (textSaveTimeoutRef.current) {
      window.clearTimeout(textSaveTimeoutRef.current);
    }

    pendingTextSaveRef.current = { id, changes };
    textSaveTimeoutRef.current = window.setTimeout(() => {
      textSaveTimeoutRef.current = null;
      persistNoteChanges(id, changes);
    }, 950);
  };

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "n") {
        event.preventDefault();
        void createAndSelectNote();
        return;
      }

      if (key === "s") {
        event.preventDefault();
        const pendingSave = pendingTextSaveRef.current;

        if (textSaveTimeoutRef.current) {
          window.clearTimeout(textSaveTimeoutRef.current);
          textSaveTimeoutRef.current = null;
        }

        if (pendingSave) {
          persistNoteChangesRef.current(
            pendingSave.id,
            pendingSave.changes,
            true,
          );
        } else {
          showSaveStatus("saved");
          showToast("Note Saved");
        }
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [createAndSelectNote]);

  const stripNoteHtml = (value: string) =>
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const deleteNote = (id: string) => {
    updateNote(id, { trashed: true, pinned: false });

    if (activeId === id) {
      setActiveId("");
    }
  };

  const restoreNote = (id: string) => {
    updateNote(id, { trashed: false });

    if (activeFilter === "trash" && activeId === id) {
      setActiveId("");
    }
  };

  const permanentlyDeleteNote = (id: string) => {
    const previousNotes = notes;
    showSaveStatus("deleted");

    setNotes((currentNotes) => {
      const remainingNotes = currentNotes.filter((note) => note.id !== id);

      if (activeId === id) {
        setActiveId("");
      }

      cacheNotes(remainingNotes);
      return remainingNotes;
    });

    if (!isPersistedNoteId(id)) {
      return;
    }

    void deleteNoteApi(id).catch((error) => {
      console.warn("Note delete could not be persisted.", error);
      setNotes(previousNotes);
      cacheNotes(previousNotes);
      showSaveStatus("idle");
    });
  };

  const duplicateNote = (id: string) => {
    setNotes((currentNotes) => {
      const sourceNote = currentNotes.find((note) => note.id === id);

      if (!sourceNote) {
        return currentNotes;
      }

      const duplicatedNote: Note = {
        ...sourceNote,
        id: `note-${Date.now()}`,
        title: `${sourceNote.title || "Untitled Note"} Copy`,
        date: "Today",
        pinned: false,
      };

      const nextNotes = [duplicatedNote, ...currentNotes];
      cacheNotes(nextNotes);
      setActiveId(duplicatedNote.id);
      return nextNotes;
    });
  };

  return (
    <div
      className={`note-workspace ${selectedNote ? "mobile-editor-active" : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns:
          viewMode === "grid" ? "1fr" : "clamp(260px, 21vw, 330px) minmax(0, 1fr)",
        height: "100%",
        minHeight: 0,
        gap: 20,
        paddingTop: 2,
        alignItems: "stretch",
      }}
    >
      <section
        className="note-list-panel"
        style={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
              marginBottom: 18,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 25,
                fontWeight: 900,
                color: mode === "light" ? "#172142" : "#F6F0E7",
                letterSpacing: 0,
              }}
            >
              {notesTitle}
              {!searchQuery.trim() && (
                <span
                  style={{
                    marginLeft: 8,
                    color:
                      mode === "light"
                        ? "rgba(69,76,112,0.52)"
                        : "rgba(238,242,255,0.54)",
                    fontSize: 18,
                    fontWeight: 820,
                  }}
                >
                  ({visibleNotes.length})
                </span>
              )}
            </h1>
            {notesSubtitle && searchQuery.trim() && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  fontWeight: 680,
                  color:
                    mode === "light"
                      ? "rgba(69,76,112,0.58)"
                      : "rgba(238,242,255,0.56)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 260,
                }}
              >
                {notesSubtitle}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {(["list", "grid"] as const).map((modeName) => (
              <button
                key={modeName}
                onClick={() => setViewMode(modeName)}
                style={{
                  width: 42,
                  height: 42,
                  border: "none",
                  outline: "none",
                  borderRadius: 14,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  backgroundImage:
                    viewMode === modeName
                      ? "linear-gradient(145deg, #cabdf3, #a991df)"
                      : "none",
                  backgroundColor:
                    viewMode === modeName
                      ? "transparent"
                      : mode === "light"
                        ? "rgba(255,255,255,0.52)"
                        : "rgba(255,255,255,0.08)",
                  boxShadow:
                    viewMode === modeName
                      ? "inset 0 1px 0 rgba(255,255,255,0.72), 0 9px 22px rgba(88,70,150,0.18)"
                      : "inset 0 1px 0 rgba(255,255,255,0.48), 0 8px 20px rgba(59,65,104,0.10)",
                  color: viewMode === modeName ? "#EFE8FF" : colors.textMuted,
                }}
              >
                {modeName === "list" ? (
                  <ListIcon size={18} strokeWidth={2.3} />
                ) : (
                  <Grid2X2 size={18} strokeWidth={2.1} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingLeft: 2,
            paddingRight: 8,
          }}
        >
          <NoteList
            notes={visibleNotes}
            activeId={activeId}
            onSelect={(note) => {
              setActiveId(note.id);
              setViewMode("list");
            }}
            onDelete={deleteNote}
            onRestore={restoreNote}
            onPermanentDelete={permanentlyDeleteNote}
            onDuplicate={duplicateNote}
            onFavorite={(note) =>
              updateNote(note.id, { starred: !note.starred })
            }
            onPin={(note) => {
              updateNote(note.id, { pinned: !note.pinned });
              showToast(note.pinned ? "Note Unpinned" : "Note Pinned");
            }}
            isTrashView={activeFilter === "trash"}
            isLoading={isLoadingNotes}
            newNoteId={newNoteId}
            viewMode={viewMode}
            emptyTitle={categoryEmptyTitle}
            emptyDescription={categoryEmptyDescription}
          />
        </div>
      </section>

    {viewMode === "list" && (
  <section
    className="note-editor-workspace"
    style={{
      position: "relative",
      minWidth: 0,
      minHeight: 0,
      overflow: "hidden",
      borderRadius: 24,
      marginInline: 0,

      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gridTemplateRows: "minmax(0, 1fr)",
      padding: "14px clamp(10px, 1.2vw, 18px)",
      gap: 18,
      alignItems: "stretch",

      background:
        mode === "light"
          ? `
            linear-gradient(135deg, rgba(255,255,255,0.58) 0%, rgba(246,248,255,0.34) 42%, rgba(225,232,240,0.24) 100%),
            radial-gradient(circle at 14% 10%, rgba(255,255,255,0.48), transparent 30%),
            radial-gradient(circle at 70% 18%, rgba(169,186,197,0.16), transparent 36%),
            radial-gradient(circle at 80% 88%, rgba(163,193,242,0.13), transparent 42%),
            linear-gradient(145deg, rgba(255,255,255,0.32), rgba(221,228,246,0.18))
          `
          : `
            #1D2450
          `,
      border:
        mode === "light"
          ? "1px solid rgba(167,139,250,.15)"
          : "1px solid rgba(167,139,250,.15)",
      backdropFilter: "blur(34px) saturate(175%)",
      WebkitBackdropFilter: "blur(34px) saturate(175%)",

      boxShadow:
        mode === "light"
          ? "inset 0 1px 0 rgba(255,255,255,0.80), inset 0 -1px 0 rgba(130,118,176,0.08), inset 14px 0 38px rgba(255,255,255,0.10), 0 16px 32px rgba(36,42,76,0.065), 0 3px 8px rgba(36,42,76,0.035)"
          : "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(8,13,30,0.24), 0 30px 70px rgba(5,10,24,0.32)",
    }}
  >
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 1,
        zIndex: 0,
        pointerEvents: "none",
        borderRadius: 23,
        background:
          mode === "light"
            ? `
              linear-gradient(115deg, rgba(255,255,255,0.18), transparent 28%),
              linear-gradient(292deg, rgba(255,255,255,0.10), transparent 34%)
            `
            : "none",
        opacity: mode === "light" ? 0.40 : 0,
      }}
    />

    <button
      type="button"
      style={{
        position: "absolute",
        right: 24,
        top: 18,
        zIndex: 5,
        height: 42,
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: 15,
        padding: "0 18px",
        display: "none",
        alignItems: "center",
        gap: 10,
        background:
          "linear-gradient(180deg, rgba(35,54,91,0.92), rgba(24,41,76,0.84))",
        color: "#F4EFE8",
        fontSize: 13,
        fontWeight: 700,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.16), 0 12px 28px rgba(0,0,0,0.22)",
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
      }}
    >
      <SlidersHorizontal size={17} strokeWidth={1.9} />
      Note Options
    </button>

    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "8%",
        right: "16%",
        top: "10%",
        bottom: "13%",
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage:
          mode === "light"
            ? `
              radial-gradient(circle at 44% 28%, rgba(255,255,255,0.30), transparent 24%),
              radial-gradient(circle at 40% 48%, rgba(167,139,250,0.12), transparent 42%),
              radial-gradient(circle at 30% 74%, rgba(196,181,253,0.08), transparent 30%),
              radial-gradient(ellipse at 42% 88%, rgba(12,20,48,0.12), transparent 58%)
            `
            : "none",
        filter: "blur(14px)",
        opacity: mode === "light" ? 0.24 : 0,
      }}
    />

    {/* Editor area */}
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        overflow: "visible",
        display: "grid",
        placeItems: "stretch",
        padding: "6px clamp(8px, 1.2vw, 16px) 4px",
        boxSizing: "border-box",
      }}
    >
      {selectedNote ? (
        <>
          <button
            type="button"
            className="notezy-mobile-editor-back"
            onClick={() => setActiveId("")}
          >
            <ArrowLeft size={17} strokeWidth={2.4} />
            Notes
          </button>
          <NoteEditor
            note={selectedNote}
            isNewNote={selectedNote.id === newNoteId}
            onChange={(id, title, body) => updateNoteText(id, title, body)}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onCreateNote={() => void createAndSelectNote()}
            saveStatus={saveStatus}
          />
        </>
      ) : (
        <WorkspaceEmptyState
          onCreateNote={() => void createAndSelectNote()}
          title={
            isCategoryEmpty && activeCategory
              ? `No ${getNoteCategoryLabel(activeCategory).toLowerCase()}`
              : activeFilter === "category" && activeCategory
                ? `Select a ${getNoteCategoryLabel(activeCategory).toLowerCase()}`
              : undefined
          }
          titleAccent={
            isCategoryEmpty && activeCategory
              ? "notes yet"
              : activeFilter === "category" && activeCategory
                ? "note"
              : undefined
          }
          description={
            categoryEmptyDescription ??
            (activeFilter === "category" && activeCategory
              ? `Choose a ${getNoteCategoryLabel(activeCategory).toLowerCase()} note from the list.`
              : undefined)
          }
        />
      )}
    </div>

  </section>
)}
    </div>
  );
}
