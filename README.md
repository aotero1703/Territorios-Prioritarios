# Territorios Prioritarios

Migración del tablero de [mapa-evidencias-mimp](https://github.com/aotero1703/mapa-evidencias-mimp/tree/47289a978b3072d746e15424bd720c1da5812841/territorios), conservando su diseño original. El repositorio fuente no se modifica.

Incluye filtros 2025/2026, departamento, periodo y tipo; mapa y zoom, conteos por sexo/edad, fichas provinciales y ranking por casos o tasa por 100 000 habitantes. Denominadores INEI provinciales de cada año. **2025 (domicilio, año completo) y 2026 (ocurrencia, enero–agosto) no forman una serie provincial homogénea.**

## Ejecutar

Sitio estático sin compilación: `python -m http.server 8000` y abrir `http://localhost:8000`. No abrir como archivo local: usa fetch y módulos ES. Para Vercel, raíz del repositorio y configuración incluida en `vercel.json`.

- `index.html`: estructura original y notas.
- `styles/`: diseño y fuentes originales.
- `js/app.js`: interacción y cálculos; `js/data.js`: carga de datos.
- `data/`: agregados recuperados, cartografía y proyecciones.
- `data/sources/`: Excel oficial y CSV 2025 original.
- `docs/`: metodología, trazabilidad y validación.

## Verificar

`python -m pip install -r requirements-dev.txt` y `python scripts/import_population.py` para reproducir denominadores. `python -m unittest discover -s tests -v` para cálculos y conciliación.

`npm ci` y `npm test` para pruebas de navegador. Requiere Chromium: definir `CHROMIUM_PATH` si no está en `/usr/bin/chromium`, o instalar el navegador con Playwright.

[Metodología y disponibilidad CEM/CEMF](docs/METODOLOGIA.md) · [Validación](docs/VALIDACION.md) · [Procedencia y SHA-256](docs/provenance.json).

Los agregados heredados se conservan con trazabilidad; no se certifica equivalencia de los instrumentos originales CEM/CEMF porque no se recuperaron sus diccionarios individuales. No se inventan datos, se anualizan tasas ni se calculan tasas específicas por sexo o edad. D3 usa licencia ISC; Rubik y Nunito Sans, OFL (archivos en `assets/`). Los logos se conservan como parte del original, sin atribuir nueva autoría ni otorgar licencia sobre ellos.
