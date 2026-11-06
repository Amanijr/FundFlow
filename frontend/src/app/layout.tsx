import type { Metadata } from "next";
import { connection } from "next/server";

import { AppProviders } from "@/components/providers/app-providers";
import { ThemeScript } from "@/components/providers/theme-script";

import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FundFlow ERP",
    template: "%s · FundFlow ERP",
  },
  description: "Fundraising and finance management for nonprofit organizations",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const mockApi =
    process.env.MOCK_API === "true" || process.env.NEXT_PUBLIC_MOCK_API === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen antialiased bg-background text-foreground">
        {/*
          THESIS: Flat light fintech ERP — precise bordered work surfaces, not graphite chrome.
          OWN-WORLD: Gray canvas · white sidebar · navy type · solid cyan CTAs · muted emerald/crimson status.
          STORY: Staff scan money and status fast; primary actions read as cyan; structure comes from borders.
          FIRST VIEWPORT: White left nav + gray canvas + bordered white bento cards; cyan primary buttons.
          FORM: User-pinned light fintech SaaS · seed key n/a (brief-locked).
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        <AppProviders mockApi={mockApi}>{children}</AppProviders>
      </body>
    </html>
  );
}
