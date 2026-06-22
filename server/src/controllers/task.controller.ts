import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/fetchuser";
import { NOTE_CATEGORIES, NoteCategory } from "../models/Note";
import { Task } from "../models/Task";

const responseTask = (task: any) => ({
  id: task._id,
  title: task.title,
  completed: task.completed,
  status: task.status,
  priority: task.priority,
  category: task.category,
  dueDate: task.dueDate,
  description: task.description,
  checklist: task.checklist,
  relatedNoteId: task.relatedNote?._id?.toString?.() ?? task.relatedNote?.toString?.() ?? "",
  relatedNoteTitle: task.relatedNote?.title ?? "",
  myDay: task.myDay,
  template: task.template ?? "",
  jobApplication: task.jobApplication ? {
    company: task.jobApplication.company ?? "",
    position: task.jobApplication.position ?? "",
    location: task.jobApplication.location ?? "",
    source: task.jobApplication.source ?? "",
    appliedDate: task.jobApplication.appliedDate,
    status: task.jobApplication.status ?? "applied",
    reminderAt: task.jobApplication.reminderAt,
  } : undefined,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const category = (value: unknown): NoteCategory => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return NOTE_CATEGORIES.includes(normalized as NoteCategory)
    ? (normalized as NoteCategory)
    : "personal";
};

const validId = (id: string) => mongoose.Types.ObjectId.isValid(id);
const status = (value: unknown) =>
  value === "in-progress" || value === "completed" ? value : "not-started";
const priority = (value: unknown) =>
  value === "low" || value === "high" ? value : "medium";
const checklist = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item) => item && typeof item.text === "string")
        .map((item) => ({
          id: typeof item.id === "string" && item.id ? item.id : new mongoose.Types.ObjectId().toString(),
          text: item.text.trim(),
          completed: Boolean(item.completed),
        }))
        .filter((item) => item.text)
    : [];
const applicationStatuses = ["applied", "assessment", "interview", "offer", "rejected"] as const;
const jobApplication = (value: any) => {
  if (!value || typeof value !== "object") return undefined;
  const applicationStatus = applicationStatuses.includes(value.status) ? value.status : "applied";
  return {
    company: typeof value.company === "string" ? value.company.trim() : "",
    position: typeof value.position === "string" ? value.position.trim() : "",
    location: typeof value.location === "string" ? value.location.trim() : "",
    source: typeof value.source === "string" ? value.source.trim() : "",
    appliedDate: value.appliedDate || undefined,
    status: applicationStatus,
    reminderAt: value.reminderAt || undefined,
  };
};

export const fetchTasks = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const tasks = await Task.find({ user: user.id })
      .populate("relatedNote", "title")
      .sort({ completed: 1, updatedAt: -1 });
    res.json(tasks.map(responseTask));
  } catch {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      res.status(400).json({ message: "Task title is required" });
      return;
    }
    const taskStatus = status(req.body.status);
    const task = await Task.create({
      title,
      completed: taskStatus === "completed",
      status: taskStatus,
      priority: priority(req.body.priority),
      category: category(req.body.category),
      dueDate: req.body.dueDate || undefined,
      description: typeof req.body.description === "string" ? req.body.description.trim() : "",
      checklist: checklist(req.body.checklist),
      relatedNote: validId(req.body.relatedNoteId ?? "") ? req.body.relatedNoteId : undefined,
      myDay: Boolean(req.body.myDay),
      template: typeof req.body.template === "string" ? req.body.template.trim() : "",
      jobApplication: jobApplication(req.body.jobApplication),
      user: user.id,
    });
    await task.populate("relatedNote", "title");
    res.status(201).json(responseTask(task));
  } catch {
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    if (!validId(req.params.id as string)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }
    const changes: Record<string, unknown> = {};
    if (typeof req.body.title === "string" && req.body.title.trim()) changes.title = req.body.title.trim();
    if (typeof req.body.completed === "boolean") {
      changes.completed = req.body.completed;
      changes.status = req.body.completed ? "completed" : "not-started";
    }
    if (typeof req.body.status === "string") {
      changes.status = status(req.body.status);
      changes.completed = changes.status === "completed";
    }
    if (typeof req.body.priority === "string") changes.priority = priority(req.body.priority);
    if (typeof req.body.category === "string") changes.category = category(req.body.category);
    if (typeof req.body.description === "string") changes.description = req.body.description.trim();
    if ("dueDate" in req.body) changes.dueDate = req.body.dueDate || null;
    if (Array.isArray(req.body.checklist)) changes.checklist = checklist(req.body.checklist);
    if ("relatedNoteId" in req.body) {
      changes.relatedNote = validId(req.body.relatedNoteId ?? "") ? req.body.relatedNoteId : null;
    }
    if (typeof req.body.myDay === "boolean") changes.myDay = req.body.myDay;
    if (typeof req.body.template === "string") changes.template = req.body.template.trim();
    if (req.body.jobApplication && typeof req.body.jobApplication === "object") changes.jobApplication = jobApplication(req.body.jobApplication);
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: user.id }, changes, { returnDocument: "after", runValidators: true });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    await task.populate("relatedNote", "title");
    res.json(responseTask(task));
  } catch {
    res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    if (!validId(req.params.id as string)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: user.id });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to delete task" });
  }
};
