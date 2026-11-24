import { writeFile } from 'node:fs/promises';
import { olas, redes, validar } from './datos.mjs';

const pesos = [2, 3, 5, 9, 13, 24, 17, 12, 8, 5, 2];
const datos = validar({
  demostracion: true,
  filas: olas.map((ola, indice) => {
    const n = 500 + indice * 20;
    const conRedes = redes.includes(ola);
    const posiciones = indice % 2 === 0 ? pesos : [...pesos].reverse();
    return {
      ola,
      posiciones: posiciones.map((peso) => peso / 100),
      nPosiciones: n,
      extremidad: (25 + 3 * indice) / 100,
      nExtremidad: n,
      concordancia: conRedes ? (45 + indice) / 100 : null,
      nConcordancia: conRedes ? 160 + indice : null,
      afinidad: conRedes ? (33 + indice) / 100 : null,
      nAfinidad: conRedes ? 210 + indice : null,
    };
  }),
});

await writeFile('demostracion.local.json', JSON.stringify(datos, null, 2));
