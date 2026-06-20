import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Notezy",
    short_name: "Notezy",
    description: "Think it. Notezy it.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#F3F1FA",
    theme_color: "#8B6BEA",
    orientation: "any",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/notezy-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/notezy-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/notezy-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/notezy-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New note",
        short_name: "New note",
        description: "Open Notezy and create a note",
        url: "/app?action=new-note",
        icons: [{ src: "/icons/notezy-192.png", sizes: "192x192" }],
      },
    ],
  };
}
