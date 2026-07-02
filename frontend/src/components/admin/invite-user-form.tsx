"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INVITABLE_ROLES } from "@/types/admin";
import type { CreateUserRequest } from "@/lib/api/users";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum([
    "FINANCE_MANAGER",
    "ACCOUNTANT",
    "FUNDRAISING_MANAGER",
    "PROGRAM_MANAGER",
    "STAFF",
    "VOLUNTEER",
    "AUDITOR",
    "VIEW_ONLY",
  ]),
});

export type InviteUserFormValues = z.infer<typeof schema>;

interface InviteUserFormProps {
  serverError?: string | null;
  submitLabel?: string;
  onSubmit: (values: CreateUserRequest) => Promise<void>;
  onCancel?: () => void;
}

export function InviteUserForm({
  serverError,
  submitLabel = "Invite user",
  onSubmit,
  onCancel,
}: InviteUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "STAFF",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Team member" description="Create a login for someone on your team">
        <FormField label="First name" error={errors.firstName?.message}>
          <Input {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <Input {...register("lastName")} />
        </FormField>
        <FormField label="Email" error={errors.email?.message} className="sm:col-span-2">
          <Input type="email" {...register("email")} />
        </FormField>
        <FormField label="Temporary password" error={errors.password?.message} className="sm:col-span-2">
          <Input type="password" {...register("password")} />
        </FormField>
        <FormField label="Role" error={errors.role?.message} className="sm:col-span-2">
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("role")}
          >
            {INVITABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {formatEnumLabel(role)}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
