// src/components/grid/CellEditors/AmountCell.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { money } from "@/lib/formatting"; // assumes money(1234) => formatted currency

type Props = {
  value: number;
  onChange?: (v: number) => void;
  currency?: string;   // visual prefix only (doesn't affect value)
  step?: number;       // default increment/decrement step
  min?: number;        // default 0
  max?: number;        // optional clamp
};

const nf = new Intl.NumberFormat(undefined);

export function AmountCell({
  value,
  onChange,
  currency = "$",
  step = 100,
  min = 0,
  max,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState<string>(() => String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // focus when editing toggles on
  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing]);

  // parse safe number from raw string
  const parsed = useMemo(() => {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return 0;
    const n = Number(digits);
    if (Number.isNaN(n)) return 0;
    return n;
  }, [raw]);

  // beautified value for input text (thousand separators)
  const pretty = useMemo(() => (raw ? nf.format(parsed) : ""), [raw, parsed]);

  function commit(next: number) {
    const clamped = clamp(next, min, max);
    onChange?.(clamped);
    setRaw(String(clamped));
    setEditing(false);
  }

  function cancel() {
    setRaw(String(value));
    setEditing(false);
  }

  function bump(delta: number, mult = 1) {
    const inc = delta * (step * Math.max(1, mult));
    const next = clamp((parsed || 0) + inc, min, max);
    setRaw(String(next));
  }

  if (!editing) {
    return (
      <button
        data-editor
        onClick={() => setEditing(true)}
        className="w-full text-left px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-md
                   shadow-sm/0 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        aria-label="Edit amount"
        title="Click to edit"
      >
        <span className="tabular-nums">{money(value)}</span>
      </button>
    );
  }

  return (
    <div className="w-full">
      <div
        className="flex items-stretch gap-1 rounded-md border border-slate-300 bg-white
                   focus-within:ring-2 focus-within:ring-blue-500/40 px-2 py-1"
      >
        {/* currency prefix */}
        <span className="self-center text-slate-500 text-sm">{currency}</span>

        {/* numeric input */}
        <input
          ref={inputRef}
          value={pretty}
          onChange={(e) => {
            // keep only digits; allow empty for clearing
            const next = e.currentTarget.value.replace(/[^\d]/g, "");
            setRaw(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit(parsed);
            } else if (e.key === "Escape") {
              cancel();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              bump(+1, e.metaKey || e.ctrlKey ? 10 : 1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              bump(-1, e.metaKey || e.ctrlKey ? 10 : 1);
            }
          }}
          onBlur={() => commit(parsed)}
          className="flex-1 bg-transparent outline-none text-sm tabular-nums"
          inputMode="numeric"
          aria-label="Amount"
        />

        {/* stepper buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-7 w-7 grid place-items-center rounded border border-slate-200 hover:bg-slate-50"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => bump(+1)}
            aria-label="Increase"
            title={`+${currency}${nf.format(step)}`}
          >
            +
          </button>
          <button
            type="button"
            className="h-7 w-7 grid place-items-center rounded border border-slate-200 hover:bg-slate-50"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => bump(-1)}
            aria-label="Decrease"
            title={`-${currency}${nf.format(step)}`}
          >
            −
          </button>
        </div>
      </div>

      {/* helper row */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
        <span className="tabular-nums">Preview: {money(parsed)}</span>
        <span>Enter ↵ to save • Esc to cancel</span>
      </div>
    </div>
  );
}

function clamp(n: number, min?: number, max?: number) {
  let x = n;
  if (typeof min === "number") x = Math.max(min, x);
  if (typeof max === "number") x = Math.min(max, x);
  return x;
}
