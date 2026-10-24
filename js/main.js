/**
 * main.js — Punto de entrada
 *
 * Solo inicializa los módulos y conecta eventos del DOM.
 * Sin lógica de negocio propia.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof iniciarIntroCarta === 'function') {
    iniciarIntroCarta();
  }
  if (typeof iniciarCountdown === 'function') {
    iniciarCountdown();
  }
  if (typeof iniciarCalendario === 'function') {
    iniciarCalendario();
  }
  if (typeof iniciarRsvp === 'function') {
    iniciarRsvp();
  }
  if (typeof iniciarGaleria === 'function') {
    iniciarGaleria();
  }
  if (typeof iniciarRegalos === 'function') {
    iniciarRegalos();
  }
  if (typeof iniciarScrollArrow === 'function') {
    iniciarScrollArrow();
  }
  if (typeof iniciarAnimacionesScroll === 'function') {
    iniciarAnimacionesScroll();
  }
});

/**
 * Conecta la flecha de scroll del hero con el desplazamiento suave.
 * Separación de responsabilidades: sin eventos onclick inline en HTML.
 */
function iniciarScrollArrow() {
  const arrow = document.getElementById('scroll-arrow');
  const target = document.getElementById('countdown');

  if (!arrow || !target) return;

  arrow.addEventListener('click', () => {
    target.scrollIntoView({ behavior: 'smooth' });
  });
}
