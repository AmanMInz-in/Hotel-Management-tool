"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UtensilsCrossed, ChefHat, KeyRound, Delete, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"quick" | "pin" | "email">("quick");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const executeLogin = async (payload: object) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      router.push(data.redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePinKey = (val: string) => {
    if (pin.length < 4) {
      const next = pin + val;
      setPin(next);
      setError("");
      if (next.length === 4) executeLogin({ pin: next });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#181B20] border border-[#262A33] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold tracking-widest uppercase text-amber-500/90">
            Hospitality Management System
          </span>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">The Grand Bistro</h1>
          <p className="text-xs text-slate-400">Staff Terminal Sign-In</p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-[#0F1115] p-1 rounded-xl border border-[#262A33]">
          {[
            { id: "quick", label: "Quick Roles" },
            { id: "pin", label: "PIN Code" },
            { id: "email", label: "Credentials" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id as any);
                setError("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors min-h-[40px] ${
                tab === t.id
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-bold text-center rounded-xl">
            {error}
          </div>
        )}

        {/* Tab 1: One-Tap Quick Role Cards */}
        {tab === "quick" && (
          <div className="space-y-2.5">
            {[
              { role: "ADMIN", title: "Master Admin", desc: "Configuration & Reports", icon: ShieldCheck },
              { role: "WAITER", title: "Captain Waiter", desc: "Floor Grid & Billing", icon: UtensilsCrossed },
              { role: "KITCHEN", title: "Chef / Kitchen Staff", desc: "Kitchen Queue Stream", icon: ChefHat },
            ].map(({ role, title, desc, icon: Icon }) => (
              <button
                key={role}
                onClick={() => executeLogin({ quickRole: role })}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] hover:border-amber-500/40 rounded-xl transition-all text-left min-h-[56px] active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-[#181B20] border border-[#262A33] flex items-center justify-center text-slate-300">
                    <Icon className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{title}</h4>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" strokeWidth={1.75} />
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: Touch PIN Pad */}
        {tab === "pin" && (
          <div className="space-y-4">
            <div className="flex justify-center items-center space-x-3 py-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    i < pin.length
                      ? "bg-amber-500 border-amber-400 scale-110"
                      : "border-[#262A33] bg-[#0F1115]"
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePinKey(n)}
                  className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-lg font-bold text-slate-100 tabular-nums transition-colors min-h-[48px]"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPin("")}
                className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-xs text-slate-400 font-bold uppercase transition-colors min-h-[48px]"
              >
                Clear
              </button>
              <button
                onClick={() => handlePinKey("0")}
                className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-lg font-bold text-slate-100 tabular-nums transition-colors min-h-[48px]"
              >
                0
              </button>
              <button
                onClick={() => setPin((p) => p.slice(0, -1))}
                className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors min-h-[48px]"
              >
                <Delete className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Standard Credentials */}
        {tab === "email" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeLogin({ email, password });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                required
                className="w-full px-4 py-3 bg-[#0F1115] border border-[#262A33] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-[#0F1115] border border-[#262A33] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 min-h-[48px]"
              />
            </div>
            <Button type="submit" variant="primary" isLoading={loading} className="w-full">
              <KeyRound className="w-4 h-4 mr-2" strokeWidth={1.75} />
              Sign In
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
