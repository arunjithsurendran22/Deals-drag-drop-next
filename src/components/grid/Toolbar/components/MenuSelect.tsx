"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FiChevronDown, FiCheck } from "react-icons/fi";

type MenuSelectProps = {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onChange: (v?: string) => void; // undefined => All
  options: string[];
  widthClass?: string; // e.g. "w-64", "w-72"
};

/** Pretty “fake select” with big trigger + wider menu */
export default function MenuSelect({
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
