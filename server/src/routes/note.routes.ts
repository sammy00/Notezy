import express from "express";
import { body } from "express-validator";
import {
  addNote,
  deleteOwnNote,
  fetchArchivedNotes,
  fetchAllNotes,
  fetchTrashedNotes,
  getOwnNoteById,
  updateOwnNote,
} from "../controllers/note.controller";
import fetchuser from "../middleware/fetchuser";

const router = express.Router();

const noteValidation = [
  body("title").optional().isString(),
  body("content").optional().isString(),
  body("preview").optional().isString(),
  body("tone").optional().isString(),
  body("category").optional().isString(),
  body("starred").optional().isBoolean(),
  body("pinned").optional().isBoolean(),
  body("archived").optional().isBoolean(),
  body("trashed").optional().isBoolean(),
];

router.get("/fetchallnotes", fetchuser, fetchAllNotes);
router.get("/fetcharchivednotes", fetchuser, fetchArchivedNotes);
router.get("/fetchtrashednotes", fetchuser, fetchTrashedNotes);

router.get("/", fetchuser, fetchAllNotes);
router.post("/", fetchuser, noteValidation, addNote);
router.get("/:id", fetchuser, getOwnNoteById);
router.patch("/:id", fetchuser, updateOwnNote);
router.delete("/:id", fetchuser, deleteOwnNote);

export default router;
