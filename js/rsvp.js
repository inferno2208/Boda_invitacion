/**
 * rsvp.js — Formulario de confirmación de asistencia
 *
 * - Validación client-side con early returns
 * - Eliminada la opción de pases/acompañantes según especificación
 * - Función única `enviarConfirmacion(datos)` para el servicio externo
 * - Prevención de doble envío con spinner visual
 * - Manejo explícito de errores (validación vs. red)
 * - URL del servicio desde CONFIG_BODA.rsvp.endpointUrl
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
      /* Distinguir error de red vs. configuración de planilla vs. otros */
      let mensaje = 'No pudimos enviar tu confirmación. Intenta de nuevo o escríbenos directamente.';
      if (error.name === 'TypeError') {
        mensaje = 'Sin conexión a internet o el servidor no respondió. Por favor verifica tu conexión e intenta de nuevo.';
      } else if (error.message && (error.message.includes('Apps Script') || error.message.includes('Google Sheets') || error.message.includes('planilla'))) {
        mensaje = error.message;
      }
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
 * @returns {{ nombre: string, email: string, asistencia: string, mensaje: string }}
 */
function recogerDatos(form) {
  return {
    nombre: form.elements['rsvp-nombre'] ? form.elements['rsvp-nombre'].value.trim() : '',
    email: form.elements['rsvp-email'] ? form.elements['rsvp-email'].value.trim() : '',
    asistencia: form.elements['rsvp-asistencia'] ? form.elements['rsvp-asistencia'].value : '',
    mensaje: form.elements['rsvp-mensaje'] ? form.elements['rsvp-mensaje'].value.trim() : '',
  };
}


/**
 * Valida los datos del formulario.
 * @param {{ nombre: string, email: string, asistencia: string }} datos
 * @returns {Array<{ campo: string, mensaje: string }>}
 */
function validarDatos(datos) {
  const errores = [];

  if (!datos.nombre) {
    errores.push({ campo: 'rsvp-nombre', mensaje: 'Por favor escribe tu nombre completo' });
  }

  if (!datos.email) {
    errores.push({ campo: 'rsvp-email', mensaje: 'Por favor escribe tu correo electrónico' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push({ campo: 'rsvp-email', mensaje: 'El formato de correo no es válido' });
  }

  if (!datos.asistencia) {
    errores.push({ campo: 'rsvp-asistencia', mensaje: 'Por favor selecciona si asistirás' });
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
 * Envía la confirmación al servicio externo (Google Sheets / Apps Script o similar).
 * ESTA ES LA ÚNICA FUNCIÓN QUE TOCA EL SERVICIO EXTERNO.
 *
 * Si `CONFIG_BODA.rsvp.endpointUrl` está vacío, simula un envío exitoso
 * (modo demo) con un delay de 1.5s.
 *
 * @param {{ nombre: string, email: string, asistencia: string, mensaje: string }} datos
 * @returns {Promise<void>}
 */
async function enviarConfirmacion(datos) {
  const url = (CONFIG_BODA.rsvp.endpointUrl || '').trim();

  /* Modo demo: sin URL configurada, simulamos envío exitoso */
  if (!url) {
    console.info('[rsvp] Modo demo: simulando envío exitoso (configura endpointUrl en config.js)');
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }

  /* Verificación si se ingresó directamente el enlace de Google Sheets */
  if (url.includes('docs.google.com/spreadsheets')) {
    throw new Error(
      'Para conectar Google Sheets se requiere la URL de la aplicación web de Apps Script (terminada en /exec). Por favor revisa las instrucciones en google-sheets-script.js.'
    );
  }

  /* Formatear datos para la fila de Google Sheets */
  const payload = {
    fecha: new Date().toLocaleString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    nombre: datos.nombre,
    email: datos.email,
    asistencia: datos.asistencia === 'si' ? 'Sí, asistirá' : 'No asistirá',
    asistenciaCodigo: datos.asistencia,
    mensaje: datos.mensaje || '',
  };

  const esGoogleScript = url.includes('script.google.com');

  /*
   * Para Google Apps Script usamos text/plain;charset=utf-8 y redirect: 'follow'.
   * Esto previene el error CORS preflight (OPTIONS 405) y sigue la redirección 302 nativa de Google.
   */
  const fetchOptions = esGoogleScript
    ? {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      }
    : {
        method: CONFIG_BODA.rsvp.metodo || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      };

  const response = await fetch(url, fetchOptions);

  /* Si el navegador devolvió una respuesta opaca (fallback seguro) */
  if (response.type === 'opaque') {
    return;
  }

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
  }

  try {
    const json = await response.json();
    if (json && json.status === 'error') {
      throw new Error(json.message || 'Error al registrar la confirmación en la planilla.');
    }
  } catch (err) {
    if (err.message && err.message.includes('Error al registrar')) {
      throw err;
    }
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
