"use client";

import { useState } from "react";
import { useDragControls } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import NoteWorkspace from "@/features/notes/NoteSpace";

type AppState = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
};

const NOTEZY_ICON = "/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png";
const DESKTOP_BACKGROUND = "/backgrounds/Bg-Desk.jpg";

export default function NotezyDesktop() {
  const dragControls = useDragControls();
  const [notezy, setNotezy] = useState<AppState>({
    open: true,
    minimized: false,
    maximized: true,
  });

  const openApp = () =>
    setNotezy({
      open: true,
      minimized: false,
      maximized: true,
    });

  const closeApp = () =>
    setNotezy({
      open: false,
      minimized: false,
      maximized: true,
    });

  const minimizeApp = () =>
    setNotezy((current) => ({
      ...current,
      minimized: true,
    }));

  const maximizeApp = (maximized: boolean) =>
    setNotezy((current) => ({
      ...current,
      maximized,
    }));

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#EEF0FA]"
      style={{
        background: `linear-gradient(145deg, rgba(248,248,252,0.16), rgba(222,229,246,0.22)), url(${DESKTOP_BACKGROUND}) center / cover no-repeat`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 86% 10%, rgba(169,186,197,0.24), transparent 34%),
            radial-gradient(circle at 10% 100%, rgba(205,219,248,0.22), transparent 34%),
            radial-gradient(ellipse at 50% 50%, transparent 48%, rgba(128,138,176,0.08) 100%)
          `,
        }}
      />

      {notezy.open && !notezy.minimized && (
        <div
          className="absolute z-10"
          style={{
            inset: notezy.maximized ? 0 : 24,
          }}
        >
          <AppLayout
            onMinimize={minimizeApp}
            onMaximize={maximizeApp}
            onClose={closeApp}
            maximized={notezy.maximized}
            dragControls={dragControls}
          >
            <NoteWorkspace />
          </AppLayout>
        </div>
      )}

      {(!notezy.open || notezy.minimized) && (
        <>
          <button
            type="button"
            onClick={openApp}
            aria-label="Open Notezy"
            className="absolute left-8 top-8 z-20 flex w-[86px] flex-col items-center gap-2 border-0 bg-transparent p-0"
            style={{
              color: "#1F2A52",
            }}
          >
            <img
              src={NOTEZY_ICON}
              alt=""
              width={64}
              height={64}
              draggable={false}
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                objectFit: "cover",
                filter: "drop-shadow(0 10px 16px rgba(85,68,150,0.24))",
              }}
            />
            <span
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 12,
                fontWeight: 800,
                textShadow: "0 1px 0 rgba(255,255,255,0.72)",
              }}
            >
              Notezy
            </span>
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center">
            <button
              type="button"
              onClick={openApp}
              aria-label="Open Notezy from taskbar"
              className="flex border-0 bg-transparent p-0"
              style={{
                color: "#1F2A52",
              }}
            >
              <img
                src={NOTEZY_ICON}
                alt=""
                width={34}
                height={34}
                draggable={false}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  objectFit: "cover",
                  filter: "drop-shadow(0 8px 12px rgba(85,68,150,0.24))",
                }}
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
