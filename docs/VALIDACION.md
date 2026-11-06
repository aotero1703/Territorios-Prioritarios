# Validación previa a publicar

Ejecutada el 6 de noviembre de 2026 en Python 3.12, Node 24 y Chromium del entorno.

- Importación reproducible del Excel INEI: 196 provincias, sin códigos duplicados, cifras enteras positivas; sumas de población iguales al total nacional de cada año. Los denominadores 2025 coinciden con los que contenía el original; se incorpora el denominador 2026 propio.
- Tres pruebas de datos aprobadas: población; conciliación de cada provincia, tipo y periodo con la tabla demográfica de ambos años, respetando celdas reservadas; huellas SHA-256 de datos y recursos preservados.
- 180 rankings de navegador aprobados contra un cálculo independiente desde archivos: dos años, todos sus periodos, cinco tipos, Perú/Amazonas, orden por casos/tasa, empates por UBIGEO.
- Fichas: población y tasa mostradas comprobadas con el año seleccionado. Se mantiene el periodo acumulado explícito para indicadores no trimestrales.
- Mapa: 197 elementos de geometría, 196 códigos provinciales; selección y restablecimiento, teclado Enter y zoom. Desgloses de sexo y edad cargados.
- Reserva: una provincia con cifra «<5» heredada muestra «Menos de 5», no calcula tasa y se excluye de ranking.
- Vista móvil de 390 × 844 sin desbordamiento horizontal; vista escritorio de 1440 × 1000. Inspección visual del original con sus dependencias y de la migración; se conserva CSS, tipografía, logos, portada, colores y disposición principal.
- Cero errores JavaScript en los recorridos exitosos; cero solicitudes a CDN/fuentes externas. Una carga de datos fallida muestra mensaje visible de error.
- El repositorio fuente tiene árbol de trabajo limpio y conserva su HEAD; solo se leyó y clonó.

Comandos: `python scripts/import_population.py`, `python -m unittest discover -s tests -v`, `npm test`. El flujo GitHub Actions repite importación y pruebas en pushes y PRs. El resultado local no implica que CI remoto ya haya terminado.

Límite de validación: esto acredita cálculos e integridad de los agregados recuperados, **no** equivalencia de las bases CEM/CEMF individuales, ni vigencia de límites cartográficos, ni una anonimización formal. Las fuentes faltantes y restricciones de comparabilidad se detallan en [METODOLOGIA.md](METODOLOGIA.md).
