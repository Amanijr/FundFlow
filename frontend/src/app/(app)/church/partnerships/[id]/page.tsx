"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ChurchNav } from "@/components/church/church-nav";
import { PartnershipForm } from "@/components/church/partnership-form";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getPartnership, updatePartnership } from "@/lib/api/church";
import { listPeople } from "@/lib/api/donors";
import { listFunds } from "@/lib/api/funds";
import { formatDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/format";
import { ApiError } from "@/types/api";
import type { PartnershipMonthStatus, PartnershipRequest } from "@/types/verticals";

function monthLabel(status: PartnershipMonthStatus) {
  if (status === "PAID") return "Paid";
  if (status === "AHEAD") return "Ahead";
  if (status === "PARTIAL") return "Partial";
  if (status === "MISSING") return "Missing";
  return "—";
}

export default function PartnershipDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const partnershipId = Number(params.id);
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const partnershipQuery = useQuery({
    queryKey: ["church", "partnerships", partnershipId],
    queryFn: async () => (await getPartnership(accessToken!, partnershipId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(partnershipId),
  });

  const membersQuery = useQuery({
    queryKey: ["people", "members"],
    queryFn: async () => (await listPeople(accessToken!, "members")).data,
    enabled: Boolean(accessToken) && editing,
  });

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken) && editing,
  });

  const memberOptions = useMemo(
    () =>
      (membersQuery.data ?? []).map((member) => ({
        id: String(member.id),
        label: `${member.firstName} ${member.lastName}${member.memberNumber ? ` (${member.memberNumber})` : ""}`,
      })),
    [membersQuery.data],
  );

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((fund) => ({ id: String(fund.id), label: fund.name })),
    [fundsQuery.data],
  );

  async function handleSubmit(values: PartnershipRequest) {
    setServerError(null);
    try {
      await updatePartnership(accessToken!, partnershipId, values);
      toast.success("Partnership updated");
      setEditing(false);
      await partnershipQuery.refetch();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update partnership");
    }
  }

  if (partnershipQuery.isLoading) return <LoadingState />;
  if (partnershipQuery.isError || !partnershipQuery.data) {
    return <ErrorAlert message="Unable to load partnership." />;
  }

  const partnership = partnershipQuery.data;
  const monthPercent =
    partnership.thisMonthExpected > 0
      ? Math.min(100, (partnership.thisMonthReceived / partnership.thisMonthExpected) * 100)
      : 0;
  const yearPercent =
    partnership.thisYearExpected > 0
      ? Math.min(100, (partnership.thisYearReceived / partnership.thisYearExpected) * 100)
      : 0;

  if (editing) {
    return (
      <div className="space-y-4">
        <ChurchNav />
        <PageHeader
          breadcrumbs={[
            { label: "Church", href: "/church" },
            { label: "Partnerships", href: "/church/partnerships" },
            { label: partnership.memberName, href: `/church/partnerships/${partnership.id}` },
            { label: "Edit" },
          ]}
          title="Edit partnership"
        />
        <PartnershipForm
          memberOptions={
            memberOptions.length
              ? memberOptions
              : [{ id: String(partnership.memberId), label: partnership.memberName }]
          }
          fundOptions={fundOptions}
          lockMember
          defaultValues={{
            memberId: String(partnership.memberId),
            fundId: partnership.fundId ? String(partnership.fundId) : "",
            monthlyAmount: partnership.monthlyAmount,
            startDate: partnership.startDate.slice(0, 10),
            endDate: partnership.endDate?.slice(0, 10) ?? "",
            status: partnership.status,
            notes: partnership.notes ?? "",
          }}
          submitLabel="Save changes"
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church" },
          { label: "Partnerships", href: "/church/partnerships" },
          { label: partnership.memberName },
        ]}
        title={partnership.memberName}
        description={
          partnership.memberNumber
            ? `${partnership.memberNumber} · ${formatCurrency(partnership.monthlyAmount)} each month`
            : `${formatCurrency(partnership.monthlyAmount)} each month`
        }
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link
                href={`/donations/new?donorId=${partnership.memberId}&partnershipId=${partnership.id}`}
              >
                Record gift
              </Link>
            </Button>
            <PermissionGate roles={["ORG_ADMIN", "STAFF", "FUNDRAISING_MANAGER"]}>
              <Button onClick={() => setEditing(true)}>Edit</Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard
          title="This month"
          fields={[
            { label: "Received", value: formatCurrency(partnership.thisMonthReceived) },
            { label: "Promised", value: formatCurrency(partnership.thisMonthExpected) },
            { label: "Status", value: monthLabel(partnership.thisMonthStatus) },
          ]}
        />
        <DetailCard
          title="This year"
          fields={[
            { label: "Received", value: formatCurrency(partnership.thisYearReceived) },
            { label: "Promised so far", value: formatCurrency(partnership.thisYearExpected) },
            { label: "Fund", value: partnership.fundName ?? "Any fund" },
          ]}
        />
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-medium">This month</p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${monthPercent}%` }} />
        </div>
        <p className="text-sm font-medium">This year</p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${yearPercent}%` }} />
        </div>
      </div>

      <DetailCard
        title="Terms"
        fields={[
          { label: "Status", value: partnership.status },
          { label: "Started", value: formatDate(partnership.startDate) },
          { label: "Ends", value: partnership.endDate ? formatDate(partnership.endDate) : "Open" },
          { label: "Notes", value: partnership.notes || "—" },
        ]}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Months</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Month</th>
                <th className="px-3 py-2 font-medium">Received</th>
                <th className="px-3 py-2 font-medium">Promised</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(partnership.months ?? []).map((row) => (
                <tr key={row.yearMonth} className="border-t border-border">
                  <td className="px-3 py-2">{row.yearMonth}</td>
                  <td className="px-3 py-2">{formatCurrency(row.received)}</td>
                  <td className="px-3 py-2">{formatCurrency(row.expected)}</td>
                  <td className="px-3 py-2">
                    <Badge variant={row.status === "PAID" || row.status === "AHEAD" ? "success" : "secondary"}>
                      {monthLabel(row.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
