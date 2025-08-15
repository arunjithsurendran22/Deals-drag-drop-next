// src/components/grid/CellEditors/StageCell.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLayoutEffect, useRef, useState } from "react";

type Stage = "New" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";

// full-cell bg (your dark-start purple stack)
const CELL_BG: Record<Stage, string> = {
  New: "bg-purple-400 text-white",
  Qualified: "bg-purple-500 text-white",
  Proposal: "bg-purple-600 text-white",
  Negotiation: "bg-purple-700 text-white",
  Won: "bg-purple-800 text-white",
  Lost: "bg-purple-900 text-white",
};

// menu item colors (same hues, deeper on hover)
const ITEM_BASE: Record<Stage, string> = {
  New: "bg-purple-400 text-white hover:bg-purple-500 focus-visible:ring-purple-200",
  Qualified: "bg-purple-500 text-white hover:bg-purple-600 focus-visible:ring-purple-300",
  Proposal: "bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-400",
  Negotiation: "bg-purple-700 text-white hover:bg-purple-800 focus-visible:ring-purple-500",
  Won: "bg-purple-800 text-white hover:bg-purple-900 focus-visible:ring-purple-600",
  Lost: "bg-purple-900 text-white hover:bg-purple-950 focus-visible:ring-purple-700",
};

export function StageCell({
  value,
  onChange,
}: {
  value: Stage;
  onChange?: (v: Stage) => void;
}) {
  const options: Stage[] = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

  // measure trigger width so content matches the cell width
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
        {/* full-cell trigger */}
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
          // absolute overlay, same width as cell
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          /* ✅ use this instead of onOpenAutoFocus to keep TS happy */
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-[70] shadow-2xl ring-1 ring-black/10 rounded-md p-2 text-sm bg-white/95 backdrop-blur"
          style={{ width }}
        >
          <div className="space-y-1">
            {options.map((s) => (
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
