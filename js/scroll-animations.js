/**
 * scroll-animations.js — Animaciones al hacer scroll
 *
 * Estrategia de Progressive Enhancement:
 *   1. Si el navegador soporta CSS scroll-driven animations
 *      (Chrome 115+, Edge 115+, Safari 26+), CSS se encarga de todo
 *      y este script solo aplica stagger delays.
 *   2. Si no (Firefox), usamos IntersectionObserver como fallback
 *      para agregar la clase `.revelar--visible` a los elementos.
 *   3. Si el usuario prefiere movimiento reducido, no se anima nada.
 *
 * Stagger effect: elementos dentro de grids/listas aparecen
 * progresivamente con un delay incremental de 80ms.
 */

/**
 * Selectores de contenedores donde se aplica stagger.
 * Los hijos directos con `.revelar` reciben --reveal-delay.
 */
const STAGGER_CONTAINERS = [
  '.countdown__grid',
  '.galeria__grid',
  '.detalles__grid',
  '.dresscode__paleta',
];

/** Delay base en ms entre cada elemento del stagger */
const STAGGER_DELAY_MS = 80;

/**
 * Inicializa las animaciones de scroll.
 */
function iniciarScrollAnimations() {
  /* Respetar preferencia de movimiento reducido */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    /* Mostrar todos los elementos de inmediato sin animación */
    document.querySelectorAll('.revelar').forEach((el) => {
      el.classList.add('revelar--visible');
    });
    return;
  }

  /* Aplicar stagger delays a hijos de contenedores específicos */
  aplicarStagger();

  /* Si el navegador soporta scroll-driven animations, CSS lo maneja */
  if (CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    /* CSS ya tiene la animación definida en @supports. No hacemos nada aquí. */
    return;
  }

  /* Fallback: IntersectionObserver para navegadores sin soporte nativo */
  const elementos = document.querySelectorAll('.revelar');

  if (elementos.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revelar--visible');
          /* Una vez revelado, dejamos de observar para liberar recursos */
          observer.unobserve(entry.target);
        }
      });
    },
    {
      /* Empezar la animación cuando el 15% del elemento sea visible */
      threshold: 0.15,
      /**
       * rootMargin negativo: el elemento debe entrar un poco más
       * para que la animación no se dispare demasiado pronto.
       */
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elementos.forEach((el) => observer.observe(el));
}


/**
 * Aplica un delay incremental (stagger) a los elementos `.revelar`
 * dentro de los contenedores definidos en STAGGER_CONTAINERS.
 *
 * Esto hace que los elementos aparezcan progresivamente en lugar
 * de todos a la vez, creando un efecto de cascada elegante.
 */
function aplicarStagger() {
  STAGGER_CONTAINERS.forEach((selector) => {
    const container = document.querySelector(selector);
    if (!container) return;

    const hijos = container.querySelectorAll(':scope > .revelar, :scope > .countdown__tarjeta');

    hijos.forEach((hijo, index) => {
      hijo.style.setProperty('--reveal-delay', `${index * STAGGER_DELAY_MS}ms`);
    });
  });
}
