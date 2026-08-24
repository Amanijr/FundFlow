import type { Metadata } from "next";
import { connection } from "next/server";

import { AppProviders } from "@/components/providers/app-providers";

import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-600.css";
import "@fontsource/roboto/latin-700.css";
import "@fontsource/lato/latin-400.css";
import "@fontsource/lato/latin-700.css";
import "@fontsource/lato/latin-900.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
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
      <body className="min-h-screen antialiased">
        <AppProviders mockApi={mockApi}>{children}</AppProviders>
      </body>
    </html>
  );
}
