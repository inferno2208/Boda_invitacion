/**
 * gallery.js — Galería con lightbox usando <dialog> nativo
 *
 * - Abre un lightbox al hacer clic en una imagen
 * - Navegación con flechas (anterior/siguiente)
 * - Cierre con botón X, tecla Escape (nativo de <dialog>), o clic en backdrop
 * - Navegación con teclado (flechas izquierda/derecha)
 * - Navegación táctil con swipe (izquierda/derecha) para móviles
 * - Transición de fade al cambiar imágenes
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

/** Coordenadas del toque inicial para detección de swipe */
let touchStartX = 0;
let touchStartY = 0;

/** Umbral mínimo en px para considerar un gesto como swipe */
const SWIPE_THRESHOLD = 50;

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

  /* Gestos táctiles (swipe) para navegación en móviles */
  dialogEl.addEventListener('touchstart', handleTouchStart, { passive: true });
  dialogEl.addEventListener('touchend', handleTouchEnd, { passive: true });
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
 * Muestra la imagen anterior (cíclico) con transición de fade.
 */
function anteriorImagen() {
  if (listaImagenes.length === 0) return;
  indiceActual = (indiceActual - 1 + listaImagenes.length) % listaImagenes.length;
  actualizarImagenConFade();
}


/**
 * Muestra la siguiente imagen (cíclico) con transición de fade.
 */
function siguienteImagen() {
  if (listaImagenes.length === 0) return;
  indiceActual = (indiceActual + 1) % listaImagenes.length;
  actualizarImagenConFade();
}


/**
 * Actualiza la imagen con una transición de fade suave.
 */
function actualizarImagenConFade() {
  if (!imagenLightbox) return;

  /* Fade out */
  imagenLightbox.classList.add('lightbox__imagen--fade');

  /* Esperar a que termine el fade out, luego cambiar imagen y fade in */
  setTimeout(() => {
    imagenLightbox.src = listaImagenes[indiceActual];
    imagenLightbox.alt = `Foto ${indiceActual + 1} de ${listaImagenes.length}`;
    imagenLightbox.classList.remove('lightbox__imagen--fade');
  }, 200);
}


/**
 * Registra las coordenadas iniciales del toque.
 * @param {TouchEvent} e
 */
function handleTouchStart(e) {
  if (e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}


/**
 * Calcula la dirección del swipe y navega según corresponda.
 * Solo actúa si el desplazamiento horizontal supera el umbral
 * y es mayor que el desplazamiento vertical (evita conflictos con scroll).
 * @param {TouchEvent} e
 */
function handleTouchEnd(e) {
  if (e.changedTouches.length !== 1) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  /* Solo considerar swipe si el movimiento horizontal es dominante */
  if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
  if (Math.abs(deltaX) < Math.abs(deltaY)) return;

  if (deltaX < 0) {
    /* Swipe izquierda → siguiente */
    siguienteImagen();
  } else {
    /* Swipe derecha → anterior */
    anteriorImagen();
  }
}
