"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import {
  requestPasswordReset,
  submitPasswordReset,
} from "@/features/auth/passwordResetClient";

type Props = { mode: "forgot" | "reset" };
const NOTEZY_ICON = "/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png";

export default function PasswordResetScreen({ mode }: Props) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isReset = mode === "reset";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isReset && !token) {
      setError("This reset link is missing its security token.");
      return;
    }
    if (isReset && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = isReset
        ? await submitPasswordReset(token, password)
        : await requestPasswordReset(email);
      setMessage(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Password reset failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at 82% 10%, rgba(199,178,255,.30), transparent 34%), linear-gradient(145deg, #F7F8FD, #E7EBF8)" }}>
      <section style={{ width: "min(430px,100%)", padding: 30, borderRadius: 30, background: "rgba(255,255,255,.72)", border: "1px solid rgba(255,255,255,.9)", boxShadow: "0 28px 70px rgba(82,88,132,.16)", backdropFilter: "blur(28px)" }}>
        <div style={{ display: "grid", justifyItems: "center", gap: 12, textAlign: "center" }}>
          <Image src={NOTEZY_ICON} alt="Notezy" width={64} height={64} priority style={{ width: 64, height: 64, borderRadius: 20, objectFit: "cover" }} />
          <h1 style={{ margin: 0, color: "#18254B", fontSize: 27 }}>{isReset ? "Choose a new password" : "Forgot your password?"}</h1>
          <p style={{ margin: 0, color: "#747C99", fontSize: 13, lineHeight: 1.55 }}>{isReset ? "Enter a secure new password for your Notezy account." : "Enter your email and we’ll send you a secure reset link."}</p>
        </div>

        {message ? (
          <div style={{ marginTop: 24, padding: 18, borderRadius: 16, textAlign: "center", color: "#267A58", background: "rgba(39,150,107,.09)", border: "1px solid rgba(39,150,107,.18)" }}>
            <CheckCircle2 size={24} style={{ margin: "0 auto 8px" }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 750 }}>{message}</p>
            <Link href="/" style={{ display: "inline-block", marginTop: 12, color: "#6D4DE2", fontSize: 12, fontWeight: 850, textDecoration: "none" }}>Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 13, marginTop: 24 }}>
            {!isReset ? (
              <ResetInput label="Email" type="email" value={email} onChange={setEmail} icon={<Mail size={16} />} autoComplete="email" />
            ) : (
              <>
                <ResetInput label="New password" type="password" value={password} onChange={setPassword} icon={<KeyRound size={16} />} autoComplete="new-password" minLength={8} />
                <ResetInput label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} icon={<KeyRound size={16} />} autoComplete="new-password" minLength={8} />
              </>
            )}
            {error && <p style={{ margin: 0, color: "#D94D5B", fontSize: 12, fontWeight: 750 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ height: 46, border: 0, borderRadius: 15, color: "#FFF", background: "linear-gradient(135deg,#8B5CF6,#6D4DE2)", fontSize: 13, fontWeight: 850, cursor: loading ? "wait" : "pointer", opacity: loading ? .7 : 1 }}>
              {loading ? "Please wait..." : isReset ? "Reset Password" : "Send Reset Link"}
            </button>
            <Link href="/" style={{ textAlign: "center", color: "#6D4DE2", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>Back to sign in</Link>
          </form>
        )}
      </section>
    </main>
  );
}

function ResetInput({ label, type, value, onChange, icon, autoComplete, minLength }: { label: string; type: string; value: string; onChange: (value: string) => void; icon: React.ReactNode; autoComplete: string; minLength?: number }) {
  return <label style={{ display: "grid", gap: 6 }}><span style={{ color: "#4C5676", fontSize: 12, fontWeight: 850 }}>{label}</span><span style={{ height: 44, padding: "0 13px", borderRadius: 14, display: "flex", alignItems: "center", gap: 9, color: "#8B78B5", background: "rgba(255,255,255,.72)", border: "1px solid rgba(255,255,255,.9)" }}>{icon}<input required type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} minLength={minLength} style={{ minWidth: 0, flex: 1, border: 0, outline: 0, color: "#18254B", background: "transparent", fontSize: 13 }} /></span></label>;
}
