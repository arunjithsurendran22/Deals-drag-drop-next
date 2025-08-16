/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import dynamic from "next/dynamic";
import {
  ColumnDef,
  ColumnOrderState,
  ColumnResizeMode,
  ExpandedState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useMemo, useRef, useState, Fragment } from "react";
import type { Deal } from "@/lib/schema";
import classNames from "classnames";
import { nextCell, GridCoord } from "@/lib/keyboard";
import { useLocalStorageState } from "@/lib/localStorage";
import { StageCell } from "./CellEditors/StageCell";
import { StatusCell } from "./CellEditors/StatusCell";
import { OwnerCell } from "./CellEditors/OwnerCell";
import { AmountCell } from "./CellEditors/AmountCell";
import { RowMenu } from "./ContextMenus";
import { DealsApiProvider } from "./tableApi";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

// hydrate-safe column header
const ColumnHeader = dynamic(() => import("./ColumnHeader"), { ssr: false });

// ---------- overlay sizing ----------
const OVERLAY_MIN_W = 260;
const OVERLAY_MAX_W = 300;
const OVERLAY_HEIGHT = 460;
const OVERLAY_PREVIEW_ROWS = 6;

// ---------- tiny utils ----------
const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

// same color stacks you use in cells, read-only
const STATUS_BG: Record<Deal["status"], string> = {
  Open: "bg-green-400 text-white",
  Blocked: "bg-green-500 text-white",
  "On Hold": "bg-green-600 text-white",
  Closed: "bg-green-700 text-white",
};

const STAGE_BG: Record<Deal["stage"], string> = {
  New: "bg-purple-400 text-white",
  Qualified: "bg-purple-500 text-white",
  Proposal: "bg-purple-600 text-white",
  Negotiation: "bg-purple-700 text-white",
  Won: "bg-purple-800 text-white",
  Lost: "bg-purple-900 text-white",
};

// ---------- preview renderer for overlay ----------
function PreviewCell({
  colId,
  value,
  row,
}: {
  colId: string;
  value: unknown;
  row: Deal;
}) {
  switch (colId) {
    case "status": {
      const v = value as Deal["status"];
      return (
        <div className={`h-9 w-full rounded-md px-3 flex items-center font-medium ${STATUS_BG[v]}`}>
          {v}
        </div>
      );
    }
    case "stage": {
      const v = value as Deal["stage"];
      return (
        <div className={`h-9 w-full rounded-md px-3 flex items-center font-medium ${STAGE_BG[v]}`}>
          {v}
        </div>
      );
    }
    case "owner": {
      const v = String(value ?? "");
      return (
        <div className="h-9 w-full rounded-md bg-white border border-slate-200 px-3 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-[11px] font-semibold">
            {initials(v)}
          </span>
          <span className="truncate">{v}</span>
        </div>
      );
    }
    case "amount": {
      const n = Number(value ?? 0);
      return (
        <div className="h-9 w-full rounded-md bg-white border border-slate-200 px-3 flex items-center">
          {money(n)}
        </div>
      );
    }
    case "probability": {
      const p = Number(value ?? 0);
      return (
        <div className="h-9 w-full rounded-md bg-slate-100 px-3 flex items-center">
          {`${Math.round(p * 100)}%`}
        </div>
      );
    }
    case "name":
    case "createdAt":
    case "closeDate": {
      return (
        <div className="h-9 w-full rounded-md bg-slate-100 px-3 flex items-center truncate">
          {String(value ?? "")}
        </div>
      );
    }
    default: {
      return (
        <div className="h-9 w-full rounded-md bg-slate-100 px-3 flex items-center truncate">
          {String(value ?? "")}
        </div>
      );
    }
  }
}

// ---------- overlay card ----------
function HeaderGhost({
  label,
  width,
  height,
  colId,
  items,
}: {
  label: string;
  width: number;
  height: number;
  colId: string;
  items: Array<{ key: string; value: unknown; row: Deal }>;
}) {
  return (
    <div
      style={{ width, height }}
      className="pointer-events-none select-none rounded-xl bg-white px-3 py-2 shadow-2xl ring-1 ring-black/10 rotate-2"
    >
      <div className="text-xs uppercase tracking-wide text-slate-500 px-1 py-1">{label}</div>
      <div className="mt-2 space-y-2 h-[calc(100%-32px)] overflow-hidden">
        {items.map((it) => (
          <PreviewCell key={it.key} colId={colId} value={it.value} row={it.row} />
        ))}
      </div>
    </div>
  );
}

type GridProps = {
  data: Deal[];
  /** Height for the scroll container in px (e.g., 800) */
  height?: number;
};

export default function DataGrid({ data, height = 600 }: GridProps) {
  // ---- table state ----
  const [sorting, setSorting] = useLocalStorageState<SortingState>("grid:sorting", []);
  const [columnVisibility, setColumnVisibility] =
    useLocalStorageState<VisibilityState>("grid:visibility", {});
  const [columnOrder, setColumnOrder] = useLocalStorageState<ColumnOrderState>("grid:order", []);
  const [columnSizing, setColumnSizing] =
    useLocalStorageState<Record<string, number>>("grid:sizing", {});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");

  const lastSelectedRef = useRef<number | null>(null);
  const shiftRef = useRef(false);
  const [focus, setFocus] = useState<GridCoord>({ row: 0, col: 0 });
  const [_tick, setTick] = useState(0);

  // ---- overlay state ----
  const [draggingColId, setDraggingColId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>(OVERLAY_MIN_W);
  const [overlayLabel, setOverlayLabel] = useState<string>("");
  const [overlayItems, setOverlayItems] = useState<Array<{ key: string; value: unknown; row: Deal }>>(
    []
  );

  // ---- columns ----
  const columns = useMemo<ColumnDef<Deal, unknown>[]>(() => [
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
          onPointerDown={(e) => { shiftRef.current = e.shiftKey; }}
          onChange={(e) => {
            const checked = e.currentTarget.checked;
            const useShift = shiftRef.current;
            shiftRef.current = false;

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
      cell: (ctx) => (
        <OwnerCell
          value={ctx.getValue<string>()}
          onChange={(v) => {
            ctx.row.original.owner = v;
            rt.options.meta?.rerender?.();
          }}
        />
      ),
      size: 140,
      filterFn: (row, id, value) => !value || row.getValue(id) === value,
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: (ctx) => (
        <StageCell
          value={ctx.getValue<Deal["stage"]>()}
          onChange={(v) => {
            ctx.row.original.stage = v;
            rt.options.meta?.rerender?.();
          }}
        />
      ),
      size: 160,
      enableSorting: true,
      filterFn: (row, id, value) => !value || row.getValue(id) === value,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (ctx) => (
        <StatusCell
          value={ctx.getValue<Deal["status"]>()}
          onChange={(v) => {
            ctx.row.original.status = v;
            rt.options.meta?.rerender?.();
          }}
        />
      ),
      size: 140,
      filterFn: (row, id, value) => !value || row.getValue(id) === value,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (ctx) => (
        <AmountCell
          value={ctx.getValue<number>()}
          onChange={(v) => {
            ctx.row.original.amount = v;
            rt.options.meta?.rerender?.();
          }}
        />
      ),
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
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 140,
      enableSorting: true,
    },
    {
      accessorKey: "closeDate",
      header: "Close Date",
      size: 140,
      enableSorting: true,
    },
  ], [amountMin, amountMax, data]);

  // ---- table instance (named rt so we don't collide with JSX scope) ----
  const rt = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing,
      rowSelection,
      expanded,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    enableMultiSort: true,
    columnResizeMode: "onChange" as ColumnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: () => true,
    // <-- this exists thanks to the .d.ts augmentation
    meta: { rerender: () => setTick((t) => t + 1) },
  });

  const rows = rt.getRowModel().rows;
  const visibleCols = rt.getVisibleLeafColumns();

  // ---- keyboard nav ----
  function onKeyDown(e: React.KeyboardEvent<HTMLTableElement>) {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Enter", "Escape"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    if (e.key === "Enter") {
      const el = document.querySelector(
        `[data-cell="${focus.row}:${focus.col}"] [data-editor]`
      ) as HTMLElement | null;
      el?.click();
      return;
    }
    if (e.key === "Escape") {
      (document.activeElement as HTMLElement)?.blur();
      return;
    }
    setFocus((f) => nextCell(e.key, f, rows.length, visibleCols.length));
  }

  // ---- DnD wiring ----
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    setDraggingColId(id);

    const col = rt.getAllLeafColumns().find((c) => c.id === id);
    if (col) {
      const colW = col.getSize();
      const clampedW = Math.max(OVERLAY_MIN_W, Math.min(OVERLAY_MAX_W, colW));
      setOverlayWidth(clampedW);

      const def = col.columnDef.header;
      setOverlayLabel(typeof def === "string" ? def : col.id);

      const items = rt
        .getRowModel()
        .rows.slice(0, OVERLAY_PREVIEW_ROWS)
        .map((r) => ({
          key: r.id,
          value: r.getValue(col.id as string),
          row: r.original as Deal,
        }));
      setOverlayItems(items);
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setDraggingColId(null);
    if (!over || active.id === over.id) return;

    const ids = rt.getVisibleLeafColumns().map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex >= 0 && newIndex >= 0) {
      setColumnOrder(arrayMove(ids, oldIndex, newIndex));
    }
  }

  function onDragCancel() {
    setDraggingColId(null);
  }

  // ---- API ctx ----
  const api = {
    table: rt,
    getColumn: (id: string) => rt.getColumn(id)!,
    getFilteredRows: () => rt.getRowModel().rows.map((r) => r.original),
    rowSelection,
    clearSelection: () => setRowSelection({}),
    globalFilter,
    setGlobalFilter,
    amountMin,
    setAmountMin,
    amountMax,
    setAmountMax,
  };

  // 👇 Make the table as wide as its columns so it can overflow horizontally.
  const totalWidth = rt.getTotalSize();

  return (
    <DealsApiProvider value={api}>
      {/* Single scroll container controls both axes */}
      <div
        className="w-full overflow-auto overscroll-contain border border-slate-200 bg-white"
        style={{ height }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <table
            role="grid"
            aria-rowcount={rows.length}
            aria-colcount={visibleCols.length}
            className="table-fixed text-[13px] min-w-[900px]" /* decent base width on small screens */
            onKeyDown={onKeyDown}
            suppressHydrationWarning
            /* Width equals sum of column sizes — enables horizontal overflow */
            style={{ width: totalWidth }}
          >
            <thead className="table-sticky text-xs uppercase tracking-wide text-slate-600">
              {rt.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  <SortableContext items={hg.headers.map((h) => h.column.id)}>
                    {hg.headers.map((header) => (
                      <ColumnHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </tr>
              ))}
            </thead>

            <tbody className="text-sm">
              {rows.map((row, rowIndex) => (
                <Fragment key={row.id}>
                  <tr
                    data-row={rowIndex}
                    aria-selected={row.getIsSelected() ? "true" : "false"}
                    className={classNames(
                      "tr-hover divide-x divide-slate-100",
                      row.getIsSelected() && "bg-blue-50"
                    )}
                  >
                    {row.getVisibleCells().map((cell, colIndex) => (
                      <td
                        key={cell.id}
                        data-cell={`${rowIndex}:${colIndex}`}
                        tabIndex={focus.row === rowIndex && focus.col === colIndex ? 0 : -1}
                        className={classNames(
                          "border-b border-slate-100 align-middle focus-ring transition-colors",
                          // highlight the column being dragged
                          cell.column.id === draggingColId && "bg-blue-50/70",
                          // ✅ fixed precedence: wrap the OR before the ternary
                          (cell.column.id === "stage" || cell.column.id === "status")
                            ? "p-0"
                            : "px-3 py-2",
                          focus.row === rowIndex && focus.col === colIndex && "ring-1 ring-blue-500"
                        )}
                        onFocus={() => setFocus({ row: rowIndex, col: colIndex })}
                        style={{ width: cell.column.getSize() }}
                      >
                        <RowMenu onDelete={() => alert("Delete row")}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </RowMenu>
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>

          {/* floating “context” ghost: real cell previews for that column */}
          <DragOverlay dropAnimation={null}>
            {draggingColId ? (
              <HeaderGhost
                label={overlayLabel}
                width={overlayWidth}
                height={OVERLAY_HEIGHT}
                colId={draggingColId}
                items={overlayItems}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </DealsApiProvider>
  );
}
