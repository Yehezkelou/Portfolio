# Portfolio — Ezéchiel Tokapieu

Portfolio Next.js 15 / React 19, en français. Direction visuelle : crème, bleu électrique, dossier interactif et typographie grand format.

## Développement

```bash
npm install
npm run dev
```

## Vérification et production

```bash
npx tsc --noEmit --incremental false
npm run build
npm start
```

## Contenu

Identité, projets et coordonnées : `lib/content.ts`. CV : `public/cv/`.
Les quatre vidéos `public/videos/` sont des présentations animées illustrées, pas des enregistrements des applications. Les visuels correspondants sont dans `public/posters/`.

## Vercel

Importer ce dépôt dans Vercel et sélectionner Next.js. `vercel.json` définit la commande de compilation. Aucune variable d’environnement n’est nécessaire. La connexion au compte Vercel reste nécessaire pour publier.

## Cartes et parcours interactifs

Les résumés, catégories et fonctionnalités des projets se règlent dans `lib/content.ts` (`problem`, `category`, `highlights`, `tech`). Les présentations démarrent au survol et disposent d’un bouton lecture/pause. La préférence de réduction des animations désactive la lecture au survol.

Le bloc profil propose trois vues. L’espace Certifications affiche les éléments du tableau `certifications` de `lib/content.ts`, avec filtres de statut. Pour ajouter une formation certifiante, renseigner son titre, l’organisme, la date, le statut `earned` (obtenue) ou `in-progress` (en cours), et `url` pour le justificatif (ou `null`). Aucun titre fictif n’est affiché lorsque le tableau est vide.
