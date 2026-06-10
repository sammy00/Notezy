"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthToken } from "@/features/auth/authClient";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredAuthToken() ? "/app" : "/login");
  }, [router]);

  return null;
}
