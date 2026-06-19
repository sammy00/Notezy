export type NoteTone =
  | "paper"
  | "blue"
  | "rose"
  | "lavender"
  | "sage"
  | "sand"
  | "frost"
  | "peach"
  | "butter"
  | "lilac"
  | "blush"
  | "pistachio"
  | "mint"
  | "sky";

export type NoteCategory = "personal" | "work" | "journal" | "ideas";

export const NOTE_CATEGORIES: { value: NoteCategory; label: string }[] = [
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "journal", label: "Journal" },
  { value: "ideas", label: "Ideas" },
];

export const normalizeNoteCategory = (category?: string): NoteCategory => {
  const normalized = category?.trim().toLowerCase();

  return NOTE_CATEGORIES.some((item) => item.value === normalized)
    ? (normalized as NoteCategory)
    : "personal";
};

export const getNoteCategoryLabel = (category?: string) =>
  NOTE_CATEGORIES.find((item) => item.value === normalizeNoteCategory(category))
    ?.label ?? "Personal";

export interface Note {
  id: string;
  title: string;
  emoji?: string;
  preview?: string;
  content: string;
  tone: NoteTone;
  date?: string;
  starred?: boolean;
  pinned?: boolean;
  archived?: boolean;
  trashed?: boolean;
  category: NoteCategory;
}
