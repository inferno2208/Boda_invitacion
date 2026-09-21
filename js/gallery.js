/**
 * gallery.js — Carrusel horizontal fluido y visor modal continuo a pantalla completa
 *
 * Características:
 * 1. Carrusel en sección principal:
 *    - Desplazamiento horizontal con scroll-snap nativo y scroll suave
 *    - Flechas de navegación previa y siguiente
 *    - Paginación interactiva por puntos (dots) sincronizada en tiempo real
 *    - Sincronización con scroll event y scrollsnapchange
 * 2. Visor centrado a pantalla completa (Lightbox):
 *    - Utiliza elemento <dialog> nativo con backdrop-filter blur de alta gama
 *    - Centrado perfecto de la imagen hasta 90vw / 85vh con object-fit contain
 *    - Navegación continua cíclica (1 a 8 y vuelve a 1)
 *    - Contador numérico superior sincronizado ("X / 8")
 *    - Botones integrados anterior y siguiente en el visor
 *    - Navegación por teclado (ArrowLeft, ArrowRight, Escape)
 *    - Gestos táctiles móviles (swipe horizontal con umbral dinámico)
 *    - Transición fluida con fade & scale
 */

/** Índice de la imagen actualmente activa */
let indiceActual = 0;

/** @type {HTMLDialogElement|null} */
let dialogEl = null;

/** @type {HTMLImageElement|null} */
let imagenLightbox = null;

/** @type {HTMLElement|null} */
let contadorLightbox = null;

/** @type {HTMLElement|null} */
let carruselTrack = null;

/** @type {NodeListOf<HTMLButtonElement>|null} */
let dotsPaginacion = null;

/** @type {NodeListOf<HTMLElement>|null} */
let slidesCarrusel = null;

/** Lista estructurada de datos de imágenes */
let listaImagenes = [];

/** Coordenadas táctiles para detección de swipe */
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 40;

/** Bandera para evitar llamadas duplicadas en scroll */
let tickScroll = false;

/**
 * Inicializa el carrusel y el lightbox.
 */
function iniciarGaleria() {
  carruselTrack = document.getElementById('galeria-carrusel');
  dialogEl = document.getElementById('lightbox');
  imagenLightbox = document.getElementById('lightbox-imagen');
  contadorLightbox = document.getElementById('lightbox-contador');

  if (!carruselTrack || !dialogEl || !imagenLightbox) {
    console.error('[gallery] Elementos esenciales de la galería no encontrados en el DOM');
    return;
  }

  slidesCarrusel = carruselTrack.querySelectorAll('.galeria__slide');
  dotsPaginacion = document.querySelectorAll('#carrusel-dots .galeria__dot');

  /* Construir lista de imágenes a partir de los slides */
  listaImagenes = Array.from(slidesCarrusel).map((slide, idx) => {
    const img = slide.querySelector('img');
    return {
      src: img ? img.src : `assets/images/galeria-${idx + 1}.webp`,
      alt: img ? img.alt : `Louis y Fabiola — Fotografía ${idx + 1}`,
    };
  });

  /* 1. CONFIGURACIÓN DEL CARRUSEL EN LA PÁGINA */
  iniciarControlesCarrusel();

  /* 2. CONFIGURACIÓN DEL VISOR MODAL (LIGHTBOX) */
  iniciarControlesLightbox();
}


/* ─── 1. LÓGICA DEL CARRUSEL HORIZONTAL ───────────────────── */

/**
 * Conecta los botones flotantes, los dots de paginación y la sincronización al hacer scroll.
 */
function iniciarControlesCarrusel() {
  const btnPrev = document.getElementById('carrusel-prev');
  const btnNext = document.getElementById('carrusel-next');

  /* Navegación con flechas flotantes */
  if (btnPrev) {
    btnPrev.addEventListener('click', () => desplazarCarrusel(-1));
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => desplazarCarrusel(1));
  }

  /* Clic en los puntos de paginación */
  if (dotsPaginacion) {
    dotsPaginacion.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        navegarSlideCarrusel(idx);
      });
    });
  }

  /* Clic o teclado en cada slide para abrir el visor */
  if (slidesCarrusel) {
    slidesCarrusel.forEach((slide, idx) => {
      slide.addEventListener('click', () => abrirLightbox(idx));

      slide.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrirLightbox(idx);
        }
      });
    });
  }

  /* Sincronización del punto activo mediante evento scroll con requestAnimationFrame */
  carruselTrack.addEventListener('scroll', onCarruselScroll, { passive: true });

  /* Soporte nativo para scrollsnapchange en navegadores modernos */
  if ('onscrollsnapchange' in HTMLElement.prototype) {
    carruselTrack.addEventListener('scrollsnapchange', (e) => {
      const snapTarget = e.snapTargetInline || e.snapTargetBlock;
      if (snapTarget && slidesCarrusel) {
        const targetIdx = Array.from(slidesCarrusel).indexOf(snapTarget);
        if (targetIdx !== -1) {
          actualizarDotActivo(targetIdx);
        }
      }
    });
  }
}

/**
 * Desplaza el carrusel una cantidad adaptada al tamaño del slide visible.
 * @param {number} direccion -1 para anterior, 1 para siguiente
 */
function desplazarCarrusel(direccion) {
  if (!carruselTrack || !slidesCarrusel || slidesCarrusel.length === 0) return;

  const anchoSlide = slidesCarrusel[0].offsetWidth;
  const gap = 24; // 1.5rem
  const pasoDesplazamiento = (anchoSlide + gap) * direccion;

  carruselTrack.scrollBy({
    left: pasoDesplazamiento,
    behavior: 'smooth',
  });
}

/**
 * Lleva la vista del carrusel directamente al slide en el índice especificado.
 * @param {number} idx
 */
function navegarSlideCarrusel(idx) {
  if (!slidesCarrusel || idx < 0 || idx >= slidesCarrusel.length) return;

  slidesCarrusel[idx].scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  });

  actualizarDotActivo(idx);
}

/**
 * Detecta qué slide se encuentra más centrado en el contenedor del carrusel.
 */
function onCarruselScroll() {
  if (tickScroll) return;
  tickScroll = true;

  requestAnimationFrame(() => {
    tickScroll = false;
    if (!carruselTrack || !slidesCarrusel || slidesCarrusel.length === 0) return;

    const trackRect = carruselTrack.getBoundingClientRect();
    const centroTrack = trackRect.left + trackRect.width / 2;

    let menorDistancia = Infinity;
    let slideMasCercano = 0;

    slidesCarrusel.forEach((slide, idx) => {
      const slideRect = slide.getBoundingClientRect();
      const centroSlide = slideRect.left + slideRect.width / 2;
      const distancia = Math.abs(centroTrack - centroSlide);

      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        slideMasCercano = idx;
      }
    });

    actualizarDotActivo(slideMasCercano);
  });
}

/**
 * Actualiza visualmente el dot activo y sus atributos de accesibilidad ARIA.
 * @param {number} idxActivo
 */
function actualizarDotActivo(idxActivo) {
  if (!dotsPaginacion) return;

  dotsPaginacion.forEach((dot, idx) => {
    const esActivo = idx === idxActivo;
    dot.classList.toggle('galeria__dot--activo', esActivo);
    dot.setAttribute('aria-selected', esActivo ? 'true' : 'false');
  });
}


/* ─── 2. LÓGICA DEL VISOR MODAL CONTINUO (LIGHTBOX) ───────── */

/**
 * Conecta botones, teclado, touch swipe y eventos de backdrop del modal.
 */
function iniciarControlesLightbox() {
  const btnAnterior = document.getElementById('lightbox-anterior');
  const btnSiguiente = document.getElementById('lightbox-siguiente');
  const btnCerrar = document.getElementById('lightbox-cerrar');

  if (btnAnterior) btnAnterior.addEventListener('click', anteriorFotoModal);
  if (btnSiguiente) btnSiguiente.addEventListener('click', siguienteFotoModal);
  if (btnCerrar) btnCerrar.addEventListener('click', cerrarLightbox);

  /* Navegación por teclado dentro del diálogo */
  dialogEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      anteriorFotoModal();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      siguienteFotoModal();
    }
  });

  /* Restaurar scroll al cerrar el diálogo nativo */
  dialogEl.addEventListener('close', () => {
    document.body.style.overflow = '';
  });

  /* Cerrar al hacer clic en el backdrop oscuro */
  dialogEl.addEventListener('click', (e) => {
    if (e.target === dialogEl) {
      cerrarLightbox();
    }
  });

  /* Gestos táctiles para móviles (swipe horizontal) */
  const swipeArea = document.getElementById('lightbox-swipe-area') || dialogEl;
  swipeArea.addEventListener('touchstart', handleTouchStart, { passive: true });
  swipeArea.addEventListener('touchend', handleTouchEnd, { passive: true });
}

/**
 * Abre el lightbox en el índice indicado.
 * @param {number} idx
 */
function abrirLightbox(idx) {
  if (!dialogEl || !imagenLightbox || listaImagenes.length === 0) return;
  if (idx < 0 || idx >= listaImagenes.length) return;

  indiceActual = idx;
  imagenLightbox.src = listaImagenes[indiceActual].src;
  imagenLightbox.alt = listaImagenes[indiceActual].alt;
  actualizarContadorModal();

  dialogEl.showModal();
  document.body.style.overflow = 'hidden';

  /* Asegurar que el carrusel en la página también se sincronice */
  navegarSlideCarrusel(indiceActual);
}

/**
 * Cierra el visor de pantalla completa.
 */
function cerrarLightbox() {
  if (!dialogEl) return;
  dialogEl.close();
  document.body.style.overflow = '';
}

/**
 * Retrocede a la foto anterior con navegación continua cíclica.
 */
function anteriorFotoModal() {
  if (listaImagenes.length === 0) return;
  indiceActual = (indiceActual - 1 + listaImagenes.length) % listaImagenes.length;
  cambiarFotoConAnimacion();
}

/**
 * Avanza a la foto siguiente con navegación continua cíclica.
 */
function siguienteFotoModal() {
  if (listaImagenes.length === 0) return;
  indiceActual = (indiceActual + 1) % listaImagenes.length;
  cambiarFotoConAnimacion();
}

/**
 * Aplica animación fluida de desvanecimiento y escala al cambiar de foto.
 */
function cambiarFotoConAnimacion() {
  if (!imagenLightbox) return;

  /* Inicio de transición (fade out & scale down) */
  imagenLightbox.classList.add('lightbox__imagen--fade');

  setTimeout(() => {
    imagenLightbox.src = listaImagenes[indiceActual].src;
    imagenLightbox.alt = listaImagenes[indiceActual].alt;
    actualizarContadorModal();

    /* Sincronizar carrusel de fondo */
    navegarSlideCarrusel(indiceActual);

    /* Fin de transición (fade in & scale up) */
    imagenLightbox.classList.remove('lightbox__imagen--fade');
  }, 160);
}

/**
 * Actualiza el indicador numérico "X / 8" en la esquina superior del visor.
 */
function actualizarContadorModal() {
  if (!contadorLightbox) return;
  contadorLightbox.textContent = `${indiceActual + 1} / ${listaImagenes.length}`;
}

/**
 * Captura las coordenadas iniciales del toque táctil.
 * @param {TouchEvent} e
 */
function handleTouchStart(e) {
  if (e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

/**
 * Evalúa el gesto táctil al finalizar y navega si corresponde a un swipe horizontal.
 * @param {TouchEvent} e
 */
function handleTouchEnd(e) {
  if (e.changedTouches.length !== 1) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  /* Comprobar que el movimiento horizontal sea dominante sobre el vertical */
  if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
  if (Math.abs(deltaX) < Math.abs(deltaY)) return;

  if (deltaX < 0) {
    /* Deslizamiento a la izquierda -> siguiente foto */
    siguienteFotoModal();
  } else {
    /* Deslizamiento a la derecha -> foto anterior */
    anteriorFotoModal();
  }
}
