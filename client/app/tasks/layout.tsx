import { ReactNode } from "react";
import ProtectedAppShell from "@/components/layout/ProtectedAppShell";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
