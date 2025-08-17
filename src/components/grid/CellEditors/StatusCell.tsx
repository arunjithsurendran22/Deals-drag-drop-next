/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLayoutEffect, useRef, useState } from "react";
import type { Deal } from "@/lib/schema";

/** Shared palette for status badges (using CSS vars) */
export const STATUS_BG: Record<Deal["status"], string> = {
  Open: "bg-[var(--status-open)] text-white",
  Blocked: "bg-[var(--status-blocked)] text-white",
  "On Hold": "bg-[var(--status-hold)] text-black",
  Closed: "bg-[var(--status-closed)] text-white",
} as const;

const ITEM_BASE: Record<Deal["status"], string> = {
  Open: "bg-[var(--status-open)] text-white hover:brightness-90 focus-visible:ring-[var(--status-open)]/40",
  Blocked: "bg-[var(--status-blocked)] text-white hover:brightness-90 focus-visible:ring-[var(--status-blocked)]/40",
  "On Hold": "bg-[var(--status-hold)] text-black hover:brightness-90 focus-visible:ring-[var(--status-hold)]/40",
  Closed: "bg-[var(--status-closed)] text-white hover:brightness-90 focus-visible:ring-[var(--status-closed)]/40",
} as const;

const OPTIONS: Deal["status"][] = ["Open", "Blocked", "On Hold", "Closed"];

function cellClassFor(value: Deal["status"] | string) {
  return (STATUS_BG as any)[value] ?? "bg-slate-200 text-slate-900";
}
function itemClassFor(value: Deal["status"] | string) {
  return (ITEM_BASE as any)[value]
    ?? "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-200";
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
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          data-editor
          className={[
            "group w-full px-3 py-2 rounded text-left cursor-pointer flex items-center justify-between gap-2",
            "focus:outline-none data-[state=open]:ring-2 data-[state=open]:ring-black/10 data-[state=open]:shadow-lg",
            cellClassFor(value),
          ].join(" ")}
        >
          <span className="truncate">{value}</span>
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
                  "transition data-[highlighted]:translate-y-[1px] focus:outline-none focus-visible:ring-2",
                  itemClassFor(s),
                ].join(" ")}
              >
                {s}
              </DropdownMenu.Item>
            ))}
          </div>

          <DropdownMenu.Arrow className="fill-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]" width={12} height={8} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
