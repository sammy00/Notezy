"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotezyDesktop from "@/components/desktop/NotezyDesktop";
import { getStoredAuthToken } from "@/features/auth/authClient";

export default function ProtectedAppPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const hasToken = Boolean(getStoredAuthToken());

      if (!hasToken) {
        router.replace("/login");
        return;
      }

      setIsAuthenticated(true);
    };

    window.requestAnimationFrame(checkAuth);
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#EEF0FA",
          color: "#1F2A52",
          fontWeight: 800,
        }}
      >
        Opening Notezy...
      </div>
    );
  }

  return <NotezyDesktop />;
}
