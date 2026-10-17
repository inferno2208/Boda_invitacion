/**
 * scroll-animations.js — Animaciones suaves al hacer scroll (IntersectionObserver)
 *
 * Principio: Progressive enhancement
 * - Si no hay soporte para IntersectionObserver, todo el contenido permanece visible por defecto.
 * - Solo si está disponible se añade la clase `js-revelar` a <html>.
 */

function iniciarAnimacionesScroll() {
  if (!('IntersectionObserver' in window)) return;

  // Activa en CSS los estados iniciales de opacidad y desplazamiento
  document.documentElement.classList.add('js-revelar');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px',
  });

  document.querySelectorAll('.revelar').forEach((el) => {
    observer.observe(el);
  });
}

window.iniciarAnimacionesScroll = iniciarAnimacionesScroll;
