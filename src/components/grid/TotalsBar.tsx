// src/components/grid/TotalsBar.tsx
"use client";

import { useDealsTableApi } from "./tableApi";
import { money } from "@/lib/formatting";
import { FiHash, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import * as React from "react";

export default function TotalsBar() {
  const api = useDealsTableApi();
  if (!api) return null;

  const rows = api.getFilteredRows();
  const count = rows.length;
  const sum = rows.reduce((acc, r) => acc + r.amount, 0);
  const avg = count ? sum / count : 0;

  // selection summary (cute lil’ bonus)
  const selectedRows = api.table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRows.length;
  const selectedSum = selectedRows.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="sticky bottom-0 z-[90]">
      <div
        className="
          mx-auto max-w-full
          rounded-2xl border border-slate-200
          bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/55
          shadow-[0_10px_30px_rgba(2,6,23,0.14)]
        "
        role="status"
        aria-live="polite"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
          <KPI
            icon={<FiHash className="h-4 w-4" />}
            label="Deals"
            value={count.toLocaleString()}
            title={`${count} visible deals`}
          />
          <KPI
            icon={<FiDollarSign className="h-4 w-4" />}
            label="Total"
            value={money(sum)}
            title={`Total value: ${money(sum)}`}
          />
          <KPI
            icon={<FiTrendingUp className="h-4 w-4" />}
            label="Average"
            value={money(Math.round(avg))}
            title={`Average deal: ${money(Math.round(avg))}`}
          />
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 px-3 sm:px-4 py-2.5 text-sm">
            <div className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-[11px] px-2 h-5 min-w-[20px]"
                aria-label={`${selectedCount} selected`}
                title={`${selectedCount} selected`}
              >
                {selectedCount}
              </span>
              <span className="text-slate-600">
                selected • sum{" "}
                <strong className="tabular-nums text-slate-900">{money(selectedSum)}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={api.clearSelection}
              className="
                inline-flex items-center justify-center rounded-md
                bg-slate-100 hover:bg-slate-200 active:bg-slate-300
                text-slate-700 px-2.5 py-1.5
                transition
              "
            >
              Clear selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({
  icon,
  label,
  value,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div
      className="
        flex items-center gap-3 rounded-xl
        border border-slate-200 bg-white/80
        p-3 shadow-sm
      "
      title={title}
    >
      <div
        className="
          grid h-10 w-10 place-items-center rounded-lg
          bg-gradient-to-br from-slate-900 to-slate-700
          text-white shadow
        "
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className="truncate font-semibold tabular-nums text-slate-900">{value}</div>
      </div>
    </div>
  );
}
