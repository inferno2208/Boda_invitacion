/**
 * scroll-animations.js — Animaciones al hacer scroll
 *
 * Estrategia de Progressive Enhancement:
 *   1. Si el navegador soporta CSS scroll-driven animations
 *      (Chrome 115+, Edge 115+, Safari 26+), CSS se encarga de todo
 *      y este script no hace nada.
 *   2. Si no (Firefox), usamos IntersectionObserver como fallback
 *      para agregar la clase `.revelar--visible` a los elementos.
 *   3. Si el usuario prefiere movimiento reducido, no se anima nada.
 */

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
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elementos.forEach((el) => observer.observe(el));
}
