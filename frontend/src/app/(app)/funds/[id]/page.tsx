"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getFund, listFundTransfers } from "@/lib/api/funds";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/dates";
import type { FundTransferResponse } from "@/types/finance";

export default function FundDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const fundId = Number(params.id);

  const fundQuery = useQuery({
    queryKey: ["funds", fundId],
    queryFn: async () => (await getFund(accessToken!, fundId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(fundId),
  });

  const transfersQuery = useQuery({
    queryKey: ["funds", "transfers"],
    queryFn: async () => (await listFundTransfers(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const transfers = useMemo(
    () =>
      (transfersQuery.data ?? []).filter(
        (t) => t.fromFundId === fundId || t.toFundId === fundId,
      ),
    [transfersQuery.data, fundId],
  );

  const columns = useMemo<ColumnDef<FundTransferResponse>[]>(
    () => [
      {
        accessorKey: "transferredAt",
        header: "Date",
        cell: ({ row }) => formatDateTime(row.original.transferredAt),
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) =>
          row.original.fromFundId === fundId
            ? `Out → ${row.original.toFundName}`
            : `In ← ${row.original.fromFundName}`,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(toNumber(row.original.amount)),
      },
      { accessorKey: "reason", header: "Reason", cell: ({ row }) => row.original.reason ?? "—" },
    ],
    [fundId],
  );

  if (fundQuery.isLoading) return <LoadingState />;
  if (fundQuery.isError || !fundQuery.data) return <ErrorAlert message="Unable to load fund." />;

  const fund = fundQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Funds", href: "/funds" }, { label: fund.name }]}
        title={fund.name}
        description={`Code ${fund.code}`}
        action={
          <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
            <Button variant="outline" asChild>
              <Link href={`/funds/${fund.id}/edit`}>Edit</Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex gap-2">
        <Badge variant={fund.active ? "success" : "secondary"}>{fund.active ? "Active" : "Inactive"}</Badge>
        <Badge variant="outline">{formatEnumLabel(fund.type)}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard
          title="Balances"
          fields={[
            { label: "Current balance", value: formatCurrency(toNumber(fund.currentBalance)) },
            {
              label: "Opening balance",
              value: fund.openingBalance != null ? formatCurrency(toNumber(fund.openingBalance)) : "—",
            },
          ]}
        />
        <DetailCard
          title="Details"
          fields={[
            { label: "Description", value: fund.description ?? "—" },
            { label: "Created", value: formatDateTime(fund.createdAt) },
          ]}
        />
      </div>

      <section className="space-y-4">
        <SectionHeader title="Transfer history" description="Inter-fund transfers involving this fund" />
        <DataTable columns={columns} data={transfers} />
      </section>
    </div>
  );
}
