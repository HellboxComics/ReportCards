import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Report Cards",
  description: "Your wallet gets a report card. Show me your grades.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=VT323&family=Special+Elite&family=Nanum+Pen+Script&family=Permanent+Marker&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
