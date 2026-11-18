"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MobileAppBar } from "@/components/shared/MobileAppBar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] bg-[#0F1115] flex flex-col pb-20 select-none">
      <MobileAppBar
        title="Manager Console"
        subtitle="Operations & Floor Settings"
        roleBadge="Admin"
        showBack={true}
        onBack={() => router.push("/")}
      />

      <main className="flex-1 p-3 sm:p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>

      <MobileBottomNav role="ADMIN" />
    </div>
  );
}
