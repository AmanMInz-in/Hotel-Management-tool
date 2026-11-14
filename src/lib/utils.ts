import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatElapsedTime(createdDate: string | Date): string {
  const diffMs = Date.now() - new Date(createdDate).getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getTimerColorClass(minutes: number): string {
  if (minutes < 10) return "text-emerald-400 bg-emerald-950/60 border-emerald-500/40";
  if (minutes < 20) return "text-amber-400 bg-amber-950/60 border-amber-500/40";
  return "text-rose-400 bg-rose-950/60 border-rose-500/40 animate-pulse";
}
