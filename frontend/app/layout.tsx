import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SITE } from "@/constants/site";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — AI-Powered Resume Screener & Job Portal`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "A job portal that connects candidates with recruiters and uses AI-assisted resume screening to surface the best-matched applicants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
