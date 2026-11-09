#!/usr/bin/env python3
"""Prepare a disposable SIH environment; no database mutation is performed."""
import argparse
import json
import os
from pathlib import Path
import secrets

BASE = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    expected = (BASE / '.local' / 'work' / 'sih').resolve()
    marker = json.loads((root / '.portfolio-demo-sandbox.json').read_text())
    if root != expected or marker.get('project') != 'sih' or marker.get('purpose') != 'portfolio-local-demo':
        parser.error('Only the marked disposable SIH copy is accepted')
    runtime = BASE / '.local' / 'sih'
    runtime.mkdir(parents=True, exist_ok=True, mode=0o700)
    credentials_path = BASE / '.local' / 'credentials' / 'sih.json'
    credentials_path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if credentials_path.exists():
        data = json.loads(credentials_path.read_text())
    else:
        data = {'email': 'sih-demo@example.test', 'password': secrets.token_urlsafe(24),
                'dbPassword': secrets.token_urlsafe(24), 'userJwt': secrets.token_urlsafe(48),
                'serviceJwt': secrets.token_urlsafe(48), 'status': 'prepared-not-created'}
        private_write(credentials_path, data)
    env = {
        'NODE_ENV': 'development', 'NX_DAEMON': 'false', 'NX_CLOUD': 'false',
        'DB_HOST': '127.0.0.1', 'DB_PORT': '55433', 'DB_USER': 'portfolio_demo',
        'DB_PASSWORD': data['dbPassword'], 'DB_NAME': 'portfolio_sih_auth_demo',
        'SUPERADMIN_EMAIL': data['email'], 'SUPERADMIN_PASSWORD': data['password'],
        'USER_JWT_SECRET': data['userJwt'], 'SERVICE_JWT_SECRET': data['serviceJwt'],
        'AUTH_GRPC_URL': '127.0.0.1:50052', 'PATIENT_GRPC_URL': '127.0.0.1:50051',
        'AUTH_HTTP_URL': 'http://127.0.0.1:3003', 'PATIENT_HTTP_URL': 'http://127.0.0.1:3001',
        'ADMISSION_HTTP_URL': 'http://127.0.0.1:3002', 'NEXT_PUBLIC_API_URL': 'http://127.0.0.1:8080',
        'CORS_ORIGIN': 'http://127.0.0.1:3000,http://127.0.0.1:3004,http://127.0.0.1:3005',
        'OTEL_SDK_DISABLED': 'true',
    }
    private_write(runtime / 'environment.json', env)
    compose = {'name': 'portfolio-sih-demo', 'services': {'db': {
        'image': 'postgres:16-alpine', 'environment': {'POSTGRES_USER': 'portfolio_demo', 'POSTGRES_PASSWORD': data['dbPassword'], 'POSTGRES_DB': 'portfolio_sih_auth_demo'},
        'ports': ['127.0.0.1:55433:5432'], 'volumes': ['sih_demo_data:/var/lib/postgresql/data', './init.sql:/docker-entrypoint-initdb.d/init.sql:ro'],
        'healthcheck': {'test': ['CMD-SHELL', 'pg_isready -U portfolio_demo -d portfolio_sih_auth_demo'], 'interval': '2s', 'timeout': '3s', 'retries': 30},
    }}, 'volumes': {'sih_demo_data': {}}}
    private_write(runtime / 'compose.json', compose)
    (runtime / 'init.sql').write_text('CREATE DATABASE portfolio_sih_patient_demo OWNER portfolio_demo;\nCREATE DATABASE portfolio_sih_admission_demo OWNER portfolio_demo;\n')
    # Keep navigation inside the local demo frontends, avoiding backend port collisions.
    modules = root / 'apps/frontend/auth-service/src/components/ui/Module/useModule.ts'
    if modules.exists():
        text = modules.read_text().replace('http://localhost:3004', 'http://127.0.0.1:3004').replace('http://localhost:3001', 'http://127.0.0.1:3005')
        modules.write_text(text)
    print('SIH local configuration ready; Auth-Service will create the fictional account on first successful startup')

def private_write(path, data):
    if path.exists():
        path.write_text(json.dumps(data, indent=2) + '\n')
        os.chmod(path, 0o600)
    else:
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as handle:
            json.dump(data, handle, indent=2)

if __name__ == '__main__':
    main()
