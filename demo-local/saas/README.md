# SaaS Restauration — environnement de démonstration local

Ces scripts s’appliquent uniquement à la copie préparée par le lanceur `demo-local`. Le projet original et sa base restent intacts. Les identifiants sont générés localement et ne sont jamais affichés par le seed.

Depuis la racine du portfolio, après création de la copie isolée :

```bash
python3 demo-local/saas/prepare.py demo-local/.local/work/saas
python3 demo-local/saas/run.py demo-local/.local/work/saas db
python3 demo-local/saas/run.py demo-local/.local/work/saas install-backend
python3 demo-local/saas/run.py demo-local/.local/work/saas schema
python3 demo-local/saas/run.py demo-local/.local/work/saas seed
python3 demo-local/saas/run.py demo-local/.local/work/saas backend
```

Dans un second terminal, depuis la racine du portfolio :

```bash
python3 demo-local/saas/run.py demo-local/.local/work/saas install-frontend
python3 demo-local/saas/run.py demo-local/.local/work/saas frontend
```

Les identifiants du restaurateur et du staff sont dans `demo-local/.local/work/saas/.portfolio-demo/credentials.json`. Ils ne sont valides que pour cette base de test. Le seed ajoute un établissement fictif actif, deux plats, trois tables et un accès staff. Il est réexécutable sans duplication des fixtures. Il n’ajoute aucune fausse commande passée.

Parcours vidéo réel à enregistrer après lancement :

1. Ouvrir `http://127.0.0.1:5174/login`, saisir l’adresse du restaurateur et le mot de passe généré, cliquer « Se connecter ».
2. Montrer `/dashboard`, puis `/menu-manager` (les deux produits fictifs), `/tables-manager` (les trois tables) et `/staff`.
3. Présenter `/pos` séparément avec `staffIdentifier` et `staffPin` ; ne pas prétendre qu’une commande ou un paiement a été réalisé sans effectuer le parcours.

L’API écoute sur `127.0.0.1:3101` et PostgreSQL sur `127.0.0.1:55432`. La configuration générée remplace uniquement celle de la copie isolée ; aucune URL de base existante n’est lue. Le wrapper `run.py` impose la configuration générée même si le terminal hérite d’une autre `DATABASE_URL`, et refuse toute autre base avant la commande Prisma. Utiliser ce wrapper pour toutes les étapes ; ne pas lancer une commande Prisma à la main.

Pour arrêter la base sans effacer les fixtures :

```bash
docker compose -f demo-local/.local/work/saas/.portfolio-demo/compose.json down
```

État dans le sandbox de préparation : génération des scripts et vérifications statiques possibles ; Docker, les ports locaux et Chromium sont bloqués. Aucun compte ni aucune vidéo réelle ne sont déclarés créés avant l’exécution réussie de ces étapes sur la machine locale.
