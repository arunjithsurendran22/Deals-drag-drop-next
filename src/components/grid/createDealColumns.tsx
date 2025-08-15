// src/components/grid/createDealColumns.tsx
"use client";

import * as React from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import type { MutableRefObject } from "react";
import type { Deal } from "@/lib/schema";
import { StageCell } from "./CellEditors/StageCell";
import { StatusCell } from "./CellEditors/StatusCell";
import { OwnerCell } from "./CellEditors/OwnerCell";
import { AmountCell } from "./CellEditors/AmountCell";

// so we don’t sprinkle `any`
type TableMeta = { rerender?: () => void };

export function createDealColumns({
  data,
  lastSelectedRef,
  setRowSelection,
  amountMin,
  amountMax,
}: {
  data: Deal[];
  lastSelectedRef: MutableRefObject<number | null>;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  amountMin: string;
  amountMax: string;
}): ColumnDef<Deal, unknown>[] {
  // capture Shift across pointerdown -> change
  let shiftPressed = false;

  const cols: ColumnDef<Deal, unknown>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="accent-blue-600"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select row ${row.index + 1}`}
          checked={row.getIsSelected()}
          onPointerDown={(e: React.PointerEvent<HTMLInputElement>) => {
            shiftPressed = e.shiftKey;
          }}
          onChange={(e) => {
            const checked = e.currentTarget.checked;
            const useShift = shiftPressed;
            shiftPressed = false;

            if (useShift && lastSelectedRef.current !== null) {
              const start = Math.min(lastSelectedRef.current, row.index);
              const end = Math.max(lastSelectedRef.current, row.index);
              const multi: RowSelectionState = {};
              for (let i = start; i <= end; i++) multi[data[i].id] = checked;
              setRowSelection((prev) => ({ ...prev, ...multi }));
            } else {
              setRowSelection((prev) => ({ ...prev, [row.id]: checked }));
              lastSelectedRef.current = row.index;
            }
          }}
          className="accent-blue-600"
        />
      ),
      size: 40,
      enableResizing: false,
    },
    {
      accessorKey: "name",
      header: "Deal",
      cell: (ctx) => (
        <button
          className="text-blue-700 underline-offset-2 hover:underline focus-ring"
          onClick={() => ctx.row.toggleExpanded()}
        >
          {ctx.getValue<string>()}
        </button>
      ),
      enableHiding: false,
      size: 240,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: (ctx) => {
        const meta = ctx.table.options.meta as TableMeta | undefined;
        return (
          <OwnerCell
            value={ctx.getValue<string>()}
            onChange={(v: string) => {
              ctx.row.original.owner = v;
              meta?.rerender?.();
            }}
          />
        );
      },
      size: 140,
      filterFn: (row, id, value) => !value || row.getValue(id) === value,
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: (ctx) => {
        const meta = ctx.table.options.meta as TableMeta | undefined;
        const v = ctx.getValue<Deal["stage"]>();
        return (
          <StageCell
            value={v}
            onChange={(next: Deal["stage"]) => {
              ctx.row.original.stage = next;
              meta?.rerender?.();
            }}
          />
        );
      },
      size: 160,
      enableSorting: true,
      filterFn: (row, id, value) => !value || row.getValue(id) === value,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (ctx) => {
        const meta = ctx.table.options.meta as TableMeta | undefined;
        const v = ctx.getValue<Deal["status"]>();
        return (
          <StatusCell
            value={v}
            onChange={(next: Deal["status"]) => {
              ctx.row.original.status = next;
              meta?.rerender?.();
            }}
          />
        );
      },
      size: 140,
      filterFn: (row, id, value) => !value || row.getValue(id) === value,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (ctx) => {
        const meta = ctx.table.options.meta as TableMeta | undefined;
        const v = ctx.getValue<number>();
        return (
          <AmountCell
            value={v}
            onChange={(next: number) => {
              ctx.row.original.amount = next;
              meta?.rerender?.();
            }}
          />
        );
      },
      size: 140,
      meta: { aggregate: "sum" },
      enableSorting: true,
      filterFn: (row, id) => {
        const v = Number(row.getValue<number>(id));
        const min = amountMin ? Number(amountMin) : -Infinity;
        const max = amountMax ? Number(amountMax) : Infinity;
        return v >= min && v <= max;
      },
    },
    {
      accessorKey: "probability",
      header: "Prob.",
      cell: (ctx) => `${Math.round((ctx.getValue<number>() ?? 0) * 100)}%`,
      size: 100,
    },
    { accessorKey: "createdAt", header: "Created", size: 140, enableSorting: true },
    { accessorKey: "closeDate", header: "Close Date", size: 140, enableSorting: true },
  ];

  return cols;
}
