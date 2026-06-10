import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

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

export const getUserByIdService = async (id: string) => {
  return User.findById(id).select("-password");
};
