// src/components/grid/tableApi.tsx
"use client";

import { createContext, useContext } from "react";
import type { Table, Column } from "@tanstack/react-table";
import type { Deal } from "@/lib/schema";

export type DealsApi = {
  table: Table<Deal>;
  getColumn: (id: string) => Column<Deal, unknown> | undefined;
  getFilteredRows: () => Deal[];
  rowSelection: Record<string, boolean>;
  clearSelection: () => void;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  amountMin: string;
  setAmountMin: (v: string) => void;
  amountMax: string;
  setAmountMax: (v: string) => void;
};

const Ctx = createContext<DealsApi | null>(null);
export const DealsApiProvider = Ctx.Provider;
export function useDealsTableApi() { return useContext(Ctx); }
