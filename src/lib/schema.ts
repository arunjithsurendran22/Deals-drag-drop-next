import { z } from "zod";

export const DealStage = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"] as const;
export const Status = ["Open", "Blocked", "On Hold", "Closed"] as const;

export const DealSchema = z.object({
  id: z.string(),
  name: z.string(),
  owner: z.string(),
  company: z.string().optional(),
  stage: z.enum(DealStage),
  status: z.enum(Status),
  amount: z.number(),
  probability: z.number().min(0).max(1),
  createdAt: z.string(),
  closeDate: z.string().optional(),
});
export type Deal = z.infer<typeof DealSchema>;