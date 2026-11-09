"""Offline checks: no database, Docker or HTTP request is made."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).parent

def load(name):
    spec = importlib.util.spec_from_file_location('saas_demo_' + name, HERE / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

prepare = load('prepare')
run = load('run')

class DemoSafety(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='saas-demo-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        backend = self.root / 'project-saas/backend'
        frontend = self.root / 'project-saas/frontend/web/saas'
        (backend / 'prisma').mkdir(parents=True)
        (backend / 'src').mkdir()
        frontend.mkdir(parents=True)
        (backend / 'prisma/schema.prisma').write_text('datasource db { provider = "postgresql" }')
        (frontend / 'package.json').write_text('{}')
        (backend / 'src/server.ts').write_text('app.listen(PORT, "0.0.0.0",() => {});')
        (self.root / '.portfolio-demo-sandbox.json').write_text(json.dumps({
            'project': 'saas', 'purpose': 'portfolio-local-demo', 'source': '/mnt/c/dev/Saas-project'}))
        with contextlib.redirect_stdout(io.StringIO()):
            prepare.prepare(self.root)

    def test_private_idempotent_credentials(self):
        file = self.root / '.portfolio-demo/credentials.json'
        original = file.read_text()
        with contextlib.redirect_stdout(io.StringIO()):
            prepare.prepare(self.root)
        self.assertEqual(original, file.read_text())
        self.assertEqual(file.stat().st_mode & 0o777, 0o600)

    def test_production_environment_is_overridden_before_schema_command(self):
        with patch.dict(os.environ, {'DATABASE_URL': 'postgresql://remote/production', 'DOTENV_CONFIG_PATH': '/wrong'}), \
             patch.object(run.subprocess, 'call', return_value=0) as command, \
             patch.object(run.sys, 'argv', ['run.py', str(self.root), 'schema']):
            with self.assertRaises(SystemExit) as result:
                run.main()
        self.assertEqual(result.exception.code, 0)
        actual = command.call_args.kwargs['env']
        self.assertIn('@127.0.0.1:55432/portfolio_saas_demo', actual['DATABASE_URL'])
        self.assertNotIn('DOTENV_CONFIG_PATH', actual)
        self.assertEqual(command.call_args.args[0], ['node', 'node_modules/prisma/build/index.js', 'db', 'push'])

    def test_remote_url_rejected_without_running_command(self):
        env_file = self.root / 'project-saas/backend/.env'
        env_file.write_text('DATABASE_URL=postgresql://someone@remote.example/production\n')
        with patch.object(run.subprocess, 'call') as command, patch.object(run.sys, 'argv', ['run.py', str(self.root), 'schema']):
            with self.assertRaises(SystemExit):
                run.main()
        command.assert_not_called()

    def test_wrong_project_rejected(self):
        (self.root / '.portfolio-demo-sandbox.json').write_text('{"project":"original"}')
        with self.assertRaises(SystemExit):
            prepare.prepare(self.root)

if __name__ == '__main__':
    unittest.main()
