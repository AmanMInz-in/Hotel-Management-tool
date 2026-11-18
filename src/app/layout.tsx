import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F1115",
};

export const metadata: Metadata = {
  title: "Grand Bistro POS & KDS",
  description: "Touch-optimized Mobile Handheld Hotel & Restaurant Management System",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bistro POS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark overscroll-none">
      <body className="min-h-[100dvh] bg-[#0F1115] text-slate-100 antialiased overscroll-none select-none touch-manipulation overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
