/* eslint-disable @next/next/no-css-tags, @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import AdminAccess from "./admin-access";
import { LanguageProvider } from "./language-provider";
import FloatingTools from "./floating-tools";
import LiveChat from "./live-chat";
import SiteHeader from "./site-header";
import VisitTracker from "./visit-tracker";
import "./revolve.css";

export const metadata: Metadata = {
  title: "Cargo Xpress | Worldwide Shipping & Tracking",
  description: "Worldwide air, sea and road freight with real-time tracking from Cargo Xpress.",
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
      <body><LanguageProvider><AdminAccess /><VisitTracker /><SiteHeader />{children}<FloatingTools /><LiveChat /></LanguageProvider></body>
    </html>
  );
}
