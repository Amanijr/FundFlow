"use client";

import { SectionHeader } from "@/components/layout/section-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTrendAnalysis } from "@/hooks/use-analytics";
import { formatCurrency, toNumber } from "@/lib/utils/format";

import { resolveWidgetStatus } from "../utils/resolve-widget-status";
import { WidgetContainer } from "./widget-container";

export function CampaignPerformanceWidget() {
  const query = useTrendAnalysis();
  const status = resolveWidgetStatus({
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    isEmpty: (data) => data.campaignPerformance.length === 0,
  });

  if (status === "empty") return null;

  if (status !== "success") {
    return (
      <WidgetContainer
        id="campaign-performance"
        title="Campaign performance"
        status={status}
        errorMessage="Unable to load campaign performance."
        onRefresh={() => query.refetch()}
      >
        {null}
      </WidgetContainer>
    );
  }

  return (
    <section className="space-y-2">
      <SectionHeader title="Campaign performance" description="Progress toward goals" />
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Campaign</TableHead>
              <TableHead>Raised</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data!.campaignPerformance.map((campaign) => (
              <TableRow key={campaign.campaignId}>
                <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                <TableCell className="tabular-nums">
                  {formatCurrency(toNumber(campaign.raisedAmount))}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {formatCurrency(toNumber(campaign.goalAmount))}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-primary">
                  {toNumber(campaign.percentOfGoal).toFixed(0)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
