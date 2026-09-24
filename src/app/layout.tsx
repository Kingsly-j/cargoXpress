/* eslint-disable @next/next/no-css-tags, @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./language-provider";
import SiteShell from "./site-shell";
import "./revolve.css";

export const metadata: Metadata = {
  title: "Cargo Xpress | Worldwide Shipping & Tracking",
  description: "Worldwide air, sea and road freight with real-time tracking from Cargo Xpress.",
  openGraph: {
    type: "website",
    siteName: "Cargo Xpress",
    title: "Cargo Xpress | Global Logistics & Tracking",
    description: "Reliable worldwide air, sea, and road freight with live shipment tracking.",
    images: [{ url: "https://raw.githubusercontent.com/Kingsly-j/cargoXpress/main/public/cargoxpress-social.png", width: 1200, height: 630, alt: "Cargo Xpress global logistics — air, sea, and road shipping" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cargo Xpress | Global Logistics & Tracking",
    description: "Reliable worldwide air, sea, and road freight with live shipment tracking.",
    images: ["https://raw.githubusercontent.com/Kingsly-j/cargoXpress/main/public/cargoxpress-social.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/cargoxpress-mark.png" />
        <link rel="apple-touch-icon" href="/cargoxpress-mark.png" />
        <link rel="stylesheet" href="/assets/css/font-awesome-all.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&display=swap" />
      </head>
      <body><LanguageProvider><SiteShell>{children}</SiteShell></LanguageProvider></body>
    </html>
  );
}
