import type { Metadata } from "next";
import { Lato, Montserrat, Roboto } from "next/font/google";
import { connection } from "next/server";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const montserrat = Montserrat({
  variable: "--font-nav",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
      <body
        className={`${roboto.variable} ${lato.variable} ${montserrat.variable} min-h-screen antialiased`}
      >
        <AppProviders mockApi={mockApi}>{children}</AppProviders>
      </body>
    </html>
  );
}
