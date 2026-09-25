"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="revolve-header">
    <div className="revolve-top"><span>Welcome to corgoXpress</span><div className="revolve-contact"><a href="tel:+17064521895">+1 (706) 452-1895</a><a href="mailto:cargoxpress83@gmail.com">cargoxpress83@gmail.com</a><span>Mon - Fri: 09:00 - 05:00</span></div></div>
    <div className="revolve-nav">
      <Link className="revolve-logo" href="/" aria-label="corgoXpress home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/corgoxpress-logo.jpeg" alt="corgoXpress global logistics" />
      </Link>
      <button className="revolve-menu" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(!open)}><i className={`fas fa-${open ? 'times' : 'bars'}`} /></button>
      <nav aria-label="Main navigation" className={open ? 'is-open' : ''}>
        <Link href="/">Home</Link><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/contact">Contact</Link>
        {pathname.startsWith('/admin') && <Link href="/admin?admin=1" aria-current="page">Dashboard</Link>}
        <Link href="/track" className="revolve-cta">Track Shipment <span>↗</span></Link>
      </nav>
    </div>
  </header>;
}
