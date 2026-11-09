#!/usr/bin/env node
/** Record a real local UI only after interactive login, never import a failed capture. */
import { chromium } from 'playwright';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.dirname(fileURLToPath(import.meta.url));
const defaults = {
  drin: { login: 'http://127.0.0.1:5173/auth/internal/sec/j8k2m4', url: 'http://127.0.0.1:5173/int/dir/dashboard/exec/g8h2j5' },
  saas: { login: 'http://127.0.0.1:5174/login', url: 'http://127.0.0.1:5174/dashboard' },
  oerp: { login: 'http://127.0.0.1:3001/login', url: 'http://127.0.0.1:3001/dashboard' },
  sih: { login: 'http://127.0.0.1:3000/login', url: 'http://127.0.0.1:3000' },
};
const args = process.argv.slice(2);
const project = args.shift();
if (!defaults[project]) throw new Error('Usage: node record.mjs <drin|saas|sih|oerp> [--url URL] [--login URL] [--seconds 30]');
const options = { ...defaults[project], seconds: 30 };
while (args.length) {
  const flag = args.shift();
  if (!['--url', '--login', '--seconds'].includes(flag)) throw new Error(`Unknown argument: ${flag}`);
  const value = args.shift();
  if (!value) throw new Error(`Missing argument: ${flag}`);
  options[flag.slice(2)] = value;
}
const seconds = Number(options.seconds);
if (!Number.isFinite(seconds) || seconds < 5 || seconds > 120) throw new Error('Duration must be 5–120 seconds');
function assertLocal(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password) throw new Error(`Only local HTTP URLs are allowed: ${url.origin}`);
  return url;
}
assertLocal(options.login);
assertLocal(options.url);
const isLogin = (value) => /\/(?:login|mfa|auth\/internal|auth\/external)(?:\/|$)/i.test(new URL(value).pathname);
const output = path.join(base, '.local', 'recordings', project, new Date().toISOString().replaceAll(':', '-'));
await fs.mkdir(output, { recursive: true });
const prompt = createInterface({ input: stdin, output: stdout });
let browser, loginContext, context, video, recordingPage, passwordMonitor;
let loginSeen = false;
let result = { project, status: 'failed', source: 'real-local-application', loginRecorded: false, startedAt: new Date().toISOString() };
const errors = [];
try {
  browser = await chromium.launch({ headless: false });
  const blockRemote = async (route) => {
    const url = new URL(route.request().url());
    if (['data:', 'blob:', 'about:'].includes(url.protocol) || ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) return route.continue();
    return route.abort('blockedbyclient');
  };
  loginContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await loginContext.route('**/*', blockRemote);
  const loginPage = await loginContext.newPage();
  await loginPage.goto(options.login, { waitUntil: 'domcontentloaded' });
  console.log(`Connectez-vous avec le compte fictif ${project} dans la fenêtre ouverte. Aucune vidéo ne tourne pendant la connexion.`);
  await prompt.question('Une fois connecté, appuyez sur Entrée ici. ');
  if (isLogin(loginPage.url())) throw new Error('The browser is still on a login page; capture cancelled');
  const state = await loginContext.storageState();
  const session = await loginPage.evaluate(() => ({ origin: location.origin, items: Object.entries(sessionStorage) }));
  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: state, recordVideo: { dir: path.join(output, 'raw'), size: { width: 1440, height: 900 } } });
  await context.route('**/*', blockRemote);
  await context.addInitScript(({ origin, items }) => { if (location.origin === origin) for (const [key, value] of items) sessionStorage.setItem(key, value); }, session);
  recordingPage = await context.newPage();
  video = recordingPage.video();
  recordingPage.on('framenavigated', (frame) => {
    if (frame === recordingPage.mainFrame() && /^https?:/.test(frame.url()) && isLogin(frame.url())) loginSeen = true;
  });
  passwordMonitor = setInterval(() => {
    recordingPage.locator('input[type="password"]:visible').count().then((count) => { if (count) loginSeen = true; }).catch(() => {});
  }, 300);
  recordingPage.on('pageerror', () => errors.push('uncaught-page-error'));
  recordingPage.on('response', (response) => {
    if (response.status() >= 400 && /\/api(?:\/|$)/.test(new URL(response.url()).pathname)) errors.push(`api-http-${response.status()}`);
  });
  const response = await recordingPage.goto(options.url, { waitUntil: 'domcontentloaded' });
  if (response && !response.ok()) throw new Error(`Page returned HTTP ${response.status()}`);
  await recordingPage.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  if (isLogin(recordingPage.url())) throw new Error('The recorded page redirected to login; capture cancelled');
  await recordingPage.locator('body').waitFor({ state: 'visible' });
  await loginContext.close();
  loginContext = null;
  console.log(`Enregistrement réel pendant ${seconds} secondes : explorez les menus et les données fictives. Ne saisissez aucun mot de passe.`);
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  if (loginSeen || isLogin(recordingPage.url())) { result.loginRecorded = true; throw new Error('A login or password form appeared during recording; capture rejected'); }
  if (await recordingPage.locator('input[type="password"]:visible').count()) throw new Error('A password form is visible; capture rejected');
  if (errors.length) throw new Error(`Application errors detected: ${[...new Set(errors)].join(', ')}`);
  await recordingPage.screenshot({ path: path.join(output, 'poster.png') });
  result = { ...result, status: 'captured-pending-review', seconds, finalUrl: recordingPage.url(), viewport: { width: 1440, height: 900 }, errors: [] };
} catch (error) {
  result.error = error.message;
  process.exitCode = 1;
} finally {
  if (passwordMonitor) clearInterval(passwordMonitor);
  result.loginRecorded = loginSeen || result.loginRecorded;
  // Playwright finishes writing the video only after the recording context closes.
  if (context) await context.close().catch(() => {});
  if (video) {
    const target = path.join(output, result.status === 'captured-pending-review' ? 'capture.webm' : 'failed-capture.webm');
    await video.saveAs(target).catch((error) => { result.status = 'failed'; result.error = error.message; process.exitCode = 1; });
  }
  if (loginContext) await loginContext.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
  prompt.close();
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(`Capture ${result.status}: ${output}`);
  if (result.error) console.error(result.error);
}
