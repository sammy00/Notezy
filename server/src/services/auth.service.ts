import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import { User } from "../models/User";
import { Note } from "../models/Note";
import { Task } from "../models/Task";

const DEMO_EMAIL = "demo@notezy.app";
const DEMO_NOTES = [
  {
    title: "👋 Welcome to Notezy",
    content: "# 👋 Welcome to Notezy\n\nThis is your demo workspace. Here are a few things to try:\n\n✓ Create a note\n✓ Add a category\n✓ Pin a note\n✓ Search notes\n✓ Switch theme",
    preview: "Things to try:\nCreate a note, pin it, search, and switch theme.",
    tone: "lavender",
    category: "personal",
    pinned: true,
  },
  {
    title: "Frontend Interview Notes",
    content: "# Frontend Interview Notes\n\nReact, TypeScript, state management, accessibility, testing, and performance.",
    preview: "React, TypeScript, state management, accessibility, testing, and performance.",
    tone: "sky",
    category: "work",
    starred: true,
  },
  {
    title: "Meeting Summary",
    content: "# Meeting Summary\n\nDiscussion with the product team:\n\n- Simplify onboarding\n- Improve search\n- Ship the next iteration",
    preview: "Discussion with the product team.\nSimplify onboarding and improve search.",
    tone: "butter",
    category: "work",
  },
];

const DEMO_TASKS = [
  { title: "Update Notezy README", category: "work", priority: "high", status: "in-progress", description: "Polish the project documentation and screenshots.", checklist: [{ id: "demo-readme-1", text: "Review feature list", completed: true }, { id: "demo-readme-2", text: "Update screenshots", completed: false }] },
  { title: "Prepare for frontend interview", category: "work", priority: "medium", status: "in-progress", description: "Review React, TypeScript, accessibility, and performance examples.", checklist: [{ id: "demo-interview-1", text: "Review React patterns", completed: true }, { id: "demo-interview-2", text: "Practice TypeScript questions", completed: false }] },
  { title: "Plan weekly priorities", category: "personal", priority: "low", status: "completed", completed: true, checklist: [] },
];

type AuthPayload = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

type ResetPayload = {
  email?: unknown;
  token?: unknown;
  password?: unknown;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

const toCleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

const signToken = (userId: string) =>
  jwt.sign({ user: { id: userId } }, getJwtSecret(), { expiresIn: "7d" });

export const createUserService = async (data: AuthPayload) => {
  const name = toCleanString(data.name);
  const email = toCleanString(data.email).toLowerCase();
  const password = toCleanString(data.password);

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  return {
    authToken: signToken(user._id.toString()),
    user,
  };
};

export const loginUserService = async (data: AuthPayload) => {
  const email = toCleanString(data.email).toLowerCase();
  const password = toCleanString(data.password);

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  return {
    authToken: signToken(user._id.toString()),
    user,
  };
};

export const loginDemoUserService = async () => {
  let user = await User.findOne({ email: DEMO_EMAIL });

  if (!user) {
    const generatedPassword = await bcrypt.hash(
      `demo-${Date.now()}-${Math.random()}`,
      10,
    );
    user = await User.create({
      name: "Demo User",
      email: DEMO_EMAIL,
      password: generatedPassword,
      role: "demo",
    });
  } else if (user.role !== "demo") {
    user.role = "demo";
    await user.save();
  }

  // Every demo login starts from the same polished workspace. This keeps the
  // public account useful without exposing credentials or running a cron job.
  await Note.deleteMany({ user: user._id });
  await Note.insertMany(
    DEMO_NOTES.map((note) => ({ ...note, user: user._id })),
  );
  await Task.deleteMany({ user: user._id });
  await Task.insertMany(
    DEMO_TASKS.map((task) => ({ ...task, user: user._id })),
  );

  return {
    authToken: signToken(user._id.toString()),
    user,
  };
};

const getResetEmailConfig = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const clientUrl = process.env.CLIENT_URL?.split(",")[0]?.trim();

  if (!apiKey || !from || !clientUrl) {
    throw new Error("Password reset email is not configured");
  }

  return { apiKey, from, clientUrl };
};

const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string,
) => {
  const { apiKey, from, clientUrl } = getResetEmailConfig();
  const resetUrl = `${clientUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Reset your Notezy password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#18254b">
          <h1 style="font-size:24px">Reset your Notezy password</h1>
          <p>Hi ${escapeHtml(name || "there")},</p>
          <p>Use the button below to choose a new password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:13px 20px;border-radius:12px;background:#6d4de2;color:white;text-decoration:none;font-weight:700">Reset password</a>
          <p style="font-size:12px;color:#68708a">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to send password reset email");
  }
};

export const requestPasswordResetService = async (data: ResetPayload) => {
  const email = toCleanString(data.email).toLowerCase();
  if (!email) throw new Error("Email is required");

  // Validate configuration before looking up a user so failures do not reveal
  // whether a particular email address has an account.
  getResetEmailConfig();
  const user = await User.findOne({ email });
  if (!user || user.role === "demo") return;

  const token = randomBytes(32).toString("hex");
  user.resetPasswordToken = createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, user.name, token);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw error;
  }
};

export const resetPasswordService = async (data: ResetPayload) => {
  const token = toCleanString(data.token);
  const password = toCleanString(data.password);
  if (!token || !password) throw new Error("Token and password are required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user || user.role === "demo") {
    throw new Error("This password reset link is invalid or has expired");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

export const getUserByIdService = async (id: string) => {
  return User.findById(id).select("-password");
};
