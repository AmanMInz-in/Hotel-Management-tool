import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 bg-[#0F1115] border border-[#262A33] rounded-xl text-slate-100 placeholder:text-slate-500",
            "focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-500/60 transition-colors",
            "min-h-[48px] text-sm",
            error && "border-rose-500 focus:ring-rose-500",
            className
          )}
          {...props}
        />
        {error ? <p className="text-xs text-rose-400 font-medium">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
