import DataGrid from "@/components/grid/DataGrid";
import Toolbar from "@/components/grid/Toolbar";
import TotalsBar from "@/components/grid/TotalsBar";
import { deals } from "@/lib/data";

export default function DealsPage() {
  return (
    <main className="p-4 flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">Deals</h1>
      <Toolbar />

      {/* Card with all-side shadow */}
      <div className="rounded-md shadow-[0_0_12px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* 📌 Let DataGrid handle scrolling (no nested scroll containers here) */}
        <DataGrid data={deals} height={800} />
      </div>

      <TotalsBar />
    </main>
  );
}
