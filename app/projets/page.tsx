import type { Metadata } from "next";
import { Projects } from "@/components/Projects";
import { identity } from "@/lib/content";

export const metadata: Metadata = {
  title: `Projets — ${identity.fullName}`,
  description: "Systèmes distribués, back-ends cloud et architectures résilientes.",
};

export default function ProjetsPage() {
  return (
    <main id="main" className="page-shell">
      <Projects headingTag="h1" />
    </main>
  );
}
