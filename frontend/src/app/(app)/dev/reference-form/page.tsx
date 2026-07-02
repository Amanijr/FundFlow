"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  CurrencyField,
  DateField,
  FormActions,
  FormContainer,
  FormSection,
  LookupField,
  TextField,
  ValidationSummary,
} from "@/components/forms";
import { money } from "@/lib/validation/financial";
import { PageHeader } from "@/components/layout/page-header";
import { WarningAlert } from "@/components/feedback/warning-alert";

const schema = z.object({
  donorId: z.string().min(1, "Select a donor"),
  amount: money,
  giftDate: z.date({ message: "Gift date is required" }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const donorOptions = [
  { id: "1", label: "Jane Donor", description: "jane@example.org" },
  { id: "2", label: "John Smith", description: "john@example.org" },
];

export default function ReferenceFormPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { donorId: "", amount: 0, note: "" },
  });

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isDirty, isSubmitted },
  } = form;

  function onSubmit(values: FormValues) {
    toast.success(`Recorded $${values.amount} gift`);
  }

  function handleSaveDraft() {
    toast.message("Draft saved locally", {
      description: `Donor: ${getValues("donorId") || "none"}, amount: ${getValues("amount")}`,
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Reference form" }]}
        title="Record donation"
        description="Reference form using the Phase 07 enterprise form framework."
      />

      {isDirty && (
        <WarningAlert message="You have unsaved changes." />
      )}

      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        {isSubmitted && Object.keys(errors).length > 0 && <ValidationSummary errors={errors} />}

        <FormSection title="Donation details" description="Link a donor and enter gift information">
          <LookupField
            control={control}
            name="donorId"
            label="Donor"
            options={donorOptions}
            placeholder="Search donors..."
            required
            className="sm:col-span-2"
          />

          <CurrencyField control={control} name="amount" label="Amount" required />

          <DateField control={control} name="giftDate" label="Gift date" required />

          <TextField
            control={control}
            name="note"
            label="Note"
            placeholder="Optional note"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormActions
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
          submitLabel="Record donation"
        />
      </FormContainer>
    </div>
  );
}
