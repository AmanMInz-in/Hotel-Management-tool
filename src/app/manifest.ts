import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Grand Bistro POS",
    short_name: "Bistro POS",
    description: "Mobile-First Handheld Hotel & Restaurant Management System",
    start_url: "/login",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F1115",
    theme_color: "#0F1115",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
