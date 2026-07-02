import { format } from "date-fns";

import type { AuditRecord } from "@/types/workflow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditTrailProps {
  records: AuditRecord[];
}

export function AuditTrail({ records }: AuditTrailProps) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No audit history
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{format(new Date(record.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                <TableCell>{record.user}</TableCell>
                <TableCell>{record.action}</TableCell>
                <TableCell className="text-muted-foreground">{record.details ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
