import mongoose, { Document, Schema } from "mongoose";

export const NOTE_TONES = [
  "paper",
  "blue",
  "rose",
  "lavender",
  "sage",
  "sand",
  "frost",
  "butter",
  "lilac",
  "blush",
  "pistachio",
  "mint",
  "sky",
  "peach",
  "Sage",
] as const;

export type NoteTone = (typeof NOTE_TONES)[number];

export interface INote extends Document {
  title: string;
  content: string;
  preview: string;
  tone: NoteTone;
  category: string;
  starred: boolean;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, default: "", trim: true },
    content: { type: String, default: "" },
    preview: { type: String, default: "" },
    tone: { type: String, enum: NOTE_TONES, default: "paper" },
    category: { type: String, default: "Personal", trim: true },
    starred: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    trashed: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Note = mongoose.model<INote>("Note", NoteSchema);
