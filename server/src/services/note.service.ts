import mongoose from "mongoose";
import {
  Note,
  NOTE_CATEGORIES,
  NOTE_TONES,
  NoteCategory,
  NoteTone,
} from "../models/Note";

type NotePayload = {
  title?: unknown;
  content?: unknown;
  preview?: unknown;
  tone?: unknown;
  category?: unknown;
  starred?: unknown;
  pinned?: unknown;
  archived?: unknown;
  trashed?: unknown;
  user?: unknown;
};

const isNoteTone = (tone: unknown): tone is NoteTone =>
  typeof tone === "string" && NOTE_TONES.includes(tone as NoteTone);

const normalizeNoteCategory = (category: unknown): NoteCategory => {
  const normalized = typeof category === "string" ? category.trim().toLowerCase() : "";

  return NOTE_CATEGORIES.includes(normalized as NoteCategory)
    ? (normalized as NoteCategory)
    : "personal";
};

const toStringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const normalizeNotePayload = (data: NotePayload) => {
  const title = toStringValue(data.title);

  return {
    title,
    content: toStringValue(data.content),
    preview: toStringValue(data.preview),
    tone: isNoteTone(data.tone) ? data.tone : "paper",
    category: normalizeNoteCategory(data.category),
    starred: typeof data.starred === "boolean" ? data.starred : false,
    pinned: typeof data.pinned === "boolean" ? data.pinned : false,
    archived: typeof data.archived === "boolean" ? data.archived : false,
    trashed: typeof data.trashed === "boolean" ? data.trashed : false,
    user: typeof data.user === "string" ? data.user.trim() : "",
  };
};

const normalizeNoteUpdate = (data: NotePayload) => {
  const update: Partial<ReturnType<typeof normalizeNotePayload>> = {};

  if (typeof data.title === "string") {
    update.title = data.title.trim();
  }

  if (typeof data.content === "string") update.content = data.content;
  if (typeof data.preview === "string") update.preview = data.preview.trim();
  if (isNoteTone(data.tone)) update.tone = data.tone;
  if (typeof data.category === "string") {
    update.category = normalizeNoteCategory(data.category);
  }
  if (typeof data.starred === "boolean") update.starred = data.starred;
  if (typeof data.pinned === "boolean") update.pinned = data.pinned;
  if (typeof data.archived === "boolean") update.archived = data.archived;
  if (typeof data.trashed === "boolean") update.trashed = data.trashed;
  if (typeof data.user === "string") update.user = data.user.trim();

  return update;
};

const ensureObjectId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid note id");
  }
};

export const getAllNotesByUserService = async (userId: string) => {
  return Note.find({ user: userId, archived: false, trashed: false }).sort({
    pinned: -1,
    updatedAt: -1,
  });
};

export const getNoteByIdForUserService = async (id: string, userId: string) => {
  ensureObjectId(id);
  return Note.findOne({ _id: id, user: userId });
};

export const createNoteForUserService = async (
  data: NotePayload,
  userId: string,
) => {
  return Note.create(normalizeNotePayload({ ...data, user: userId }));
};

export const updateNoteForUserService = async (
  id: string,
  userId: string,
  data: NotePayload,
) => {
  ensureObjectId(id);

  const note = await Note.findById(id);
  if (!note) return null;
  if (note.user.toString() !== userId) throw new Error("Not allowed");

  return Note.findByIdAndUpdate(id, normalizeNoteUpdate(data), {
    returnDocument: "after",
    runValidators: true,
  });
};

export const getArchivedNotesByUserService = async (userId: string) => {
  return Note.find({ user: userId, archived: true, trashed: false }).sort({
    updatedAt: -1,
  });
};

export const getTrashedNotesByUserService = async (userId: string) => {
  return Note.find({ user: userId, trashed: true }).sort({ updatedAt: -1 });
};

export const deleteNoteForUserService = async (id: string, userId: string) => {
  ensureObjectId(id);

  const note = await Note.findById(id);
  if (!note) return null;
  if (note.user.toString() !== userId) throw new Error("Not allowed");

  await Note.findByIdAndDelete(id);
  return note;
};
