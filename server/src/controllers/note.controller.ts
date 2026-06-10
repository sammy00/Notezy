import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthenticatedRequest } from "../middleware/fetchuser";
import {
  createNoteForUserService,
  deleteNoteForUserService,
  getAllNotesByUserService,
  getArchivedNotesByUserService,
  getNoteByIdForUserService,
  getTrashedNotesByUserService,
  updateNoteForUserService,
} from "../services/note.service";

const toNoteResponse = (note: any) => ({
  id: note._id,
  title: note.title,
  content: note.content,
  preview: note.preview,
  tone: note.tone,
  category: note.category,
  starred: note.starred,
  pinned: note.pinned,
  archived: note.archived,
  trashed: note.trashed,
  user: note.user,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const sendError = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  const status =
    message.includes("Invalid") ||
    message.includes("required") ||
    message.includes("empty")
      ? 400
      : message.includes("allowed")
        ? 401
      : 500;

  res.status(status).json({ message, error: message });
};

const getParamValue = (value: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export const getOwnNoteById = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const note = await getNoteByIdForUserService(
      getParamValue(req.params.id),
      user.id,
    );

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.status(200).json(toNoteResponse(note));
  } catch (error) {
    console.error("Error fetching user note:", error);
    sendError(res, error, "Failed to fetch note");
  }
};

export const fetchAllNotes = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const notes = await getAllNotesByUserService(user.id);
    res.status(200).json(notes.map(toNoteResponse));
  } catch (error) {
    console.error("Error fetching user notes:", error);
    sendError(res, error, "Failed to fetch notes");
  }
};

export const fetchArchivedNotes = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const notes = await getArchivedNotesByUserService(user.id);
    res.status(200).json(notes.map(toNoteResponse));
  } catch (error) {
    console.error("Error fetching archived notes:", error);
    sendError(res, error, "Failed to fetch archived notes");
  }
};

export const fetchTrashedNotes = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const notes = await getTrashedNotesByUserService(user.id);
    res.status(200).json(notes.map(toNoteResponse));
  } catch (error) {
    console.error("Error fetching trashed notes:", error);
    sendError(res, error, "Failed to fetch trashed notes");
  }
};

export const addNote = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { user } = req as AuthenticatedRequest;
    const note = await createNoteForUserService(req.body, user.id);
    res.status(201).json(toNoteResponse(note));
  } catch (error) {
    console.error("Error adding note:", error);
    sendError(res, error, "Failed to add note");
  }
};

export const updateOwnNote = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const note = await updateNoteForUserService(
      getParamValue(req.params.id),
      user.id,
      req.body,
    );

    if (!note) {
      res.status(404).send("Not Found");
      return;
    }

    res.status(200).json(toNoteResponse(note));
  } catch (error) {
    console.error("Error updating user note:", error);
    sendError(res, error, "Failed to update note");
  }
};

export const deleteOwnNote = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const note = await deleteNoteForUserService(getParamValue(req.params.id), user.id);

    if (!note) {
      res.status(404).send("Not Found");
      return;
    }

    res.json({ Success: "Note has been deleted", note: toNoteResponse(note) });
  } catch (error) {
    console.error("Error deleting user note:", error);
    sendError(res, error, "Failed to delete note");
  }
};
