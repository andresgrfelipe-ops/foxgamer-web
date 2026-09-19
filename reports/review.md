# Revisión FOX GAMER

Rama: mejora-catalogo-fotos. Sin commit, push ni merge.

## Estructura

811 archivos originalmente versionados. Fuente comercial: data/store.json; generación: scripts/build.mjs; validación: scripts/catalog.mjs; interfaz: assets/app.js, assets/brand.css, assets/styles.css y assets/gallery.js. Scripts de importación, corrección y recorte son utilidades históricas, no pasos del build. original.html es histórico. HTML, robots y sitemap son salidas. No se borraron fotografías originales.

## Integridad

Comparación programática con HEAD: se conservan las 450 variantes y todos sus campos salvo image. Precios, disponibilidad, condiciones, nombres y slugs sin cambios. Se encontraron 51 fichas huérfanas: sus URLs se conservan con consulta, sin oferta antigua, noindex y fuera del sitemap.

## Fotografías

15 variantes de 5 referencias verificadas visualmente; 435 variantes de 145 referencias pendientes. El informe image-review.json conserva las asignaciones anteriores. No se afirma que todas las pendientes sean incorrectas: falta verificar su correspondencia exacta. Errores visuales confirmados: FC25 mostraba FC26, VR2 mostraba Pulse Elite y G29 mostraba PXN V9. Apple tenía rotación entre modelos distintos.

## Cambios de interfaz

Catálogo antes de galería, acceso directo desde portada, consulta WhatsApp con modelo/condición/URL, búsqueda por palabras sin acentos y con retardo de 120 ms, índice de búsqueda reutilizable, menos modificaciones DOM al filtrar, campos móviles de 16 px y controles táctiles de 44 px, tarjetas de una columna hasta 420 px, colores de condición y marcador neutro al faltar/fallar una foto. Galería preservada con títulos neutrales para no reiterar asociaciones no verificadas. SEO: imagen social del modelo verificado, URL de imagen estructurada válida y ausencia de imagen falsa en JSON-LD.

## Verificación

Build: 509 archivos generados. Auditoría por SHA-256: 5 fotos verificadas, sin reutilización entre modelos distintos. Pruebas Node cubren datos, build, enlaces/anclas, fotografías, WhatsApp y comportamiento de filtros. Ver resultados finales de ejecución. git diff --check sin errores. Navegador de automatización no disponible; no se atribuye una comprobación visual responsive ni puntuación Lighthouse.

Listado exacto de cambios: changed-files.txt. Pendientes por referencia: pending-photos.md; por slug/condición: image-review.json.
