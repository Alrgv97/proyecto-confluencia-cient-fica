# Observatorio de Polarización

Prototipo estático del estudio ELSOC 2016–2023 para Confluencia Científica.

## Prueba rápida para el equipo

Clona el repositorio o descarga su ZIP desde GitHub. En VS Code, abre la carpeta y ejecuta estos comandos desde la terminal con Node.js 24:

```text
npm ci
node demo.mjs
npm run build
npm run dev
```

Si PowerShell bloquea el script de npm, escribe `npm.cmd` en lugar de `npm`. Abre http://127.0.0.1:4173 y selecciona `demostracion.local.json`. Verás los cuatro gráficos y el selector de ola con cifras ficticias identificadas en la interfaz.
deben usar `observatorio.local.json` que les comparto por un canal privado
## Preparación de datos ELSOC para la vista local

Desde PowerShell con Node.js 24:

```powershell
npm.cmd ci
node preparar.mjs "$env:USERPROFILE/Downloads"
npm.cmd run build
npm.cmd run dev
```

Abre http://127.0.0.1:4173 y selecciona `observatorio.local.json`. La carpeta entregada al preparador debe contener `indicadores.json`, `distribucion.json` y `metodologia.json` generados en R. El preparador proyecta únicamente los totales por ola y las columnas necesarias sin recalcular las estimaciones. El servidor local entrega únicamente archivos del frontend.

## Verificación

```powershell
npm.cmd run lint
$env:VERIFICAR_ELSOC = '1'
npm.cmd test
```

El archivo local está excluido de Git y de la compilación. Para alojar el frontend, usa el contenido de `dist/` en un hosting estático. La aplicación también funciona en subrutas gracias a las rutas relativas. Cualquier integración automática de datos para publicación requiere la aprobación documentada de la versión, su licencia y la divulgación.

