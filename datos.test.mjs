import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { olas, validar } from './datos.mjs';

const muestra = () => ({ filas: olas.map((ola) => ({ ola })) });
test('Los faltantes permanecen como null', () => {
  const datos = validar(muestra());
  assert.equal(datos.filas[0].extremidad, null);
  assert.equal(datos.filas[0].posiciones, null);
  assert.equal(datos.filas[0].concordancia, null);
});
test('Rechaza ceros para redes sin medicion y distribuciones invalidas', () => {
  const datos = muestra();
  assert.throws(() => validar({ filas: [{ ola: 2016, concordancia: 0, nConcordancia: 30 }, ...datos.filas.slice(1)] }));
  datos.filas[0].posiciones = Array(11).fill(0);
  datos.filas[0].nPosiciones = 150;
  assert.throws(() => validar(datos));
});
test('El compilado solo contiene frontend', async () => {
  assert.deepEqual((await readdir('dist')).sort(), ['app.mjs', 'datos.mjs', 'estilos.css', 'index.html']);
});
test('Totales locales coinciden con el maestro', { skip: !process.env.VERIFICAR_ELSOC }, async () => {
  const datos = validar(JSON.parse(await readFile('observatorio.local.json', 'utf8')));
  assert.deepEqual(datos.filas.map((r) => r.nExtremidad), [1596, 1362, 2493, 2110, 2050, 1732, 1743]);
  assert.deepEqual(datos.filas.map((r) => +r.extremidad.toFixed(6)), [.336002, .412851, .332005, .330230, .335702, .306017, .342926]);
  assert.deepEqual(datos.filas.map((r) => r.nConcordancia), [null, 652, null, 866, null, 203, null]);
  assert.deepEqual(datos.filas.map((r) => r.nAfinidad), [null, 788, null, 1188, null, 403, null]);
});
