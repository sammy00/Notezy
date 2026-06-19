import { Note, NoteTone, normalizeNoteCategory } from "../types/note";
import { formatRelativeNoteDate } from "../utils/formatDate";

type ApiNote = {
  id: string;
  title?: string;
  content?: string;
  preview?: string;
  tone?: NoteTone;
  category?: string;
  starred?: boolean;
  pinned?: boolean;
  archived?: boolean;
  trashed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return apiUrl;
};

const MONGO_ID_PATTERN = /^[a-f\d]{24}$/i;

export const isPersistedNoteId = (id: string) => MONGO_ID_PATTERN.test(id);

const AUTH_TOKEN_KEYS = [
  "auth-token",
  "authToken",
  "token",
  "notezy-auth-token",
] as const;

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return AUTH_TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ?? "";
};

const clearStoredTokens = () => {
  if (typeof window === "undefined") {
    return;
  }

  AUTH_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
};

const getAuthHeaders = () => {
  const token = getStoredToken();

  if (token) {
    return { "auth-token": token };
  }

  return {};
};

const request = async <T>(path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  Object.entries(getAuthHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && getStoredToken()) {
      clearStoredTokens();
      throw new Error("Note API request failed: 401");
    }

    throw new Error(`Note API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

const toNote = (note: ApiNote): Note => ({
  id: note.id,
  title: note.title || "Untitled Note",
  content: note.content || "",
  preview: note.preview || "",
  tone: note.tone || "paper",
  date: formatRelativeNoteDate(note.updatedAt ?? note.createdAt) || "Today",
  starred: note.starred ?? false,
  pinned: note.pinned ?? false,
  archived: note.archived ?? false,
  trashed: note.trashed ?? false,
  category: normalizeNoteCategory(note.category),
});

export const fetchNotes = async () => {
  const notes = await request<ApiNote[]>("/api/notes/fetchallnotes");
  return notes.map(toNote);
};

export const fetchTrashedNotes = async () => {
  const notes = await request<ApiNote[]>("/api/notes/fetchtrashednotes");
  return notes.map(toNote);
};

export const createNote = async (note: Omit<Note, "id" | "date">) => {
  const savedNote = await request<ApiNote>("/api/notes", {
    method: "POST",
    body: JSON.stringify(note),
  });

  return toNote(savedNote);
};

export const updateNote = async (id: string, changes: Partial<Note>) => {
  const updatedNote = await request<ApiNote>(`/api/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

  return toNote(updatedNote);
};

export const deleteNote = async (id: string) => {
  await request<{ Success: string }>(`/api/notes/${id}`, {
    method: "DELETE",
  });
};
