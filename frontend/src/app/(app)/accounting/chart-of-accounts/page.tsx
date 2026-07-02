"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AccountingNav } from "@/components/accounting/accounting-nav";
import { ChartOfAccountForm } from "@/components/accounting/chart-of-account-form";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { createChartOfAccount, initializeAccounting, listChartOfAccounts } from "@/lib/api/accounting";
import { ApiError } from "@/types/api";
import type { ChartOfAccountRequest, ChartOfAccountResponse } from "@/types/accounting";

export default function ChartOfAccountsPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["accounting", "chart-of-accounts"],
    queryFn: async () => (await listChartOfAccounts(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (accountsQuery.data ?? []).filter(
      (a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  }, [accountsQuery.data, search]);

  const columns = useMemo<ColumnDef<ChartOfAccountResponse>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Account name" },
      {
        accessorKey: "accountType",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.accountType),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "success" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "systemAccount",
        header: "System",
        cell: ({ row }) => (row.original.systemAccount ? "Yes" : "—"),
      },
    ],
    [],
  );

  async function handleInitialize() {
    try {
      await initializeAccounting(accessToken!);
      toast.success("Accounting initialized");
      await queryClient.invalidateQueries({ queryKey: ["accounting", "chart-of-accounts"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to initialize");
    }
  }

  async function handleCreate(values: ChartOfAccountRequest) {
    setServerError(null);
    try {
      await createChartOfAccount(accessToken!, values);
      toast.success("Account created");
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["accounting", "chart-of-accounts"] });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create account");
    }
  }

  if (accountsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <AccountingNav />

      <PageHeader
        breadcrumbs={[{ label: "Accounting" }, { label: "Chart of accounts" }]}
        title="Chart of accounts"
        action={
          <div className="flex gap-2">
            <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
              <Button variant="outline" onClick={handleInitialize}>
                Initialize defaults
              </Button>
            </PermissionGate>
            <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT"]}>
              <Button onClick={() => setCreateOpen(true)}>Add account</Button>
            </PermissionGate>
          </div>
        }
      />

      {accountsQuery.isError && <ErrorAlert message="Unable to load chart of accounts." />}

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by code or name..."
        onReset={() => setSearch("")}
      />

      <DataTable columns={columns} data={filtered} globalFilter={search} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New account</DialogTitle>
          </DialogHeader>
          <ChartOfAccountForm
            serverError={serverError}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
