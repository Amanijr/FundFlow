"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  CurrencyField,
  DateField,
  FormSection,
  FormWizard,
  TextField,
  type FormWizardStep,
} from "@/components/forms";
import { emailSchema } from "@/lib/validation/common";
import { money } from "@/lib/validation/financial";
import { PageHeader } from "@/components/layout/page-header";
import { DetailCard } from "@/components/display/detail-card";

const grantSchema = z.object({
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantEmail: emailSchema,
  projectTitle: z.string().min(1, "Project title is required"),
  projectSummary: z.string().max(2000).optional(),
  requestedAmount: money,
  startDate: z.date({ error: "Start date is required" }),
});

type GrantFormValues = z.infer<typeof grantSchema>;

const steps: FormWizardStep<GrantFormValues>[] = [
  { id: "applicant", title: "Applicant", fields: ["applicantName", "applicantEmail"] },
  { id: "project", title: "Project", fields: ["projectTitle", "projectSummary"] },
  { id: "budget", title: "Budget", fields: ["requestedAmount", "startDate"] },
  { id: "review", title: "Review" },
];

export default function WizardFormPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Wizard form" }]}
        title="Grant application"
        description="Multi-step form demo using FormWizard and StepIndicator."
      />

      <FormWizard
        steps={steps}
        resolver={zodResolver(grantSchema)}
        defaultValues={{
          applicantName: "",
          applicantEmail: "",
          projectTitle: "",
          projectSummary: "",
          requestedAmount: 0,
        }}
        onSubmit={(values) => {
          toast.success(`Submitted grant: ${values.projectTitle}`);
        }}
        onSaveDraft={(values) => {
          toast.message("Draft saved", { description: values.projectTitle });
        }}
        renderStep={(stepId, wizardForm) => {
          const { control } = wizardForm;

          if (stepId === "applicant") {
            return (
              <FormSection title="Applicant information">
                <TextField control={control} name="applicantName" label="Full name" required />
                <TextField control={control} name="applicantEmail" label="Email" required />
              </FormSection>
            );
          }

          if (stepId === "project") {
            return (
              <FormSection title="Project details">
                <TextField
                  control={control}
                  name="projectTitle"
                  label="Project title"
                  required
                  className="sm:col-span-2"
                />
                <TextField
                  control={control}
                  name="projectSummary"
                  label="Summary"
                  className="sm:col-span-2"
                />
              </FormSection>
            );
          }

          if (stepId === "budget") {
            return (
              <FormSection title="Budget">
                <CurrencyField control={control} name="requestedAmount" label="Requested amount" required />
                <DateField control={control} name="startDate" label="Start date" required />
              </FormSection>
            );
          }

          return null;
        }}
        renderReview={(wizardForm) => {
          const values = wizardForm.getValues();
          return (
            <DetailCard
              title="Review application"
              fields={[
                { label: "Applicant", value: values.applicantName },
                { label: "Email", value: values.applicantEmail },
                { label: "Project", value: values.projectTitle },
                { label: "Amount", value: `$${values.requestedAmount.toLocaleString()}` },
              ]}
            />
          );
        }}
        submitLabel="Submit application"
        reviewStepId="review"
      />
    </div>
  );
}
