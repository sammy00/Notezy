import { NoteCategory, normalizeNoteCategory } from "@/features/notes/types/note";
import { getStoredAuthUser } from "@/features/auth/authClient";

export type ApplicationStatus = "applied" | "assessment" | "interview" | "offer" | "rejected";
export type JobApplicationData = {
  company: string;
  position: string;
  location: string;
  source: string;
  appliedDate?: string;
  status: ApplicationStatus;
  reminderAt?: string;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  status: "not-started" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: NoteCategory;
  dueDate?: string;
  description: string;
  checklist: { id: string; text: string; completed: boolean }[];
  relatedNoteId?: string;
  relatedNoteTitle?: string;
  myDay: boolean;
  template?: string;
  jobApplication?: JobApplicationData;
  createdAt?: string;
  updatedAt?: string;
};

export const getTasksCacheKey = () =>
  `notezy-tasks-cache:${getStoredAuthUser()?.id ?? "guest"}`;

type ApiTask = Omit<Task, "category"> & { category?: string };

const apiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return url;
};

const request = async <T>(path = "", init: RequestInit = {}) => {
  const token = localStorage.getItem("auth-token") ?? "";
  const response = await fetch(`${apiUrl()}/api/tasks${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "auth-token": token, ...init.headers },
  });
  if (!response.ok) throw new Error(`Task request failed: ${response.status}`);
  return (await response.json()) as T;
};

const normalizeTask = (task: ApiTask): Task => ({
  ...task,
  completed: task.completed ?? task.status === "completed",
  status: task.status ?? (task.completed ? "completed" : "not-started"),
  priority: task.priority ?? "medium",
  category: normalizeNoteCategory(task.category),
  description: task.description ?? "",
  checklist: Array.isArray(task.checklist) ? task.checklist : [],
  relatedNoteId: task.relatedNoteId ?? "",
  relatedNoteTitle: task.relatedNoteTitle ?? "",
  myDay: task.myDay ?? false,
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
});

export const fetchTasks = async () => (await request<ApiTask[]>()).map(normalizeTask);
export const createTask = async (
  title: string,
  category: NoteCategory = "personal",
  details: Partial<Omit<Task, "id" | "title" | "category" | "createdAt" | "updatedAt">> = {},
) => normalizeTask(await request<ApiTask>("", { method: "POST", body: JSON.stringify({ title, category, ...details }) }));
export const updateTask = async (id: string, changes: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>) =>
  normalizeTask(await request<ApiTask>(`/${id}`, { method: "PATCH", body: JSON.stringify(changes) }));
export const deleteTask = async (id: string) => request<{ success: boolean }>(`/${id}`, { method: "DELETE" });
