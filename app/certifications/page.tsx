import type { Metadata } from "next";
import { Certifications } from "@/components/Certifications";
import { identity } from "@/lib/content";

export const metadata: Metadata = {
  title: `Certifications — ${identity.fullName}`,
  description: "Certifications et validations techniques en cybersécurité, cloud et développement.",
};

export default function CertificationsPage() {
  return (
    <main id="main" className="page-shell">
      <Certifications headingTag="h1" />
    </main>
  );
}
