/* eslint-disable @typescript-eslint/no-explicit-any */

export function labelFor(col: any) {
  const h = col?.columnDef?.header;
  return typeof h === "string" ? h : col?.id ?? "Column";
}

export const STAGES = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
export const OWNERS = ["Aisha", "Omar", "Lina", "Raj", "Maya", "Ken", "Zara"];
export const STATUSES = ["Open", "Blocked", "On Hold", "Closed"];
