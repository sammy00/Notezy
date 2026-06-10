import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
   "./{app,components,features,shared}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        sidebar: "var(--sidebar)",
        surface: "var(--surface)",

        primary: "var(--primary)",
        secondary: "var(--secondary)",

        text: "var(--text)",
        muted: "var(--text-muted)",

        border: "var(--border)",
      },
      boxShadow: {
        soft: "var(--shadow)",
      },
    },
  },
  plugins: [animate],
};

export default config;
