require('dotenv').config();
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname);
const port = Number(process.env.FRONTEND_PORT || 5173);
const backendPort = Number(process.env.PORT || 3000);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function proxyApi(req, res) {
  const proxy = http.request({
    hostname: '127.0.0.1',
    port: backendPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${backendPort}` },
  }, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res);
  });

  proxy.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: '백엔드 서버에 연결할 수 없습니다.' }));
  });
  req.pipe(proxy);
}

function serveStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const requestedPath = path.resolve(root, relativePath);
  const filePath = requestedPath.startsWith(`${root}${path.sep}`) ? requestedPath : path.join(root, 'index.html');

  fs.stat(filePath, (statError, stats) => {
    const target = !statError && stats.isFile() ? filePath : path.join(root, 'index.html');
    fs.readFile(target, (readError, data) => {
      if (readError) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('프론트엔드 파일을 읽을 수 없습니다.');
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(target)] || 'application/octet-stream' });
      return res.end(data);
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/api' || req.url.startsWith('/api/')) return proxyApi(req, res);
  return serveStatic(req, res);
});

server.listen(port, () => console.log(`[frontend] NightWave UI: http://localhost:${port}`));
