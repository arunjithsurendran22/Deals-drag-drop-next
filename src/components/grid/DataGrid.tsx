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
import { useMemo, useRef, useState, useEffect, Fragment } from "react";
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
import Toolbar from "./Toolbar";
import TotalsBar from "./TotalsBar";
import DealDetails from "./DealDetails";
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

const ColumnHeader = dynamic(() => import("./ColumnHeader"), { ssr: false });

// ---------- overlay sizing ----------
const OVERLAY_MIN_W = 260;
const OVERLAY_MAX_W = 300;

// Make the drag ghost feel roomier
const PREVIEW_ROW_H = 32; // px — height of each preview row inside the ghost
const PREVIEW_ROW_GAP = 12; // px — vertical gap between preview rows

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

// Colors aligned with StatusCell & StageCell for preview ghost
const STATUS_BG: Record<Deal["status"], string> = {
  Open: "bg-emerald-500 text-white",
  Blocked: "bg-rose-500 text-white",
  "On Hold": "bg-amber-400 text-black",
  Closed: "bg-slate-500 text-white",
};
const STAGE_BG: Record<Deal["stage"], string> = {
  New: "bg-sky-500 text-white",
  Qualified: "bg-violet-500 text-white",
  Proposal: "bg-cyan-500 text-white",
  Negotiation: "bg-amber-500 text-black",
  Won: "bg-emerald-500 text-white",
  Lost: "bg-slate-500 text-white",
};

// ---------- preview renderer for overlay ----------
function PreviewCell({ colId, value }: { colId: string; value: unknown }) {
  // shared base styles per preview row
  const style: React.CSSProperties = { height: PREVIEW_ROW_H };

  switch (colId) {
    case "status": {
      const v = value as Deal["status"];
      return (
        <div
          style={style}
          className={`w-full rounded-md px-3 flex items-center font-medium ${STATUS_BG[v]}`}
        >
          {v}
        </div>
      );
    }
    case "stage": {
      const v = value as Deal["stage"];
      return (
        <div
          style={style}
          className={`w-full rounded-md px-3 flex items-center font-medium ${STAGE_BG[v]}`}
        >
          {v}
        </div>
      );
    }
    case "owner": {
      const v = String(value ?? "");
      return (
        <div
          style={style}
          className="w-full rounded-md bg-white border border-slate-200 px-3 flex items-center gap-2"
        >
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
        <div
          style={style}
          className="w-full rounded-md bg-white border border-slate-200 px-3 flex items-center"
        >
          {money(n)}
        </div>
      );
    }
    case "probability": {
      const p = Number(value ?? 0);
      return (
        <div
          style={style}
          className="w-full rounded-md bg-slate-100 px-3 flex items-center"
        >
          {`${Math.round(p * 100)}%`}
        </div>
      );
    }
    default: {
      return (
        <div
          style={style}
          className="w-full rounded-md bg-slate-100 px-3 flex items-center truncate"
        >
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
  items: Array<{ key: string; value: unknown }>;
}) {
  return (
    <div
      style={{ width, height }}
      className="pointer-events-none select-none rounded-xl bg-white px-3 py-2 shadow-2xl ring-1 ring-black/10 rotate-2"
    >
      <div className="text-xs uppercase tracking-wide text-slate-500 px-1 py-1">
        {label}
      </div>
      <div
        className="mt-2 h-[calc(100%-32px)] overflow-hidden flex flex-col"
        style={{ gap: PREVIEW_ROW_GAP }}
      >
        {items.map((it) => (
          <PreviewCell key={it.key} colId={colId} value={it.value} />
        ))}
      </div>
    </div>
  );
}

type GridProps = {
  data: Deal[];
  /** Height for the scroll container in px (e.g., 800) */
  height?: number;
  /** How many example rows to show in the drag preview (HeaderGhost) */
  previewRows?: number;
};

export default function DealsGrid({
  data,
  height = 600,
  previewRows = 10,
}: GridProps) {
  // ---- table state ----
  const [sorting, setSorting] = useLocalStorageState<SortingState>(
    "grid:sorting",
    []
  );
  const [columnVisibility, setColumnVisibility] =
    useLocalStorageState<VisibilityState>("grid:visibility", {});
  const [columnOrder, setColumnOrder] = useLocalStorageState<ColumnOrderState>(
    "grid:order",
    []
  );
  const [columnSizing, setColumnSizing] = useLocalStorageState<
    Record<string, number>
  >("grid:sizing", {});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");

  const lastSelectedRef = useRef<number | null>(null);
  const shiftRef = useRef(false);
  const [focus, setFocus] = useState<GridCoord>({ row: 0, col: 0 });
  const [_tick, setTick] = useState(0);
  console.log("====================================");
  console.log(_tick);
  console.log("====================================");
  // ---- overlay state ----
  const [draggingColId, setDraggingColId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number>(OVERLAY_MIN_W);
  const [overlayLabel, setOverlayLabel] = useState<string>("");
  const [overlayItems, setOverlayItems] = useState<
    Array<{ key: string; value: unknown }>
  >([]);

  // each preview row = PREVIEW_ROW_H, gaps between = PREVIEW_ROW_GAP
  const overlayHeight = Math.min(
    720,
    48 + // header + padding
      Math.max(1, previewRows) * PREVIEW_ROW_H +
      Math.max(0, previewRows - 1) * PREVIEW_ROW_GAP
  );

  // ---- columns ----
  const columns = useMemo<ColumnDef<Deal, unknown>[]>(
    () => [
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
            onPointerDown={(e) => {
              shiftRef.current = e.shiftKey;
            }}
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
        cell: (ctx) => {
          const expanded = ctx.row.getIsExpanded();
          return (
            <button
              className="flex items-center gap-2 text-blue-700 underline-offset-2 cursor-pointer hover:underline focus-ring"
              onClick={() => ctx.row.toggleExpanded()}
              title={expanded ? "Collapse" : "click to Expand"}
            >
              <span
                className={[
                  "inline-block transition-transform duration-150",
                  expanded ? "rotate-90" : "rotate-0",
                ].join(" ")}
                aria-hidden
              >
                ▶
              </span>
              <span className="truncate">{ctx.getValue<string>()}</span>
            </button>
          );
        },
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
    ],
    [amountMin, amountMax, data]
  );

  // ---- table instance ----
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
    meta: { rerender: () => setTick((t) => t + 1) },
  });

  const rows = rt.getRowModel().rows;
  const visibleCols = rt.getVisibleLeafColumns();

  // ---- keyboard nav ----
  function onKeyDown(e: React.KeyboardEvent<HTMLTableElement>) {
    const keys = [
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
      "Enter",
      "Escape",
    ];
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
        .rows.slice(0, Math.max(1, previewRows))
        .map((r) => ({
          key: r.id,
          value: r.getValue(col.id as string),
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

  const totalWidth = rt.getTotalSize();

  // ---- sticky toolbar measurement ----
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current || !toolbarRef.current) return;
    const el = toolbarRef.current;
    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      scrollRef.current!.style.setProperty("--grid-toolbar-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <DealsApiProvider value={api}>
      {/* Single scroll container controls both axes; toolbar is sticky inside */}
      <div
        ref={scrollRef}
        className="w-full overflow-auto overscroll-contain border-t border-slate-200 bg-white"
        style={{ height }}
      >
        {/* Sticky toolbar */}
        <div
          ref={toolbarRef}
          className="sticky top-0 z-[60] bg-white/95 backdrop-blur border-b border-slate-200 p-3"
        >
          <Toolbar />
        </div>

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
            className="table-fixed text-[13px] min-w-[900px]"
            onKeyDown={onKeyDown}
            suppressHydrationWarning
            /* Width equals sum of column sizes — enables horizontal overflow */
            style={{ width: totalWidth }}
          >
            {/* NOTE: ensure your ColumnHeader uses `top-[var(--grid-toolbar-h,0px)]` for sticky! */}
            <thead className="text-xs uppercase tracking-wide text-slate-600">
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
                        tabIndex={
                          focus.row === rowIndex && focus.col === colIndex
                            ? 0
                            : -1
                        }
                        className={classNames(
                          "border-b border-slate-100 align-middle focus-ring transition-colors",
                          // highlight the column being dragged
                          cell.column.id === draggingColId && "bg-blue-50/70",
                          // tight padding for stage/status cells
                          cell.column.id === "stage" ||
                            cell.column.id === "status"
                            ? "p-0"
                            : "px-3 py-2",
                          // keyboard focus ring
                          focus.row === rowIndex &&
                            focus.col === colIndex &&
                            "ring-1 ring-blue-500"
                        )}
                        onFocus={() =>
                          setFocus({ row: rowIndex, col: colIndex })
                        }
                        style={{ width: cell.column.getSize() }}
                      >
                        <RowMenu onDelete={() => alert("Delete row")}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </RowMenu>
                      </td>
                    ))}
                  </tr>

                  {/* Expanded details row */}
                  {row.getIsExpanded() && (
                    <tr className="bg-slate-50/40">
                      <td colSpan={visibleCols.length} className="px-3 py-3">
                        <DealDetails deal={row.original as Deal} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {/* Drag overlay with real cell previews */}
          <DragOverlay dropAnimation={null}>
            {draggingColId ? (
              <HeaderGhost
                label={overlayLabel}
                width={overlayWidth}
                height={overlayHeight}
                colId={draggingColId}
                items={overlayItems}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Totals inside provider so it sees filtered rows */}
      <div className="p-3">
        <TotalsBar />
      </div>
    </DealsApiProvider>
  );
}
