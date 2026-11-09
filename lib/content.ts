export type TechKey =
  | "javascript"
  | "typescript"
  | "react"
  | "nextdotjs"
  | "nodedotjs"
  | "nestjs"
  | "python"
  | "fastapi"
  | "postgresql"
  | "mongodb"
  | "redis"
  | "docker"
  | "kubernetes"
  | "amazonaws"
  | "terraform"
  | "githubactions"
  | "rabbitmq"
  | "tailwindcss"
  | "go"
  | "grafana";

export type Project = {
  slug: string;
  title: string;
  /** Le PROBLÈME résolu, en 1–2 phrases. Pas la liste des fonctionnalités. */
  problem: string;
  category: string;
  highlights: string[];
  tech: TechKey[];
  /** Fichiers dans /public/videos/ — fournis .webm ET .mp4 si possible. */
  video: { webm?: string; mp4?: string; poster: string; kind?: "illustration" | "recording" };
  repo: string | null;
  demo: string | null;
  /** Un seul projet à true : il reçoit la grande place. */
  featured?: boolean;
};

export const identity = {
  fullName: "Tokapieu Ouangui Ezéchiel",
  shortName: "Ezéchiel T.",
  status: "Master Cybersécurité & IA",
  role: "Développeur full stack",
  school: "ESATIC",
  city: "Abidjan, Côte d’Ivoire",
  availability: "Échangeons autour de votre projet",
  heroMargin: "du code à l’expérience",
};

export const hero = {
  lead: "Des idées aux applications.",
  body: "Je suis Ezéchiel, développeur full stack et étudiant en cybersécurité & intelligence artificielle à l’ESATIC. Je transforme des besoins concrets en applications utiles, avec une attention particulière à la sécurité.",
};

export const profile: string[] = [
  "Je suis Tokapieu Ouangui Ezéchiel, développeur full stack et étudiant en Master Cybersécurité et Intelligence Artificielle à l’ESATIC, en Côte d’Ivoire.",
  "Mes projets explorent des métiers différents : les procédures maritimes, la restauration et le parcours hospitalier. Je conçois leurs interfaces, leurs API et la circulation des données avec React, TypeScript, NestJS et Django.",
  "J’aime relier l’expérience utilisateur à une architecture claire : des accès adaptés à chaque rôle, des workflows compréhensibles et des services dont les responsabilités sont définies.",
];

export const projects: Project[] = [
  {
    slug: "drin",
    title: "DRIN",
    category: "Administration maritime",
    highlights: ["Dossiers d’immatriculation centralisés", "Circuit de validation administratif", "Certificats vérifiables par QR code"],
    problem: "Une application pour immatriculer les navires, suivre les validations et vérifier les certificats par QR code.",
    tech: ["react", "typescript", "python", "postgresql"],
    video: { mp4: "/videos/drin.mp4", poster: "/posters/drin.svg" },
    repo: null,
    demo: null,
    featured: true,
  },
  {
    slug: "saas",
    title: "SaaS Restauration",
    category: "Gestion de restaurant",
    highlights: ["Menu accessible par QR code", "Gestion des tables et commandes", "Espaces séparés par établissement"],
    problem: "Une plateforme qui relie menu QR, tables et commandes pour simplifier le quotidien des équipes de restauration.",
    tech: ["react", "typescript", "nodedotjs", "postgresql"],
    video: { mp4: "/videos/saas.mp4", poster: "/posters/saas.svg" },
    repo: null,
    demo: null,
  },
  {
    slug: "sih",
    title: "SIH",
    category: "Santé & parcours patient",
    highlights: ["Identité et dossiers patients", "Admissions et prise en charge aux urgences", "Services reliés par une passerelle API"],
    problem: "Un système hospitalier qui relie l’identité patient, les admissions et les urgences pour organiser la prise en charge.",
    tech: ["nestjs", "nextdotjs", "typescript", "postgresql"],
    video: { mp4: "/videos/sih.mp4", poster: "/posters/sih.svg" },
    repo: null,
    demo: null,
  },
  {
    slug: "oerp",
    title: "OERP",
    category: "Gestion des opérations",
    highlights: ["Dossiers de procédures maritimes", "Documents et échanges centralisés", "Suivi du temps par dossier"],
    problem: "Un espace partagé pour suivre les procédures maritimes, retrouver les documents et coordonner le travail des équipes.",
    tech: ["nextdotjs", "react", "python", "postgresql"],
    video: { mp4: "/videos/oerp.mp4", poster: "/posters/oerp.svg" },
    repo: null,
    demo: null,
  },
];

export type Certification = {
  status?: "earned" | "in-progress";
  title: string;
  issuer: string;
  date: string;
  url: string | null;
};

// Aucun justificatif de certification fourni : ne pas inventer de titres.
export const certifications: Certification[] = [];

export const contact = {
  email: "toka.yehzdev@gmail.com",
  github: null,
  linkedin: null,
  cv: "/cv/CV.TOKAPIEU.OUANGUI.EZECHIEL.SIGL3_25_26.pdf",
};

export const nav = [
  { id: "profil", label: "À propos", href: "/profil", short: "Profil" },
  { id: "projets", label: "Projets", href: "/projets", short: "Projets" },
  { id: "certifications", label: "Parcours", href: "/certifications", short: "Parcours" },
  { id: "contact", label: "Contact", href: "/contact", short: "Contact" },
] as const;

export const meta = {
  title: "Ezéchiel Tokapieu — Développeur full stack",
  description: "Portfolio de Tokapieu Ouangui Ezéchiel, développeur full stack et étudiant à l’ESATIC en cybersécurité et intelligence artificielle. Découvrez DRIN, SaaS Restauration, SIH et OERP.",
  ogImage: "/og.svg",
  locale: "fr_FR",
};
