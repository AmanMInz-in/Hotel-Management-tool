import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Bistro POS & KDS",
  description: "Touch-optimized Hotel & Restaurant Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
