import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

createServer(async (req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const filePath = join(__dirname, url);
  if (!filePath.startsWith(__dirname)) { res.writeHead(403).end('Forbidden'); return; }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found: ' + url);
  }
}).listen(PORT, () => {
  const ips = Object.values(networkInterfaces()).flat()
    .filter(n => n && n.family === 'IPv4' && !n.internal)
    .map(n => n.address);
  console.log(`\n  Local:    http://localhost:${PORT}`);
  for (const ip of ips) console.log(`  Network:  http://${ip}:${PORT}`);
  console.log('\n  Trykk Ctrl+C for å stoppe.\n');
});
