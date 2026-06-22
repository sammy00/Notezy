import mongoose, { Document, Schema } from "mongoose";
import { NOTE_CATEGORIES, NoteCategory } from "./Note";

export interface ITask extends Document {
  title: string;
  completed: boolean;
  status: "not-started" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: NoteCategory;
  dueDate?: Date;
  description: string;
  checklist: { id: string; text: string; completed: boolean }[];
  relatedNote?: mongoose.Types.ObjectId;
  myDay: boolean;
  template?: string;
  jobApplication?: {
    company: string;
    position: string;
    location: string;
    source: string;
    appliedDate?: Date;
    status: "applied" | "assessment" | "interview" | "offer" | "rejected";
    reminderAt?: Date;
  };
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    category: { type: String, enum: NOTE_CATEGORIES, default: "personal" },
    dueDate: { type: Date },
    description: { type: String, default: "" },
    checklist: {
      type: [{ id: String, text: String, completed: { type: Boolean, default: false } }],
      default: [],
    },
    relatedNote: { type: Schema.Types.ObjectId, ref: "Note" },
    myDay: { type: Boolean, default: false },
    template: { type: String, default: "", trim: true },
    jobApplication: {
      type: {
        company: { type: String, default: "", trim: true },
        position: { type: String, default: "", trim: true },
        location: { type: String, default: "", trim: true },
        source: { type: String, default: "", trim: true },
        appliedDate: { type: Date },
        status: { type: String, enum: ["applied", "assessment", "interview", "offer", "rejected"], default: "applied" },
        reminderAt: { type: Date },
      },
      required: false,
      _id: false,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Task = mongoose.model<ITask>("Task", TaskSchema);
