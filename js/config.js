/**
 * config.js — Datos centralizados de la boda
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS EDITAR             ║
 * ║  para cambiar nombres, fechas, textos, direcciones, etc.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Todos los módulos JS leen de aquí. Ningún dato de la boda
 * está repetido en otro archivo.
 */

const CONFIG_BODA = {
  /* ─── Pareja ────────────────────────────────────────────── */
  novios: {
    nombre1: 'Louis',
    nombre2: 'Fabiola',
    /** Se usa en el hero y el footer */
    nombreCompleto: 'Louis & Fabiola',
    hashtag: '#LouisYFabi2027',
  },

  /* ─── Fecha y hora ──────────────────────────────────────── */
  fecha: {
    /** ISO 8601 — la cuenta regresiva se calcula desde aquí */
    iso: '2027-02-27T17:00:00',
    /** Texto para mostrar en el hero */
    textoCorto: '27 . 02 . 2027',
    /** Texto largo para el footer u otros contextos */
    textoLargo: '27 de febrero de 2027',
  },

  /* ─── Ceremonia ─────────────────────────────────────────── */
  ceremonia: {
    titulo: 'Ceremonia',
    hora: '17:00 h',
    lugar: 'Posada el pozo',
    direccion: 'Carretera La Puerta - La Lagunita, La Puerta 3106, Trujillo',
    /** URL de Google Maps para el botón "Cómo llegar" */
    mapaUrl: 'https://maps.app.goo.gl/gBVBAStTH312Dewk7',
    /** URL de iframe embebido (con loading="lazy") */
    mapaEmbed: 'https://maps.app.goo.gl/gBVBAStTH312Dewk7',
  },

  /* ─── Recepción ─────────────────────────────────────────── */
  recepcion: {
    titulo: 'Recepción',
    hora: '19:00 h',
    lugar: 'Hacienda Los Olivos',
    direccion: 'Carretera Vieja, km 5 — Ciudad, Estado',
    mapaUrl: 'https://maps.google.com/?q=Hacienda+Los+Olivos',
    mapaEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.0!2d-99.16!3d19.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzEyLjAiTiA5OcKwMDknMzYuMCJX!5e0!3m2!1ses!2smx!4v1',
  },

  /* ─── Textos ────────────────────────────────────────────── */
  textos: {
    heroFrase: '¡Nos casamos!',
    heroSubfrase: 'Y queremos compartir este día tan especial contigo',

    historiaTitle: 'Nuestra Historia',
    historiaTexto: `Nos conocimos una tarde de otoño y desde entonces
supimos que este momento llegaría. Después de años de aventuras juntos,
de risas compartidas y sueños construidos, estamos listos para dar el
paso más importante de nuestras vidas. Nos llena de alegría poder
celebrarlo rodeados de las personas que más queremos.`,

    detallesTitle: 'Detalles del Evento',

    dressCodeTitle: 'Código de Vestimenta',
    dressCodeTexto: 'Formal / Etiqueta',
    dressCodeNota: 'Evitar color blanco, por favor.',

    galeriaTitle: 'Nuestra Galería',

    regalosTitle: 'Mesa de Regalos',
    regalosTexto: `Lo más importante para nosotros es tu presencia.
Sin embargo, si deseas hacernos un obsequio, puedes contribuir
a nuestro fondo de luna de miel.`,
    regalosBanco: 'Banco Ejemplo',
    regalosCuenta: 'CLABE: 0123 4567 8901 2345 67',
    regalosTitular: 'Louis & Fabiola',

    rsvpTitle: 'Confirma tu Asistencia',
    rsvpTexto: 'Por favor confirma antes del 27 de enero de 2027',

    footerTexto: 'Esperamos celebrar juntos este día tan especial',
  },

  /* ─── Galería ───────────────────────────────────────────── */
  galeria: {
    /**
     * Lista de imágenes para la galería.
     * `src`: ruta relativa al .webp
     * `alt`: descripción de la imagen para accesibilidad
     */
    imagenes: [
      { src: 'assets/images/galeria-1.webp', alt: 'Foto de la pareja 1' },
      { src: 'assets/images/galeria-2.webp', alt: 'Foto de la pareja 2' },
      { src: 'assets/images/galeria-3.webp', alt: 'Foto de la pareja 3' },
      { src: 'assets/images/galeria-4.webp', alt: 'Foto de la pareja 4' },
      { src: 'assets/images/galeria-5.webp', alt: 'Foto de la pareja 5' },
      { src: 'assets/images/galeria-6.webp', alt: 'Foto de la pareja 6' },
      { src: 'assets/images/galeria-7.webp', alt: 'Foto de la pareja 7' },
      { src: 'assets/images/galeria-8.webp', alt: 'Foto de la pareja 8' },
    ],
  },

  /* ─── Imágenes ──────────────────────────────────────────── */
  imagenes: {
    heroDesktop: 'assets/images/hero-desktop.webp',
    heroTablet: 'assets/images/hero-tablet.webp',
    heroMobile: 'assets/images/hero-mobile.webp',
    logo: 'assets/images/logo.webp',
    historia: 'assets/images/historia.webp',
    ceremonia: 'assets/images/ceremonia.webp',
    recepcion: 'assets/images/recepcion.webp',
    dresscode: 'assets/images/dresscode.webp',
  },

  /* ─── RSVP — Servicio externo ───────────────────────────── */
  rsvp: {
    /**
     * URL del servicio de envío (Formspree, Google Sheets, EmailJS...).
     * Cambiar esta URL es lo único necesario para conectar el formulario.
     * Dejar vacío para modo demo (simula envío exitoso).
     */
    endpointUrl: '',
    /** Método HTTP para el envío */
    metodo: 'POST',
    /** Número máximo de acompañantes permitidos */
    maxAcompanantes: 10,
  },
};
