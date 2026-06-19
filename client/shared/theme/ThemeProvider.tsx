"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ThemeMode,
  lightTheme,
  darkTheme,
} from "./Theme";

import { designSystem } from "./DesignSystem";

export type ThemeColors = {
  appBg: string;

  sidebar: string;

  navbar: string;

  editor: string;

  glass: string;

  input: string;

  border: string;

  textPrimary: string;

  textMuted: string;

  accent: string;

  shadow: string;

  glow: string;

  noteBg: string;

  noteBorder: string;
};

type ThemeContextType = {
  mode: ThemeMode;

  setMode: (mode: ThemeMode) => void;

  toggleTheme: () => void;

  theme: typeof lightTheme;

  colors: ThemeColors;

  design: typeof designSystem;
};

const ThemeContext =
  createContext<ThemeContextType | null>(
    null
  );

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] =
    useState<ThemeMode>("light");

  const [isThemeReady, setIsThemeReady] =
    useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedTheme = localStorage.getItem(
        "notezy-theme"
      );

      if (storedTheme === "dark") {
        setMode("dark");
      }

      setIsThemeReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  /* APPLY THEME */

  useEffect(() => {
    if (!isThemeReady) {
      return;
    }

    localStorage.setItem(
      "notezy-theme",
      mode
    );

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(
      mode
    );
  }, [isThemeReady, mode]);

  /* ACTIVE THEME */

  const theme =
    mode === "light"
      ? lightTheme
      : darkTheme;

  /* SEMANTIC COLORS */

  const colors =
    useMemo<ThemeColors>(
      () => ({
        appBg:
          theme.colors.appBg,

        sidebar:
          theme.colors.sidebar,

        navbar:
          theme.colors.navbar,

        editor:
          theme.colors.editor,

        glass:
          theme.colors.glass,

        input:
          mode === "light"
            ? "rgba(255,255,255,0.72)"
            : "#262E63",

        border:
          theme.colors.border,

        textPrimary:
          theme.colors.text,

        textMuted:
          theme.colors.muted,

        accent:
          theme.colors.accent,

        shadow:
          theme.colors.shadow,

        glow:
          theme.colors.glow,

        noteBg:
          mode === "light"
            ? "rgba(255,255,255,0.86)"
            : "#20295A",

        noteBorder:
          mode === "light"
            ? "rgba(255,255,255,0.72)"
            : "rgba(255,255,255,0.08)",
      }),
      [mode, theme]
    );

  const toggleTheme = () => {
    setMode((prev) =>
      prev === "light"
        ? "dark"
        : "light"
    );
  };

  const value = useMemo(
    () => ({
      mode,

      setMode,

      toggleTheme,

      theme,

      colors,

      design: designSystem,
    }),
    [
      mode,
      theme,
      colors,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
