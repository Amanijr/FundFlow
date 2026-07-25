"use client";

import { useState } from "react";
import {
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
  useForm,
} from "react-hook-form";

import { ErrorAlert } from "@/components/feedback/error-alert";

import { FormActions } from "../layout/form-actions";
import { FormContainer } from "../layout/form-container";
import { ValidationSummary } from "../validation/validation-summary";
import { StepIndicator, type WizardStep } from "./step-indicator";

export interface FormWizardStep<T extends FieldValues> extends WizardStep {
  fields?: readonly FieldPath<T>[];
}

interface FormWizardProps<T extends FieldValues> {
  steps: readonly FormWizardStep<T>[];
  resolver: Resolver<T>;
  defaultValues?: DefaultValues<T>;
  serverError?: string | null;
  onSubmit: (values: T) => void | Promise<void>;
  onSaveDraft?: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  renderStep: (stepId: string, form: UseFormReturn<T>) => React.ReactNode;
  renderReview?: (form: UseFormReturn<T>) => React.ReactNode;
  submitLabel?: string;
  reviewStepId?: string;
}

export function FormWizard<T extends FieldValues>({
  steps,
  resolver,
  defaultValues,
  serverError,
  onSubmit,
  onSaveDraft,
  onCancel,
  renderStep,
  renderReview,
  submitLabel = "Submit",
  reviewStepId = "review",
}: FormWizardProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const form = useForm<T>({
    resolver,
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting, isSubmitted },
  } = form;

  const currentStep = steps[currentIndex];
  const isReviewStep = currentStep?.id === reviewStepId;
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;

  async function goNext() {
    if (currentStep?.fields?.length) {
      const valid = await trigger(currentStep.fields as FieldPath<T>[]);
      if (!valid) return;
    }
    setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function goPrevious() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  async function handleSaveDraft() {
    if (!onSaveDraft) return;
    setIsSavingDraft(true);
    try {
      await onSaveDraft(getValues());
    } finally {
      setIsSavingDraft(false);
    }
  }

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <StepIndicator
        steps={steps}
        currentIndex={currentIndex}
        onStepClick={(index) => setCurrentIndex(index)}
      />

      {serverError && <ErrorAlert message={serverError} />}
      {isSubmitted && Object.keys(errors).length > 0 && <ValidationSummary errors={errors} />}

      <div className="space-y-6">
        {isReviewStep && renderReview ? renderReview(form) : renderStep(currentStep.id, form)}
      </div>

      <FormActions
        onCancel={!isFirstStep ? goPrevious : onCancel}
        onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
        onNext={!isLastStep ? goNext : undefined}
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        submitLabel={isLastStep ? submitLabel : "Next"}
        cancelLabel={isFirstStep ? "Cancel" : "Back"}
        isLastStep={isLastStep}
      />
    </FormContainer>
  );
}
