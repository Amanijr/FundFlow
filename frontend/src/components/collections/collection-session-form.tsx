"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLLECTION_TYPE_LABELS } from "@/lib/collections/labels";
import type { CollectionSessionCreateRequest, CollectionType } from "@/types/collection";
import type { FundResponse } from "@/types/finance";

const collectionTypes = Object.keys(COLLECTION_TYPE_LABELS) as CollectionType[];

const schema = z.object({
  collectionType: z.enum(["GENERAL", "EVENT", "PROJECT", "SPECIAL_APPEAL"]),
  title: z.string().min(1, "Give this collection a name").max(255),
  location: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
  fundId: z.string().optional(),
});

export type CollectionSessionFormValues = z.infer<typeof schema>;

interface CollectionSessionFormProps {
  funds?: FundResponse[];
  serverError?: string | null;
  onSubmit: (values: CollectionSessionCreateRequest) => Promise<void>;
  onCancel?: () => void;
}

export function CollectionSessionForm({
  funds = [],
  serverError,
  onSubmit,
  onCancel,
}: CollectionSessionFormProps) {
  const defaultFund = funds.find((fund) => fund.defaultForCollections && fund.active);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CollectionSessionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      collectionType: "GENERAL",
      title: "",
      location: "",
      notes: "",
      fundId: defaultFund ? String(defaultFund.id) : "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          collectionType: values.collectionType,
          title: values.title,
          location: values.location || undefined,
          notes: values.notes || undefined,
          fundId: values.fundId ? Number(values.fundId) : undefined,
        }),
      )}
      className="space-y-4"
    >
      {serverError && <ErrorAlert message={serverError} />}
      <FormSection
        title="Collection"
        description="Start a count for collected funds. Finance verifies it before it posts to the books."
      >
        <FormField label="Collection type" error={errors.collectionType?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("collectionType")}
          >
            {collectionTypes.map((type) => (
              <option key={type} value={type}>
                {COLLECTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Name" error={errors.title?.message}>
          <Input {...register("title")} placeholder="e.g. Community fundraiser" />
        </FormField>
        <FormField label="Fund" className="sm:col-span-2">
          <select className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm" {...register("fundId")}>
            <option value="">No fund selected</option>
            {funds
              .filter((fund) => fund.active)
              .map((fund) => (
                <option key={fund.id} value={String(fund.id)}>
                  {fund.name}
                  {fund.defaultForCollections ? " (default)" : ""}
                </option>
              ))}
          </select>
        </FormField>
        <FormField label="Location" error={errors.location?.message} className="sm:col-span-2">
          <Input {...register("location")} placeholder="Optional" />
        </FormField>
        <FormField label="Notes" className="sm:col-span-2">
          <Input {...register("notes")} placeholder="Optional" />
        </FormField>
      </FormSection>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Start collection
        </Button>
      </div>
    </form>
  );
}
