"use client";

import { FiSearch, FiX } from "react-icons/fi";

export default function SearchInput({
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
