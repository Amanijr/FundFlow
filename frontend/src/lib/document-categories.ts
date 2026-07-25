import type { DocumentCategory } from "@/types/document";

export const DOCUMENT_CATEGORIES: {
  value: DocumentCategory;
  label: string;
  group: string;
}[] = [
  { value: "receipt", label: "Receipt", group: "Financial" },
  { value: "invoice", label: "Invoice", group: "Financial" },
  { value: "voucher", label: "Voucher", group: "Financial" },
  { value: "bank_slip", label: "Bank slip", group: "Financial" },
  { value: "journal_attachment", label: "Journal attachment", group: "Financial" },
  { value: "contract", label: "Contract", group: "Operations" },
  { value: "proposal", label: "Proposal", group: "Operations" },
  { value: "quotation", label: "Quotation", group: "Operations" },
  { value: "purchase_order", label: "Purchase order", group: "Operations" },
  { value: "grant_agreement", label: "Grant agreement", group: "Projects" },
  { value: "project_plan", label: "Project plan", group: "Projects" },
  { value: "budget", label: "Budget", group: "Projects" },
  { value: "supporting_evidence", label: "Supporting evidence", group: "Projects" },
  { value: "user_document", label: "User document", group: "Administration" },
  { value: "organization_logo", label: "Organization logo", group: "Administration" },
  { value: "policy", label: "Policy", group: "Administration" },
  { value: "other", label: "Other", group: "General" },
];

export function getDocumentCategoryLabel(category: DocumentCategory): string {
  return DOCUMENT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
