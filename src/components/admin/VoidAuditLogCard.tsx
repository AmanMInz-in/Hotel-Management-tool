"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

interface VoidAuditLogCardProps {
  voids?: Array<{
    id: string;
    itemName: string;
    authorizedByName: string;
    reason: string;
    voidedAt: string;
  }>;
}

export const VoidAuditLogCard: React.FC<VoidAuditLogCardProps> = ({ voids }) => {
  return (
    <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#262A33]">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <ShieldAlert className="w-4 h-4 mr-2 text-rose-400" strokeWidth={1.75} />
          Manager Void Audit Log ({voids?.length || 0})
        </h3>
      </div>
      <div className="divide-y divide-[#262A33] max-h-80 overflow-y-auto">
        {!voids || voids.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No items voided in this period.</p>
        ) : (
          voids.map((v) => (
            <div key={v.id} className="py-2.5 flex items-center justify-between text-sm">
              <div>
                <span className="font-bold text-rose-300 block">{v.itemName}</span>
                <span className="text-xs text-slate-400 block">
                  Auth by {v.authorizedByName} • &quot;{v.reason}&quot;
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                {new Date(v.voidedAt).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
