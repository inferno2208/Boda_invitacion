/**
 * countdown.js — Cuenta regresiva hasta la fecha de la boda
 *
 * Lee la fecha desde CONFIG_BODA (config.js).
 * Muestra días, horas, minutos, segundos restantes.
 * Si la fecha ya pasó, muestra "¡Ya nos casamos!".
 */

/**
 * Calcula el tiempo restante hasta una fecha objetivo.
 * Función pura: no modifica estado externo.
 *
 * @param {string} fechaIso — Fecha objetivo en formato ISO 8601
 * @returns {{ dias: number, horas: number, minutos: number, segundos: number, terminado: boolean }}
 */
function calcularTiempoRestante(fechaIso) {
  const ahora = Date.now();
  const objetivo = new Date(fechaIso).getTime();
  const diferencia = objetivo - ahora;

  if (diferencia <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: true };
  }

  return {
    dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diferencia / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diferencia / (1000 * 60)) % 60),
    segundos: Math.floor((diferencia / 1000) % 60),
    terminado: false,
  };
}

/**
 * Formatea un número a 2 dígitos mínimo (ej. 5 → "05").
 * @param {number} n
 * @returns {string}
 */
function formatearDosDigitos(n) {
  return String(n).padStart(2, '0');
}

/**
 * Inicializa la cuenta regresiva.
 * Busca los elementos del DOM y arranca el intervalo.
 */
function iniciarCountdown() {
  const contenedor = document.getElementById('countdown-grid');
  const mensajeFinal = document.getElementById('countdown-mensaje-final');

  if (!contenedor) {
    console.error('[countdown] No se encontró el elemento #countdown-grid');
    return;
  }

  const elDias = document.getElementById('countdown-dias');
  const elHoras = document.getElementById('countdown-horas');
  const elMinutos = document.getElementById('countdown-minutos');
  const elSegundos = document.getElementById('countdown-segundos');

  if (!elDias || !elHoras || !elMinutos || !elSegundos) {
    console.error('[countdown] Faltan elementos de dígitos del countdown');
    return;
  }

  const fechaIso = CONFIG_BODA.fecha.iso;

  function actualizar() {
    const tiempo = calcularTiempoRestante(fechaIso);

    if (tiempo.terminado) {
      contenedor.setAttribute('hidden', '');
      if (mensajeFinal) {
        mensajeFinal.classList.remove('countdown__mensaje-final--oculto');
      }
      return true; // Señal para detener el intervalo
    }

    actualizarDigito(elDias, tiempo.dias);
    actualizarDigito(elHoras, formatearDosDigitos(tiempo.horas));
    actualizarDigito(elMinutos, formatearDosDigitos(tiempo.minutos));
    actualizarDigito(elSegundos, formatearDosDigitos(tiempo.segundos));

    return false;
  }

  /**
   * Actualiza un dígito en el DOM con micro-animación sutil.
   * Solo anima si el valor cambió, para evitar reflows innecesarios.
   */
  function actualizarDigito(el, nuevoValor) {
    const valorStr = String(nuevoValor);
    if (el.textContent === valorStr) return;

    el.textContent = valorStr;
    /* Micro-animación: escala sutil al cambiar */
    el.style.transform = 'scale(1.08)';
    el.style.opacity = '0.7';

    /* Usar requestAnimationFrame para la transición de vuelta */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'scale(1)';
        el.style.opacity = '1';
      });
    });
  }

  /* Primera actualización inmediata */
  const terminado = actualizar();

  /* Intervalo de 1 segundo, se detiene si la fecha pasó */
  if (!terminado) {
    const intervalo = setInterval(() => {
      if (actualizar()) {
        clearInterval(intervalo);
      }
    }, 1000);
  }
}
