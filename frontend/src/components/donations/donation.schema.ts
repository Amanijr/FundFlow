import { z } from "zod";

import { money } from "@/lib/validation/financial";

export const donationSchema = z
  .object({
    donorId: z.string().optional(),
    amount: money,
    donationType: z.enum(["ONE_TIME", "RECURRING", "PLEDGE", "IN_KIND", "COLLECTION"]),
    anonymous: z.boolean(),
    campaignId: z.string().optional(),
    source: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
    itemDescription: z.string().max(500).optional(),
    estimatedValue: z.number().optional(),
  })
  .refine((values) => values.anonymous || Boolean(values.donorId), {
    message: "Select a donor or mark as anonymous",
    path: ["donorId"],
  });

export type DonationFormValues = z.infer<typeof donationSchema>;

export const donationTypeOptions = [
  { value: "ONE_TIME", label: "One time" },
  { value: "RECURRING", label: "Recurring" },
  { value: "PLEDGE", label: "Pledge" },
  { value: "IN_KIND", label: "In kind" },
  { value: "COLLECTION", label: "Collection" },
] as const;
