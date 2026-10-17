/**
 * intro-carta.js — Animación inicial con la secuencia de imágenes de Carta_heros
 *
 * Cumplimiento de requerimientos:
 * - Utiliza directamente los frames ubicados en assets/Carta_heros/
 *   (gemini_generated_video_0ca878b4_007.jpg a ..._073.jpg).
 * - Renderiza en <canvas> de alto rendimiento a 24 fps constantes.
 * - Soporta navegación por teclado (Enter, Espacio) y toque móvil.
 * - Persistencia: si el invitado ya abrió la carta en esta sesión, no se repite.
 */

(function () {
  'use strict';

  const CONFIG_FRAMES = {
    carpeta: 'assets/Carta_heros',
    prefijo: 'gemini_generated_video_0ca878b4_',
    extension: '.jpg',
    frameInicial: 7,
    frameFinal: 73,
    digitos: 3,
    fps: 24,
    ancho: 1920,
    alto: 1080,
  };

  /** Almacén de imágenes precargadas */
  const imagenes = [];
  let animando = false;
  let cartaAbierta = false;

  /**
   * Formatea el número de frame a N dígitos con ceros iniciales.
   * @param {number} num
   * @returns {string}
   */
  function pad(num) {
    return String(num).padStart(CONFIG_FRAMES.digitos, '0');
  }

  /**
   * Retorna la ruta relativa de un frame específico.
   * @param {number} num
   * @returns {string}
   */
  function rutaFrame(num) {
    return `${CONFIG_FRAMES.carpeta}/${CONFIG_FRAMES.prefijo}${pad(num)}${CONFIG_FRAMES.extension}`;
  }

  /**
   * Inicializa la intro de la carta.
   */
  function iniciarIntroCarta() {
    const contenedorIntro = document.getElementById('intro-carta');
    const btnAbrir = document.getElementById('intro-abrir');
    const canvas = document.getElementById('intro-canvas');
    const frameFallback = document.getElementById('intro-frame');

    if (!contenedorIntro || !btnAbrir) return;

    /* Persistencia: si ya se abrió en esta sesión, remover intro de inmediato */
    if (sessionStorage.getItem('boda_carta_abierta') === 'true') {
      contenedorIntro.style.display = 'none';
      document.documentElement.classList.remove('intro-bloqueo');
      return;
    }

    /* Bloquear scroll mientras la carta no se haya abierto */
    document.documentElement.classList.add('intro-bloqueo');

    /* Contexto 2D del canvas */
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    const totalFrames = CONFIG_FRAMES.frameFinal - CONFIG_FRAMES.frameInicial + 1;

    /* Precargar el primer frame de inmediato */
    const imgInicial = new Image();
    imgInicial.src = rutaFrame(CONFIG_FRAMES.frameInicial);
    imgInicial.onload = () => {
      if (ctx && canvas) {
        canvas.width = imgInicial.naturalWidth || CONFIG_FRAMES.ancho;
        canvas.height = imgInicial.naturalHeight || CONFIG_FRAMES.alto;
        ctx.drawImage(imgInicial, 0, 0, canvas.width, canvas.height);
        if (frameFallback) frameFallback.style.display = 'none';
      }
    };
    imagenes[0] = imgInicial;

    /* Precargar el resto de la secuencia en segundo plano */
    for (let i = 1; i < totalFrames; i++) {
      const numFrame = CONFIG_FRAMES.frameInicial + i;
      const img = new Image();
      img.src = rutaFrame(numFrame);
      imagenes[i] = img;
    }

    /**
     * Ejecuta la animación de apertura de la carta frame por frame.
     */
    function abrirCarta() {
      if (animando || cartaAbierta) return;
      animando = true;

      contenedorIntro.classList.add('intro--abriendo');

      /* Reproducir música opcional si existe en el DOM */
      const audio = document.getElementById('wedding-music');
      if (audio && typeof audio.play === 'function') {
        audio.play().catch(() => {});
      }

      /* Si el usuario tiene activo prefers-reduced-motion, saltar animación */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finalizarApertura(contenedorIntro);
        return;
      }

      let inicioTiempo = null;
      const duracionPorFrame = 1000 / CONFIG_FRAMES.fps;
      const duracionTotal = totalFrames * duracionPorFrame;

      function renderFrame(tiempoActual) {
        if (!inicioTiempo) inicioTiempo = tiempoActual;
        const transcurrido = tiempoActual - inicioTiempo;

        /* Calcular el índice actual según el tiempo transcurrido a 24 fps */
        const indice = Math.min(totalFrames - 1, Math.floor(transcurrido / duracionPorFrame));

        /* Dibujar el frame en canvas o fallback */
        const imgFrame = imagenes[indice];
        if (imgFrame && imgFrame.complete && imgFrame.naturalWidth > 0) {
          if (ctx && canvas) {
            ctx.drawImage(imgFrame, 0, 0, canvas.width, canvas.height);
          } else if (frameFallback) {
            frameFallback.src = imgFrame.src;
          }
        }

        if (transcurrido < duracionTotal) {
          requestAnimationFrame(renderFrame);
        } else {
          /* Secuencia completada: mostrar frame final y desvanecer hacia la invitación */
          setTimeout(() => {
            finalizarApertura(contenedorIntro);
          }, 400);
        }
      }

      requestAnimationFrame(renderFrame);
    }

    /**
     * Finaliza la apertura, revela la página y almacena en sessionStorage.
     * @param {HTMLElement} introEl
     */
    function finalizarApertura(introEl) {
      cartaAbierta = true;
      sessionStorage.setItem('boda_carta_abierta', 'true');
      introEl.classList.add('intro--abierta');
      document.documentElement.classList.remove('intro-bloqueo');

      /* Disparar evento para que otros módulos sepan que la página es visible */
      window.dispatchEvent(new CustomEvent('boda:invitacion-abierta'));

      setTimeout(() => {
        introEl.style.display = 'none';
      }, 1100);
    }

    /* Eventos de click y teclado */
    btnAbrir.addEventListener('click', (e) => {
      e.preventDefault();
      abrirCarta();
    });

    btnAbrir.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirCarta();
      }
    });
  }

  /* Exponer globalmente para main.js */
  window.iniciarIntroCarta = iniciarIntroCarta;
})();
