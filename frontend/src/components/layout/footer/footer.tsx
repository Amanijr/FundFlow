import packageJson from "../../../../package.json";

const environment =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_ENV ?? "production"
    : "development";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-border bg-card px-4 py-2 sm:px-5 lg:px-6">
      <div className="flex flex-col gap-1 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} FundFlow. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>v{packageJson.version}</span>
          <span aria-hidden>·</span>
          <span className="capitalize">{environment}</span>
        </p>
      </div>
    </footer>
  );
}
