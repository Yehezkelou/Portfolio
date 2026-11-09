#!/usr/bin/env python3
"""Run SaaS commands with only the generated local database URL."""
import json
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import urlparse


def main():
    if len(sys.argv) != 3:
        raise SystemExit('Usage: python3 demo-local/saas/run.py COPIE_SAAS {db|install-backend|schema|seed|backend|install-frontend|frontend}')
    root = Path(sys.argv[1]).resolve()
    marker = json.loads((root / '.portfolio-demo-sandbox.json').read_text())
    if marker.get('project') != 'saas' or marker.get('purpose') != 'portfolio-local-demo' or root == Path(marker.get('source', '')).resolve():
        raise SystemExit('Refus : copie isolée requise.')
    backend = root / 'project-saas/backend'
    frontend = root / 'project-saas/frontend/web/saas'
    generated = {}
    for line in (backend / '.env').read_text().splitlines():
        if '=' in line:
            key, value = line.split('=', 1)
            generated[key] = value
    url = urlparse(generated.get('DATABASE_URL', ''))
    if (url.scheme, url.hostname, url.port, url.path, url.username) != ('postgresql', '127.0.0.1', 55432, '/portfolio_saas_demo', 'portfolio_demo'):
        raise SystemExit('Refus : seule la base locale de démonstration est autorisée.')
    credentials = json.loads((root / '.portfolio-demo/credentials.json').read_text())
    if url.password != credentials['dbPassword']:
        raise SystemExit('Refus : configuration locale incohérente.')
    env = dict(os.environ)
    # Never allow an inherited production URL or dotenv override to win.
    env.pop('DOTENV_CONFIG_PATH', None)
    env.pop('DOTENV_CONFIG_OVERRIDE', None)
    env.pop('VERCEL', None)
    env.update(generated)
    commands = {
        'db': (['docker', 'compose', '-f', str(root / '.portfolio-demo/compose.json'), 'up', '-d', '--wait'], root),
        'install-backend': (['npm', 'ci'], backend),
        'schema': (['node', 'node_modules/prisma/build/index.js', 'db', 'push'], backend),
        'seed': (['node', 'node_modules/tsx/dist/cli.mjs', '.portfolio-demo-seed.ts'], backend),
        'backend': (['npm', 'run', 'dev'], backend),
        'install-frontend': (['npm', 'ci'], frontend),
        'frontend': (['npm', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], frontend),
    }
    if sys.argv[2] not in commands:
        raise SystemExit('Commande inconnue.')
    command, cwd = commands[sys.argv[2]]
    # Frontend config is also pinned explicitly, independent of the invoking shell.
    env['VITE_API_URL'] = 'http://127.0.0.1:3101/api/v1'
    env['VITE_GOOGLE_CLIENT_ID'] = ''
    raise SystemExit(subprocess.call(command, cwd=cwd, env=env))


if __name__ == '__main__':
    main()
