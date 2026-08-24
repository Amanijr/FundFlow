"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLLECTION_TYPE_LABELS } from "@/lib/church/labels";
import type { CollectionSessionCreateRequest, CollectionType } from "@/types/collection";

const collectionTypes = Object.keys(COLLECTION_TYPE_LABELS) as CollectionType[];

const schema = z.object({
  collectionType: z.enum([
    "SERVICE_OFFERING",
    "EVENT",
    "DEPARTMENT",
    "PROJECT",
    "SPECIAL_APPEAL",
  ]),
  title: z.string().min(1, "Give this collection a name").max(255),
  location: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export type CollectionSessionFormValues = z.infer<typeof schema>;

interface CollectionSessionFormProps {
  serverError?: string | null;
  onSubmit: (values: CollectionSessionCreateRequest) => Promise<void>;
  onCancel?: () => void;
}

export function CollectionSessionForm({ serverError, onSubmit, onCancel }: CollectionSessionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CollectionSessionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      collectionType: "SERVICE_OFFERING",
      title: "Sunday offering",
      location: "",
      notes: "",
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
        }),
      )}
      className="space-y-4"
    >
      {serverError && <ErrorAlert message={serverError} />}
      <FormSection
        title="Collection"
        description="Start a count for the service. The treasurer verifies it later, then it posts to the books."
      >
        <FormField label="What was collected" error={errors.collectionType?.message}>
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
          <Input {...register("title")} placeholder="e.g. Sunday 1st service" />
        </FormField>
        <FormField label="Where" error={errors.location?.message} className="sm:col-span-2">
          <Input {...register("location")} placeholder="e.g. Main sanctuary, Kinondoni" />
        </FormField>
        <FormField label="Notes" className="sm:col-span-2">
          <Input {...register("notes")} placeholder="Optional — ushers, bag count, etc." />
        </FormField>
      </FormSection>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          Start collection
        </Button>
      </div>
    </form>
  );
}
