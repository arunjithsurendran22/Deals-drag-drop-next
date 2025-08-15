/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/grid/ContextMenus.tsx
"use client";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Column } from "@tanstack/react-table";

export function HeaderMenu({ column, children }:{ column: Column<any, unknown>, children: React.ReactNode }) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Content className="bg-white border rounded-md shadow p-1 text-sm">
        <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onSelect={() => column.toggleVisibility()}>
          {column.getIsVisible() ? "Hide column" : "Show column"}
        </ContextMenu.Item>
        <ContextMenu.Separator className="h-px bg-gray-200 my-1" />
        <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onSelect={() => column.clearSorting()}>
          Clear sorting
        </ContextMenu.Item>
        <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onSelect={() => column.resetSize()}>
          Reset width
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

export function RowMenu({ children, onDelete }:{ children: React.ReactNode; onDelete: ()=>void }) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Content className="bg-white border rounded-md shadow p-1 text-sm">
        <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Open</ContextMenu.Item>
        <ContextMenu.Item className="px-2 py-1 hover:bg-gray-100 cursor-pointer">Duplicate</ContextMenu.Item>
        <ContextMenu.Item className="px-2 py-1 hover:bg-red-50 text-red-600 cursor-pointer" onSelect={onDelete}>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
