#!/usr/bin/env python3
"""Create clean disposable source copies, never reusing env files or databases."""
import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
SOURCES = {
    'drin': Path('/mnt/c/dev/drin'),
    'saas': Path('/mnt/c/dev/Saas-project'),
    'sih': Path('/home/Yehezou/dev/SIH'),
    'oerp': Path('/home/Yehezou/dev/OERP'),
}
EXCLUDED = {
    '.git', '.agents', '.claude', '.codex', '.aws', 'node_modules', '.next', 'dist', 'build',
    'out', '.nx', '.venv', 'venv', 'env', '__pycache__', '.cache', '.pytest_cache',
    'uploads', 'media', 'logs', 'backups', 'backup', '.vercel', 'coverage', 'temp', 'tmp',
}
PRIVATE_SUFFIXES = {'.sqlite', '.sqlite3', '.db', '.sql', '.dump', '.bak', '.log', '.pem', '.key', '.p12', '.pfx'}

def ignore(directory, names):
    root = Path(directory)
    return [name for name in names if name in EXCLUDED or name.startswith('.env')
            or Path(name).suffix.lower() in PRIVATE_SUFFIXES or (root / name).is_symlink()]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', choices=[*SOURCES, 'all'])
    parser.add_argument('--source', type=Path, help='Source override for a single project')
    parser.add_argument('--check', action='store_true', help='Show availability without copying')
    args = parser.parse_args()
    if (BASE / '.local').is_symlink() or (BASE / '.local/work').is_symlink():
        parser.error('Disposable workspace directories must not be symlinks')
    if args.project == 'all' and args.source:
        parser.error('--source requires a single project')
    projects = SOURCES if args.project == 'all' else [args.project]
    for project in projects:
        source = (args.source or SOURCES[project]).resolve()
        destination = BASE / '.local' / 'work' / project
        if not source.is_dir():
            raise SystemExit(f'{project}: source missing: {source}')
        if args.check:
            print(f'{project}: source accessible; destination {destination}')
            continue
        if destination.exists():
            marker_file = destination / '.portfolio-demo-sandbox.json'
            try:
                previous = json.loads(marker_file.read_text())
            except (OSError, ValueError):
                previous = {}
            if (previous.get('project') == project
                    and previous.get('purpose') == 'portfolio-local-demo'
                    and previous.get('source') == str(source)):
                print(f'{project}: prepared copy already exists; preserving it: {destination}')
                continue
            raise SystemExit(f'{project}: destination already exists; preserving it: {destination}')
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(source, destination, ignore=ignore)
        marker = {'project': project, 'purpose': 'portfolio-local-demo',
                  'source': str(source), 'preparedAt': datetime.now(timezone.utc).isoformat()}
        (destination / '.portfolio-demo-sandbox.json').write_text(json.dumps(marker, indent=2) + '\n')
        print(f'{project}: clean source copy prepared at {destination}; no account or recording created yet')

if __name__ == '__main__':
    main()
