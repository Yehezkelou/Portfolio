"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { identity, nav } from "@/lib/content";

export function BottomBar() {
  const pathname = usePathname();
  return (
    <div className="site-nav">
      <Link href="/" className="site-brand" aria-label={`${identity.fullName} — accueil`}>
        <span className="site-brand-symbol" aria-hidden="true">e.</span>
        <span>Ézéchiel<span className="site-brand-sub">Portfolio personnel</span></span>
      </Link>
      <nav className="site-nav-links" aria-label="Navigation principale">
        {nav.filter((item) => item.id !== "contact").map((item) => {
          const active = item.href === "/profil" ? pathname === "/" || pathname === "/profil" : pathname.startsWith(item.href);
          return <Link key={item.id} href={item.href} aria-current={active ? "page" : undefined}>{item.id === "profil" ? "À propos" : item.id === "certifications" ? "Parcours" : "Projets"}</Link>;
        })}
      </nav>
      <Link href="/contact" className="site-nav-cta">Parlons de votre projet <span aria-hidden="true">↗</span></Link>
    </div>
  );
}
