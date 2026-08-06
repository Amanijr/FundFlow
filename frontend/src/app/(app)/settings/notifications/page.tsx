"use client";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notification-preferences";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";

export default function NotificationSettingsPage() {
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const simpleMode = useSessionPreferencesStore((state) => state.simpleMode);
  const setSimpleMode = useSessionPreferencesStore((state) => state.setSimpleMode);

  if (preferencesQuery.isLoading) return <LoadingState />;
  if (preferencesQuery.isError || !preferencesQuery.data) {
    return <ErrorAlert message="Unable to load notification preferences." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Preferences"
        description="Display options and how you receive updates."
      />

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-1">
            <Label htmlFor="prefs-simple-mode" className="text-sm font-medium">
              Simple mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Keep the sidebar and header focused on day-to-day work. Turn off for full ERP menus.
            </p>
          </div>
          <Switch
            id="prefs-simple-mode"
            checked={simpleMode}
            onCheckedChange={setSimpleMode}
            aria-label="Toggle simple mode"
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <NotificationPreferencesForm
          preferences={preferencesQuery.data}
          isSubmitting={updatePreferences.isPending}
          onSubmit={async (values) => {
            await updatePreferences.mutateAsync(values);
          }}
        />
      </div>
    </div>
  );
}
