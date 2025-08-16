/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/grid/CellEditors/StageCell.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLayoutEffect, useRef, useState } from "react";

type Stage = "New" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";

/** Color per stage (not all purple now) */
const CELL_BG: Record<Stage, string> = {
  New: "bg-sky-500 text-white",
  Qualified: "bg-violet-500 text-white",
  Proposal: "bg-cyan-500 text-white",
  Negotiation: "bg-amber-500 text-black",
  Won: "bg-emerald-500 text-white",
  Lost: "bg-slate-500 text-white",
} as const;

const ITEM_BASE: Record<Stage, string> = {
  New: "bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-200",
  Qualified:
    "bg-violet-500 text-white hover:bg-violet-600 focus-visible:ring-violet-200",
  Proposal:
    "bg-cyan-500 text-white hover:bg-cyan-600 focus-visible:ring-cyan-200",
  Negotiation:
    "bg-amber-500 text-black hover:bg-amber-600 focus-visible:ring-amber-200",
  Won: "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-200",
  Lost:
    "bg-slate-500 text-white hover:bg-slate-600 focus-visible:ring-slate-200",
} as const;

const OPTIONS: Stage[] = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

function cellClassFor(value: Stage | string) {
  return (CELL_BG as any)[value] ?? "bg-slate-200 text-slate-900";
}
function itemClassFor(value: Stage | string) {
  return (ITEM_BASE as any)[value]
    ?? "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-200";
}

export function StageCell({
  value,
  onChange,
}: {
  value: Stage;
  onChange?: (v: Stage) => void;
}) {
  // measure trigger so menu can be at least that wide
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setWidth(el.getBoundingClientRect().width)
    );
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  return (
    <DropdownMenu.Root modal={false}>
      {/* trigger shows open state via data-state attr */}
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          data-editor
          className={[
            "group w-full px-3 py-2 rounded text-left",
            "flex items-center justify-between gap-2",
            "focus:outline-none",
            // open-state ring/shadow so it’s obvious
            "data-[state=open]:ring-2 data-[state=open]:ring-black/10 data-[state=open]:shadow-lg",
            cellClassFor(value),
          ].join(" ")}
        >
          <span className="truncate">{value}</span>
          {/* caret that flips when menu is open */}
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
          // 👉 open to the RIGHT with arrow
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-[9999] rounded-md bg-white p-2 text-sm shadow-2xl ring-1 ring-black/10"
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

          {/* lil triangle that points to the trigger */}
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
