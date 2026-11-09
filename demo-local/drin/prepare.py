#!/usr/bin/env python3
"""Configure and seed only the disposable DRIN source copy."""
import argparse
import json
import os
from pathlib import Path
import secrets
import subprocess

BASE = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    parser.add_argument('--python', default='python3', help='Interpreter with the project dependencies')
    parser.add_argument('--configure-only', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    if root != (BASE / '.local/work/drin').resolve():
        parser.error('Only demo-local/.local/work/drin is accepted')
    marker = json.loads((root / '.portfolio-demo-sandbox.json').read_text())
    if marker.get('project') != 'drin' or marker.get('purpose') != 'portfolio-local-demo':
        raise SystemExit('Refusing a source tree without the disposable DRIN marker')
    if root == Path(marker.get('source', '')).resolve():
        raise SystemExit('Refusing to configure the original source')
    backend = root / 'backendDRIM' / 'siteMarine'
    frontend = root / 'frontendDRIM' / 'DRIM'
    credentials_path = BASE / '.local' / 'credentials' / 'drin.json'
    credentials_path.parent.mkdir(parents=True, exist_ok=True)
    if credentials_path.exists():
        credentials = json.loads(credentials_path.read_text())
    else:
        credentials = {'username': 'demo.directeur', 'email': 'drin-demo@example.test',
                       'password': secrets.token_urlsafe(20), 'role': 'directeur', 'created': False}
        fd = os.open(credentials_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as handle:
            json.dump(credentials, handle, indent=2)
    secret_path = BASE / '.local' / 'drin-secret.txt'
    if not secret_path.exists():
        fd = os.open(secret_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as handle:
            handle.write(secrets.token_urlsafe(48))
    settings = f'''from siteMarine.settings import *
SECRET_KEY = {secret_path.read_text()!r}
DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
DATABASES = {{'default': {{'ENGINE': 'django.db.backends.sqlite3', 'NAME': str(BASE_DIR / 'portfolio-demo.sqlite3')}}}}
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
EMAIL_HOST = ''
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_DOMAIN = None
CSRF_COOKIE_DOMAIN = None
CORS_ALLOWED_ORIGINS = ['http://127.0.0.1:5173']
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ['http://127.0.0.1:5173']
MEDIA_ROOT = BASE_DIR / 'demo-media'
'''
    settings_path = backend / 'siteMarine' / 'demo_settings.py'
    settings_path.write_text(settings)
    os.chmod(settings_path, 0o600)
    api = frontend / 'src' / 'api' / 'Api.ts'
    text = api.read_text()
    import re
    text, count = re.subn(r'const BASE_URL\s*=\s*[^;]+;', 'const BASE_URL = "http://127.0.0.1:8010/";', text, count=1)
    if count != 1:
        raise SystemExit('API base URL not found: review the copied frontend before running')
    api.write_text(text)
    # A second certificate view also has its own hard-coded API origin.
    for source in (frontend / 'src').rglob('*'):
        if source.is_file() and source.suffix in {'.ts', '.tsx'}:
            source.write_text(source.read_text().replace('https://syst.drin.ci', 'http://127.0.0.1:8010'))
    # The original API forces HTTPS cookies; this copy is exclusively local HTTP.
    views = backend / 'Users' / 'views.py'
    views.write_text(views.read_text().replace('secure=True', 'secure=False').replace("samesite='None'", "samesite='Lax'"))
    if args.configure_only:
        print('DRIN local configuration ready; no account created yet')
        return
    env = os.environ.copy()
    env.update(DJANGO_SETTINGS_MODULE='siteMarine.demo_settings', DATABASE_URL='sqlite:///portfolio-demo.sqlite3')
    subprocess.run([args.python, 'manage.py', 'migrate', '--noinput'], cwd=backend, env=env, check=True)
    seed = '''import json, os
from django.conf import settings
from django.contrib.auth import get_user_model
from pathlib import Path
assert settings.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3'
assert Path(settings.DATABASES['default']['NAME']).name == 'portfolio-demo.sqlite3'
data = json.loads(Path(os.environ['DEMO_CREDENTIALS_FILE']).read_text())
user, _ = get_user_model().objects.get_or_create(username=data['username'], defaults={'email':data['email'], 'role':data['role']})
user.email = data['email']
user.role = data['role']
user.set_password(data['password'])
user.is_active = True
user.save()
print('Fictional DRIN director account created in the isolated SQLite database')
'''
    env['DEMO_CREDENTIALS_FILE'] = str(credentials_path)
    subprocess.run([args.python, 'manage.py', 'shell', '-c', seed], cwd=backend, env=env, check=True)
    credentials['created'] = True
    credentials_path.write_text(json.dumps(credentials, indent=2) + '\n')
    print(f'Credentials saved privately: {credentials_path}')

if __name__ == '__main__':
    main()
