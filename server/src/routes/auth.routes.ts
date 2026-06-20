import express from "express";
import { body } from "express-validator";
import {
  demoLogin,
  forgotPassword,
  login,
  me,
  resetPassword,
  signup,
} from "../controllers/auth.controller";
import fetchuser from "../middleware/fetchuser";

const router = express.Router();

const signupValidation = [
  body("name", "Enter a valid name").isLength({ min: 2 }),
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password must be at least 5 characters").isLength({
    min: 5,
  }),
];

const loginValidation = [
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password cannot be blank").exists(),
];

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/demo", demoLogin);
router.post(
  "/forgot-password",
  [body("email", "Enter a valid email").isEmail()],
  forgotPassword,
);
router.post(
  "/reset-password",
  [
    body("token", "Reset token is required").isString().notEmpty(),
    body("password", "Password must be at least 8 characters").isLength({ min: 8 }),
  ],
  resetPassword,
);
router.get("/me", fetchuser, me);

export default router;
