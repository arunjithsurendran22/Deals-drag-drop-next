import DealsGrid from "@/components/grid/DataGrid";
import { deals } from "@/lib/data";

export default function DealsPage() {
  return (
    <main className="px-4 py-3 flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">Deals</h1>

      {/* All-in-one grid shell: Toolbar + Table + Totals inside provider */}
      <div className="overflow-hidden rounded-md shadow-[0_0_12px_rgba(0,0,0,0.6)]">
        <DealsGrid data={deals} height={690} previewRows={13} />
      </div>
    </main>
  );
}
