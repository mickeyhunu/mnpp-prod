const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('같은 서버에서 API와 프론트엔드를 제공한다', () => withServer(async (baseUrl) => {
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: 'ok' });

  const pageResponse = await fetch(baseUrl);
  assert.equal(pageResponse.status, 200);
  assert.match(pageResponse.headers.get('content-type'), /^text\/html/);
  assert.match(await pageResponse.text(), /NightWave/);

  const scriptResponse = await fetch(`${baseUrl}/js/app.js`);
  assert.equal(scriptResponse.status, 200);
  assert.match(scriptResponse.headers.get('content-type'), /^application\/javascript/);
}));

test('SPA 경로는 화면을 반환하고 알 수 없는 API는 JSON 404를 반환한다', () => withServer(async (baseUrl) => {
  const pageResponse = await fetch(`${baseUrl}/boards/common`);
  assert.equal(pageResponse.status, 200);
  assert.match(await pageResponse.text(), /NightWave/);

  const apiResponse = await fetch(`${baseUrl}/api/unknown`);
  assert.equal(apiResponse.status, 404);
  assert.deepEqual(await apiResponse.json(), { message: '존재하지 않는 API입니다.' });
}));
