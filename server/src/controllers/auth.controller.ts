import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthenticatedRequest } from "../middleware/fetchuser";
import {
  createUserService,
  getUserByIdService,
  loginDemoUserService,
  loginUserService,
  requestPasswordResetService,
  resetPasswordService,
} from "../services/auth.service";

const toUserResponse = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const sendAuthError = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : "Authentication failed";
  const status =
    message.includes("credentials") || message.includes("authenticate")
      ? 401
      : message.includes("configured")
        ? 503
      : message.includes("required") ||
          message.includes("already exists") ||
          message.includes("expired") ||
          message.includes("Password")
        ? 400
        : 500;

  res.status(status).json({ success: false, error: message });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { authToken, user } = await createUserService(req.body);
    res.status(201).json({
      success: true,
      authToken,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("Error signing up:", error);
    sendAuthError(res, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { authToken, user } = await loginUserService(req.body);
    res.status(200).json({
      success: true,
      authToken,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("Error logging in:", error);
    sendAuthError(res, error);
  }
};

export const demoLogin = async (_req: Request, res: Response) => {
  try {
    const { authToken, user } = await loginDemoUserService();
    res.status(200).json({
      success: true,
      authToken,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("Error opening demo workspace:", error);
    sendAuthError(res, error);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    await requestPasswordResetService(req.body);
    res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    sendAuthError(res, error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    await resetPasswordService(req.body);
    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    sendAuthError(res, error);
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const foundUser = await getUserByIdService(user.id);

    if (!foundUser) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user: foundUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    sendAuthError(res, error);
  }
};
