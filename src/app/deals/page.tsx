// src/app/deals/page.tsx  (Server Component)
import DataGrid from "@/components/grid/DataGrid";
import Toolbar from "@/components/grid/Toolbar";
import TotalsBar from "@/components/grid/TotalsBar";
import { deals } from "@/lib/data";

export default function DealsPage() {
  return (
    <main className="p-4 flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">Deals</h1>
      <Toolbar />
      <div className="overflow-hidden">
        <DataGrid data={deals} />
      </div>
      <TotalsBar />
    </main>
  );
}
