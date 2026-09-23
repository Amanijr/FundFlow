"use client";

import { useQuery } from "@tanstack/react-query";

import { ExportActions } from "@/components/reports/export-actions";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportsNav } from "@/components/reports/reports-nav";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { getMembershipReport } from "@/lib/api/church";

export default function MembershipReportPage() {
  const { accessToken } = useAuth();

  const reportQuery = useQuery({
    queryKey: ["church", "reports", "membership"],
    queryFn: async () => (await getMembershipReport(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  if (reportQuery.isLoading) return <LoadingState />;
  if (reportQuery.isError || !reportQuery.data) {
    return <ErrorAlert message="Unable to load the membership report." />;
  }

  const report = reportQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Giving, members, attendance, and funds." />
      <ReportsNav />
      <PageHeader
        title="Members"
        description="Counts from the same member records used for giving."
        action={
          <ExportActions
            filename="membership-report"
            headers={["Status", "Count"]}
            rows={[
              ["Total", report.total],
              ["Active", report.active],
              ["Inactive", report.inactive],
              ["Visitors", report.visitors],
            ]}
          />
        }
      />
      <ReportSummary
        metrics={[
          { label: "Total", value: String(report.total) },
          { label: "Active", value: String(report.active) },
          { label: "Inactive", value: String(report.inactive) },
          { label: "Visitors", value: String(report.visitors) },
        ]}
      />
    </div>
  );
}
