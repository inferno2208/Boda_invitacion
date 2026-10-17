/**
 * =========================================================================
 * GOOGLE APPS SCRIPT — CONFIRMACIÓN DE ASISTENCIA (RSVP)
 * Boda Louis & Fabiola
 * Planilla vinculada:
 * https://docs.google.com/spreadsheets/d/1xh57iG_DeFoPKmmtBWYgfKLtis63bJ-7fUCybuDRCgs/edit
 * =========================================================================
 *
 * PASOS PARA ACTIVAR LA CONEXIÓN (Solo toma 2 minutos):
 *
 * 1. Abre tu planilla de Google Sheets en el navegador:
 *    https://docs.google.com/spreadsheets/d/1xh57iG_DeFoPKmmtBWYgfKLtis63bJ-7fUCybuDRCgs/edit
 *
 * 2. En el menú superior de la planilla, haz clic en:
 *    Extensiones > Apps Script
 *
 * 3. Borra cualquier código que aparezca en el editor y PEGA TODO ESTE ARCHIVO.
 *
 * 4. Haz clic en el icono de guardar (💾 Guardar proyecto).
 *
 * 5. Haz clic en el botón azul superior "Implementar" (Deploy) > "Nueva implementación" (New deployment).
 *
 * 6. En el icono de engranaje (⚙️ Seleccionar tipo), elige: "Aplicación web" (Web app).
 *
 * 7. Configura estos campos:
 *    - Descripción: RSVP Boda Louis y Fabiola
 *    - Ejecutar como: Yo (tu correo de Google)
 *    - Quién tiene acceso: Cualquier usuario (Anyone)  <--- ¡MUY IMPORTANTE!
 *
 * 8. Haz clic en "Implementar" (Deploy).
 *    (Si Google te solicita "Revisar permisos", selecciona tu cuenta, haz clic en
 *     "Configuración avanzada" / "Advanced" y luego en "Ir a proyecto (no seguro)").
 *
 * 9. Copia la "URL de la aplicación web" (termina en "/exec", ejemplo:
 *    https://script.google.com/macros/s/AKfycbx.../exec).
 *
 * 10. Abre el archivo `js/config.js` de la invitación y pega esa URL en:
 *     CONFIG_BODA.rsvp.endpointUrl = 'https://script.google.com/macros/s/.../exec';
 *
 * ¡Listo! Cada vez que un invitado confirme su asistencia, se agregará
 * automáticamente una fila con: Fecha, Nombre, Email, ¿Asistirá? y Mensaje.
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Evitar colisiones si dos personas envían al mismo segundo (espera hasta 30s)
  lock.tryLock(30000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Si la hoja está vacía, crear encabezados automáticamente
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Fecha y hora',
        'Nombre completo',
        'Correo electrónico',
        '¿Asistirá?',
        'Mensaje para los novios'
      ]);

      // Formato a la fila de encabezados
      var cabecera = sheet.getRange(1, 1, 1, 5);
      cabecera.setFontWeight('bold');
      cabecera.setBackground('#5a6e4e'); // Verde oliva boda
      cabecera.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // Procesar datos enviados (soporta JSON vía text/plain o multipart)
    var datos = {};
    if (e && e.postData && e.postData.contents) {
      try {
        datos = JSON.parse(e.postData.contents);
      } catch (err) {
        datos = e.parameter || {};
      }
    } else if (e && e.parameter) {
      datos = e.parameter;
    }

    var fecha = datos.fecha || Utilities.formatDate(new Date(), 'America/Caracas', 'dd/MM/yyyy HH:mm:ss');
    var nombre = datos.nombre || 'Sin nombre';
    var email = datos.email || 'Sin correo';
    var asistencia = datos.asistencia || (datos.asistenciaCodigo === 'si' ? 'Sí, asistirá' : 'No asistirá');
    var mensaje = datos.mensaje || '';

    // Agregar la fila a la planilla
    sheet.appendRow([
      fecha,
      nombre,
      email,
      asistencia,
      mensaje
    ]);

    // Responder con éxito
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Confirmación registrada correctamente en la planilla.'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Para verificar fácilmente desde el navegador que la aplicación web está activa
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      message: 'El servicio de confirmación RSVP para la boda de Louis y Fabiola está en línea.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
