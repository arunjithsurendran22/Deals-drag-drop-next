// src/components/grid/Toolbar.tsx
"use client";

import { useDealsTableApi } from "./tableApi";

export default function Toolbar() {
  const api = useDealsTableApi();
  if (!api) return null;

  const selected = Object.keys(api.rowSelection).length;

  const stageCol = api.getColumn("stage");
  const ownerCol = api.getColumn("owner");
  const statusCol = api.getColumn("status");

  const stageValue = (stageCol?.getFilterValue() as string) ?? "";
  const ownerValue = (ownerCol?.getFilterValue() as string) ?? "";
  const statusValue = (statusCol?.getFilterValue() as string) ?? "";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {selected > 0 ? (
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded border">
          <span className="font-medium">{selected} selected</span>
          <button className="px-2 py-1 rounded bg-blue-600 text-white" onClick={() => alert("Bulk: Assign owner")}>Assign owner</button>
          <button className="px-2 py-1 rounded bg-blue-600 text-white" onClick={() => alert("Bulk: Move stage")}>Move stage</button>
          <button className="px-2 py-1 rounded bg-rose-600 text-white" onClick={api.clearSelection}>Clear</button>
        </div>
      ) : (
        <>
          <input
            className="px-2 py-1 border rounded"
            placeholder="Search deals..."
            value={api.globalFilter ?? ""}
            onChange={(e)=>api.setGlobalFilter(e.target.value)}
            aria-label="Search"
          />
          <select className="px-2 py-1 border rounded" value={stageValue} onChange={(e)=>stageCol?.setFilterValue(e.target.value || undefined)} aria-label="Stage filter">
            <option value="">Stage: All</option>
            {['New','Qualified','Proposal','Negotiation','Won','Lost'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="px-2 py-1 border rounded" value={ownerValue} onChange={(e)=>ownerCol?.setFilterValue(e.target.value || undefined)} aria-label="Owner filter">
            <option value="">Owner: All</option>
            {['Aisha','Omar','Lina','Raj','Maya','Ken','Zara'].map(o=> <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="px-2 py-1 border rounded" value={statusValue} onChange={(e)=>statusCol?.setFilterValue(e.target.value || undefined)} aria-label="Status filter">
            <option value="">Status: All</option>
            {['Open','Blocked','On Hold','Closed'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <input className="px-2 py-1 border rounded w-24" placeholder="Min $" value={api.amountMin ?? ""} onChange={(e)=>api.setAmountMin(e.target.value)} inputMode="numeric" aria-label="Min amount" />
            <span>–</span>
            <input className="px-2 py-1 border rounded w-24" placeholder="Max $" value={api.amountMax ?? ""} onChange={(e)=>api.setAmountMax(e.target.value)} inputMode="numeric" aria-label="Max amount" />
          </div>
        </>
      )}
    </div>
  );
}
