"use client";

import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ChefHat, ShieldCheck, ArrowRight, Sparkles, LogIn } from "lucide-react";
import { UserNav } from "@/components/shared/UserNav";

export default function HomePage() {
  const terminals = [
    {
      title: "Waiter POS Terminal",
      subtitle: "Front-of-House Operations",
      description: "Interactive table grid, instant order taking, add-on rounds, and bill settlement.",
      href: "/pos",
      icon: UtensilsCrossed,
      color: "from-blue-600 to-indigo-600",
      accent: "border-blue-500/40 hover:border-blue-500",
      badge: "Touch Handheld / Tablet",
    },
    {
      title: "Kitchen Display (KDS)",
      subtitle: "Back-of-House Queue",
      description: "Real-time FIFO order queue, aging timers, add-on alerts, and ready notifications.",
      href: "/kds",
      icon: ChefHat,
      color: "from-orange-600 to-amber-600",
      accent: "border-orange-500/40 hover:border-orange-500",
      badge: "Kitchen Touch Monitor",
    },
    {
      title: "Admin Dashboard",
      subtitle: "Management & Control",
      description: "Dynamic tables, live menu & 86'd management, sales analytics, and void audit logs.",
      href: "/admin",
      icon: ShieldCheck,
      color: "from-purple-600 to-violet-600",
      accent: "border-purple-500/40 hover:border-purple-500",
      badge: "Manager Portal",
    },
  ];

  return (
    <main className="min-h-screen bg-background flex flex-col justify-between p-6 sm:p-12">
      {/* Top Header with User Status / Login Link */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full pb-6 border-b border-slate-900">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-400">Grand Bistro POS Online</span>
        </div>
        <div className="flex items-center space-x-3">
          <UserNav />
          <Link
            href="/login"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:text-white hover:bg-blue-600 text-xs font-bold transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Terminal Login / Switch</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full pt-8 sm:pt-12">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Phase 1 Verified: RBAC & Master Config</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            The Grand Bistro
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
            Select a terminal to launch, or sign in to access your designated role portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {terminals.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.title}
                href={t.href}
                className={`group relative flex flex-col justify-between p-6 bg-slate-900/90 border rounded-3xl transition-all duration-200 active:scale-[0.98] shadow-2xl hover:shadow-blue-900/20 ${t.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                      {t.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{t.subtitle}</p>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center text-sm font-bold text-slate-200 mt-6 pt-4 border-t border-slate-800 group-hover:text-white">
                  <span>Launch Terminal</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-600 py-6 border-t border-slate-900 mt-12">
        Hotel & Restaurant Management System • Real-Time Socket.io • SQLite/PostgreSQL Prisma Engine
      </footer>
    </main>
  );
}
