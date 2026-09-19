# FOX GAMER

Tienda estática en español para **foxgamer.co**, con categorías, catálogo filtrable y fichas individuales. Sin dependencias de producción ni servicios de terceros para cargar la web.

## Revisión del proyecto original

La rama main en e1b7fd842d02d82923088b6216fc155360a5c9a9 contenía únicamente index.html (3.574 bytes). No había catálogo de unidades, imágenes, precios, WhatsApp, backend, pruebas ni configuración de Netlify versionada. Se mantienen los contenidos sobre PlayStation, Xbox, monitores y accesorios, condiciones de producto, transferencia, efectivo, crédito/financiación y envíos nacionales.

No se han cambiado ajustes de Netlify, DNS ni dominio. Los HTML generados se versionan en la raíz para mantener el despliegue estático actual. No hace falta cambiar el directorio de publicación ni añadir una regla SPA.

## Desarrollo

Node.js 20 o posterior:

    npm run build
    npm test
    npm start

Abrir http://127.0.0.1:4173. No es necesario npm install. Después de editar datos o plantillas, ejecutar build y guardar también los HTML generados.

- data/store.json: datos comerciales y unidades reales.
- scripts/build.mjs: generación de inicio, categorías, fichas, sitemap y 404.
- scripts/catalog.mjs: validación y utilidades.
- assets/: CSS, JavaScript progresivo e ilustraciones SVG locales.
- tests/: validación de datos, fichas, rutas y estados de venta.

## Activar ventas

El catálogo actual contiene referencias importadas. Los precios, disponibilidad y condiciones requieren confirmación comercial; esta revisión no los modifica.

1. Indicar whatsapp con código de país, solo dígitos, por ejemplo el formato colombiano 57 seguido del móvil real.
2. Agregar productos reales a products con estos campos:

    {
      "slug": "identificador-unico",
      "name": "Nombre comercial de la unidad",
      "category": "consolas",
      "brand": "Marca",
      "condition": "Usado",
      "conditionNotes": "Estado real y señales de uso de esta unidad",
      "description": "Descripción comercial verificable",
      "price": null,
      "availability": "inquiry",
      "includes": "Contenido real de la caja",
      "warranty": "Garantía y condiciones confirmadas",
      "image": "/assets/products/foto-real.webp"
    }

- category: consolas, videojuegos, accesorios o apple.
- condition: exactamente Nuevo, Usado o Exhibición.
- price: entero positivo en COP; null muestra Precio por confirmar.
- availability: available, inquiry o soldout. Agotado no muestra llamada a comprar.
- image: opcional, ruta local. Usar fotos reales optimizadas, preferiblemente WebP.
- Unidades con distinta condición deben tener slugs separados.

El catálogo importado desde WhatsApp usa tres variantes por referencia: Nuevo conserva el precio publicado, Exhibición aplica $150.000 de descuento y Usado aplica $200.000 de descuento. Confirma que el costo y margen de cada unidad soporten estos descuentos.

3. Ejecutar build y test antes de subir los cambios.
4. Confirmar políticas de garantía, cambios/devoluciones, identidad comercial y contacto antes de operar ventas. No se inventaron textos legales ni datos de la empresa.

## Alcance comercial

La conversión está preparada por WhatsApp, con mensaje de producto y enlace a su ficha. No hay cobro en línea, cuentas, carrito, stock sincronizado ni pasarela de pagos. Las opciones de pago son informativas y proceden del sitio original. La financiación sigue sujeta a aprobación.

La web no solicita datos personales ni integra analítica o cookies de terceros. Al pulsar WhatsApp, el visitante sale al proveedor.

## SEO y accesibilidad

HTML estático indexable, canónicas foxgamer.co, sitemap, robots, metadatos Open Graph, Organization y Product/Offer solo para datos existentes. No se generan valoraciones, precios ni disponibilidad ficticios. Estado Exhibición se conserva visible y se representa como UsedCondition en Schema.org.

Navegación semántica, salto al contenido, etiquetas en formularios, foco visible, menú operable con teclado/Escape, anuncios de resultados y movimiento reducido. Sin JavaScript se mantienen contenido, categorías y fichas; los filtros requieren JavaScript.

## Política de imágenes y fuentes (revisión 2026-09-19)

Fuente comercial: data/store.json. Plantillas: scripts/build.mjs. Validación: scripts/catalog.mjs. Interacción y diseño: assets/app.js, assets/styles.css y assets/brand.css. Los HTML de inicio, categorías, productos y 404, robots.txt y sitemap.xml son generados. original.html es un archivo histórico, no una plantilla.

verifiedImages registra coincidencias exactas revisadas visualmente. Una imagen sin evidencia impide el build. Las fotos pendientes usan image: null; no se sustituyen por fotos de familias parecidas. La foto identifica el modelo, no acredita estado, existencias ni accesorios de la unidad. No ejecutar los antiguos scripts de importación/asignación como parte del build: contienen asignaciones por familia o rotación, precios calculados y datos históricos. El validador bloqueará imágenes fuera del registro.

Ejecutar npm run audit:images, npm run build y npm test. reports/image-review.json conserva por slug la imagen retirada y reports/pending-photos.md enumera referencias pendientes. Los HTML antiguos sin producto actual se regeneran como páginas de consulta no indexables, conservando las URLs. No editar manualmente HTML generado.
