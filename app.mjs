import { olas, redes, validar } from './datos.mjs';

const porId = (id) => document.getElementById(id);
const formato = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 3 });
const entero = new Intl.NumberFormat('es-CL');
const porcentaje = new Intl.NumberFormat('es-CL', { style: 'percent', maximumFractionDigits: 1 });
let filas = [];

function elemento(tipo, texto) {
  const nodo = document.createElement(tipo);
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
}

function grafico(id, puntos, formatear, maximo, etiqueta, destacar = false) {
  const destino = porId(id);
  destino.replaceChildren();
  if (puntos.every((punto) => punto.valor === null)) {
    destino.append(elemento('p', 'Datos insuficientes'));
    return;
  }
  const eje = elemento('p', 'Escala del gráfico: ' + formatear(0) + ' a ' + formatear(maximo));
  eje.className = 'axis';
  const plot = elemento('div');
  plot.className = 'plot';
  const ticks = elemento('div');
  ticks.className = 'ticks';
  for (const nodo of [plot, ticks]) {
    nodo.setAttribute('aria-hidden', 'true');
    nodo.style.setProperty('--cols', puntos.length);
  }
  const detalles = elemento('details');
  detalles.append(elemento('summary', 'Ver valores y muestras'));
  const tabla = elemento('table');
  tabla.append(elemento('caption', etiqueta));
  const cabecera = tabla.createTHead().insertRow();
  for (const texto of ['Ola o posición', 'Valor', 'N válido']) {
    const th = elemento('th', texto);
    th.scope = 'col';
    cabecera.append(th);
  }
  const cuerpo = tabla.createTBody();
  const pico = Math.max(...puntos.filter((punto) => punto.valor !== null).map((punto) => punto.valor));
  for (const { nombre, valor, n } of puntos) {
    const texto = valor === null ? 'Datos insuficientes' : formatear(valor);
    const muestra = n === null ? '—' : entero.format(n);
    const barra = elemento('div');
    barra.className = destacar && valor === pico ? 'bar peak' : 'bar';
    barra.title = nombre + ' · ' + texto + ' · N ' + muestra;
    if (valor !== null) {
      const relleno = elemento('i');
      relleno.style.setProperty('--value', (100 * valor / maximo) + '%');
      barra.append(relleno);
    }
    plot.append(barra);
    ticks.append(elemento('span', nombre));
    const fila = cuerpo.insertRow();
    const th = elemento('th', nombre);
    th.scope = 'row';
    fila.append(th);
    fila.insertCell().textContent = texto;
    fila.insertCell().textContent = muestra;
  }
  if (puntos.some((punto) => punto.valor === null)) destino.append(elemento('p', 'Datos insuficientes en una o más olas.'));
  detalles.append(tabla);
  destino.append(eje, plot, ticks, detalles);
}

function distribucion() {
  const fila = filas.find((dato) => dato.ola === Number(porId('ola').value));
  const puntos = Array.from({ length: 11 }, (_, nombre) => ({ nombre, valor: fila.posiciones?.[nombre] ?? null, n: fila.nPosiciones }));
  const maximo = Math.min(1, Math.max(.1, Math.ceil(Math.max(...(fila.posiciones ?? [0])) * 10) / 10));
  grafico('distribucion', puntos, porcentaje.format, maximo, 'Autoubicación en ' + fila.ola);
  porId('distribucion').prepend(elemento('p', '0 izquierda · 5 centro · 10 derecha' + (fila.nPosiciones === null ? '' : ' · N ' + entero.format(fila.nPosiciones))));
}

for (const ola of olas) {
  const opcion = elemento('option', ola);
  opcion.value = ola;
  porId('ola').append(opcion);
}
porId('ola').value = 2023;
porId('ola').addEventListener('change', distribucion);
porId('archivo').addEventListener('change', async (evento) => {
  const archivo = evento.currentTarget.files[0];
  if (!archivo) return;
  porId('tablero').hidden = true;
  porId('estado-datos').textContent = 'Resultados provisionales';
  porId('fecha').textContent = '';
  porId('mensaje').textContent = 'Validando archivos…';
  try {
    const datos = validar(JSON.parse(await archivo.text()));
    if (porId('archivo').files[0] !== archivo) return;
    filas = datos.filas;
    for (const [id, n, titulo] of [['extremidad', 'nExtremidad', 'Extremidad ideológica'], ['concordancia', 'nConcordancia', 'Concordancia de confidentes'], ['afinidad', 'nAfinidad', 'Afinidad con confidentes']]) {
      const serie = id === 'extremidad' ? filas : filas.filter((fila) => redes.includes(fila.ola));
      grafico(id, serie.map((fila) => ({ nombre: fila.ola, valor: fila[id], n: fila[n] })), formato.format, 1, titulo, id === 'extremidad');
      if (id !== 'extremidad') porId(id).append(elemento('p', 'Sin medición comparable: 2016, 2018, 2021 y 2023.'));
    }
    distribucion();
    porId('fecha').textContent = datos.fecha ? 'Fecha de generación: ' + datos.fecha : '';
    porId('estado-datos').textContent = datos.demostracion ? 'Datos ficticios de demostración' : 'Resultados provisionales';
    porId('mensaje').textContent = 'Datos cargados · siete olas · totales transversales.';
    porId('tablero').hidden = false;
  } catch {
    if (porId('archivo').files[0] === archivo) porId('mensaje').textContent = 'El archivo no cumple el contrato de datos. Selecciona observatorio.local.json generado con el comando de preparación.';
  }
});

