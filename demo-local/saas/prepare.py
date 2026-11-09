#!/usr/bin/env python3
"""Configure an already isolated SaaS checkout; never reads source .env files."""
import json
import os
from pathlib import Path
import secrets
import sys


def prepare(root):
    root = Path(root).resolve()
    marker_path = root / '.portfolio-demo-sandbox.json'
    marker = json.loads(marker_path.read_text())
    if marker.get('project') != 'saas' or marker.get('purpose') != 'portfolio-local-demo':
        raise SystemExit('Refus : copie isolée SaaS non reconnue.')
    if root == Path(marker.get('source', '')).resolve():
        raise SystemExit('Refus : le chemin est le projet original.')
    backend = root / 'project-saas/backend'
    frontend = root / 'project-saas/frontend/web/saas'
    if not (backend / 'prisma/schema.prisma').is_file() or not (frontend / 'package.json').is_file():
        raise SystemExit('Structure SaaS inattendue.')
    local = root / '.portfolio-demo'
    local.mkdir(mode=0o700, exist_ok=True)
    os.chmod(local, 0o700)
    credentials_path = local / 'credentials.json'
    if credentials_path.exists():
        credentials = json.loads(credentials_path.read_text())
    else:
        credentials = {'project': 'saas', 'email': 'restaurateur@portfolio-demo.test',
            'password': secrets.token_urlsafe(20), 'staffIdentifier': 'PORTFOLIO_DEMO',
            'staffPin': str(secrets.randbelow(10000)).zfill(4),
            'dbPassword': secrets.token_urlsafe(24), 'jwtSecret': secrets.token_urlsafe(48)}
        credentials_path.write_text(json.dumps(credentials, indent=2) + '\n')
        os.chmod(credentials_path, 0o600)
    database = f"postgresql://portfolio_demo:{credentials['dbPassword']}@127.0.0.1:55432/portfolio_saas_demo"
    backend_env = '\n'.join([f'DATABASE_URL={database}', f"JWT_SECRET={credentials['jwtSecret']}",
        'PORT=3101', 'FRONTEND_URL=http://127.0.0.1:5174', 'NODE_ENV=development',
        'GOOGLE_CLIENT_ID=', 'SUPER_ADMIN_EMAIL=', 'SUPER_ADMIN_PASSWORD=', ''])
    (backend / '.env').write_text(backend_env)
    os.chmod(backend / '.env', 0o600)
    (frontend / '.env.local').write_text('VITE_API_URL=http://127.0.0.1:3101/api/v1\nVITE_GOOGLE_CLIENT_ID=\n')
    compose = {'name': 'portfolio-saas-demo', 'services': {'db': {
        'image': 'postgres:16-alpine', 'ports': ['127.0.0.1:55432:5432'],
        'environment': {'POSTGRES_USER': 'portfolio_demo', 'POSTGRES_PASSWORD': credentials['dbPassword'],
            'POSTGRES_DB': 'portfolio_saas_demo'},
        'healthcheck': {'test': ['CMD-SHELL', 'pg_isready -U portfolio_demo -d portfolio_saas_demo'],
            'interval': '3s', 'timeout': '3s', 'retries': 20},
        'volumes': ['demo-db:/var/lib/postgresql/data']}}, 'volumes': {'demo-db': {}}}
    (local / 'compose.json').write_text(json.dumps(compose, indent=2) + '\n')
    os.chmod(local / 'compose.json', 0o600)
    (backend / '.portfolio-demo-seed.ts').write_text((Path(__file__).parent / 'seed.ts.template').read_text())
    # Restrict the original all-interface development listener in this isolated copy only.
    server_path = backend / 'src/server.ts'
    source = server_path.read_text()
    source = source.replace('app.listen(PORT, "0.0.0.0",', 'app.listen(PORT, "127.0.0.1",')
    if 'app.listen(PORT, "127.0.0.1",' not in source:
        raise SystemExit('Refus : vérifier manuellement le listener de src/server.ts avant lancement.')
    server_path.write_text(source)
    print('SaaS configuré dans la copie isolée. Aucun compte créé avant exécution du seed.')
    print('Identifiants locaux :', credentials_path)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python3 demo-local/saas/prepare.py CHEMIN_COPIE_SAAS')
    prepare(sys.argv[1])
