"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminAccess from "./admin-access";
import FloatingTools from "./floating-tools";
import LiveChat from "./live-chat";
import SiteHeader from "./site-header";
import VisitTracker from "./visit-tracker";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatEmbed = pathname === "/chat-embed";
  useEffect(() => {
    if (!isChatEmbed) return;
    const oldBody = document.body.style.background;
    const oldDocument = document.documentElement.style.background;
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
    return () => { document.body.style.background = oldBody; document.documentElement.style.background = oldDocument; };
  }, [isChatEmbed]);
  if (isChatEmbed) return <><VisitTracker /><LiveChat embedded /></>;
  return <><AdminAccess /><VisitTracker /><SiteHeader />{children}<FloatingTools /><LiveChat /></>;
}
