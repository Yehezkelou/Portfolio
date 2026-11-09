import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { identity } from "@/lib/content";

export const metadata: Metadata = {
  title: `Contact — ${identity.fullName}`,
  description: "Canaux directs, coordonnées et téléchargement du CV.",
};

export default function ContactPage() {
  return (
    <main id="main" className="page-shell">
      <Contact headingTag="h1" />
    </main>
  );
}
