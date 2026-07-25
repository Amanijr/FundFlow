"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { NotificationCenterPanel } from "@/components/notifications/notification-center-panel";
import { Card, CardContent } from "@/components/ui/card";
import type { NotificationFilters } from "@/types/notification";

export default function NotificationsPage() {
  const [filters, setFilters] = useState<NotificationFilters>({ status: "all", size: 50 });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description="Review alerts and activity requiring your attention."
      />

      <Card>
        <CardContent className="p-0">
          <NotificationCenterPanel
            showFilters
            showSearch
            showArchiveActions
            showFooter={false}
            fullHeight
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
