import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

interface DetailCardProps {
  title: string;
  fields: DetailField[];
  className?: string;
}

export function DetailCard({ title, fields, className }: DetailCardProps) {
  return (
    <Panel className={cn(className)}>
      <PanelHeader>
        <PanelTitle>{title}</PanelTitle>
      </PanelHeader>
      <PanelContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{field.label}</dt>
              <dd className="mt-0.5 text-[13px] text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>
      </PanelContent>
    </Panel>
  );
}
