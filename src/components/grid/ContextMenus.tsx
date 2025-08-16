/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Column } from "@tanstack/react-table";
import { FiEye, FiEyeOff, FiRotateCcw, FiX } from "react-icons/fi";

export function HeaderMenu({
  column,
  children,
}: {
  column: Column<any, unknown>;
  children: React.ReactNode;
}) {
  const isVisible = column.getIsVisible();
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Content className="z-50 bg-white/95 backdrop-blur border rounded-md shadow-xl p-1 text-sm min-w-[200px] mt-4">
        <ContextMenu.Item
          className="px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer flex items-center gap-2"
          onSelect={() => column.toggleVisibility(!isVisible)}
        >
          {isVisible ? <FiEyeOff /> : <FiEye />}
          {isVisible ? "Hide column" : "Show column"}
        </ContextMenu.Item>

        <ContextMenu.Separator className="h-px bg-gray-200 my-1" />

        <ContextMenu.Item
          className="px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer flex items-center gap-2"
          onSelect={() => column.clearSorting()}
        >
          <FiX />
          Clear sorting
        </ContextMenu.Item>
        <ContextMenu.Item
          className="px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer flex items-center gap-2"
          onSelect={() => column.resetSize()}
        >
          <FiRotateCcw />
          Reset width
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

export function RowMenu({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Content className="z-50 bg-white/95 backdrop-blur border rounded-md shadow-xl p-1 text-sm min-w-[180px]">
        <ContextMenu.Item className="px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer">
          Open
        </ContextMenu.Item>
        <ContextMenu.Item className="px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer">
          Duplicate
        </ContextMenu.Item>
        <ContextMenu.Item
          className="px-2 py-1.5 rounded hover:bg-rose-50 text-rose-600 cursor-pointer"
          onSelect={onDelete}
        >
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
