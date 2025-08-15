// src/components/grid/CellEditors/StatusCell.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLayoutEffect, useRef, useState } from "react";
import type { Deal } from "@/lib/schema";

// full-cell green stack
const CELL_BG: Record<Deal["status"], string> = {
  Open: "bg-green-400 text-white",
  Blocked: "bg-green-500 text-white",
  "On Hold": "bg-green-600 text-white",
  Closed: "bg-green-700 text-white",
};

const ITEM_BASE: Record<Deal["status"], string> = {
  Open: "bg-green-400 text-white hover:bg-green-500 focus-visible:ring-green-200",
  Blocked: "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-300",
  "On Hold": "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-400",
  Closed: "bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-500",
};

const OPTIONS: Deal["status"][] = ["Open", "Blocked", "On Hold", "Closed"];

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
          className={`w-full text-left px-3 py-2 ${CELL_BG[value]} focus:outline-none`}
        >
          {value}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          /* ✅ type-safe in your Radix version */
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-[70] shadow-2xl ring-1 ring-black/10 rounded-md p-2 text-sm bg-white/95 backdrop-blur"
          style={{ width }}
        >
          <div className="space-y-1">
            {OPTIONS.map((s) => (
              <DropdownMenu.Item
                key={s}
                onSelect={() => onChange?.(s)}
                className={`px-3 py-2 cursor-pointer select-none font-medium rounded
                            border border-white/10 ${ITEM_BASE[s]}
                            transition data-[highlighted]:translate-y-[1px]
                            focus:outline-none focus-visible:ring-2`}
              >
                {s}
              </DropdownMenu.Item>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
