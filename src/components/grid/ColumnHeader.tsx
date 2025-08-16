"use client";

import * as React from "react";
import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HeaderMenu } from "./ContextMenus";
import type { Deal } from "@/lib/schema";

export type ColumnHeaderProps = {
  header: Header<Deal, unknown>;
};

export default function ColumnHeader({ header }: ColumnHeaderProps) {
  const column = header.column;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: column.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: "relative",
    width: column.getSize(),
  };

  const isSorted = column.getIsSorted(); // 'asc' | 'desc' | false

  return (
    <th
      ref={setNodeRef}
      style={style}
      aria-sort={isSorted ? (isSorted === "asc" ? "ascending" : "descending") : "none"}
      className={[
        // sticky header
        "sticky top-0 z-20",
        // visuals
        "bg-white border-b border-r border-slate-200 align-middle select-none",
        // crisp divider while scrolling
        "[box-shadow:inset_0_-1px_0_rgba(0,0,0,0.08)]"
      ].join(" ")}
    >
      <HeaderMenu column={column}>
        <button
          type="button"
          title="Drag to reorder • Click to sort"
          onClick={column.getToggleSortingHandler()}
          className="flex w-full items-center justify-between gap-2 px-2 py-1
                     cursor-grab active:cursor-grabbing focus:outline-none"
          {...attributes}
          {...listeners}
        >
          <span className="truncate text-left">
            {flexRender(column.columnDef.header, header.getContext())}
          </span>
          <span className="shrink-0 text-slate-500">
            {isSorted === "asc" ? "↑" : isSorted === "desc" ? "↓" : null}
          </span>
        </button>
      </HeaderMenu>

      {column.getCanResize() && (
        <div
          className="th-resize-handle"
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
        />
      )}
    </th>
  );
}
