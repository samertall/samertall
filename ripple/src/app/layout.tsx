import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Shell } from "@/components/shell";
import { siteUrl } from "@/lib/format";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: "Ripple",
    template: "%s · Ripple",
  },
  description: "Pass it before it cools. A live board for lines that catch.",
  applicationName: "Ripple",
  openGraph: {
    title: "Ripple",
    description: "Pass it before it cools. A live board for lines that catch.",
    siteName: "Ripple",
    type: "website",
    url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ripple",
    description: "Pass it before it cools. A live board for lines that catch.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
