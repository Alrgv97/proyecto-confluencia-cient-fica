import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const tipos = new Map([['/', ['index.html', 'text/html']], ['/index.html', ['index.html', 'text/html']], ['/estilos.css', ['estilos.css', 'text/css']], ...['app.mjs', 'datos.mjs'].map((name) => ['/' + name, [name, 'text/javascript']])]);
createServer(async (req, res) => {
  const archivo = tipos.get(req.url);
  if (!archivo) {
    res.writeHead(404).end();
    return;
  }
  try {
    const contenido = await readFile(new URL('./dist/' + archivo[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': archivo[1] + '; charset=utf-8' }).end(contenido);
  } catch {
    res.writeHead(503).end('Ejecuta npm run build primero.');
  }
}).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173'));
