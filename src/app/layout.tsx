import type { Metadata, Viewport } from "next";
import { fontVars } from "./fonts";
import { siteOrigin } from "./site";
import "./styles/base.css";
import "./styles/paper.css";
import "./styles/card-page.css";
import "./styles/landing.css";

const title = "Report Cards — your wallet got graded";
const description =
  "Paste a Robinhood Chain wallet. Get the report card your parents never saw. Show me your grades.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await siteOrigin()),
    title,
    description,
    openGraph: { type: "website", siteName: "Report Cards", title, description, url: "/" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#07060a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
