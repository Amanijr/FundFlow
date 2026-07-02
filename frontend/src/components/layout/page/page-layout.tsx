import { ContentContainer } from "./content-container";
import { PageHeader } from "./page-header";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page wrapper inside AppShell — use for feature pages that need only content spacing.
 * For titled pages, compose PageHeader inside children or use PageHeader directly.
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return <ContentContainer className={className}>{children}</ContentContainer>;
}

export { PageHeader };
