"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { showToast } from "@/shared/toast";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallButton() {
  const { mode } = useTheme();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        const hadController = Boolean(navigator.serviceWorker.controller);
        void navigator.serviceWorker
          .register("/sw.js", { updateViaCache: "none" })
          .then((registration) => registration.update());

        if (hadController) {
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => window.location.reload(),
            { once: true },
          );
        }
      } else {
        void navigator.serviceWorker
          .getRegistrations()
          .then((registrations) =>
            Promise.all(registrations.map((registration) => registration.unregister())),
          );
        if ("caches" in window) {
          void caches.keys().then((keys) =>
            Promise.all(
              keys
                .filter((key) => key.startsWith("notezy-shell-"))
                .map((key) => caches.delete(key)),
            ),
          );
        }
      }
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const detectionFrame = window.requestAnimationFrame(() => {
      setShowIosHelp(isiOS && !standalone);
    });

    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const clearInstallPrompt = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", clearInstallPrompt);
    return () => {
      window.cancelAnimationFrame(detectionFrame);
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", clearInstallPrompt);
    };
  }, []);

  if (!installPrompt && !showIosHelp) return null;

  const install = async () => {
    if (!installPrompt) {
      showToast("Use Share → Add to Home Screen", "info");
      return;
    }

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      showToast("Notezy Installed");
    }
  };

  return (
    <motion.button
      type="button"
      className="notezy-install-button"
      aria-label="Install Notezy"
      title="Install Notezy"
      onClick={install}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      style={{
        width: 48,
        height: 48,
        padding: 0,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        color: mode === "dark" ? "#C4B5FD" : "#6D4DE2",
        background:
          mode === "dark"
            ? "rgba(255,255,255,.075)"
            : "rgba(255,255,255,.64)",
        border:
          mode === "dark"
            ? "1px solid rgba(255,255,255,.12)"
            : "1px solid rgba(255,255,255,.78)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.72), 0 12px 24px rgba(82,88,132,.09)",
      }}
    >
      <Download size={20} strokeWidth={2.2} />
    </motion.button>
  );
}
