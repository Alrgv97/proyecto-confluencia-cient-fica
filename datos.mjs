export const olas = [2016, 2017, 2018, 2019, 2021, 2022, 2023];
export const redes = [2017, 2019, 2022];
const total = (row) => ['edad', 'sexo', 'educ'].every((key) => row?.segmento?.[key] === 'Todos');
const proporcion = (value) => Number.isFinite(value) && value >= 0 && value <= 1;
const muestra = (value) => Number.isInteger(value) && value >= 30;
function exigir(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}
export function restringir(indicadores, distribucion, metodologia) {
  for (const fuente of [indicadores, distribucion]) {
    exigir(fuente?.meta && Array.isArray(fuente.registros), 'Faltan metadatos o registros.');
  }
  const i = indicadores.registros.filter(total);
  const d = distribucion.registros.filter(total);
  exigir(i.length === 7 && d.length === 7, 'Se requieren siete totales por archivo.');
  return validar({
    fecha: metodologia?.fecha_generacion,
    filas: olas.map((ola) => {
      const registro = i.find((r) => r.ola === ola);
      const posiciones = d.find((r) => r.ola === ola);
      exigir(registro && posiciones, 'Falta un total por ola.');
      const h = registro.homogeneidad;
      exigir(registro.extremidad?.n === posiciones.n_posicionados, 'Los denominadores de autoubicacion difieren.');
      return {
        ola,
        extremidad: registro.extremidad.media ?? null,
        nExtremidad: registro.extremidad.n ?? null,
        posiciones: posiciones.distribucion ?? null,
        nPosiciones: posiciones.n_posicionados ?? null,
        concordancia: h?.concordancia_media ?? null,
        nConcordancia: h?.n_concordancia ?? null,
        afinidad: h?.afinidad_media ?? null,
        nAfinidad: h?.n_afinidad ?? null,
      };
    }),
  });
}
export function validar(datos) {
  exigir(Array.isArray(datos?.filas) && datos.filas.length === 7, 'Se requieren las siete olas.');
  return {
    demostracion: datos.demostracion === true,
    fecha: typeof datos.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) ? datos.fecha : null,
    filas: datos.filas.map((row, index) => {
      exigir(row?.ola === olas[index], 'Olas incorrectas o duplicadas.');
      const fila = { ola: row.ola };
      for (const [valor, n] of [['extremidad', 'nExtremidad'], ['concordancia', 'nConcordancia'], ['afinidad', 'nAfinidad'], ['posiciones', 'nPosiciones']]) {
        const dato = row[valor] ?? null;
        const cuenta = row[n] ?? null;
        const correcto = valor === 'posiciones'
          ? Array.isArray(dato) && dato.length === 11 && dato.every(proporcion) && Math.abs(dato.reduce((a, b) => a + b, 0) - 1) < 0.00001
          : proporcion(dato);
        exigir(dato === null || (correcto && muestra(cuenta)), 'Valor o muestra invalida para ' + valor);
        exigir(cuenta === null || muestra(cuenta), 'Tamano muestral invalido.');
        if (valor === 'concordancia' || valor === 'afinidad') {
          exigir(redes.includes(row.ola) || (dato === null && cuenta === null), 'Ola sin medicion comparable.');
        }
        fila[valor] = dato;
        fila[n] = cuenta;
      }
      exigir(fila.nExtremidad === fila.nPosiciones, 'Los denominadores de autoubicacion difieren.');
      return fila;
    }),
  };
}

