import type { MetadataRoute } from "next";

const icon = "/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Notezy",
    short_name: "Notezy",
    description: "Think it. Notezy it.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F3F1FA",
    theme_color: "#8B6BEA",
    icons: [
      {
        src: icon,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icon,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: icon,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icon,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: icon,
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
