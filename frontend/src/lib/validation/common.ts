import { z } from "zod";

export const requiredString = (label: string) => z.string().min(1, `${label} is required`);

export const optionalString = z
  .string()
  .transform((value) => (value.trim() === "" ? undefined : value))
  .optional();

export const optionalNotes = z.string().max(2000, "Notes cannot exceed 2000 characters").optional();

export const emailSchema = z.string().email("Enter a valid email address");

export const phoneSchema = z
  .string()
  .min(7, "Enter a valid phone number")
  .max(20, "Phone number is too long");
