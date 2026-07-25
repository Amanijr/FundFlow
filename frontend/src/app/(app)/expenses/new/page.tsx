"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createExpense } from "@/lib/api/expenses";
import { listFunds } from "@/lib/api/funds";
import { ApiError } from "@/types/api";
import type { ExpenseRequest } from "@/types/finance";

export default function NewExpensePage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((f) => ({ id: String(f.id), label: f.name, description: f.code })),
    [fundsQuery.data],
  );

  async function handleSubmit(values: ExpenseRequest) {
    setServerError(null);
    try {
      const response = await createExpense(accessToken!, values);
      toast.success("Expense created");
      router.push(`/expenses/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create expense");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Expenses", href: "/expenses" }, { label: "New expense" }]}
        title="Create expense"
      />
      <ExpenseForm
        fundOptions={fundOptions}
        submitLabel="Create expense"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/expenses")}
      />
    </div>
  );
}
