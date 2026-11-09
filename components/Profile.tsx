"use client";

import { useState } from "react";
import { contact, identity, profile } from "@/lib/content";
import { TechRow } from "./TechIcons";

const perspectives = [
  { label: "Mon parcours", title: "Le développement, avec une lecture sécurité.", body: profile[0], note: "ESATIC · Abidjan, Côte d’Ivoire" },
  { label: "Ma façon de faire", title: "Comprendre le métier avant de dessiner le système.", body: profile[2], note: "Besoins → interface → API → données" },
  { label: "Ce que je construis", title: "Des applications ancrées dans le quotidien.", body: profile[1], note: "Maritime · Restauration · Santé" },
];

export function Profile() {
  const [active, setActive] = useState(0);
  const perspective = perspectives[active];
  return (
    <section id="profil" className="shell editorial" aria-labelledby="profil-title">
      <p className="margin-label">À propos</p>
      <div>
        <h2 id="profil-title" className="h2">Derrière le code,<br />Ezéchiel.</h2>
        <div className="profile-workspace">
          <div className="profile-id">
            <div className="profile-avatar" aria-hidden="true"><span>E.</span><span className="profile-orbit">&lt;/&gt;</span></div>
            <p className="profile-id-name">{identity.fullName}</p>
            <p>{identity.role}</p>
            <span className="profile-location">{identity.city}</span>
            <a className="profile-cv" href={contact.cv} download>Découvrir mon CV <span aria-hidden="true">↓</span></a>
          </div>
          <div className="profile-explorer">
            <div className="profile-switch" role="group" aria-label="Explorer mon profil">
              {perspectives.map((item, index) => <button key={item.label} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>{item.label}</button>)}
            </div>
            <div className="profile-perspective" key={active}>
              <h3>{perspective.title}</h3>
              <p>{perspective.body}</p>
              <p className="profile-note">{perspective.note}</p>
            </div>
            <TechRow keys={["typescript", "react", "nestjs", "python", "postgresql"]} />
          </div>
        </div>
      </div>
    </section>
  );
}
