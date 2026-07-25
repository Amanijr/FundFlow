"use client";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityTimeline } from "@/components/workflow/activity-timeline";
import { ActivityTimelineSkeleton } from "@/components/workflow/activity-timeline-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useActivityFeed } from "@/hooks/use-activity-feed";

export default function ActivityPage() {
  const activityQuery = useActivityFeed();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Activity"
        description="Chronological history of organization events."
      />

      <Card>
        <CardContent className="pt-6">
          {activityQuery.isLoading && <ActivityTimelineSkeleton />}
          {activityQuery.isError && (
            <ErrorAlert message="Unable to load activity feed." />
          )}
          {!activityQuery.isLoading && !activityQuery.isError && (
            <ActivityTimeline events={activityQuery.data ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
