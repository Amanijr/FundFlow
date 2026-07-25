"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { SwitchField } from "@/components/forms/fields/switch-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCategoryLabel } from "@/lib/notification-categories";
import type { DeliveryChannel, NotificationPreferences } from "@/types/notification";

const preferencesSchema = z.object({
  globalEnabled: z.boolean(),
  categories: z.array(
    z.object({
      category: z.string(),
      enabled: z.boolean(),
      email: z.boolean(),
    }),
  ),
  digestEnabled: z.boolean(),
  digestFrequency: z.enum(["daily", "weekly"]),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

interface NotificationPreferencesFormProps {
  preferences: NotificationPreferences;
  onSubmit: (values: Partial<NotificationPreferences>) => Promise<void>;
  isSubmitting?: boolean;
}

export function NotificationPreferencesForm({
  preferences,
  onSubmit,
  isSubmitting,
}: NotificationPreferencesFormProps) {
  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      globalEnabled: preferences.globalEnabled,
      categories: preferences.categories.map((item) => ({
        category: item.category,
        enabled: item.enabled,
        email: item.channels.includes("email"),
      })),
      digestEnabled: preferences.digest.enabled,
      digestFrequency: preferences.digest.frequency,
    },
  });

  useEffect(() => {
    form.reset({
      globalEnabled: preferences.globalEnabled,
      categories: preferences.categories.map((item) => ({
        category: item.category,
        enabled: item.enabled,
        email: item.channels.includes("email"),
      })),
      digestEnabled: preferences.digest.enabled,
      digestFrequency: preferences.digest.frequency,
    });
  }, [preferences, form]);

  async function handleSubmit(values: PreferencesFormValues) {
    await onSubmit({
      globalEnabled: values.globalEnabled,
      digest: {
        ...preferences.digest,
        enabled: values.digestEnabled,
        frequency: values.digestFrequency,
      },
      categories: values.categories.map((item) => ({
        category: item.category as NotificationPreferences["categories"][number]["category"],
        enabled: item.enabled,
        channels: [
          "in_app" as DeliveryChannel,
          ...(item.email ? (["email"] as DeliveryChannel[]) : []),
        ],
        minSeverity: preferences.categories.find((c) => c.category === item.category)?.minSeverity,
      })),
    });
  }

  const categories = form.watch("categories");

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <SwitchField
        control={form.control}
        name="globalEnabled"
        label="Notifications"
        switchLabel="Enable in-app notifications"
      />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Categories</Label>
        <div className="divide-y divide-border rounded-lg border border-border">
          {categories.map((item, index) => (
            <div
              key={item.category}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {getCategoryLabel(item.category as NotificationPreferences["categories"][number]["category"])}
                </p>
                <p className="text-xs text-muted-foreground">In-app and email delivery</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`cat-${item.category}`}
                    checked={item.enabled}
                    onCheckedChange={(checked) =>
                      form.setValue(`categories.${index}.enabled`, checked)
                    }
                  />
                  <Label htmlFor={`cat-${item.category}`} className="text-xs font-normal">
                    In-app
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`email-${item.category}`}
                    checked={item.email}
                    onCheckedChange={(checked) =>
                      form.setValue(`categories.${index}.email`, checked)
                    }
                    disabled={!item.enabled}
                  />
                  <Label htmlFor={`email-${item.category}`} className="text-xs font-normal">
                    Email
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <SwitchField
          control={form.control}
          name="digestEnabled"
          label="Email digest"
          switchLabel="Send a summary email"
          description="Bundles non-urgent notifications into a daily or weekly digest."
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
