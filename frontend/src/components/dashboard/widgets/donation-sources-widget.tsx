"use client";

import { MetricCard } from "@/components/charts/metric-card";
import { SectionHeader } from "@/components/layout/section-header";
import { useTrendAnalysis } from "@/hooks/use-analytics";
import { formatCurrency, toNumber } from "@/lib/utils/format";

import { resolveWidgetStatus } from "../utils/resolve-widget-status";
import { WidgetContainer } from "./widget-container";

export function DonationSourcesWidget() {
  const query = useTrendAnalysis();
  const status = resolveWidgetStatus({
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    isEmpty: (data) => data.donationSources.length === 0,
  });

  if (status === "empty") return null;

  if (status !== "success") {
    return (
      <WidgetContainer
        id="donation-sources"
        title="Donation sources"
        status={status}
        errorMessage="Unable to load donation sources."
        onRefresh={() => query.refetch()}
      >
        {null}
      </WidgetContainer>
    );
  }

  return (
    <section className="space-y-2">
      <SectionHeader title="Donation sources" description="Breakdown by channel" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {query.data!.donationSources.map((source) => (
          <MetricCard
            key={source.source}
            label={source.source.replaceAll("_", " ")}
            value={formatCurrency(toNumber(source.amount))}
          />
        ))}
      </div>
    </section>
  );
}
