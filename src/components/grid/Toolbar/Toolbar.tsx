
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDealsTableApi } from "../tableApi"; 
import {
  FiSliders,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiFlag,
  FiGitMerge,
} from "react-icons/fi";

import ToolbarCard from "./components/ToolbarCard";
import SearchInput from "./components/SearchInput";
import MenuSelect from "./components/MenuSelect";
import { labelFor, STAGES, OWNERS, STATUSES } from "./components/utils";

export default function Toolbar() {
  const api = useDealsTableApi();
  if (!api) return null;

  const selected = Object.keys(api.rowSelection).length;

  // table + hidden column count
  const table = api.table;
  const allLeaf = table.getAllLeafColumns(); // includes hidden
  const hidden = allLeaf.filter((c) => !c.getIsVisible());
  const showAll = () => allLeaf.forEach((c) => c.toggleVisibility(true));

  // filter columns
  const stageCol = api.getColumn("stage");
  const ownerCol = api.getColumn("owner");
  const statusCol = api.getColumn("status");

  const stageValue = (stageCol?.getFilterValue() as string | undefined) ?? undefined;
  const ownerValue = (ownerCol?.getFilterValue() as string | undefined) ?? undefined;
  const statusValue = (statusCol?.getFilterValue() as string | undefined) ?? undefined;

  return (
    <div className="flex w-full items-center justify-between gap-3 flex-wrap">
      {/* left side */}
      {selected > 0 ? (
        <ToolbarCard>
          <span className="font-medium">{selected} selected</span>
          <button
            className="px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => alert("Bulk: Assign owner")}
          >
            Assign owner
          </button>
          <button
            className="px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => alert("Bulk: Move stage")}
          >
            Move stage
          </button>
          <button
            className="px-2.5 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700"
            onClick={api.clearSelection}
          >
            Clear
          </button>
        </ToolbarCard>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <MenuSelect
            icon={<FiGitMerge className="opacity-70" />}
            label="Stage"
            value={stageValue}
            onChange={(v) => stageCol?.setFilterValue(v || undefined)}
            options={STAGES}
            widthClass="w-72"
          />
          <MenuSelect
            icon={<FiUsers className="opacity-70" />}
            label="Owner"
            value={ownerValue}
            onChange={(v) => ownerCol?.setFilterValue(v || undefined)}
            options={OWNERS}
            widthClass="w-72"
          />
          <MenuSelect
            icon={<FiFlag className="opacity-70" />}
            label="Status"
            value={statusValue}
            onChange={(v) => statusCol?.setFilterValue(v || undefined)}
            options={STATUSES}
            widthClass="w-64"
          />
        </div>
      )}

      {/* right side — Search + Columns */}
      <div className="flex items-center gap-2">
        <SearchInput value={api.globalFilter ?? ""} onChange={api.setGlobalFilter} />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="Columns"
              className="relative inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 hover:bg-slate-50 active:bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500/60"
            >
              <FiSliders className="h-4 w-4" />
              {hidden.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 text-white text-[10px] px-1">
                  {hidden.length}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="z-50 w-[22rem] rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-xl"
          >
            <div className="px-2 py-2 text-xs uppercase tracking-wide text-slate-500">
              Toggle Columns
            </div>

            <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />

            {allLeaf.map((col) => {
              const vis = col.getIsVisible();
              return (
                <DropdownMenu.Item
                  key={col.id}
                  onSelect={(e) => {
                    e.preventDefault(); // keep menu open
                    col.toggleVisibility(!vis);
                  }}
                  className="flex cursor-pointer select-none items-center justify-between gap-2 rounded px-2 py-1.5 outline-none hover:bg-slate-100"
                >
                  <span className="truncate">{labelFor(col)}</span>
                  {vis ? <FiEye className="opacity-70" /> : <FiEyeOff className="opacity-70" />}
                </DropdownMenu.Item>
              );
            })}

            <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />

            <div className="flex items-center gap-1 px-1 py-1">
              <button
                className="w-full rounded-md px-2 py-1 hover:bg-slate-100"
                onClick={showAll}
              >
                Show all
              </button>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
