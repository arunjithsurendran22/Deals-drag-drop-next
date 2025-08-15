import "@tanstack/react-table";

// Extend TanStack's TableMeta so `table.options.meta.rerender` is typed.
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    rerender?: () => void;
    // phantom usage so eslint doesn't flag TData as unused
    /** @internal */
    __tdata__?: TData | undefined;
  }
}
