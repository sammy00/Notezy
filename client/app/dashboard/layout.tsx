import { ReactNode } from "react";
import ProtectedAppShell from "@/components/layout/ProtectedAppShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
