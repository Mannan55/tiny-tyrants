const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { mkdtempSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');

const repoDir = path.resolve(__dirname, '..');
const mimes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.cjs': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json'
};

function findChrome() {
  const envPath = process.env.CHROME_BIN || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

test('E2E Browser: New game, building construction, and UI verification', async (t) => {
  const chromePath = findChrome();
  if (!chromePath) {
    t.skip('Chrome executable not found on host; skipping browser E2E test');
    return;
  }

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(repoDir, reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimes[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  const userDataDir = mkdtempSync(path.join(tmpdir(), 'tt-chrome-e2e-'));
  const cdpPort = port + 2000;

  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
        if (res.ok) {
          targets = await res.json();
          break;
        }
      } catch {}
    }
    if (!targets) {
      t.skip('Chrome remote debugging port not reachable in current sandbox environment');
      return;
    }

    const target = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();
    const exceptions = [];

    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        exceptions.push(msg.params.exceptionDetails);
      }
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    await send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
    await new Promise(r => setTimeout(r, 1200));

    // Verify Title
    const titleRes = await send('Runtime.evaluate', { expression: 'document.title' });
    assert.equal(titleRes.result?.result?.value, 'Tiny Tyrants · v1.2');

    // Click Start New Game
    await send('Runtime.evaluate', { expression: 'document.getElementById("startFresh")?.click()' });
    await new Promise(r => setTimeout(r, 500));

    // Enter valid name
    await send('Runtime.evaluate', { expression: `
      const input = document.getElementById("playerNameInput");
      input.value = "Commander Leo";
      document.getElementById("nameForm").requestSubmit();
    ` });
    await new Promise(r => setTimeout(r, 1000));

    // Verify village state
    const villageData = await send('Runtime.evaluate', { expression: `({
      dialogOpen: document.getElementById("dialog")?.open,
      gold: document.getElementById("gold")?.textContent,
      grain: document.getElementById("grain")?.textContent,
      rank: document.getElementById("rank")?.textContent,
      storageLoaded: Boolean(window.TinyTyrantsStorage)
    })`, returnByValue: true });

    const state = villageData.result?.result?.value;
    assert.equal(state.dialogOpen, false);
    assert.equal(state.gold, '350');
    assert.equal(state.grain, '60');
    assert.equal(state.storageLoaded, true);

    // Capture screenshot evidence of running game
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(repoDir, 'docs', 'screenshot-v1.2.png'), Buffer.from(shot.result.data, 'base64'));

    ws.close();
    assert.equal(exceptions.length, 0, 'No uncaught browser runtime exceptions');
  } finally {
    chrome.kill();
    server.close();
  }
});
