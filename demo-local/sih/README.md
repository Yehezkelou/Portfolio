# SIH — démo locale isolée

SIH a besoin de PostgreSQL, de Node/pnpm, de quatre services NestJS et de ses interfaces Next.js. Les bases TypeORM utilisent `synchronize:true` : le lanceur impose trois bases de démonstration neuves dans un PostgreSQL dédié sur `127.0.0.1:55433`. Ne pas lancer le compose du projet original.

Depuis la racine du portfolio, hors sandbox :

```bash
python3 demo-local/prepare.py sih
python3 demo-local/sih/prepare.py demo-local/.local/work/sih
python3 demo-local/sih/run.py install
python3 demo-local/sih/run.py db
```

Ouvrir un terminal par service ; attendre que le premier démarre avant les suivants :

```bash
python3 demo-local/sih/run.py auth
python3 demo-local/sih/run.py patient
python3 demo-local/sih/run.py admission
python3 demo-local/sih/run.py gateway
python3 demo-local/sih/run.py front-auth
python3 demo-local/sih/run.py front-admission
python3 demo-local/sih/run.py front-info
```

Le service Auth crée le superadministrateur fictif au premier démarrage réussi à partir de `SUPERADMIN_EMAIL` et `SUPERADMIN_PASSWORD`. Les identifiants aléatoires sont dans `demo-local/.local/credentials/sih.json`. Leur statut reste `prepared-not-created` tant que l’authentification réelle n’a pas été confirmée ; la préparation seule ne crée aucun compte.

Connexion : `http://127.0.0.1:3000/login`, champs `#identifiant`, `#password`, bouton « Se connecter ». La connexion retourne à `/` et présente les modules. Pour les autres scènes, ouvrir l’interface admission sur 3004 (`/patients`, `/patients/nouveau`, `/admissions`) et l’administration sur 3005 (`/personnel/list`, `/roles`, `/permissions`). Créer uniquement des patients fictifs ; aucune donnée d’hôpital n’est copiée. Le transfert de session entre modules doit être vérifié dans les vraies interfaces avant d’enregistrer.

Les frontends d’urgence ne sont pas inclus dans cette configuration de démonstration minimale. Ne pas utiliser les liens d’un module dont le service n’a pas été démarré.
