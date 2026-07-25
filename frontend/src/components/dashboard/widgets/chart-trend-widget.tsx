"use client";

import dynamic from "next/dynamic";

import { useTrendAnalysis } from "@/hooks/use-analytics";
import { toNumber } from "@/lib/utils/format";

import { resolveWidgetStatus } from "../utils/resolve-widget-status";
import { WidgetContainer } from "./widget-container";

const TrendChart = dynamic(
  () => import("@/components/charts/trend-chart").then((mod) => mod.TrendChart),
  { ssr: false },
);

interface ChartTrendWidgetProps {
  id: string;
  title: string;
  series: "donation" | "expense";
}

export function ChartTrendWidget({ id, title, series }: ChartTrendWidgetProps) {
  const query = useTrendAnalysis();
  const status = resolveWidgetStatus({
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    isEmpty: (data) => {
      const points = series === "donation" ? data.donationTrend : data.expenseTrend;
      return points.length < 2;
    },
  });

  if (status !== "success") {
    return (
      <WidgetContainer
        id={id}
        title={title}
        variant="chart"
        status={status}
        emptyMessage="Not enough data to display a trend."
        errorMessage={`Unable to load ${title.toLowerCase()}.`}
        onRefresh={() => query.refetch()}
      >
        {null}
      </WidgetContainer>
    );
  }

  const trendData = query.data![series === "donation" ? "donationTrend" : "expenseTrend"].map((point) => ({
    label: point.period,
    value: toNumber(point.amount),
  }));

  return <TrendChart title={title} data={trendData} />;
}
