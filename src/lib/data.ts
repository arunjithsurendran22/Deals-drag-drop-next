import { Deal } from "./schema";

function d(id: number, p: Partial<Deal>): Deal {
  return {
    id: `d_${id.toString().padStart(3, "0")}`,
    name: p.name ?? `Deal -${id}`,
    owner: p.owner ?? ["Aisha","Omar","Lina","Raj","Maya"][id % 5],
    company: p.company ?? ["OrbitSoft","Skylytics","NovaBank","Qwibi","Helio"][id % 5],
    stage: p.stage ?? (["New","Qualified","Proposal","Negotiation","Won","Lost"] as const)[id % 6],
    status: p.status ?? (["Open","Blocked","On Hold","Closed"] as const)[id % 4],
    amount: p.amount ?? (Math.floor(Math.random()*8)+3) * 1000,
    probability: p.probability ?? (Math.round((0.3 + Math.random()*0.6) * 100) / 100),
    createdAt: p.createdAt ?? "2025-07-0" + ((id%9)+1),
    closeDate: p.closeDate ?? (id % 3 === 0 ? "2025-09-1" + (id%9) : undefined),
  };
}

export const deals: Deal[] = Array.from({ length: 20 }, (_, i) => d(i+1, {}));