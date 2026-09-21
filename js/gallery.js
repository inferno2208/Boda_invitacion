/**
 * gallery.js — Galería con lightbox usando <dialog> nativo
 *
 * - Abre un lightbox al hacer clic en una imagen
 * - Navegación con flechas (anterior/siguiente)
 * - Cierre con botón X, tecla Escape (nativo de <dialog>), o clic en backdrop
 * - Navegación con teclado (flechas izquierda/derecha)
 * - Sin dependencias externas
 */

/** Índice de la imagen actualmente mostrada en el lightbox */
let indiceActual = 0;

/** @type {HTMLDialogElement|null} */
let dialogEl = null;

/** @type {HTMLImageElement|null} */
let imagenLightbox = null;

/** @type {string[]} Lista de URLs de las imágenes */
let listaImagenes = [];

/**
 * Inicializa la galería y el lightbox.
 */
function iniciarGaleria() {
  const grid = document.getElementById('galeria-grid');
  dialogEl = document.getElementById('lightbox');
  imagenLightbox = document.getElementById('lightbox-imagen');

  if (!grid || !dialogEl || !imagenLightbox) {
    console.error('[gallery] Faltan elementos del DOM para la galería');
    return;
  }

  /* Recoger todas las URLs de las imágenes del grid */
  const items = grid.querySelectorAll('.galeria__item');
  listaImagenes = Array.from(items).map((item) => {
    const img = item.querySelector('img');
    return img ? img.src : '';
  }).filter(Boolean);

  /* Abrir lightbox al hacer clic en una imagen */
  items.forEach((item, idx) => {
    item.addEventListener('click', () => abrirLightbox(idx));
    /* Accesibilidad: también se puede abrir con teclado */
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirLightbox(idx);
      }
    });
  });

  /* Botones de navegación */
  const btnAnterior = document.getElementById('lightbox-anterior');
  const btnSiguiente = document.getElementById('lightbox-siguiente');
  const btnCerrar = document.getElementById('lightbox-cerrar');

  if (btnAnterior) btnAnterior.addEventListener('click', anteriorImagen);
  if (btnSiguiente) btnSiguiente.addEventListener('click', siguienteImagen);
  if (btnCerrar) btnCerrar.addEventListener('click', cerrarLightbox);

  /* Navegación con teclado */
  dialogEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') anteriorImagen();
    if (e.key === 'ArrowRight') siguienteImagen();
  });

  /* Cerrar al hacer clic en el backdrop (fuera del contenido) */
  dialogEl.addEventListener('click', (e) => {
    if (e.target === dialogEl) {
      cerrarLightbox();
    }
  });
}


/**
 * Abre el lightbox mostrando la imagen en el índice dado.
 * @param {number} idx
 */
function abrirLightbox(idx) {
  if (!dialogEl || !imagenLightbox) return;
  if (idx < 0 || idx >= listaImagenes.length) return;

  indiceActual = idx;
  imagenLightbox.src = listaImagenes[idx];
  imagenLightbox.alt = `Foto ${idx + 1} de ${listaImagenes.length}`;
  dialogEl.showModal();
}


/**
 * Cierra el lightbox.
 */
function cerrarLightbox() {
  if (!dialogEl) return;
  dialogEl.close();
}


/**
 * Muestra la imagen anterior (cíclico).
 */
function anteriorImagen() {
  if (listaImagenes.length === 0) return;
  indiceActual = (indiceActual - 1 + listaImagenes.length) % listaImagenes.length;
  actualizarImagenLightbox();
}


/**
 * Muestra la siguiente imagen (cíclico).
 */
function siguienteImagen() {
  if (listaImagenes.length === 0) return;
  indiceActual = (indiceActual + 1) % listaImagenes.length;
  actualizarImagenLightbox();
}


/**
 * Actualiza la imagen mostrada en el lightbox.
 */
function actualizarImagenLightbox() {
  if (!imagenLightbox) return;
  imagenLightbox.src = listaImagenes[indiceActual];
  imagenLightbox.alt = `Foto ${indiceActual + 1} de ${listaImagenes.length}`;
}
