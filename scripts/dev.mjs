import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'api');
const kioskDir = path.join(root, 'kiosk');

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

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

spawnDev('api', apiDir, 'start:dev');

setTimeout(() => {
  spawnDev('kiosk', kioskDir, 'dev');
}, 2000);
