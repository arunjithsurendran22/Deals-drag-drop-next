// src/components/grid/CellEditors/OwnerCell.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

const OWNERS = ["Aisha", "Omar", "Lina", "Raj", "Maya", "Ken", "Zara"];

// initials helper (typed)
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export function OwnerCell({
  value,
  onChange,
}: {
  value: string;
  onChange?: (v: string) => void;
}) {
  // measure trigger width so dropdown matches cell width
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      setWidth(w);
    });
    ro.observe(el);
    // set once immediately
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const [query, setQuery] = useState<string>("");
  const filtered = useMemo<string[]>(() => {
    const q = query.trim().toLowerCase();
    return q ? OWNERS.filter((o) => o.toLowerCase().includes(q)) : OWNERS;
  }, [query]);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {/* full-cell trigger; use p-0 on the <td> for Owner column to make this edge-to-edge */}
        <button
          ref={triggerRef}
          data-editor
          className="w-full px-3 py-2 text-left bg-white hover:bg-slate-50
                     border border-slate-200 rounded-md
                     flex items-center gap-2 transition
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                       bg-sky-100 text-sky-700 text-[11px] font-semibold"
          >
            {initials(value)}
          </span>
          <span className="truncate">{value}</span>
          <span className="ml-auto text-slate-400 text-xs">▾</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          // ✅ type-safe in your Radix version; prevents focus snapping back to trigger
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-[70] rounded-xl bg-white/95 backdrop-blur shadow-2xl ring-1 ring-black/10 p-2 text-sm"
          style={{ width }}
        >
          {/* search */}
          <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1">
            <span className="text-slate-400 text-xs">🔎</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search owner…"
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Clear"
                type="button"
              >
                ✕
              </button>
            )}
          </div>

          {/* list */}
          <div className="max-h-56 overflow-auto pr-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-slate-500">No matches</div>
            ) : (
              filtered.map((o) => {
                const isActive = o === value;
                const q = query.toLowerCase();
                const idx = q ? o.toLowerCase().indexOf(q) : -1;
                const before = idx >= 0 ? o.slice(0, idx) : o;
                const match = idx >= 0 ? o.slice(idx, idx + q.length) : "";
                const after = idx >= 0 ? o.slice(idx + q.length) : "";

                return (
                  <DropdownMenu.Item
                    key={o}
                    onSelect={() => onChange?.(o)}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                               border border-transparent hover:bg-slate-50
                               focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                                 bg-sky-100 text-sky-700 text-[11px] font-semibold"
                    >
                      {initials(o)}
                    </span>

                    <span className="flex-1 truncate">
                      {idx >= 0 ? (
                        <>
                          {before}
                          <mark className="bg-transparent text-blue-600 font-semibold">
                            {match}
                          </mark>
                          {after}
                        </>
                      ) : (
                        o
                      )}
                    </span>

                    {isActive && <span className="text-emerald-600 text-sm font-semibold">✓</span>}
                  </DropdownMenu.Item>
                );
              })
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
