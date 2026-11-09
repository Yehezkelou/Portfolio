# DRIN — démonstration locale isolée

Depuis le dossier du portfolio, hors sandbox :

```bash
python3 demo-local/prepare.py drin
cd demo-local/.local/work/drin/backendDRIM/siteMarine
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt dj-database-url qrcode reportlab
```

Revenir à la racine du portfolio, puis :

```bash
python3 demo-local/drin/prepare.py demo-local/.local/work/drin --python "$PWD/demo-local/.local/work/drin/backendDRIM/siteMarine/.venv/bin/python"
```

Dans deux terminaux, depuis la racine du portfolio :

```bash
cd demo-local/.local/work/drin/backendDRIM/siteMarine
DJANGO_SETTINGS_MODULE=siteMarine.demo_settings .venv/bin/python manage.py runserver 127.0.0.1:8010
```

```bash
cd demo-local/.local/work/drin/frontendDRIM/DRIM
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Compte directeur fictif dans `demo-local/.local/credentials/drin.json` (mot de passe aléatoire, jamais commité). La connexion interne est `/auth/internal/sec/j8k2m4`, puis le tableau de bord directeur `/int/dir/dashboard/exec/g8h2j5`. Montrer ensuite le suivi des immatriculations via le menu. La base est neuve : les dossiers métier doivent être créés dans l’interface avec des données fictives avant l’enregistrement.

Le script adapte uniquement la copie : API sur boucle locale, SQLite neuve, emails en mémoire et cookies HTTP locaux. Il n'importe aucune donnée métier ni base existante. Les dépendances et migrations doivent réussir avant que le champ `created` passe à `true`. Aucune génération de certificat réel ni validation de dossier administratif n’est automatisée.
