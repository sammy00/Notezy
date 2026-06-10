// Theme/Theme.ts

export type ThemeMode = "light" | "dark";

export const lightTheme = {
  name: "light",

  colors: {
    appBg: "#F5F1EC",

    sidebar: "rgba(255,255,255,0.58)",

    navbar: "rgba(255,255,255,0.52)",

    editor: "#FBF8F4",

    glass: "rgba(255,255,255,0.55)",

    border: "rgba(0,0,0,0.06)",

    text: "#1F2A44",

    muted: "#7E8AA0",

    accent: "#A78BFA",

    shadow: "rgba(0,0,0,0.10)",

    glow: "rgba(167,139,250,0.20)",
  },
};

export const darkTheme = {
  name: "dark",

  colors: {
    appBg: "#0F172A",

    sidebar: "rgba(15,23,42,0.72)",

    navbar: "rgba(15,23,42,0.62)",

    editor: "#111827",

    glass: "rgba(255,255,255,0.05)",

    border: "rgba(255,255,255,0.08)",

    text: "#F8FAFC",

    muted: "#94A3B8",

    accent: "#C4B5FD",

    shadow: "rgba(0,0,0,0.45)",

    glow: "rgba(196,181,253,0.25)",
  },
};