#!/usr/bin/env python3
"""Seed OERP only inside a marked disposable portfolio demo copy."""
import argparse
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys


def main():
    demo = Path(__file__).resolve().parents[1]
    local = demo / ".local"
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=local / "work" / "oerp")
    parser.add_argument("--python", help="Python with OERP requirements installed")
    parser.add_argument("--configure-only", action="store_true")
    args = parser.parse_args()
    for candidate in (local, local / "work", local / "work" / "oerp"):
        if candidate.is_symlink():
            parser.error("Disposable workspace paths must not be symlinks.")
    if args.root.is_symlink():
        parser.error("The root must not be a symlink.")
    root = args.root.resolve()
    expected = (local / "work" / "oerp").resolve()
    if root != expected or root.is_symlink():
        parser.error("The root must be demo-local/.local/work/oerp, never the original project.")
    marker = root / ".portfolio-demo-sandbox.json"
    try:
        metadata = json.loads(marker.read_text())
    except (OSError, ValueError):
        parser.error("Missing or invalid disposable-copy marker.")
    if metadata.get("project") != "oerp" or metadata.get("purpose") != "portfolio-local-demo":
        parser.error("The disposable-copy marker does not identify this demo.")
    backend = root / "outil_ERP"
    if marker.is_symlink() or backend.is_symlink() or (backend / "manage.py").is_symlink():
        parser.error("The marker and backend must belong to the physical disposable copy.")
    if not (backend / "manage.py").is_file():
        parser.error("outil_ERP/manage.py is missing in the clean copy.")
    runtime = local / "oerp"
    credentials_dir = local / "credentials"
    for directory in (runtime, credentials_dir):
        if directory.is_symlink():
            parser.error("Runtime directories must not be symlinks.")
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    credentials_file = credentials_dir / "oerp.json"
    if credentials_file.exists():
        credentials = json.loads(credentials_file.read_text())
    else:
        credentials = {
            "project": "oerp", "environment": "local-disposable-demo",
            "username": "portfolio.demo", "email": "oerp.demo@example.test",
            "password": secrets.token_urlsafe(24), "secret_key": secrets.token_urlsafe(48),
            "status": "prepared-not-created",
        }
        write_private(credentials_file, credentials)
    database = runtime / "demo.sqlite3"
    settings_file = backend / "portfolio_demo_settings.py"
    settings_file.write_text(
        "from outil_ERP.settings import *\n"
        "import os\nfrom pathlib import Path\n"
        "DEMO_RUNTIME = Path(os.environ['PORTFOLIO_OERP_RUNTIME']).resolve()\n"
        "DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': DEMO_RUNTIME / 'demo.sqlite3'}}\n"
        "SECRET_KEY = os.environ['PORTFOLIO_OERP_SECRET']\n"
        "DEBUG = True\nALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']\n"
        "EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'\n"
        "MEDIA_ROOT = DEMO_RUNTIME / 'media'\nSTATIC_ROOT = DEMO_RUNTIME / 'static'\n"
        "SESSION_COOKIE_SECURE = False\nCSRF_COOKIE_SECURE = False\n"
        "CSRF_TRUSTED_ORIGINS = ['http://127.0.0.1:3001', 'http://localhost:3001']\n"
        "CORS_ALLOWED_ORIGINS = CSRF_TRUSTED_ORIGINS\n"
        "JWT_AUTH_COOKIE_SECURE = False\n"
    )
    config = {
        "DJANGO_SETTINGS_MODULE": "portfolio_demo_settings",
        "PORTFOLIO_OERP_RUNTIME": str(runtime),
        "PORTFOLIO_OERP_SECRET": credentials["secret_key"],
        "DB_ENGINE": "django.db.backends.sqlite3",
        "DB_NAME": str(database), "LOG_FILE": str(runtime / "django.log"),
        "DEBUG": "True", "ALLOWED_HOSTS": "127.0.0.1,localhost,testserver",
        "DJANGO_API_URL": "http://127.0.0.1:8000",
        "NEXT_PUBLIC_API_URL": "http://127.0.0.1:8000",
    }
    write_private(runtime / "environment.json", config)
    if args.configure_only:
        print("OERP isolated settings prepared; account not created (--configure-only).")
        return
    candidates = [root / ".venv/bin/python", backend / ".venv/bin/python"]
    python = args.python or next((str(p) for p in candidates if p.is_file()), sys.executable)
    env = {**os.environ, **config, "PORTFOLIO_DEMO_PASSWORD": credentials["password"]}
    check = subprocess.run([python, "-c", "import django"], env=env, capture_output=True)
    if check.returncode:
        raise SystemExit("Django missing. Install requirements in the copy's venv, then rerun with --python.")
    subprocess.run([python, "manage.py", "migrate", "--noinput"], cwd=backend, env=env, check=True)
    seed = """
import os
from pathlib import Path
from django.conf import settings
from django.contrib.auth import get_user_model
db = settings.DATABASES['default']
assert db['ENGINE'] == 'django.db.backends.sqlite3'
assert Path(db['NAME']).resolve() == Path(os.environ['PORTFOLIO_OERP_RUNTIME']).resolve() / 'demo.sqlite3'
User = get_user_model()
user, _ = User.objects.get_or_create(username='portfolio.demo', defaults={'email': 'oerp.demo@example.test'})
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.set_password(os.environ['PORTFOLIO_DEMO_PASSWORD'])
user.save()
assert user.check_password(os.environ['PORTFOLIO_DEMO_PASSWORD'])
print('Local disposable OERP demo account created and password verified.')
"""
    subprocess.run([python, "manage.py", "shell", "-c", seed], cwd=backend, env=env, check=True)
    credentials["status"] = "created-and-password-verified"
    write_private(credentials_file, credentials)
    print("Credentials are in the ignored demo-local/.local/credentials/oerp.json file.")


def write_private(path, value):
    # O_EXCL avoids following a pre-existing symlink when first creating secrets.
    if path.is_symlink():
        raise SystemExit("Refusing a symlink for a private runtime file.")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    os.fchmod(fd, 0o600)
    with os.fdopen(fd, "w") as stream:
        json.dump(value, stream, indent=2)
        stream.write("\n")


if __name__ == "__main__":
    main()
