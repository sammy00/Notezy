// Theme/Theme.ts

export type ThemeMode = "light" | "dark";

export const lightTheme = {
  name: "light",

  colors: {
    appBg: "#F7F8FC",

    sidebar: "rgba(255,255,255,0.84)",

    navbar: "rgba(255,255,255,0.78)",

    editor: "#FFFFFF",

    glass: "rgba(255,255,255,0.72)",

    border: "rgba(0,0,0,0.06)",

    text: "#111827",

    muted: "#68708A",

    accent: "#8B5CF6",

    shadow: "rgba(73,80,120,0.12)",

    glow: "rgba(167,139,250,0.20)",
  },
};

export const darkTheme = {
  name: "dark",

  colors: {
    appBg: "#171B38",

    sidebar: "#0E1B35",

    navbar: "#1C2450",

    editor: "#20295A",

    glass: "rgba(28,36,80,0.76)",

    border: "rgba(255,255,255,0.08)",

    text: "#E8EAF8",

    muted: "#AAB6CC",

    accent: "#A78BFA",

    shadow: "rgba(5,10,24,0.52)",

    glow: "rgba(167,139,250,0.18)",
  },
};
