# Fuentes, denominadores y comparabilidad

Revisión: 6 de noviembre de 2026. El tablero es un prototipo de uso interno; no representa una certificación de calidad de los registros administrativos.

## Recuperación del original

Fuente de código, diseño y agregados: [aotero1703/mapa-evidencias-mimp](https://github.com/aotero1703/mapa-evidencias-mimp), commit `47289a978b3072d746e15424bd720c1da5812841`, archivo `territorios/index.html`.

Se revisaron el código, CSS, logos incrustados, cartografía y representación en navegador antes de migrar. Se revisó también el historial: `6006d61` (primera herramienta), `ef9889d` (conciliación desde SPSS y reserva), `53c212a` (INEI 2025), `29ef5f0` (carpeta independiente), `47289a9` (2026 y selector). No se escribió ni publicó nada en el repositorio fuente.

Se extrajeron sin modificar los objetos `R`, `Y26`, `GEO`, y las dos tablas demográficas incrustadas. Se preservó también el CSV de desagregación 2025 que existía en la raíz. Los campos heredados de predicción, tasas antiguas, población antigua y niveles precalculados en `original-2025.json` son archivo histórico: **no se usan** para tasas, ranking ni colores. La población activa procede únicamente de `poblacion.json`.

El sitio mantiene la tipografía Rubik/Nunito Sans, colores, portada, logos, tarjetas, mapa D3, zoom departamental, fichas, barras de sexo/edad y miniaturas del ranking. Datos, estilos y lógica están en carpetas separadas. D3 y fuentes se sirven localmente para evitar fallos por dependencias remotas.

## Disponibilidad y límites de variables CEM/CEMF

| Variable | 2025 recuperado | 2026 recuperado | Comparabilidad comprobada |
| --- | --- | --- | --- |
| Casos atendidos | 169 536 nacionales | 120 168 nacionales | Misma estructura de agregados; no equivalencia de personas únicas ni de instrumentos |
| Casos con provincia | 169 501 | 120 132 | 196 provincias, mismo UBIGEO de cuatro dígitos |
| Casos sin provincia | 35 | 36 | Incluidos en total nacional; excluidos de mapa y desgloses provinciales |
| Referencia territorial | Domicilio según notas originales | Ocurrencia según notas originales | **No homogénea**; falta validación contra diccionarios oficiales |
| Periodo | Enero–diciembre | Enero–agosto, preliminar | No comparar acumulados como variación anual |
| Periodos internos | Ene–mar, abr–jun, jul–sep, oct–dic | Ene–mar, abr–jun, jul–ago | Tercer periodo 2026 parcial; incluso periodos de igual duración difieren territorialmente |
| Tipo principal | Económica/patrimonial, psicológica, física, sexual | Las mismas cuatro etiquetas | Sumas verificadas; falta certificar recodificaciones del registro |
| Sexo | Mujer, hombre | Mujer, hombre | Etiquetas heredadas, sin inferir otras categorías ni su inexistencia en registro original |
| Edad | 0–11, 12–17, 18–29, 30–59, 60+ | Mismos cinco grupos | Conteos conciliados; no tasas específicas |
| Riesgo severo | Porcentaje acumulado | Porcentaje acumulado | Denominador de clasificación no documentado en Git; no recalcular ni comparar como tasa de atención |
| Tentativa de feminicidio | Conteo acumulado | Conteo acumulado | No filtrable por trimestre/tipo; etiquetas de periodo explícitas |
| Modalidades, vínculo, discapacidad, etnia | No presentes en agregados activos | No presentes en agregados activos | No inventar, imputar ni reconstruir cruces |

El [portal estadístico Warmi Ñan](https://portalestadistico.warminan.gob.pe/cem-casos-tipo-de-violencia/) presenta años 2025 y 2026 y secciones por tipo, sexo y edad. La [Plataforma Nacional de Datos Abiertos](https://www.datosabiertos.gob.pe/dataset/casos-de-violencia-contra-las-mujeres-integrantes-del-grupo-familiar-y-violencia-sexual) describe un recurso de sexo/departamento para el I trimestre 2026. Ese recurso **no sustituye** los agregados provinciales enero–agosto y no permite probar su equivalencia.

El [banco de datos](https://portalestadistico.warminan.gob.pe/banco-de-datos/) devolvió HTTP 503 desde el entorno y 502 desde la consulta web. El historial completo de Git no contiene las bases SPSS individuales, sus diccionarios ni un script de agregación CEM reproducible. Por tanto se verificó disponibilidad de agregados y consistencia interna, pero **no se certifica comparabilidad completa de los instrumentos CEM/CEMF ni se afirma que agosto sea el último corte publicado**. La ampliación a otros meses o variables requiere recuperar la base oficial y validar los diccionarios de ambos años. El cambio de nombre del servicio no prueba continuidad estadística.

## INEI y denominadores

Publicación oficial: [Perú: Población Total Proyectada al 30 de Junio de cada año, según Departamento, Provincia y Distrito, 2018–2026](https://www.gob.pe/institucion/inei/informes-publicaciones/6894980-peru-).

[Excel descargado del CDN oficial](https://cdn.www.gob.pe/uploads/document/file/8261096/6894980-peru-poblacion-total-proyectada-al-30-de-junio-de-cada-ano-segun-departamento-provincia-y-distrito-2018-2026.xlsx?v=1768402069), preservado en `data/sources/inei-2018-2026.xlsx`, con SHA-256 en `provenance.json`. Hoja `POB. PROYECTADA 2018-2026`, Cuadro Nº 01. La hoja advierte «Información de carácter referencial»; sus notas territoriales se conservan en el Excel.

Se seleccionan exclusivamente las filas cuyo UBIGEO de seis dígitos termina en `00` pero no en `0000`: provincia, excluyendo departamentos y total nacional. Se conserva el prefijo de cuatro dígitos, con ceros iniciales. No se suman distritos. Columna J: 2025; K: 2026. `data/poblacion.csv` conserva la fila del Excel de cada denominador. Hay 196 provincias; suma 2025 = 34 350 244; suma 2026 = 34 660 114, iguales a las filas nacionales de la hoja. No se sustituyen proyecciones por resultados censales de otra definición/fecha.

El importador `scripts/import_population.py` reproduce JSON y CSV. Población: ambos sexos, todas las edades, residente proyectada al 30 de junio del año elegido. El original reutilizaba población 2025 para 2026; se corrigió.

**Tasa del periodo = casos provinciales del tipo y periodo seleccionados ÷ población total provincial del mismo año × 100 000.** Se calcula con precisión completa; se redondea al entero solo para mostrarla. No se anualizan trimestres ni el acumulado de ocho meses. En 2026 el numerador por ocurrencia puede incluir no residentes: la tasa usa población residente como referencia territorial, no como población expuesta exactamente observada. No mide riesgo individual, incidencia ni prevalencia.

No hay denominadores por sexo/edad en esta importación: esas dimensiones muestran solo conteos. No se calculan tasas específicas dividiendo por población total ni se imputan denominadores.

## Rankings, mapa y reserva

Ranking: diez provincias con mayor conteo o tasa positiva entre las del departamento elegido (o Perú). No se restringe a la provincia de la ficha. Empates resueltos por UBIGEO ascendente. No se usan predicciones. Datos faltantes, cifras reservadas y conteos de 1 a 4 se excluyen. Cero es distinto de faltante y reserva; los ceros no entran al top diez.

Mapa: cuartiles empíricos de las tasas positivas de todas las provincias del país para cada año/periodo/tipo. Departamento modifica foco y zoom; no los umbrales nacionales. «Muy alta/alta/media/baja» son etiquetas relativas del prototipo, **no clasificación oficial de riesgo** ni recomendación causal de intervención. Los umbrales cambian con el filtro: no comparar colores entre periodos como evolución. Las geometrías se heredaron del original; hay 197 elementos para 196 códigos provinciales (un código tiene más de una geometría); no se duplica población ni casos por geometría. No se ha certificado vigencia legal de límites contra cartografía oficial.

La interfaz muestra 1–4 como «Menos de 5», sin derivar tasas ni posición de ranking. Las tablas recuperadas son agregados públicos heredados que pueden contener celdas pequeñas; esta migración no constituye una anonimización formal de sus archivos descargables. Se debe revisar control de divulgación antes de distribuir microcruces o sostener que existe garantía de anonimato.

Totales nacionales acumulados provienen de metadatos originales; barras de sexo/edad y filtros territoriales provienen de casos con provincia. Por eso pueden diferir en 35/36 casos: no distribuirlos artificialmente entre provincias, sexos o edades. Riesgo severo y tentativas se mantienen acumulados del año/corte, con etiquetas que explican que no cambian por trimestre.

## Validación

`python -m unittest discover -s tests -v`: cobertura poblacional, suma nacional, conciliación por provincia/tipo/periodo con tabla demográfica y huellas de fuentes. `npm test`: navegador Chromium, rankings contra cálculo independiente, ambos años, tipos, departamentos, periodos parciales, fichas, teclado, reserva, móvil, carga fallida y ausencia de dependencias remotas. Ver `VALIDACION.md` para resultados y alcance.
