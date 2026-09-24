"use client";

import { useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { db } from "@/utils/firebase/client";

const SESSION_KEY = "cargoxpress-visitor-session";

export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const timer = window.setTimeout(() => {
      let sessionId = "";
      try {
        sessionId = sessionStorage.getItem(SESSION_KEY) || crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, sessionId);
      } catch { sessionId = crypto.randomUUID(); }
      let source = "Direct";
      try {
        const referrer = document.referrer ? new URL(document.referrer).hostname : "";
        if (referrer && referrer !== location.hostname) source = referrer;
      } catch { /* A malformed referrer is treated as direct traffic. */ }
      void addDoc(collection(db, "siteVisits"), {
        sessionId,
        page: pathname.slice(0, 300),
        source: source.slice(0, 160),
        createdAt: new Date().toISOString(),
      }).catch(() => { /* Analytics must never interrupt page navigation. */ });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
