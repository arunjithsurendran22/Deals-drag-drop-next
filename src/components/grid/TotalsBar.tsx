// src/components/grid/TotalsBar.tsx
"use client";
import { useDealsTableApi } from "./tableApi";
import { money } from "@/lib/formatting";

export default function TotalsBar() {
  const api = useDealsTableApi();
  if (!api) return null;

  const rows = api.getFilteredRows();
  const count = rows.length;
  const sum = rows.reduce((acc, r) => acc + r.amount, 0);
  const avg = count ? Math.round(sum / count) : 0;

  return (
    <div className="sticky bottom-0 bg-white border rounded-xl px-3 py-2 text-sm flex gap-6">
      <span><strong>{count}</strong> deals</span>
      <span>Total: <strong>{money(sum)}</strong></span>
      <span>Avg: <strong>{money(avg)}</strong></span>
    </div>
  );
}
