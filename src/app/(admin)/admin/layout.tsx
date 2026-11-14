"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BarChart3, LayoutGrid, Utensils } from "lucide-react";
import { UserNav } from "@/components/shared/UserNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Sales & Reports", icon: BarChart3 },
    { href: "/admin/tables", label: "Floor & Tables", icon: LayoutGrid },
    { href: "/admin/menu", label: "Menu & Stock", icon: Utensils },
  ];

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col">
      <header className="px-6 py-3.5 bg-[#181B20] border-b border-[#262A33] flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#0F1115] border border-[#262A33] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">Manager Console</h1>
            <p className="text-xs text-slate-400">Operations & Floor Settings</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <nav className="flex space-x-1.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-[#22262E] text-amber-400 border border-[#262A33]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0F1115]"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <UserNav />
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">{children}</div>
    </div>
  );
}
