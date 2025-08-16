/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDealsTableApi } from "./tableApi";
import {
  FiSliders,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiChevronDown,
  FiCheck,
  FiX,
  FiUsers,
  FiFlag,
  FiGitMerge,
} from "react-icons/fi";

function labelFor(col: any) {
  const h = col?.columnDef?.header;
  return typeof h === "string" ? h : col?.id ?? "Column";
}

/* ---------- tiny UI bits ---------- */

function ToolbarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-[2px] px-3 py-2 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,.05)]">
      {children}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder = "Search deals…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative h-10">
      <input
        className="h-full w-80 md:w-[28rem] rounded-lg border border-slate-300 bg-white pl-3 pr-10 text-sm
                   outline-none transition focus:ring-2 focus:ring-blue-500/60"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-slate-100"
        >
          <FiX className="h-4 w-4 opacity-70" />
        </button>
      ) : (
        <FiSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
      )}
    </div>
  );
}

type MenuSelectProps = {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onChange: (v?: string) => void; // undefined => All
  options: string[];
  widthClass?: string; // e.g. "w-64", "w-72"
};

/** Pretty “fake select” with big trigger + wider menu */
function MenuSelect({
  icon,
  label,
  value,
  onChange,
  options,
  widthClass = "w-64",
}: MenuSelectProps) {
  const shown = value ?? ""; // empty => All

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={[
            "h-10 inline-flex items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm",
            "hover:bg-slate-50 active:bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500/60",
            widthClass,
          ].join(" ")}
        >
          <span className="flex min-w-0 items-center gap-2">
            {icon}
            <span className="text-slate-600 shrink-0">{label}:</span>
            <span className="truncate font-medium">{shown || "All"}</span>
          </span>
          <FiChevronDown className="ml-2 shrink-0 opacity-60" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        sideOffset={8}
        align="start"
        className="z-[100] w-[20rem] md:w-[22rem] rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-xl"
      >
        <DropdownMenu.Item
          onSelect={(e) => {
            e.preventDefault();
            onChange(undefined);
          }}
          className="flex cursor-pointer select-none items-center justify-between rounded px-2 py-2 outline-none hover:bg-slate-100"
        >
          <span className="text-slate-700">All</span>
          {!shown && <FiCheck className="opacity-70" />}
        </DropdownMenu.Item>

        <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />

        {options.map((opt) => {
          const active = shown === opt;
          return (
            <DropdownMenu.Item
              key={opt}
              onSelect={(e) => {
                e.preventDefault();
                onChange(opt);
              }}
              className="flex cursor-pointer select-none items-center justify-between rounded px-2 py-2 outline-none hover:bg-slate-100"
            >
              <span className="truncate">{opt}</span>
              {active && <FiCheck className="opacity-70" />}
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

/* ---------- main Toolbar ---------- */

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

  const STAGES = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
  const OWNERS = ["Aisha", "Omar", "Lina", "Raj", "Maya", "Ken", "Zara"];
  const STATUSES = ["Open", "Blocked", "On Hold", "Closed"];

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
