import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Note } from "../models/Note";

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

type AuthPayload = {
  name?: unknown;
  email?: unknown;
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

  return {
    authToken: signToken(user._id.toString()),
    user,
  };
};

export const getUserByIdService = async (id: string) => {
  return User.findById(id).select("-password");
};
