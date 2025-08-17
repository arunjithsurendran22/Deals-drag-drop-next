
"use client";

import {
  FiUser,
  FiTag,
  FiCheckCircle,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import type { Deal } from "@/lib/schema";

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

/** Badge colors aligned with StageCell & StatusCell */
const STAGE_BADGE: Record<Deal["stage"], string> = {
  New: "bg-sky-100 text-sky-700",
  Qualified: "bg-violet-100 text-violet-700",
  Proposal: "bg-cyan-100 text-cyan-700",
  Negotiation: "bg-amber-100 text-amber-800",
  Won: "bg-emerald-100 text-emerald-700",
  Lost: "bg-slate-100 text-slate-700",
};

const STATUS_BADGE: Record<Deal["status"], string> = {
  Open: "bg-emerald-100 text-emerald-700",
  Blocked: "bg-rose-100 text-rose-700",
  "On Hold": "bg-amber-100 text-amber-800",
  Closed: "bg-slate-100 text-slate-700",
};

export default function DealDetails({ deal }: { deal: Deal }) {
  // Demo activity — replace with real data
  const activity = [
    { t: "2025-08-12 10:40", who: "Aisha", what: "Moved to Negotiation" },
    { t: "2025-08-13 15:10", who: "Raj",   what: "Shared proposal v2" },
    { t: "2025-08-14 09:05", who: "Lina",  what: "Client requested discount" },
  ];

  // Demo line items — replace with real data
  const lineItems = [
    { id: "L1", name: "Seats (50)", price: 25000 },
    { id: "L2", name: "Onboarding", price: 5000 },
  ];
  const subtotal = lineItems.reduce((a, b) => a + b.price, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <FiUser className="h-4 w-4 text-slate-500" />
            <span className="truncate">{deal.owner}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiTag className="h-4 w-4 text-slate-500" />
            <Badge className={STAGE_BADGE[deal.stage]}>{deal.stage}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-slate-500" />
            <Badge className={STATUS_BADGE[deal.status]}>{deal.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <FiDollarSign className="h-4 w-4 text-slate-500" />
            <span className="font-semibold tabular-nums">${deal.amount.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <span className="block text-slate-400">Created</span>
              {deal.createdAt}
            </div>
            <div>
              <span className="block text-slate-400">Close Date</span>
              {deal.closeDate ?? "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Activity</h3>
        <ol className="space-y-3">
          {activity.map((a, i) => (
            <li key={i} className="relative pl-6">
              <span className="absolute left-0 top-1.5 grid h-3 w-3 place-items-center rounded-full bg-slate-300" />
              <div className="text-sm">
                <span className="font-medium">{a.who}</span>{" "}
                <span className="text-slate-600">{a.what}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <FiClock className="h-3 w-3" />
                {a.t}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Line items */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Line Items</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-2 py-1 text-left">Item</th>
                <th className="px-2 py-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="px-2 py-1">{it.name}</td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    ${it.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="px-2 py-2 text-right font-medium">Subtotal</td>
                <td className="px-2 py-2 text-right font-semibold tabular-nums">
                  ${subtotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
