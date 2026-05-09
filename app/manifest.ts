import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aviron AI Builder",
    short_name: "Aviron AI",
    description: "Premium AI software for websites, themes, creatives, and ad generation.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050509",
    theme_color: "#0b0b12",
    categories: ["productivity", "business", "design"],
    icons: [
      {
        src: "/icons/aviron-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/aviron-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/aviron-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
