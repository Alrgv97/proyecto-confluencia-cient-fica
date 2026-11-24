import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { restringir } from './datos.mjs';

if (process.argv[2] === '--build') {
  await mkdir('dist', { recursive: true });
  for (const file of ['index.html', 'estilos.css', 'app.mjs', 'datos.mjs']) {
    await copyFile(file, join('dist', file));
  }
} else {
  const carpeta = process.argv[2];
  if (!carpeta) throw new Error('Indica la carpeta con las tres exportaciones de R.');
  const leer = async (nombre) => JSON.parse((await readFile(join(carpeta, nombre + '.json'), 'utf8')).replace(/^\uFEFF/, ''));
  const datos = restringir(...await Promise.all(['indicadores', 'distribucion', 'metodologia'].map(leer)));
  await writeFile('observatorio.local.json', JSON.stringify(datos, null, 2));
}
