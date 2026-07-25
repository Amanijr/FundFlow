import type { CommandAction } from "@/components/navigation/command-palette";

export const defaultCommandActions: CommandAction[] = [
  { id: "home", label: "Go to Home", group: "Navigation", href: "/" },
  { id: "components", label: "Component library", group: "Navigation", href: "/dev/components" },
  { id: "ref-list", label: "Reference list page", group: "Navigation", href: "/dev/reference-list" },
  { id: "ref-form", label: "Reference form page", group: "Navigation", href: "/dev/reference-form" },
];

export interface SampleDonor {
  id: string;
  name: string;
  email: string;
  totalGiven: number;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "COMPLETED";
  lastGift: string;
}

export const sampleDonors: SampleDonor[] = [
  { id: "1", name: "Jane Donor", email: "jane@example.org", totalGiven: 12500, status: "APPROVED", lastGift: "2026-06-20" },
  { id: "2", name: "John Smith", email: "john@example.org", totalGiven: 4200, status: "COMPLETED", lastGift: "2026-06-18" },
  { id: "3", name: "Hope Foundation Board", email: "board@hope.org", totalGiven: 50000, status: "APPROVED", lastGift: "2026-06-15" },
  { id: "4", name: "Maria Garcia", email: "maria@example.org", totalGiven: 850, status: "PENDING_REVIEW", lastGift: "2026-06-10" },
  { id: "5", name: "Anonymous", email: "anonymous@example.org", totalGiven: 250, status: "DRAFT", lastGift: "2026-06-01" },
];

export const sampleActivity = [
  { id: "a1", title: "Donation recorded", description: "$1,500 card payment", timestamp: "2026-06-24T10:00:00Z", actor: "Jane Admin" },
  { id: "a2", title: "Receipt emailed", description: "RCP-1042 sent to donor", timestamp: "2026-06-24T10:01:00Z", actor: "System" },
  { id: "a3", title: "Posted to ledger", description: "Journal entry JE-220", timestamp: "2026-06-24T10:02:00Z", actor: "System" },
];

export const sampleAudit = [
  { id: "r1", user: "Jane Admin", action: "CREATE", timestamp: "2026-06-24T10:00:00Z", details: "Donation #1042" },
  { id: "r2", user: "System", action: "POST", timestamp: "2026-06-24T10:02:00Z", details: "Journal entry JE-220" },
];

export const sampleTrend = [
  { label: "Jan", value: 12000 },
  { label: "Feb", value: 15000 },
  { label: "Mar", value: 13800 },
  { label: "Apr", value: 17200 },
  { label: "May", value: 16500 },
  { label: "Jun", value: 19000 },
];
