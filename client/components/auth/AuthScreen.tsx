"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  loginAsDemo,
  loginWithEmail,
  signupWithEmail,
} from "@/features/auth/authClient";

type Props = {
  mode: "login" | "signup";
};

const NOTEZY_ICON = "/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png";

export default function AuthScreen({ mode }: Props) {
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signupWithEmail(name, email, password);
      } else {
        await loginWithEmail(email, password);
      }

      window.location.replace("/dashboard");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await loginAsDemo();
      window.location.replace("/dashboard");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "The demo workspace could not be opened",
      );
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: `
          radial-gradient(circle at 82% 10%, rgba(199,178,255,0.30), transparent 34%),
          radial-gradient(circle at 8% 94%, rgba(207,221,249,0.42), transparent 34%),
          linear-gradient(145deg, rgba(247,248,253,0.94), rgba(231,235,248,0.86))
        `,
      }}
    >
      <section
        style={{
          width: "min(420px, 100%)",
          borderRadius: 30,
          padding: 28,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(246,246,252,0.52))",
          border: "1px solid rgba(255,255,255,0.82)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.94), 0 28px 70px rgba(82,88,132,0.16)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
        }}
      >
        <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
          <Image
            src={NOTEZY_ICON}
            alt=""
            width={72}
            height={72}
            priority
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              objectFit: "cover",
              filter: "drop-shadow(0 14px 20px rgba(85,68,150,0.22))",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                margin: 0,
                color: "#18254B",
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              {isSignup ? "Create Notezy" : "Welcome"}
            </h1>
            <p
              style={{
                margin: "7px 0 0",
                color: "rgba(67,75,119,0.66)",
                fontSize: 14,
                fontWeight: 620,
                lineHeight: 1.5,
              }}
            >
              {isSignup
                ? "Create your account and start saving notes."
                : "Sign in to open your Notezy desktop."}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 12, marginTop: 26 }}
        >
          {isSignup && (
            <AuthInput
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Sanjay Rohit"
              autoComplete="name"
            />
          )}
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Minimum 5 characters"
            autoComplete={isSignup ? "new-password" : "current-password"}
          />

          {!isSignup && (
            <Link
              href="/forgot-password"
              style={{
                justifySelf: "end",
                marginTop: -4,
                color: "#6D4DE2",
                fontSize: 11.5,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          )}

          {error && (
            <p
              style={{
                margin: 0,
                color: "#D94D5B",
                fontSize: 12,
                fontWeight: 750,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 46,
              border: "none",
              borderRadius: 15,
              marginTop: 4,
              background: "linear-gradient(135deg, #8B5CF6, #6D4DE2)",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 850,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.72 : 1,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.24), 0 16px 30px rgba(109,77,226,0.24)",
            }}
          >
            {loading
              ? isSignup
                ? "Creating..."
                : "Signing in..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {!isSignup && (
          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            <div
              aria-hidden="true"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 10,
                color: "rgba(67,75,119,0.5)",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              <span style={{ height: 1, background: "rgba(87,93,132,0.16)" }} />
              OR
              <span style={{ height: 1, background: "rgba(87,93,132,0.16)" }} />
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              style={{
                height: 46,
                border: "1px solid rgba(109,77,226,0.22)",
                borderRadius: 15,
                background: "rgba(255,255,255,0.58)",
                color: "#6545D6",
                fontSize: 14,
                fontWeight: 850,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.72 : 1,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 24px rgba(109,77,226,0.10)",
              }}
            >
              {loading ? "Opening workspace..." : "🚀 Try Demo Account"}
            </button>
            <p style={{ margin: -4, textAlign: "center", color: "rgba(67,75,119,0.58)", fontSize: 11, fontWeight: 650 }}>
              No signup required · Resets to sample notes on login
            </p>
          </div>
        )}

        <p
          style={{
            margin: "18px 0 0",
            textAlign: "center",
            color: "rgba(67,75,119,0.68)",
            fontSize: 13,
            fontWeight: 650,
          }}
        >
          {isSignup ? "Already have an account?" : "New to Notezy?"}{" "}
          <Link
            href={isSignup ? "/" : "/signup"}
            style={{
              color: "#6D4DE2",
              fontWeight: 850,
              textDecoration: "none",
            }}
          >
            {isSignup ? "Sign in" : "Create account"}
          </Link>
        </p>
      </section>
    </main>
  );
}

function AuthInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          color: "#4C5676",
          fontSize: 12,
          fontWeight: 850,
        }}
      >
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          height: 44,
          border: "1px solid rgba(255,255,255,0.74)",
          borderRadius: 14,
          padding: "0 14px",
          outline: "none",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(246,246,252,0.46))",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.88), 0 8px 18px rgba(90,95,140,0.06)",
          color: "#18254B",
          fontSize: 14,
          fontWeight: 650,
        }}
      />
    </label>
  );
}
