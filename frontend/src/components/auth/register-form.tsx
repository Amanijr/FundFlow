"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { register as registerApi } from "@/lib/api/auth";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, type OrganizationType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const organizationTypes: { value: OrganizationType; label: string }[] = [
  { value: "CHURCH", label: "Church" },
  { value: "NGO", label: "NGO" },
  { value: "FOUNDATION", label: "Foundation" },
  { value: "CHARITY", label: "Charity" },
  { value: "COMMUNITY_ORGANIZATION", label: "Community organization" },
  { value: "SCHOOL", label: "School" },
  { value: "RELIGIOUS_INSTITUTION", label: "Religious institution" },
];

const registerSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  organizationType: z.enum([
    "CHURCH",
    "NGO",
    "FOUNDATION",
    "CHARITY",
    "COMMUNITY_ORGANIZATION",
    "SCHOOL",
    "RELIGIOUS_INSTITUTION",
  ]),
  organizationEmail: z.string().email("Enter a valid organization email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  variant?: "card" | "panel";
  className?: string;
  onSwitchToSignIn?: () => void;
}

export function RegisterForm({ variant = "card", className, onSwitchToSignIn }: RegisterFormProps) {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      organizationType: "NGO",
      organizationEmail: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    try {
      const response = await registerApi({
        organization: {
          name: values.organizationName,
          type: values.organizationType,
          email: values.organizationEmail,
        },
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setSession(response.data);
      router.replace("/admin/setup");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register");
    }
  }

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <ErrorAlert message={error ?? ""} />

      <div className="space-y-1.5">
        <Label htmlFor="organizationName">Organization name</Label>
        <Input id="organizationName" {...register("organizationName")} />
        {errors.organizationName && (
          <p className="text-xs text-destructive">{errors.organizationName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="organizationType">Organization type</Label>
        <select
          id="organizationType"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
          {...register("organizationType")}
        >
          {organizationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="organizationEmail">Organization email</Label>
        <Input id="organizationEmail" type="email" {...register("organizationEmail")} />
        {errors.organizationEmail && (
          <p className="text-xs text-destructive">{errors.organizationEmail.message}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="register-email">Admin email</Label>
        <Input id="register-email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );

  if (variant === "panel") {
    return (
      <div
        className={cn(
          "flex h-full flex-col overflow-y-auto overscroll-contain px-6 py-8 scrollbar-thin sm:px-10",
          className,
        )}
      >
        <div className="mb-4 shrink-0 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Create your organization</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register a new organization on FundFlow</p>
        </div>
        <div className="min-h-0 flex-1">{form}</div>
        {onSwitchToSignIn && (
          <p className="mt-4 shrink-0 text-center text-sm text-muted-foreground lg:hidden">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToSignIn} className="font-medium text-primary hover:underline">
              Sign in
            </button>
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-2xl border-border", className)}>
      <CardHeader>
        <CardTitle>Create your organization</CardTitle>
        <CardDescription>Register a new FundFlow ERP tenant and admin account</CardDescription>
      </CardHeader>
      <CardContent>
        {form}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
