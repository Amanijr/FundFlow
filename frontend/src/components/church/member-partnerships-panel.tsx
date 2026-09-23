"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listMemberPartnerships } from "@/lib/api/church";
import { formatCurrency } from "@/lib/utils/format";
import { PermissionGate } from "@/components/security/permission-gate";

interface MemberPartnershipsPanelProps {
  memberId: number;
  accessToken: string;
}

export function MemberPartnershipsPanel({ memberId, accessToken }: MemberPartnershipsPanelProps) {
  const partnershipsQuery = useQuery({
    queryKey: ["members", memberId, "partnerships"],
    queryFn: async () => (await listMemberPartnerships(accessToken, memberId)).data,
  });

  const rows = partnershipsQuery.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Partnerships</CardTitle>
        <PermissionGate roles={["ORG_ADMIN", "STAFF", "FUNDRAISING_MANAGER"]}>
          <Button asChild size="sm">
            <Link href={`/church/partnerships/new?memberId=${memberId}`}>Add partnership</Link>
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent className="space-y-3">
        {partnershipsQuery.isError ? (
          <p className="text-sm text-muted-foreground">Unable to load partnerships.</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No monthly partnership yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0 space-y-1">
                <Link href={`/church/partnerships/${row.id}`} className="font-medium text-primary hover:underline">
                  {formatCurrency(row.monthlyAmount)} / month
                </Link>
                <p className="text-xs text-muted-foreground">
                  This month {formatCurrency(row.thisMonthReceived)} of {formatCurrency(row.thisMonthExpected)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge variant={row.thisMonthStatus === "PAID" || row.thisMonthStatus === "AHEAD" ? "success" : "secondary"}>
                  {row.thisMonthStatus}
                </Badge>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/donations/new?donorId=${memberId}&partnershipId=${row.id}`}>Record gift</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
