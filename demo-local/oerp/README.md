# OERP — démonstration locale isolée

Le script utilise exclusivement la copie physique `demo-local/.local/work/oerp`, marquée par `.portfolio-demo-sandbox.json` contenant `{"project":"oerp","purpose":"portfolio-local-demo"}`. Il refuse le dépôt original et les liens symboliques sur les chemins de travail.

Depuis la racine du portfolio, après préparation de la copie propre :

```bash
python3 -m venv demo-local/.local/work/oerp/.venv
demo-local/.local/work/oerp/.venv/bin/python -m pip install -r demo-local/.local/work/oerp/outil_ERP/requirements.txt
python3 demo-local/oerp/prepare.py
```

`prepare.py` crée une configuration Django de démonstration dans la copie, migre une nouvelle base SQLite et crée le compte `portfolio.demo`. Le mot de passe est généré aléatoirement et conservé dans le fichier local ignoré `demo-local/.local/credentials/oerp.json`, avec permissions `0600`. Le statut ne devient `created-and-password-verified` qu'après création et vérification du mot de passe dans Django. `--configure-only` prépare les fichiers sans créer de compte ni exécuter de migration.

La base `demo-local/.local/oerp/demo.sqlite3`, les médias et journaux restent dans l'espace de démonstration. Le backend d'emails est en mémoire. Aucun réglage de la base PostgreSQL d'origine n'est utilisé.

Pour lancer le backend avec l'environnement généré :

```bash
python3 - <<'PY'
import json, os, subprocess
from pathlib import Path
root = Path.cwd()
config = json.loads((root / 'demo-local/.local/oerp/environment.json').read_text())
subprocess.run([
    str(root / 'demo-local/.local/work/oerp/.venv/bin/python'),
    'manage.py', 'runserver', '127.0.0.1:8000', '--noreload'
], cwd=root / 'demo-local/.local/work/oerp/outil_ERP', env={**os.environ, **config}, check=True)
PY
```

Dans un second terminal, démarrer l'interface réelle :

```bash
cd demo-local/.local/work/oerp/frontend-v2
npm ci
DJANGO_API_URL=http://127.0.0.1:8000 npm run dev
```

L'interface Next.js écoute sur le port `3001`. Son proxy `/api/[...path]` transmet les appels au Django local. Parcours vidéo : `/login` (champs `Username`, `Password`, bouton `Login`), puis `/dashboard`, `/procedures/dossiers`, `/procedures/nouveau_dossier`, `/admin/utilisateurs`. L'utilisateur de démonstration est un superutilisateur local et son profil 2FA est créé inactif par le signal Django existant.

Une base neuve ne contient pas encore de dossiers maritimes métier : saisir uniquement des données fictives depuis les formulaires avant l'enregistrement. Ne jamais copier une base existante pour remplir la vidéo. Les routes et commandes sont issues du code ; l'exécution complète et l'enregistrement nécessitent un environnement autorisant les serveurs et Chromium.
