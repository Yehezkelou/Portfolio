import Link from "next/link";
import { contact, identity } from "@/lib/content";

export function Hero() {
  return (
    <header className="portfolio-hero shell">
      <div className="hero-topline">
        <span>Développement & conception</span>
        <span>Une sélection de projets · 2026</span>
      </div>
      <h1 className="portfolio-word">Portfolio<span>®</span></h1>
      <div className="hero-stage">
        <div className="hero-caption">
          <span className="hero-caption-star" aria-hidden="true">✳</span>
          <p>Des idées claires.<br />Des produits concrets.</p>
        </div>
        <Link href="/projets" className="hero-folder" aria-label="Ouvrir le dossier des projets">
          <span className="hero-folder-tab">PROJETS SÉLECTIONNÉS <span aria-hidden="true">↗</span></span>
          <span className="hero-folder-inner" aria-hidden="true"><span>Concevoir.<br />Développer.<br />Livrer.</span></span>
          <span className="hero-folder-front">
            <span className="hero-folder-mark" aria-hidden="true">&lt;/&gt;</span>
            <span className="hero-folder-label">Un aperçu de mon travail<span aria-hidden="true">↗</span></span>
          </span>
        </Link>
        <div className="hero-note">
          <span>Dans ma boîte à outils <span aria-hidden="true">✓</span></span>
          <p>↳ Applications web</p><p>↳ API & données</p><p>↳ Interfaces & expériences</p>
        </div>
        <div className="hero-name"><p>{identity.fullName}</p><span>Développeur full stack</span></div>
        <a className="hero-cv-sticker" href={contact.cv} download>
          <span>Le parcours derrière les projets</span>
          <strong>Télécharger mon CV <span aria-hidden="true">↓</span></strong>
        </a>
      </div>
      <div className="hero-bottomline"><span>Du premier schéma à l’interface.</span><a href="#profil">Un peu plus sur moi <span aria-hidden="true">↓</span></a></div>
    </header>
  );
}
