# FOX GAMER · Fase 2

Base: `origin/main` en `246eac3bfd29630705c4ac41bf93a855b42733f5`. Rama de trabajo: `mejora-web-fase-2`, creada antes de modificar archivos. Sin commit, push, merge ni despliegue.

## Mejoras

- Catálogo progresivo: todo el HTML permanece disponible sin JavaScript. Con JavaScript, lotes de 24 resultados y botón Cargar más con gestión de foco.
- Búsqueda por palabras y sin acentos, abreviaturas PS4/PS5, filtros combinados por categoría, condición y disponibilidad. URL compartible, restablecimiento y resumen de filtros. Orden estable con precios desconocidos al final.
- Índice de búsqueda y órdenes calculados una vez; scripts del catálogo y galería solo en las páginas que los usan. Galería plegable y fotografías con carga diferida. Sin nuevas dependencias ni fuentes externas.
- Menú adaptable hasta 960 px, cierre con Escape/clic exterior/salida de foco, enlaces de categoría activos y navegación disponible sin JavaScript.
- Hero con acceso a catálogo, contacto y categorías. Tarjetas adaptadas a móvil/tablet/escritorio, campos de 16 px, focos visibles y estados de condición con texto y color.
- Fichas con selector de variantes del mismo nombre/marca/categoría, precios y condiciones propios, detalles de unidad y CTA móvil para WhatsApp. Los agotados no muestran CTA de compra.
- Mensajes WhatsApp con modelo, condición, enlace y solicitud de confirmación. La fotografía del modelo no se presenta como prueba del estado de cada unidad.
- BreadcrumbList, metadatos sociales y descripciones específicas por condición. Product/Offer conserva exclusivamente precio, disponibilidad y condición existentes; no hay opiniones, descuentos ni garantías inventadas.
- Auditoría de imágenes integrada al comienzo del build: evidencia, ruta local raster, huella SHA-256, archivo existente y duplicados entre modelos. Una alteración o asignación sin correspondencia bloquea la generación antes de escribir HTML.

## Integridad comercial e imágenes

Comparación con main: las 450 variantes completas, incluidas sus asignaciones de imagen, no cambian. El único cambio de `data/store.json` es añadir `sha256` a los cinco registros existentes de `verifiedImages`.

Resultado: 15 variantes con foto verificada, 435 variantes pendientes (145 referencias), 5 fotografías únicas. Los pendientes siguen mostrando «Imagen próximamente». No se descargaron, sustituyeron ni asignaron nuevas fotos. Los informes de pendientes de la fase anterior siguen vigentes.

La huella protege los archivos revisados, pero no sustituye la identificación humana del modelo. La revisión visual original y la exactitud comercial de los datos importados no se deducen de una prueba automática.

## Archivos fuente

Modificados:

- `assets/app.js`
- `data/store.json` (solo metadatos de verificación)
- `scripts/audit-images.mjs`
- `scripts/build.mjs`
- `scripts/catalog.mjs`
- `tests/app.test.mjs`
- `README.md`

Nuevos:

- `assets/catalog-model.js`
- `assets/storefront.css`
- `scripts/storefront.mjs`
- `tests/images.test.mjs`
- `tests/storefront.test.mjs`
- `reports/phase-2.md`

Las modificaciones HTML proceden del generador. El build conserva las 51 URLs antiguas como páginas de consulta con noindex; no elimina productos del catálogo. `reports/changed-files.txt` y `reports/review.md` documentan la fase anterior, no son el inventario de esta fase.

## Verificación

Ejecutado con Node.js 22.14.0, usando directamente los comandos de package.json:

| Comando | Resultado |
| --- | --- |
| `node scripts/audit-images.mjs` (`audit:images`) | Correcto: 450 variantes, 15 verificadas, 435 pendientes, 5 fotos |
| `node scripts/build.mjs` (`build`) | Correcto: 509 archivos |
| `node --test tests/*.test.mjs` (`test`) | 25 pruebas aprobadas, 0 fallos |
| `git diff --check` | Sin errores |

Las pruebas cubren paginación y foco, filtros/URL, orden, menú, imagen rota, datos estructurados de todas las variantes, enlaces/anclas, WhatsApp, imágenes alteradas/ausentes/duplicadas y aborto del build antes de escribir HTML.

No se ejecutó una revisión visual en navegador, porque la herramienta de navegador no dispone de sesiones habilitadas. Tampoco se ha medido Lighthouse ni Core Web Vitals. Queda pendiente verificar visualmente las resoluciones móvil/tablet/escritorio y el comportamiento con lectores de pantalla reales antes de publicar. Las pruebas de interacción usan un DOM simulado.

Referencias: [navegación accesible W3C](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/), [BreadcrumbList Google](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [Product Google](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).
