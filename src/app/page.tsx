"use client";

import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ChefHat, ShieldCheck, ArrowRight, Sparkles, LogIn } from "lucide-react";
import { UserNav } from "@/components/shared/UserNav";

export default function HomePage() {
  const terminals = [
    {
      title: "Floor Server POS",
      subtitle: "Front-of-House Operations",
      description: "Interactive table grid, instant order firing, add-on rounds, and bill settlement.",
      href: "/pos",
      icon: UtensilsCrossed,
      badge: "Touch Tablet / Handheld",
    },
    {
      title: "Kitchen Display (KDS)",
      subtitle: "Back-of-House Queue",
      description: "Real-time FIFO queue, aging timers, add-on alerts, and live bump notifications.",
      href: "/kds",
      icon: ChefHat,
      badge: "Kitchen Touch Monitor",
    },
    {
      title: "Manager Console",
      subtitle: "Management & Control",
      description: "Floor tables, live 86'd inventory, collections (Day/Week/Month), and CSV audit export.",
      href: "/admin",
      icon: ShieldCheck,
      badge: "Manager Portal",
    },
  ];

  return (
    <main
      className="relative min-h-screen flex flex-col justify-between p-6 sm:p-12 overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/assets/bg.jpg')" }}
    >
      {/* Semi-transparent dark overlay to enhance restaurant ambiance and card legibility */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] pointer-events-none z-0" />

      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full pb-6 border-b border-white/15 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider drop-shadow">
            Grand Bistro POS Online
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <UserNav />
          <Link
            href="/login"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#181B20]/90 backdrop-blur-md border border-[#262A33] hover:border-amber-500/50 text-slate-200 hover:text-amber-400 text-xs font-bold transition-all min-h-[40px] shadow-lg"
          >
            <LogIn className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
            <span>Terminal Login</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full pt-8 sm:pt-14 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#181B20]/85 backdrop-blur-md border border-[#262A33] text-xs font-semibold text-slate-200 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.75} />
            <span>Hospitality POS & Kitchen Display System</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-md">
            The Grand Bistro
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-xl mx-auto drop-shadow-sm font-medium">
            Select an operational terminal to launch, or sign in to access your designated role portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {terminals.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.title}
                href={t.href}
                className="group relative flex flex-col justify-between p-6 bg-[#181B20]/90 hover:bg-[#181B20] backdrop-blur-md border border-[#262A33] hover:border-amber-500/60 rounded-2xl transition-all duration-200 active:scale-[0.99] shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#0F1115]/90 border border-[#262A33] flex items-center justify-center text-amber-400">
                      <Icon className="w-6 h-6 text-amber-500" strokeWidth={1.75} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-[#0F1115]/90 px-2.5 py-1 rounded-md border border-[#262A33]">
                      {t.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{t.subtitle}</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-slate-300 mt-6 pt-4 border-t border-[#262A33] group-hover:text-amber-400 transition-colors">
                  <span>Launch Terminal</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" strokeWidth={1.75} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-300 py-6 border-t border-white/15 mt-12 relative z-10 drop-shadow">
        The Grand Bistro Hospitality System • High-Performance POS & KDS Engine
      </footer>
    </main>
  );
}
