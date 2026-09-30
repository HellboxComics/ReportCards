import type { Metadata, Viewport } from "next";
import { fontVars } from "./fonts";
import { siteOrigin } from "./site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await siteOrigin()),
    title: "Report Cards — your wallet got graded",
    description:
      "Paste a Robinhood Chain wallet. Get the report card your parents never saw. Show me your grades.",
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#060708",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
