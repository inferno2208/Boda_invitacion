/**
 * rsvp.js — Formulario de confirmación de asistencia
 *
 * - Validación client-side con early returns
 * - Función única `enviarConfirmacion(datos)` para el servicio externo
 * - Prevención de doble envío con spinner visual
 * - Manejo explícito de errores (validación vs. red)
 * - URL del servicio desde CONFIG_BODA.rsvp.endpointUrl
 * - Campo de preferencias dietéticas incluido
 */

/**
 * Inicializa el formulario RSVP.
 */
function iniciarRsvp() {
  const formulario = document.getElementById('rsvp-formulario');
  if (!formulario) {
    console.error('[rsvp] No se encontró el formulario #rsvp-formulario');
    return;
  }

  const btnSubmit = formulario.querySelector('.rsvp__submit');
  const resultadoEl = document.getElementById('rsvp-resultado');

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Limpiar resultado anterior */
    limpiarResultado(resultadoEl);

    /* Recoger datos del formulario */
    const datos = recogerDatos(formulario);

    /* Validar — early return si hay errores */
    const errores = validarDatos(datos);
    if (errores.length > 0) {
      mostrarErroresValidacion(formulario, errores);
      return;
    }

    /* Prevención de doble envío */
    if (btnSubmit.disabled) return;
    btnSubmit.disabled = true;

    /* Activar spinner visual */
    btnSubmit.classList.add('rsvp__submit--loading');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = 'Enviando...';

    try {
      await enviarConfirmacion(datos);
      mostrarResultado(resultadoEl, 'exito',
        '¡Gracias por confirmar! Nos vemos en la boda 🎉');
      formulario.reset();
    } catch (error) {
      /* Distinguir error de red vs. otros */
      const mensaje = error.name === 'TypeError'
        ? 'Sin conexión a internet. Por favor verifica tu conexión e intenta de nuevo.'
        : 'No pudimos enviar tu confirmación. Intenta de nuevo o escríbenos directamente.';
      mostrarResultado(resultadoEl, 'error', mensaje);
      console.error('[rsvp] Error al enviar:', error);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.classList.remove('rsvp__submit--loading');
      btnSubmit.textContent = textoOriginal;
    }
  });
}


/**
 * Recoge los datos del formulario en un objeto plano.
 * @param {HTMLFormElement} form
 * @returns {{ nombre: string, email: string, asistencia: string, acompanantes: number, dieta: string, mensaje: string }}
 */
function recogerDatos(form) {
  return {
    nombre: form.elements['rsvp-nombre'].value.trim(),
    email: form.elements['rsvp-email'].value.trim(),
    asistencia: form.elements['rsvp-asistencia'].value,
    acompanantes: parseInt(form.elements['rsvp-acompanantes'].value, 10) || 0,
    dieta: form.elements['rsvp-dieta'] ? form.elements['rsvp-dieta'].value : '',
    mensaje: form.elements['rsvp-mensaje'].value.trim(),
  };
}


/**
 * Valida los datos del formulario.
 * @param {{ nombre: string, email: string, asistencia: string, acompanantes: number }} datos
 * @returns {Array<{ campo: string, mensaje: string }>}
 */
function validarDatos(datos) {
  const errores = [];
  const maxAcompanantes = CONFIG_BODA.rsvp.maxAcompanantes;

  if (!datos.nombre) {
    errores.push({ campo: 'rsvp-nombre', mensaje: 'Por favor escribe tu nombre' });
  }

  if (!datos.email) {
    errores.push({ campo: 'rsvp-email', mensaje: 'Por favor escribe tu email' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push({ campo: 'rsvp-email', mensaje: 'El email no parece válido' });
  }

  if (!datos.asistencia) {
    errores.push({ campo: 'rsvp-asistencia', mensaje: 'Por favor selecciona una opción' });
  }

  if (datos.acompanantes < 0) {
    errores.push({ campo: 'rsvp-acompanantes', mensaje: 'El número no puede ser negativo' });
  }

  if (datos.acompanantes > maxAcompanantes) {
    errores.push({
      campo: 'rsvp-acompanantes',
      mensaje: `Máximo ${maxAcompanantes} acompañantes`,
    });
  }

  return errores;
}


/**
 * Muestra errores de validación junto a cada campo.
 * @param {HTMLFormElement} form
 * @param {Array<{ campo: string, mensaje: string }>} errores
 */
function mostrarErroresValidacion(form, errores) {
  /* Limpiar errores anteriores */
  form.querySelectorAll('.rsvp__error').forEach((el) => {
    el.textContent = '';
    el.removeAttribute('role');
  });

  errores.forEach(({ campo, mensaje }) => {
    const errorEl = form.querySelector(`[data-error-for="${campo}"]`);
    if (errorEl) {
      errorEl.textContent = mensaje;
      errorEl.setAttribute('role', 'alert');
    }

    /* Marcar el campo como inválido para lectores de pantalla */
    const input = form.elements[campo];
    if (input) {
      input.setAttribute('aria-invalid', 'true');
    }
  });

  /* Poner foco en el primer campo con error */
  const primerCampoError = form.elements[errores[0].campo];
  if (primerCampoError) {
    primerCampoError.focus();
  }
}


/**
 * Envía la confirmación al servicio externo.
 * ESTA ES LA ÚNICA FUNCIÓN QUE TOCA EL SERVICIO EXTERNO.
 *
 * Si `CONFIG_BODA.rsvp.endpointUrl` está vacío, simula un envío exitoso
 * (modo demo) con un delay de 1.5s.
 *
 * @param {{ nombre: string, email: string, asistencia: string, acompanantes: number, dieta: string, mensaje: string }} datos
 * @returns {Promise<void>}
 */
async function enviarConfirmacion(datos) {
  const url = CONFIG_BODA.rsvp.endpointUrl;

  /* Modo demo: sin URL configurada, simulamos envío exitoso */
  if (!url) {
    console.info('[rsvp] Modo demo: simulando envío exitoso (configura endpointUrl en config.js)');
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }

  const response = await fetch(url, {
    method: CONFIG_BODA.rsvp.metodo,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
  }
}


/**
 * Muestra un mensaje de resultado (éxito o error de red).
 * @param {HTMLElement} el — Contenedor del resultado
 * @param {'exito' | 'error'} tipo
 * @param {string} mensaje
 */
function mostrarResultado(el, tipo, mensaje) {
  if (!el) return;
  el.className = `rsvp__resultado rsvp__resultado--${tipo}`;
  el.textContent = mensaje;
  el.setAttribute('role', 'alert');
}

/**
 * Limpia el mensaje de resultado anterior.
 * @param {HTMLElement} el
 */
function limpiarResultado(el) {
  if (!el) return;
  el.className = 'rsvp__resultado';
  el.textContent = '';
  el.removeAttribute('role');
}
