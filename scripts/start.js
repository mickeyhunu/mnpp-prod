const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const watch = process.argv.includes('--watch');
const nodeArgs = watch ? ['--watch'] : [];
const services = [
  { name: 'backend', entry: 'backend/src/server.js' },
  { name: 'frontend', entry: 'frontend/server.js' },
];
let shuttingDown = false;

const children = services.map(({ name, entry }) => {
  const child = spawn(process.execPath, [...nodeArgs, entry], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    console.error(`[${name}] 실행 실패:`, error.message);
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[${name}] 서버가 종료되었습니다 (${signal || `code ${code}`}).`);
    shutdown(code || 1);
  });
  return child;
});

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGTERM');
  });
  setTimeout(() => process.exit(exitCode), 200).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
