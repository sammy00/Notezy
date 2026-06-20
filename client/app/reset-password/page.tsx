import { Suspense } from "react";
import PasswordResetScreen from "@/components/auth/PasswordResetScreen";

export default function ResetPasswordPage() {
  return <Suspense><PasswordResetScreen mode="reset" /></Suspense>;
}
