import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { Suspense } from "react";
import { Header, HeaderFallback } from "@/components/shell";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: { default: "Lyceum", template: "%s · Lyceum" },
  description: "A school for product people. Read a course, sit the quiz, and keep a record of the work.",
  applicationName: "Lyceum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable}`}>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>
        <main id="content">{children}</main>
        <footer className="site-footer">Lyceum keeps the house curriculum and the courses you publish in one catalog.</footer>
      </body>
    </html>
  );
}
