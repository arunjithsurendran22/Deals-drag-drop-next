/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Table } from "@tanstack/react-table";
import type { Deal } from "@/lib/schema";
import { HeaderGhost } from "../overlay/HeaderGhost";

const OVERLAY_MIN_W = 260;
const OVERLAY_MAX_W = 300;
const PREVIEW_ROW_H = 32;
const PREVIEW_ROW_GAP = 12;

export function useColumnDnD({
  table,
  previewRows,
  setColumnOrder,
  focus,
  setFocus,
  rows,
  visibleCols,
}: {
  table: Table<Deal>;
  previewRows: number;
  setColumnOrder: (updater: string[] | ((old: string[]) => string[])) => void;
  focus: { row: number; col: number };
  setFocus: (f: { row: number; col: number }) => void;
  rows: any[];
  visibleCols: any[];
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const [draggingColId, setDraggingColId] = React.useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = React.useState<number>(OVERLAY_MIN_W);
  const [overlayLabel, setOverlayLabel] = React.useState<string>("");
  const [overlayItems, setOverlayItems] = React.useState<Array<{ key: string; value: unknown }>>([]);

  const overlayHeight = Math.min(
    720,
    48 + Math.max(1, previewRows) * PREVIEW_ROW_H + Math.max(0, previewRows - 1) * PREVIEW_ROW_GAP
  );

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    setDraggingColId(id);

    const col = table.getAllLeafColumns().find((c) => c.id === id);
    if (!col) return;

    const colW = col.getSize();
    setOverlayWidth(Math.max(OVERLAY_MIN_W, Math.min(OVERLAY_MAX_W, colW)));

    const def = col.columnDef.header;
    setOverlayLabel(typeof def === "string" ? def : col.id);

    const items = table
      .getRowModel()
      .rows.slice(0, Math.max(1, previewRows))
      .map((r) => ({ key: r.id, value: r.getValue(col.id as string) }));
    setOverlayItems(items);
  }

  function onDragEnd(e: DragEndEvent) {
    setDraggingColId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const ids = table.getVisibleLeafColumns().map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex >= 0 && newIndex >= 0) setColumnOrder(arrayMove(ids, oldIndex, newIndex));
  }

  function onDragCancel() {
    setDraggingColId(null);
  }

  // keyboard nav for grid cells
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

    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
    const next = { ...focus };

    if (e.key === "ArrowRight") next.col++;
    if (e.key === "ArrowLeft") next.col--;
    if (e.key === "ArrowDown") next.row++;
    if (e.key === "ArrowUp") next.row--;

    next.row = clamp(next.row, 0, rows.length - 1);
    next.col = clamp(next.col, 0, visibleCols.length - 1);
    setFocus(next);
  }

  return {
    sensors,
    draggingColId,
    overlayLabel,
    overlayWidth,
    overlayHeight,
    overlayItems,
    onDragStart,
    onDragEnd,
    onDragCancel,
    onKeyDown,
    HeaderGhost,
  };
}
