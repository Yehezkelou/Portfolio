#!/usr/bin/env python3
"""Run SIH only with the generated isolated local database environment."""
import argparse
import json
import os
from pathlib import Path
import subprocess

BASE = Path(__file__).resolve().parents[1]
SERVICES = {
    'auth': ('dev:auth-service', '3003', 'portfolio_sih_auth_demo', 'auth-service'),
    'patient': ('dev:patient', '3001', 'portfolio_sih_patient_demo', 'patient-identity-service'),
    'admission': ('dev:admission', '3002', 'portfolio_sih_admission_demo', 'admission-service'),
    'gateway': ('dev:api-gateway', '8080', 'portfolio_sih_auth_demo', 'api-gateway'),
}
FRONTS = {'front-auth': ('auth-service', '3000'), 'front-admission': ('admission-service', '3004'), 'front-info': ('service-info', '3005')}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['install', 'db', *SERVICES, *FRONTS])
    args = parser.parse_args()
    root = BASE / '.local/work/sih'
    marker = json.loads((root / '.portfolio-demo-sandbox.json').read_text())
    if marker.get('project') != 'sih' or marker.get('purpose') != 'portfolio-local-demo':
        parser.error('Invalid disposable SIH marker')
    runtime = BASE / '.local/sih'
    config = json.loads((runtime / 'environment.json').read_text())
    credentials = json.loads((BASE / '.local/credentials/sih.json').read_text())
    if (config.get('DB_HOST'), config.get('DB_PORT'), config.get('DB_USER'), config.get('DB_PASSWORD')) != ('127.0.0.1', '55433', 'portfolio_demo', credentials['dbPassword']):
        parser.error('Database configuration is not the generated loopback demo configuration')
    env = {**os.environ, **config}
    env.pop('DATABASE_URL', None)
    if args.action == 'db':
        command = ['docker', 'compose', '-f', str(runtime / 'compose.json'), 'up', '-d', '--wait']
    elif args.action == 'install':
        command = ['pnpm', 'install', '--frozen-lockfile']
    elif args.action in SERVICES:
        script, port, database, service_name = SERVICES[args.action]
        env.update(PORT=port, DB_NAME=database, SERVICE_NAME=service_name)
        command = ['pnpm', 'run', script]
    else:
        folder, port = FRONTS[args.action]
        command = ['pnpm', 'exec', 'next', 'dev', str(root / 'apps/frontend' / folder), '--hostname', '127.0.0.1', '--port', port]
    subprocess.run(command, cwd=root, env=env, check=True)

if __name__ == '__main__':
    main()
