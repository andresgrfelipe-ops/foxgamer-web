import {escapeHTML as e,whatsappURL} from './catalog.mjs';
import {gameGallery} from './game-gallery.mjs';
export function gameDirectory(store){
 const url=whatsappURL(store.whatsapp,'Hola FOX GAMER, quiero consultar un juego. ¿Me ayudas a confirmar título, plataforma, formato, precio y disponibilidad?');
 return `${gameGallery(store)}<details class="wrap directory-disclosure"><summary>Buscar otros títulos y clásicos · PS3, PS2 y Xbox 360</summary><section class="wrap section games-directory" id="directorio-juegos" data-whatsapp="${e(store.whatsapp)}" aria-labelledby="games-title">
 <p class="eyebrow">DE LOS CLÁSICOS A LA NUEVA GENERACIÓN</p><h2 id="games-title">Encuentra tu próximo juego</h2>
 <p class="muted">Busca títulos de PS5, PS4, PS3, PS2 y Xbox 360. Consulta con FOX GAMER la disponibilidad, el formato, la región y el precio de cada juego.</p>
 <form id="games-search" class="games-search" role="search" aria-label="Buscar juegos por plataforma">
 <label>Nombre del juego<input id="game-title" type="search" maxlength="100" placeholder="Prueba God of War, Halo o GTA…" autocomplete="off"></label>
 <label>Plataforma<select id="game-platform"><option value="">Todas las plataformas</option>${['PS5','PS4','PS3','PS2','Xbox 360'].map(p=>`<option>${p}</option>`).join('')}</select></label>
 <button class="button" type="submit">Buscar juegos</button><button class="button secondary" type="reset">Limpiar</button></form>
 <p id="games-count" role="status" aria-live="polite">Cargando directorio de juegos…</p>
 <div id="games-results" class="games-results"></div>
 <nav id="games-pagination" class="games-pagination" aria-label="Páginas del directorio" hidden><button id="games-prev" class="button secondary" type="button">Anterior</button><span id="games-page"></span><button id="games-next" class="button secondary" type="button">Siguiente</button></nav>
 <p class="small">Directorio de títulos para consulta. Aparecer en esta lista no indica existencias en tienda. Ediciones y formatos pueden variar según región.</p>
 <p><a class="text-link" href="${e(url)}" target="_blank" rel="noopener noreferrer">¿No encuentras tu juego? Consultar por WhatsApp</a></p>
 <details><summary>Fuentes del directorio</summary><p class="small">Títulos y plataformas recopilados de las listas de Wikipedia, consultadas el 19/09/2026. Pueden existir omisiones o diferencias regionales. Listas bajo CC BY-SA 4.0.</p><div id="games-sources"></div></details>
 <noscript><p>Activa JavaScript para buscar en el directorio o consulta un título por WhatsApp. Más abajo encontrarás las fichas de la tienda.</p></noscript>
 </section></details><link rel="stylesheet" href="/assets/game-directory.css"><script src="/assets/game-directory.js" defer></script>`;
}
