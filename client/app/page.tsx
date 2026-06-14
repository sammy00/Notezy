"use client";

import { useEffect } from "react";
import { getStoredAuthToken } from "@/features/auth/authClient";

export default function HomePage() {
  useEffect(() => {
    window.location.replace(getStoredAuthToken() ? "/app" : "/login");
  }, []);

  return null;
}
