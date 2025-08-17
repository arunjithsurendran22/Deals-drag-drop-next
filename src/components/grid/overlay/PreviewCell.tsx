"use client";
import * as React from "react";
import type { Deal } from "@/lib/schema";

const PREVIEW_ROW_H = 32;

const STATUS_BG: Record<Deal["status"], string> = {
  Open: "bg-emerald-500 text-white",
  Blocked: "bg-rose-500 text-white",
  "On Hold": "bg-amber-400 text-black",
  Closed: "bg-slate-500 text-white",
};
const STAGE_BG: Record<Deal["stage"], string> = {
  New: "bg-sky-500 text-white",
  Qualified: "bg-violet-500 text-white",
  Proposal: "bg-cyan-500 text-white",
  Negotiation: "bg-amber-500 text-black",
  Won: "bg-emerald-500 text-white",
  Lost: "bg-slate-500 text-white",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const initials = (name: string) =>
  name.split(/\s+/).map((s) => s[0]?.toUpperCase() ?? "").slice(0, 2).join("");

export function PreviewCell({ colId, value }: { colId: string; value: unknown }) {
  const style: React.CSSProperties = { height: PREVIEW_ROW_H };

  switch (colId) {
    case "status": {
      const v = value as Deal["status"];
      return <div style={style} className={`w-full rounded-md px-3 flex items-center font-medium ${STATUS_BG[v]}`}>{v}</div>;
    }
    case "stage": {
      const v = value as Deal["stage"];
      return <div style={style} className={`w-full rounded-md px-3 flex items-center font-medium ${STAGE_BG[v]}`}>{v}</div>;
    }
    case "owner": {
      const v = String(value ?? "");
      return (
        <div style={style} className="w-full rounded-md bg-white border border-slate-200 px-3 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-[11px] font-semibold">
            {initials(v)}
          </span>
          <span className="truncate">{v}</span>
        </div>
      );
    }
    case "amount": {
      const n = Number(value ?? 0);
      return <div style={style} className="w-full rounded-md bg-white border border-slate-200 px-3 flex items-center">{money(n)}</div>;
    }
    case "probability": {
      const p = Number(value ?? 0);
      return <div style={style} className="w-full rounded-md bg-slate-100 px-3 flex items-center">{`${Math.round(p * 100)}%`}</div>;
    }
    default:
      return <div style={style} className="w-full rounded-md bg-slate-100 px-3 flex items-center truncate">{String(value ?? "")}</div>;
  }
}
