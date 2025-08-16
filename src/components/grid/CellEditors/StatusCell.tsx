/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/grid/CellEditors/StatusCell.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLayoutEffect, useRef, useState } from "react";
import type { Deal } from "@/lib/schema";

/** Name-based colors per status */
const CELL_BG: Record<Deal["status"], string> = {
  Open: "bg-emerald-500 text-white",
  Blocked: "bg-rose-500 text-white",
  "On Hold": "bg-amber-400 text-black",
  Closed: "bg-slate-500 text-white",
} as const;

const ITEM_BASE: Record<Deal["status"], string> = {
  Open:
    "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-200",
  Blocked:
    "bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-200",
  "On Hold":
    "bg-amber-400 text-black hover:bg-amber-500 focus-visible:ring-amber-200",
  Closed:
    "bg-slate-500 text-white hover:bg-slate-600 focus-visible:ring-slate-200",
} as const;

const OPTIONS: Deal["status"][] = ["Open", "Blocked", "On Hold", "Closed"];

function cellClassFor(value: Deal["status"] | string) {
  return (CELL_BG as any)[value] ?? "bg-slate-200 text-slate-900";
}
function itemClassFor(value: Deal["status"] | string) {
  return (ITEM_BASE as any)[value] ?? "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-200";
}

export function StatusCell({
  value,
  onChange,
}: {
  value: Deal["status"];
  onChange?: (v: Deal["status"]) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.getBoundingClientRect().width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  return (
    <DropdownMenu.Root modal={false}>
      {/* Trigger gets data-state=open|closed so we style the open state */}
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          data-editor
          className={[
            "group w-full px-3 py-2 rounded text-left",
            // open-state visuals so it’s obvious it’s active
            "data-[state=open]:ring-2 data-[state=open]:ring-black/10 data-[state=open]:shadow-lg",
            "flex items-center justify-between gap-2", // caret on the right
            cellClassFor(value),
            "focus:outline-none"
          ].join(" ")}
        >
          <span className="truncate">{value}</span>
          {/* tiny caret; rotates when open */}
          <svg
            className="h-3 w-3 shrink-0 transition-transform duration-150 group-data-[state=open]:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.17l-4.24 3.36a.75.75 0 0 1-.94 0L5.21 8.4a.75.75 0 0 1 .02-1.19z" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          // 👉 open to the RIGHT; falls back if it collides, arrow follows the side
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // z-max so it beats sticky headers/other overlays
          className="z-[9999] rounded-md bg-white p-2 text-sm shadow-2xl ring-1 ring-black/10"
          // keep it at least 220 so items don’t wrap weirdly
          style={{ width: Math.max(220, width ?? 220) }}
        >
          <div className="space-y-1">
            {OPTIONS.map((s) => (
              <DropdownMenu.Item
                key={s}
                onSelect={() => onChange?.(s)}
                className={[
                  "px-3 py-2 cursor-pointer select-none font-medium rounded border border-white/10",
                  "transition data-[highlighted]:translate-y-[1px]",
                  "focus:outline-none focus-visible:ring-2",
                  itemClassFor(s),
                ].join(" ")}
              >
                {s}
              </DropdownMenu.Item>
            ))}
          </div>

          {/* lil triangle arrow (auto-rotates based on side) */}
          <DropdownMenu.Arrow
            className="fill-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
            width={12}
            height={8}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
