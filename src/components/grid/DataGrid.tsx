/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import dynamic from "next/dynamic";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Fragment, useMemo } from "react";
import type { Deal } from "@/lib/schema";
import classNames from "classnames";
import { DealsApiProvider } from "./tableApi";
import TotalsBar from "./TotalsBar";
import DealDetails from "./DealDetails";
import { RowMenu } from "./ContextMenus";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useGridState } from "./hooks/useGridState";
import { useColumnDnD } from "./hooks/useColumnDnD";
import Toolbar from "./Toolbar";

const ColumnHeader = dynamic(() => import("./ColumnHeader"), { ssr: false });

type GridProps = {
  data: Deal[];
  height?: number;
  previewRows?: number;
};

export default function DataGrid({ data, height = 600, previewRows = 10 }: GridProps) {
  const s = useGridState();

  const columns = useMemo<ColumnDef<Deal, unknown>[]>(() => {
    const { createDealColumns } = require("./createDealColumns");
    return createDealColumns({
      data,
      lastSelectedRef: s.lastSelectedRef,
      setRowSelection: s.setRowSelection,
      amountMin: s.amountMin,
      amountMax: s.amountMax,
      rerender: () => s.setTick((t) => t + 1),
    });
  }, [data, s.lastSelectedRef, s.setRowSelection, s.amountMin, s.amountMax, s.setTick]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: s.sorting,
      columnVisibility: s.columnVisibility,
      columnOrder: s.columnOrder,
      columnSizing: s.columnSizing,
      rowSelection: s.rowSelection,
      expanded: s.expanded,
      globalFilter: s.globalFilter,
    },
    onSortingChange: s.setSorting,            
    onColumnVisibilityChange: s.setColumnVisibility,
    onColumnOrderChange: s.setColumnOrder,
    onColumnSizingChange: s.setColumnSizing,
    onRowSelectionChange: s.setRowSelection,
    onExpandedChange: s.setExpanded,
    onGlobalFilterChange: s.setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: () => true,
    enableMultiSort: true,
    columnResizeMode: "onChange",
    meta: { rerender: () => s.setTick((t) => t + 1) },
    getRowId: (row) => String((row as Deal).id ?? `${(row as Deal).name}-${(row as Deal).createdAt}`),
  });

  const rows = table.getRowModel().rows;
  const visibleCols = table.getVisibleLeafColumns();
  const totalWidth = table.getTotalSize();

  const dnd = useColumnDnD({
    table,
    previewRows,
    setColumnOrder: s.setColumnOrder,
    focus: s.focus,
    setFocus: s.setFocus,
    rows,
    visibleCols,
  });

  const api = {
    table,
    getColumn: (id: string) => table.getColumn(id)!,
    getFilteredRows: () => table.getRowModel().rows.map((r) => r.original as Deal),
    rowSelection: s.rowSelection,
    clearSelection: () => s.setRowSelection({}),
    globalFilter: s.globalFilter,
    setGlobalFilter: s.setGlobalFilter,
    amountMin: s.amountMin,
    setAmountMin: s.setAmountMin,
    amountMax: s.amountMax,
    setAmountMax: s.setAmountMax,
  };

  return (
    <DealsApiProvider value={api}>
      <div
        ref={s.scrollRef}
        className="w-full overflow-auto overscroll-contain border-t border-slate-200 bg-white"
        style={{ height }}
      >
        <div
          ref={s.toolbarRef}
          className="sticky top-0 z-[60] bg-white/95 backdrop-blur border-b border-slate-200 p-3"
        >
          <Toolbar />
        </div>

        <DndContext
          sensors={dnd.sensors}
          onDragStart={dnd.onDragStart}
          onDragEnd={dnd.onDragEnd}
          onDragCancel={dnd.onDragCancel}
        >
          <table
            role="grid"
            aria-rowcount={rows.length}
            aria-colcount={visibleCols.length}
            className="table-fixed text-[13px] min-w-[900px]"
            style={{ width: totalWidth }}
            onKeyDown={dnd.onKeyDown}
            suppressHydrationWarning
          >
            <thead className="text-xs uppercase tracking-wide text-slate-600">
              {table.getHeaderGroups().map((hg) => (
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
                        tabIndex={s.focus.row === rowIndex && s.focus.col === colIndex ? 0 : -1}
                        className={classNames(
                          "border-b border-slate-100 align-middle focus-ring transition-colors",
                          cell.column.id === dnd.draggingColId && "bg-blue-50/70",
                          (cell.column.id === "stage" || cell.column.id === "status") ? "p-0" : "px-3 py-2",
                          s.focus.row === rowIndex && s.focus.col === colIndex && "ring-1 ring-blue-500"
                        )}
                        onFocus={() => s.setFocus({ row: rowIndex, col: colIndex })}
                        style={{ width: cell.column.getSize() }}
                      >
                        <RowMenu onDelete={() => alert("Delete row")}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </RowMenu>
                      </td>
                    ))}
                  </tr>

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

          <DragOverlay dropAnimation={null}>
            {dnd.draggingColId ? (
              <dnd.HeaderGhost
                label={dnd.overlayLabel}
                width={dnd.overlayWidth}
                height={dnd.overlayHeight}
                colId={dnd.draggingColId}
                items={dnd.overlayItems}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="p-3">
        <TotalsBar />
      </div>
    </DealsApiProvider>
  );
}
