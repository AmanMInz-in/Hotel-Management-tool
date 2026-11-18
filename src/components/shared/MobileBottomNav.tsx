"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ChefHat, BarChart3, Utensils, LogOut, LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileBottomNavProps {
  role?: "WAITER" | "ADMIN" | "KITCHEN";
  readyCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  role = "WAITER",
  readyCount = 0,
}) => {
  const pathname = usePathname();

  const waiterNav: NavItem[] = [
    { label: "Floor Tables", href: "/pos", icon: LayoutGrid },
    { label: "Kitchen KDS", href: "/kds", icon: ChefHat, badge: readyCount },
    { label: "Admin", href: "/admin", icon: BarChart3 },
  ];

  const adminNav: NavItem[] = [
    { label: "Reports", href: "/admin", icon: BarChart3 },
    { label: "Floor Tables", href: "/admin/tables", icon: LayoutGrid },
    { label: "Inventory", href: "/admin/menu", icon: Utensils },
    { label: "Waiter POS", href: "/pos", icon: LayoutGrid },
  ];

  const kitchenNav: NavItem[] = [
    { label: "Kitchen Queue", href: "/kds", icon: ChefHat },
    { label: "Floor Grid", href: "/pos", icon: LayoutGrid },
    { label: "Reports", href: "/admin", icon: BarChart3 },
  ];

  const navItems = role === "ADMIN" ? adminNav : role === "KITCHEN" ? kitchenNav : waiterNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#181B20]/95 backdrop-blur-md border-t border-[#262A33] pb-safe select-none">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1.5 rounded-xl transition-all active:scale-95 relative ${
                isActive
                  ? "text-amber-400 font-bold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-400 stroke-[2.2]" : "text-slate-400 stroke-[1.75]"}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-bounce shadow">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[80px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
