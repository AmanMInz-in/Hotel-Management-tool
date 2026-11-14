import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "touch";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "touch",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-xl transition-colors duration-100 select-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-amber-500/50";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs h-9 min-h-[36px]",
    md: "px-4 py-2 text-sm h-11 min-h-[44px]",
    lg: "px-5 py-3 text-sm h-12 min-h-[48px]",
    touch: "px-5 py-3 text-sm h-12 min-h-[48px] min-w-[48px]",
  };

  const variantStyles = {
    primary: "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-sm",
    secondary: "bg-[#181B20] hover:bg-[#22262E] active:bg-[#262A33] text-slate-200 border border-[#262A33]",
    success: "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm",
    warning: "bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm",
    outline: "border border-[#262A33] hover:border-slate-600 text-slate-300 bg-transparent hover:bg-[#181B20]",
    ghost: "bg-transparent hover:bg-[#181B20] text-slate-400 hover:text-white",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
