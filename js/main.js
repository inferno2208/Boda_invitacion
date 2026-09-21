/**
 * main.js — Punto de entrada
 *
 * Solo inicializa los módulos y conecta eventos del DOM.
 * Sin lógica de negocio propia.
 */

document.addEventListener('DOMContentLoaded', () => {
  iniciarCountdown();
  iniciarRsvp();
  iniciarGaleria();
  iniciarScrollAnimations();
  iniciarScrollArrow();
});

/**
 * Conecta la flecha de scroll del hero con el desplazamiento suave.
 * Este cambio existe porque la regla 1.1 prohíbe onclick en el HTML.
 */
function iniciarScrollArrow() {
  const arrow = document.getElementById('scroll-arrow');
  const target = document.getElementById('countdown');

  if (!arrow || !target) return;

  arrow.addEventListener('click', () => {
    target.scrollIntoView({ behavior: 'smooth' });
  });
}
