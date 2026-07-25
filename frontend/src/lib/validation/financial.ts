import { z } from "zod";

export const positiveAmount = z
  .number({ error: "Amount is required" })
  .positive("Amount must be greater than zero");

export const money = positiveAmount.max(999_999_999.99, "Amount exceeds maximum");

export const nonNegativeAmount = z
  .number({ error: "Amount is required" })
  .min(0, "Amount cannot be negative");

export const percentageSchema = z
  .number({ error: "Percentage is required" })
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");
