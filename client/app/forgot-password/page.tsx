import { Suspense } from "react";
import PasswordResetScreen from "@/components/auth/PasswordResetScreen";

export default function ForgotPasswordPage() {
  return <Suspense><PasswordResetScreen mode="forgot" /></Suspense>;
}
