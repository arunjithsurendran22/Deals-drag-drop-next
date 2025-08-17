"use client";

import * as React from "react";
import {
  type SortingState,
  type VisibilityState,
  type ColumnOrderState,
} from "@tanstack/react-table";
import type { RowSelectionState, ExpandedState } from "@tanstack/react-table";
import { useLocalStorageState } from "@/lib/localStorage";
import type { MutableRefObject } from "react";
import type { GridCoord } from "@/lib/keyboard";

export function useGridState() {
  // 👇 important: add generics + typed defaults
  const [sorting, setSorting] = useLocalStorageState<SortingState>(
    "grid:sorting",
    [] as SortingState
  );
  const [columnVisibility, setColumnVisibility] = useLocalStorageState<VisibilityState>(
    "grid:visibility",
    {} as VisibilityState
  );
  const [columnOrder, setColumnOrder] = useLocalStorageState<ColumnOrderState>(
    "grid:order",
    [] as ColumnOrderState
  );
  const [columnSizing, setColumnSizing] = useLocalStorageState<Record<string, number>>(
    "grid:sizing",
    {} as Record<string, number>
  );

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const [amountMin, setAmountMin] = React.useState<string>("");
  const [amountMax, setAmountMax] = React.useState<string>("");

  const lastSelectedRef = React.useRef<number | null>(null) as MutableRefObject<number | null>;
  const [focus, setFocus] = React.useState<GridCoord>({ row: 0, col: 0 });
  const [tick, setTick] = React.useState(0);

  // sticky toolbar measurement → sets CSS var consumed by ColumnHeader
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
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

  return {
    sorting, setSorting,
    columnVisibility, setColumnVisibility,
    columnOrder, setColumnOrder,
    columnSizing, setColumnSizing,
    rowSelection, setRowSelection,
    expanded, setExpanded,
    globalFilter, setGlobalFilter,
    amountMin, setAmountMin,
    amountMax, setAmountMax,
    lastSelectedRef,
    focus, setFocus,
    tick, setTick,
    scrollRef, toolbarRef,
  };
}
