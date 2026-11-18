"use client";

import React, { useState } from "react";
import { ShieldAlert, Delete } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

interface VoidAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: string;
  onConfirmVoid: (itemId: string, pin: string, reason: string) => Promise<void>;
}

export const VoidAuthModal: React.FC<VoidAuthModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemId,
  onConfirmVoid,
}) => {
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleVoid = async () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    if (!reason.trim()) {
      setError("Cancellation reason is required");
      return;
    }
    setLoading(true);
    try {
      await onConfirmVoid(itemId, pin, reason);
      setPin("");
      setReason("");
      setError("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid Admin PIN or void failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Manager PIN Authorization"
      description={`Voiding "${itemName}" in kitchen queue.`}
    >
      <div className="space-y-4">
        {/* PIN Dots Display */}
        <div className="flex justify-center items-center space-x-3 py-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                i < pin.length
                  ? "bg-rose-500 border-rose-400 scale-110"
                  : "border-[#262A33] bg-[#0F1115]"
              }`}
            />
          ))}
        </div>

        {error ? (
          <p
            id="void-error-msg"
            className="text-center text-xs text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40"
          >
            {error}
          </p>
        ) : null}

        {/* Reason Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Reason for Cancellation
          </label>
          <input
            id="void-reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Guest change of mind..."
            className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#262A33] rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 min-h-[44px]"
          />
        </div>

        {/* Touch Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
            <button
              key={n}
              id={`pin-btn-${n}`}
              type="button"
              onClick={() => handleKeyPress(n)}
              className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-lg font-bold text-slate-100 tabular-nums transition-colors min-h-[48px]"
            >
              {n}
            </button>
          ))}
          <button
            id="pin-btn-clear"
            type="button"
            onClick={() => {
              setPin("");
              setError("");
            }}
            className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-xs font-bold text-slate-400 uppercase transition-colors min-h-[48px]"
          >
            Clear
          </button>
          <button
            id="pin-btn-0"
            type="button"
            onClick={() => handleKeyPress("0")}
            className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-lg font-bold text-slate-100 tabular-nums transition-colors min-h-[48px]"
          >
            0
          </button>
          <button
            id="pin-btn-delete"
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors min-h-[48px]"
          >
            <Delete className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="pt-2">
          <Button
            id="authorize-void-btn"
            variant="danger"
            onClick={handleVoid}
            disabled={loading || pin.length < 4}
            isLoading={loading}
            className="w-full min-h-[50px] font-bold"
          >
            <ShieldAlert className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Authorize Void Item
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
