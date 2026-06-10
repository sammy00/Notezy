"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Palette, Search, Settings, Tag, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { designSystem } from "@/shared/theme/DesignSystem";

const ACTIONS = [
  {
    label: "Tags",
    icon: Tag,
  },
  {
    label: "Settings",
    icon: Settings,
  },
  {
    label: "Notifications",
    icon: Bell,
    dot: true,
  },
  {
    label: "Theme",
    icon: Palette,
  },
];

const NOTE_SEARCH_EVENT = "notezy:set-note-search";

export default function Navbar() {
  const { mode, colors } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const updateSearch = (value: string) => {
    setSearchQuery(value);
    window.dispatchEvent(
      new CustomEvent(NOTE_SEARCH_EVENT, { detail: { query: value } }),
    );
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === searchInputRef.current) {
        updateSearch("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const handleSearchSync = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;

      if (typeof query === "string") {
        setSearchQuery(query);
      }
    };

    window.addEventListener(NOTE_SEARCH_EVENT, handleSearchSync);

    return () =>
      window.removeEventListener(NOTE_SEARCH_EVENT, handleSearchSync);
  }, []);

  const searchGlass =
    mode === "light"
      ? {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(246,246,252,0.42))",
          border: "1px solid rgba(255,255,255,0.76)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.92), 0 12px 24px rgba(90,95,140,0.08)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }
      : designSystem.glass.dark.primary;

  const actionGlass =
    mode === "light"
      ? {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.64), rgba(244,244,251,0.42))",
          border: "1px solid rgba(255,255,255,0.72)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -1px 2px rgba(104,96,145,0.07), 0 12px 24px rgba(82,88,132,0.09)",
          backdropFilter: "blur(22px) saturate(175%)",
          WebkitBackdropFilter: "blur(22px) saturate(175%)",
        }
      : designSystem.glass.dark.primary;

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between gap-4">
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className="flex w-full max-w-[356px] items-center gap-3 px-[18px]"
          style={{
            ...searchGlass,
            ...(mode === "dark"
              ? {
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.055))",
                  border: searchFocused
                    ? "1px solid rgba(139,92,246,0.45)"
                    : "1px solid rgba(255,255,255,0.13)",
                  boxShadow: searchFocused
                    ? "inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 3px rgba(139,92,246,0.10), 0 16px 34px rgba(0,0,0,0.22), 0 0 32px rgba(139,92,246,0.16)"
                    : "inset 0 1px 0 rgba(255,255,255,0.12), 0 14px 30px rgba(0,0,0,0.18)",
                }
              : {}),
            height: 48,
            borderRadius: 17,
          }}
        >
          <Search
            size={20}
            color={searchFocused ? "#C4B5FD" : mode === "dark" ? "#AAB6CC" : "#61708F"}
            strokeWidth={2.2}
          />

          <input
            ref={searchInputRef}
            value={searchQuery}
            placeholder="Search Anything"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={(event) => updateSearch(event.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{
              color: colors.textPrimary,
              fontSize: designSystem.typography.body,
              fontWeight: designSystem.typography.weights.medium,
              letterSpacing: 0,
            }}
          />

          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                updateSearch("");
                searchInputRef.current?.focus();
              }}
              style={{
                width: 26,
                height: 26,
                border: "none",
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color:
                  mode === "light"
                    ? "rgba(55,64,98,0.62)"
                    : colors.textMuted,
                background:
                  mode === "light"
                    ? "rgba(255,255,255,0.62)"
                    : "rgba(255,255,255,0.075)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.70), 0 1px 2px rgba(70,78,120,0.06)",
              }}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          ) : (
            <kbd
              className="hidden sm:flex items-center gap-1 px-2.5 py-[4px]"
              style={{
                borderRadius: 999,
                background:
                  mode === "light"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(246,241,232,0.54))"
                    : "rgba(255,255,255,0.075)",
                color:
                  mode === "light" ? "rgba(55,64,98,0.62)" : colors.textMuted,
                fontSize: 11,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: 0,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.70), 0 1px 2px rgba(70,78,120,0.06), 0 0 0 1px rgba(139,92,246,0.06)",
              }}
            >
              <span>Ctrl</span>
              <span>K</span>
            </kbd>
          )}
        </motion.div>

        <div className="flex shrink-0 items-center" style={{ gap: 14 }}>
          {ACTIONS.map(({ label, icon: Icon, dot }) => (
            <motion.button
              key={label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="relative grid place-items-center"
              style={{
                ...actionGlass,
                ...(mode === "dark"
                  ? {
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.052))",
                      border: "1px solid rgba(255,255,255,0.13)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.13), 0 14px 30px rgba(0,0,0,0.18)",
                    }
                  : {}),
                width: 48,
                height: 48,
                borderRadius: 16,
              }}
            >
              <Icon
                size={18}
                color={mode === "light" ? "#24315F" : colors.textMuted}
                strokeWidth={2.2}
              />

              {dot && (
                <span
                  className="absolute rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    top: 8,
                    right: 10,
                    background: "#F4B73B",
                    boxShadow:
                      "0 0 0 3px rgba(255,255,255,0.86), 0 2px 5px rgba(212,143,30,0.22)",
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div
        className="mt-5 h-px w-full"
        style={{
          background:
            mode === "light"
              ? "linear-gradient(90deg, rgba(210,214,228,0), rgba(210,214,228,0.82), rgba(210,214,228,0))"
              : "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))",
        }}
      />
    </div>
  );
}
