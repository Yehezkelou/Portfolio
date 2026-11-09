# Vraies démonstrations locales des quatre projets

**État vérifié : les scripts sont préparés, aucun nouveau compte ni enregistrement réel n’a été créé.** Le sandbox interdit les sockets locaux (`EPERM`) et l’accès au moteur Docker. Les vidéos actuellement publiées dans le portfolio restent des illustrations.

Première commande, dans un terminal local ayant accès aux projets, depuis la racine du portfolio :

```bash
python3 demo-local/prepare.py all
```

Ce script crée des copies de travail dans `demo-local/.local/work/`. Il exclut les fichiers `.env`, les bases existantes, les dumps SQL, uploads, médias et dépendances. Il ne modifie pas les projets d’origine. Les copies sont ignorées par Git ; elles peuvent néanmoins contenir des paramètres codés dans les sources d’origine et doivent rester privées.

Suivre ensuite les instructions du projet choisi :

| Projet | Guide | Base démo | Interface |
| --- | --- | --- | --- |
| DRIN | [drin/README.md](drin/README.md) | SQLite neuve | 127.0.0.1:5173 |
| SaaS restauration | [saas/README.md](saas/README.md) | PostgreSQL dédié sur 55432 | 127.0.0.1:5174 |
| SIH | [sih/README.md](sih/README.md) | Trois bases PostgreSQL dédiées sur 55433 | Auth 3000, admission 3004, administration 3005 |
| OERP | [oerp/README.md](oerp/README.md) | SQLite neuve | 127.0.0.1:3001 |

**Exécuter les projets l’un après l’autre**, car certains ports SIH et OERP se recouvrent. Les accès fictifs aléatoires sont enregistrés uniquement dans `demo-local/.local/` (fichiers privés ; emplacement exact dans chaque guide). Générer un fichier d’identifiants ne signifie pas que le compte existe : les migrations et le seed doivent terminer avec succès, puis la connexion réelle doit être testée.

## Enregistrer une vraie vidéo

Après avoir démarré un projet local et créé quelques données métier fictives, ouvrir un autre terminal :

```bash
cd demo-local
npm install
npx playwright install chromium
npm run record -- drin --seconds 30
```

Remplacer `drin` par `saas`, `sih` ou `oerp`. Le navigateur s’ouvre **sans enregistrement** pour se connecter. Après connexion, appuyer sur Entrée dans le terminal. Une seconde fenêtre authentifiée lance la capture réelle pendant 30 secondes : parcourir le tableau de bord, une liste et un détail métier. Des adresses spécifiques peuvent être passées avec `--login URL --url URL` ; seules les adresses HTTP de boucle locale sont acceptées. Les appels à des domaines externes sont bloqués.

Les captures et leur manifeste restent privées dans `.local/recordings/<projet>/<date>/` :

- `captured-pending-review` : connexion conservée, vidéo sauvegardée, à regarder avant publication.
- `failed` : erreur, redirection vers connexion, formulaire de mot de passe visible ou erreur API ; ne pas utiliser comme démonstration.

Le contexte Playwright est fermé avant de sauvegarder la vidéo, conformément à la [documentation officielle](https://playwright.dev/docs/videos). Un passage par la connexion pendant la capture invalide la session. Aucun enregistrement n’est importé automatiquement dans le portfolio. Vérifier l’absence de données personnelles, le parcours métier et la lisibilité, puis convertir si nécessaire la capture WebM avec FFmpeg :

```bash
ffmpeg -i capture.webm -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart demo.mp4
```

Après revue, une vraie capture peut être copiée vers `public/videos/real/` et son affiche vers `public/posters/`, puis référencée dans `lib/content.ts` avec `video.kind: "recording"`. Conserver `kind: "illustration"` tant que les captures réelles ne sont pas validées.

## Vérifications effectuées dans le sandbox

Syntaxe Python et JavaScript vérifiée ; copies sources accessibles ; tests de sécurité hors ligne du lanceur SaaS validés. Démarrage applicatif, migrations réelles, connexion des comptes et navigateur de capture restent à exécuter sur la machine locale, où Docker et les ports réseau sont autorisés. Claude a été sollicité par l’agent principal mais son API n’était pas joignable (`EAI_AGAIN`).
