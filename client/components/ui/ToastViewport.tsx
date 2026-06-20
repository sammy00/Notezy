"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert, Info } from "lucide-react";
import {
  NOTEZY_TOAST_EVENT,
  ToastTone,
} from "@/shared/toast";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

export default function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<{
        message?: string;
        tone?: ToastTone;
      }>).detail;

      if (!detail?.message) return;

      const toast: ToastItem = {
        id: crypto.randomUUID(),
        message: detail.message,
        tone: detail.tone ?? "success",
      };

      setToasts((current) => [...current.slice(-2), toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 2600);
    };

    window.addEventListener(NOTEZY_TOAST_EVENT, handleToast);
    return () => window.removeEventListener(NOTEZY_TOAST_EVENT, handleToast);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        top: 78,
        right: 28,
        zIndex: 10000,
        display: "grid",
        justifyItems: "end",
        gap: 9,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const color =
            toast.tone === "error"
              ? "#D94D5B"
              : toast.tone === "info"
                ? "#6D4DE2"
                : "#27966B";
          const Icon =
            toast.tone === "error"
              ? CircleAlert
              : toast.tone === "info"
                ? Info
                : Check;

          return (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, x: 18, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              style={{
                minWidth: 190,
                height: 46,
                padding: "0 15px 0 11px",
                borderRadius: 15,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#263052",
                background: "rgba(255,252,246,0.94)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 16px 36px rgba(50,42,78,0.18)",
                backdropFilter: "blur(18px) saturate(160%)",
                WebkitBackdropFilter: "blur(18px) saturate(160%)",
                fontSize: 12.5,
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: 9,
                  display: "grid",
                  placeItems: "center",
                  color,
                  background: `${color}12`,
                }}
              >
                <Icon size={15} strokeWidth={2.5} />
              </span>
              {toast.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
