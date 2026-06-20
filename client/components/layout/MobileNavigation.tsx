"use client";

import { FileText, Menu, Plus, Search, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/shared/theme/ThemeProvider";

const NEW_NOTE_EVENT = "notezy:create-note";
const NOTE_FILTER_EVENT = "notezy:set-note-filter";
const FOCUS_SEARCH_EVENT = "notezy:focus-search";
const SHOW_NOTES_EVENT = "notezy:show-notes";

type Props = {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
};

export default function MobileNavigation({
  drawerOpen,
  onToggleDrawer,
}: Props) {
  const { mode } = useTheme();

  const setFilter = (filter: "all" | "favorites") => {
    window.dispatchEvent(new Event(SHOW_NOTES_EVENT));
    window.dispatchEvent(
      new CustomEvent(NOTE_FILTER_EVENT, { detail: { filter } }),
    );
  };

  const items = [
    {
      label: "Notes",
      icon: FileText,
      action: () => setFilter("all"),
    },
    {
      label: "Search",
      icon: Search,
      action: () => {
        window.dispatchEvent(new Event(SHOW_NOTES_EVENT));
        window.dispatchEvent(new Event(FOCUS_SEARCH_EVENT));
      },
    },
    {
      label: "New",
      icon: Plus,
      primary: true,
      action: () => window.dispatchEvent(new Event(NEW_NOTE_EVENT)),
    },
    {
      label: "Favorites",
      icon: Star,
      action: () => setFilter("favorites"),
    },
    {
      label: "Menu",
      icon: Menu,
      active: drawerOpen,
      action: onToggleDrawer,
    },
  ];

  return (
    <nav
      className="notezy-mobile-nav"
      aria-label="Mobile navigation"
      style={{
        background:
          mode === "dark"
            ? "rgba(14,27,53,0.94)"
            : "rgba(255,255,255,0.88)",
        border:
          mode === "dark"
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(255,255,255,0.92)",
      }}
    >
      {items.map(({ label, icon: Icon, action, primary, active }) => (
        <motion.button
          key={label}
          type="button"
          onClick={action}
          aria-label={label}
          whileTap={{ scale: 0.9 }}
          style={{
            color: primary || active ? "#FFFFFF" : mode === "dark" ? "#AAB6CC" : "#596584",
            background: primary
              ? "linear-gradient(135deg, #9B7AEA, #7554D8)"
              : active
                ? "#7C5CE0"
                : "transparent",
            boxShadow: primary
              ? "0 10px 20px rgba(109,77,226,0.3)"
              : "none",
          }}
        >
          <Icon size={primary ? 21 : 19} strokeWidth={2.25} />
          <span>{label}</span>
        </motion.button>
      ))}
    </nav>
  );
}
