import { contact } from "@/lib/content";

/* Section 5 — court et fonctionnel. Liens directs, aucun champ inutile,
 *  fonctionne sans JavaScript.                                                 */
export function Contact({
  headingTag: Heading = "h1",
}: {
  headingTag?: "h1" | "h2";
} = {}) {
  const channels = [
    { label: "e-mail", value: contact.email, href: `mailto:${contact.email}` },
    { label: "github", value: "github.com", href: contact.github, external: true },
    { label: "linkedin", value: "linkedin.com", href: contact.linkedin, external: true },
    { label: "cv", value: "télécharger le CV (pdf)", href: contact.cv, download: true },
  ];

  return (
    <section id="contact" className="shell editorial" aria-labelledby="contact-title">
      <p className="margin-label">contact</p>

      <div>
        <Heading id="contact-title" className="h2">
          Parlons d&apos;un système à construire.
        </Heading>

        <nav className="contact-list" aria-label="Coordonnées">
          {channels.filter((c) => c.href).map((c) => (
            <a
              key={c.label}
              href={c.href!}
              {...(c.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              {...(c.download ? { download: true } : {})}
            >
              <span>{c.value}</span>
              <span className="channel">{c.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
