import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'api');
const kioskDir = path.join(root, 'kiosk');
const API_HEALTH_URL = 'http://127.0.0.1:3000/health';

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];
let shuttingDown = false;

function spawnDev(name, cwd, script) {
  const child = spawn('npm', ['run', script], {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    if (shuttingDown) {
      return;
    }
    if (code !== null && code !== 0) {
      console.error(`[dev] ${name} exited with code ${code}`);
      shutdown();
    }
  });

  children.push(child);
  return child;
}

function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  process.exit(0);
}

async function waitForApiHealth(maxWaitMs = 120_000) {
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(API_HEALTH_URL);
      if (response.ok) {
        console.log('[dev] API ready');
        return;
      }
    } catch {
      // API still booting
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }

  console.warn('[dev] API health check timed out; starting kiosk anyway');
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

spawnDev('api', apiDir, 'start:dev');

void waitForApiHealth().then(() => {
  spawnDev('kiosk', kioskDir, 'dev');
});
