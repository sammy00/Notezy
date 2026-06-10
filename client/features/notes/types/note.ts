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
  category?: string;
}
