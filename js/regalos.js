/**
 * regalos.js — Interacción de copia de datos de la mesa de regalos
 *
 * Cumplimiento de requerimientos:
 * - Separación de responsabilidades: sin eventos inline en HTML.
 * - Soporte para portapapeles moderno (Clipboard API) con fallback seguro.
 * - Feedback visual y accesible temporal ("¡Copiado!").
 */

(function () {
  'use strict';

  /**
   * Inicializa los botones y elementos de copia en la sección de regalos.
   */
  function iniciarRegalos() {
    const botonesCopiar = document.querySelectorAll('.regalos__btn-copiar[data-copiar]');
    if (!botonesCopiar.length) return;

    botonesCopiar.forEach((boton) => {
      boton.addEventListener('click', async () => {
        const texto = boton.getAttribute('data-copiar');
        if (!texto) return;

        let copiado = false;

        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(texto);
            copiado = true;
          } catch (err) {
            copiado = copiarFallback(texto);
          }
        } else {
          copiado = copiarFallback(texto);
        }

        if (copiado) {
          mostrarFeedbackCopiado(boton);
        }
      });
    });
  }

  /**
   * Método de respaldo tradicional en caso de que Clipboard API no esté disponible.
   * @param {string} texto
   * @returns {boolean}
   */
  function copiarFallback(texto) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      const resultado = document.execCommand('copy');
      document.body.removeChild(textarea);
      return resultado;
    } catch (err) {
      return false;
    }
  }

  /**
   * Muestra feedback visual temporal en el botón presionado.
   * @param {HTMLButtonElement} boton
   */
  function mostrarFeedbackCopiado(boton) {
    const spanTexto = boton.querySelector('span');
    const icono = boton.querySelector('use');
    const textoOriginal = spanTexto ? spanTexto.textContent : '';

    boton.classList.add('copiado');
    if (spanTexto) {
      spanTexto.textContent = '¡Copiado!';
    }
    if (icono) {
      icono.setAttribute('href', '#icono-check');
    }

    setTimeout(() => {
      boton.classList.remove('copiado');
      if (spanTexto) {
        spanTexto.textContent = textoOriginal;
      }
      if (icono) {
        icono.setAttribute('href', '#icono-copiar');
      }
    }, 2000);
  }

  window.iniciarRegalos = iniciarRegalos;
})();
