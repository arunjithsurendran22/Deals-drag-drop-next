"use client";
import * as React from "react";
import { PreviewCell } from "./PreviewCell";

const PREVIEW_ROW_GAP = 12;

export function HeaderGhost({
  label,
  width,
  height,
  colId,
  items,
}: {
  label: string;
  width: number;
  height: number;
  colId: string;
  items: Array<{ key: string; value: unknown }>;
}) {
  return (
    <div
      style={{ width, height }}
      className="pointer-events-none select-none rounded-xl bg-white px-3 py-2 shadow-2xl ring-1 ring-black/10 rotate-2"
    >
      <div className="text-xs uppercase tracking-wide text-slate-500 px-1 py-1">{label}</div>
      <div className="mt-2 h-[calc(100%-32px)] overflow-hidden flex flex-col" style={{ gap: PREVIEW_ROW_GAP }}>
        {items.map((it) => <PreviewCell key={it.key} colId={colId} value={it.value} />)}
      </div>
    </div>
  );
}
