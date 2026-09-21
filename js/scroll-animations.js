/**
 * scroll-animations.js — Failsafe implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Asegurar visibilidad inmediata de todo el contenido crítico
    document.querySelectorAll('section, main, .hero, .card, .container, .revelar').forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'none';
    });

    // Observer seguro de una sola vía (sin remoción de clases)
    if ('IntersectionObserver' in window) {
        const appearObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Dejar de observar inmediatamente
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

        document.querySelectorAll('.reveal-on-scroll, .revelar').forEach(el => {
            appearObserver.observe(el);
        });
    }
});
