"use client";

import { useState } from "react";
import { certifications, contact } from "@/lib/content";

const studies = [
  ["Master 1 · Cybersécurité & Intelligence artificielle", "ESATIC", "2026–2027"],
  ["Licence 2 & 3 · Génie logiciel", "ESATIC", "2024–2026"],
  ["Licence 1 · Réseaux & informatique", "ESATIC", "2023–2024"],
  ["Baccalauréat D", "Lycée municipal d’Issia", "2022–2023"],
];
const filters = [{ id: "all", label: "Toutes" }, { id: "earned", label: "Obtenues" }, { id: "in-progress", label: "En cours" }] as const;

export function Certifications({ headingTag: Heading = "h1" }: { headingTag?: "h1" | "h2" } = {}) {
  const [view, setView] = useState<"studies" | "certifications">("studies");
  const [filter, setFilter] = useState<"all" | "earned" | "in-progress">("all");
  const visible = certifications.filter((item) => filter === "all" || (item.status ?? "earned") === filter);
  return (
    <section id="certifications" className="shell editorial" aria-labelledby="certifs-title">
      <p className="margin-label">Parcours</p>
      <div>
        <Heading id="certifs-title" className="h2">Apprendre.<br />Construire. Évoluer.</Heading>
        <div className="learning-switch" role="group" aria-label="Explorer le parcours">
          <button type="button" onClick={() => setView("studies")} aria-pressed={view === "studies"}>Formations <span>{studies.length}</span></button>
          <button type="button" onClick={() => setView("certifications")} aria-pressed={view === "certifications"}>Certifications <span>{certifications.length}</span></button>
        </div>
        <div className="learning-content" key={view}>
          {view === "studies" ? <div className="study-timeline">{studies.map(([title, school, date], index) => <article className="study-item" key={title}>
            <span className="study-dot" aria-hidden="true" />
            <p className="study-date">{date}{index === 0 && <span className="learning-status">En cours</span>}</p>
            <h3>{title}</h3><p className="study-school">{school}</p>
          </article>)}</div> : <>
            {certifications.length > 0 && <div className="learning-filters" role="group" aria-label="Filtrer les certifications">{filters.map((item) => <button type="button" key={item.id} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id}>{item.label}</button>)}</div>}
            <div className="certificate-grid">
              {visible.map((cert) => <article className="certificate-card" key={`${cert.title}-${cert.issuer}`}>
                <span className="certificate-seal" aria-hidden="true">✳</span>
                <span className="learning-status">{cert.status === "in-progress" ? "En cours" : "Obtenue"}</span>
                <h3>{cert.title}</h3><p>{cert.issuer}</p><p className="study-date">{cert.date}</p>
                {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer">Voir le justificatif <span aria-hidden="true">↗</span></a>}
              </article>)}
              {visible.length === 0 && <div className="certificate-placeholder">
                <span className="certificate-seal" aria-hidden="true">✳</span>
                <span className="learning-status">À venir</span>
                <h3>{certifications.length ? "Aucune certification dans cette catégorie." : "La suite s’écrit ici."}</h3>
                <p>Mes prochaines certifications et leurs justificatifs trouveront leur place dans cet espace.</p>
                <a href={contact.cv} download>Explorer mon parcours actuel ↓</a>
              </div>}
            </div>
          </>}
        </div>
        <a className="learning-cv" href={contact.cv} download>Télécharger mon CV <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
