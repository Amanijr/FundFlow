"use client";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notification-preferences";

export default function NotificationSettingsPage() {
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  if (preferencesQuery.isLoading) return <LoadingState />;
  if (preferencesQuery.isError || !preferencesQuery.data) {
    return <ErrorAlert message="Unable to load notification preferences." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="Notification preferences"
        description="Choose which events you receive and how they are delivered."
      />
      <NotificationPreferencesForm
        preferences={preferencesQuery.data}
        isSubmitting={updatePreferences.isPending}
        onSubmit={async (values) => {
          await updatePreferences.mutateAsync(values);
        }}
      />
    </div>
  );
}
