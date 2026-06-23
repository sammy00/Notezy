"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LegacyAppLayout({ children }: { children: ReactNode }) {
  void children;
  const pathname = usePathname();

  useEffect(() => {
    window.location.replace(
      pathname.endsWith("/tasks") ? "/tasks" : "/dashboard",
    );
  }, [pathname]);

  return null;
}
