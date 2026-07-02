"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { bootstrapSuperAdmin } from "@/lib/api/platform";
import { ApiError } from "@/types/api";

const bootstrapSchema = z.object({
  bootstrapSecret: z.string().min(1, "Bootstrap secret is required"),
  email: z.string().email("Enter a valid email").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

type BootstrapFormValues = z.infer<typeof bootstrapSchema>;

export default function PlatformBootstrapPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BootstrapFormValues>({
    resolver: zodResolver(bootstrapSchema),
    defaultValues: {
      bootstrapSecret: process.env.NEXT_PUBLIC_PLATFORM_BOOTSTRAP_SECRET ?? "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  async function onSubmit(values: BootstrapFormValues) {
    setServerError(null);
    try {
      const response = await bootstrapSuperAdmin(values.bootstrapSecret, {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setSession(response.data);
      toast.success("Platform super administrator created");
      router.replace("/platform/dashboard");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Bootstrap failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Platform bootstrap</CardTitle>
          <CardDescription>
            Create the first super administrator when none exists. Requires the bootstrap secret from backend
            configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && <ErrorAlert message={serverError} />}

            <FormSection title="Bootstrap credentials">
              <FormField label="Bootstrap secret" error={errors.bootstrapSecret?.message} className="sm:col-span-2">
                <Input type="password" {...register("bootstrapSecret")} />
              </FormField>
              <FormField label="Email" error={errors.email?.message} className="sm:col-span-2">
                <Input type="email" {...register("email")} />
              </FormField>
              <FormField label="Password" error={errors.password?.message} className="sm:col-span-2">
                <Input type="password" {...register("password")} />
              </FormField>
              <FormField label="First name" error={errors.firstName?.message}>
                <Input {...register("firstName")} />
              </FormField>
              <FormField label="Last name" error={errors.lastName?.message}>
                <Input {...register("lastName")} />
              </FormField>
            </FormSection>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/login")}>
                Back to login
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Bootstrap platform
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
