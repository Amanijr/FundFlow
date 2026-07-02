import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FeedItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  title?: string;
  items: FeedItem[];
}

export function RecentActivityFeed({ title = "Recent activity", items }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
