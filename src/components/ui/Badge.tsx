import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "available" | "occupied" | "bill" | "cleaning" | "neutral" | "danger" | "addon";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  size = "md",
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium tracking-wide",
    md: "px-2.5 py-1 text-xs font-bold tracking-wide uppercase",
  };

  const variantStyles = {
    available: "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30",
    occupied: "bg-amber-950/60 text-amber-400 border border-amber-500/30",
    bill: "bg-rose-950/60 text-rose-400 border border-rose-500/30",
    cleaning: "bg-sky-950/60 text-sky-400 border border-sky-500/30",
    danger: "bg-rose-950/70 text-rose-400 border border-rose-500/30",
    neutral: "bg-[#181B20] text-slate-300 border border-[#262A33]",
    addon: "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg select-none whitespace-nowrap",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
