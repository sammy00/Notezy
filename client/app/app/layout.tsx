"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NotezyDesktop from "@/components/desktop/NotezyDesktop";
import { getStoredAuthToken } from "@/features/auth/authClient";
import NoteWorkspace from "@/features/notes/NoteSpace";
import TaskWorkspace from "@/features/tasks/TaskWorkspace";

function PersistentWorkspaces() {
  const pathname = usePathname();
  const tasksActive = pathname === "/app/tasks";

  return <div className="notezy-persistent-workspaces">
    <div className="notezy-persistent-workspace" hidden={tasksActive}><NoteWorkspace /></div>
    <div className="notezy-persistent-workspace" hidden={!tasksActive}><TaskWorkspace /></div>
  </div>;
}

function AppLaunchSkeleton() {
  return <div className="notezy-launch-skeleton" aria-label="Loading Notezy" aria-busy="true">
    <aside><span className="brand" />{Array.from({ length: 7 }, (_, index) => <span key={index} />)}</aside>
    <main><header><span /><span /></header><section>{Array.from({ length: 6 }, (_, index) => <article key={index}><i /><i /><i /></article>)}</section></main>
  </div>;
}

export default function ProtectedAppLayout({ children }: { children: ReactNode }) {
  void children;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!getStoredAuthToken()) {
        window.location.replace("/login");
        return;
      }
      setIsAuthenticated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!isAuthenticated) {
    return <AppLaunchSkeleton />;
  }

  return <NotezyDesktop workspace={<PersistentWorkspaces />} />;
}
