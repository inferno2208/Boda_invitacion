/**
 * calendario.js — Generación de enlace para agendar el evento en Google Calendar / Apple Calendar
 *
 * Lee la fecha y lugar centralizados desde CONFIG_BODA (config.js).
 */

(function () {
  'use strict';

  function iniciarCalendario() {
    const btnCalendario = document.getElementById('btn-calendario');
    if (!btnCalendario || typeof CONFIG_BODA === 'undefined') return;

    const fechaIso = CONFIG_BODA.fecha.iso; // '2027-02-27T16:00:00'
    const titulo = `Boda de ${CONFIG_BODA.novios.nombreCompleto}`;
    const lugar = `${CONFIG_BODA.ceremonia.lugar}, ${CONFIG_BODA.ceremonia.direccion}`;
    const detalles = `Celebración del matrimonio de ${CONFIG_BODA.novios.nombreCompleto}. ¡Esperamos celebrar juntos este gran día! Más información: https://inferno2208.github.io/Boda_invitacion/`;

    /* Calcular fechas en formato UTC para Google Calendar (YYYYMMDDTHHMMSSZ) */
    const fechaInicio = new Date(fechaIso);
    // Asumir duración aproximada de 8 horas para el evento completo
    const fechaFin = new Date(fechaInicio.getTime() + 8 * 60 * 60 * 1000);

    function formatearUtc(date) {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    }

    const startUtc = formatearUtc(fechaInicio);
    const endUtc = formatearUtc(fechaFin);

    const urlGoogleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      titulo
    )}&dates=${startUtc}/${endUtc}&details=${encodeURIComponent(detalles)}&location=${encodeURIComponent(lugar)}`;

    btnCalendario.href = urlGoogleCalendar;
  }

  window.iniciarCalendario = iniciarCalendario;
})();
