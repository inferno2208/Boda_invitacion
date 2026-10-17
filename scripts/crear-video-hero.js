#!/usr/bin/env node
/**
 * crear-video-hero.js — Genera el video de bienvenida (carta que se abre)
 *
 * Uso:  npm run video:hero
 *
 * Toma la secuencia de frames JPG de CARPETA_FRAMES y produce:
 *   - assets/video/carta-hero-desktop.mp4   (1280x720, tablet/desktop)
 *   - assets/video/carta-hero-mobile.mp4    (720x720, recorte cuadrado centrado)
 *   - assets/images/carta-hero-poster-desktop.webp
 *   - assets/images/carta-hero-poster-mobile.webp
 *
 * Requiere ffmpeg en el PATH. Sin dependencias de npm.
 * Los JPG son solo materia prima: la web nunca los carga.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/* ─── Configuración ─────────────────────────────────────────── */
/** Nombre exacto de la carpeta: el hosting distingue mayúsculas. */
const CARPETA_FRAMES = 'assets/Carta_heros';
const PREFIJO_FRAME = 'gemini_generated_video_0ca878b4_';
const EXTENSION_FRAME = '.jpg';
const NUMERO_INICIAL = 7;
const DIGITOS_NUMERO = 3;
const FPS_ENTRADA = 24;
/** 60 fps interpolados = fluido. Si aparecen artefactos, bajar a 30. */
const FPS_SALIDA = 60;
/** Si algún archivo supera su presupuesto, subir a 28. */
const CRF = 26;

const CARPETA_VIDEO = 'assets/video';
const CARPETA_IMAGENES = 'assets/images';
const CALIDAD_POSTER = 78;

/** El celular vertical recortaría un 16:9 con cover; el cuadrado conserva la carta. */
const RECORTE_MOBILE = 'crop=720:720:280:0';

/** Presupuesto de peso en bytes (KB × 1024). */
const PRESUPUESTO = {
  desktop: 400 * 1024,
  mobile: 250 * 1024,
  poster: 60 * 1024,
};

const RAIZ = path.resolve(__dirname, '..');

/* ─── Utilidades ────────────────────────────────────────────── */
function fallar(mensaje) {
  console.error(`\n✖ ${mensaje}\n`);
  process.exit(1);
}

function ejecutar(comando, args) {
  const resultado = spawnSync(comando, args, { cwd: RAIZ, encoding: 'utf8' });
  if (resultado.error) {
    fallar(`No se pudo ejecutar "${comando}": ${resultado.error.message}`);
  }
  if (resultado.status !== 0) {
    fallar(`"${comando}" terminó con código ${resultado.status}:\n${resultado.stderr}`);
  }
  return resultado.stdout;
}

function verificarFfmpeg() {
  const resultado = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  if (resultado.error || resultado.status !== 0) {
    fallar(
      'ffmpeg no está instalado o no está en el PATH.\n' +
      '  Windows: winget install Gyan.FFmpeg  (luego reabre la terminal)\n' +
      '  macOS:   brew install ffmpeg\n' +
      '  Linux:   sudo apt install ffmpeg'
    );
  }
  console.log(`✔ ${resultado.stdout.split('\n')[0]}`);
}

/**
 * Lista los frames ordenados por su número (no por texto) y exige que la
 * numeración sea contigua: un hueco produciría un salto visible en el video.
 */
function listarFramesContiguos() {
  const carpeta = path.join(RAIZ, CARPETA_FRAMES);
  if (!fs.existsSync(carpeta)) {
    fallar(`No existe la carpeta de frames: ${CARPETA_FRAMES}`);
  }

  const patron = new RegExp(`^${PREFIJO_FRAME}(\\d{${DIGITOS_NUMERO}})\\${EXTENSION_FRAME}$`);
  const numeros = fs.readdirSync(carpeta)
    .map((nombre) => nombre.match(patron))
    .filter(Boolean)
    .map((coincidencia) => Number(coincidencia[1]))
    .sort((a, b) => a - b);

  if (numeros.length === 0) {
    fallar(`No hay frames "${PREFIJO_FRAME}NNN${EXTENSION_FRAME}" en ${CARPETA_FRAMES}`);
  }
  if (numeros[0] !== NUMERO_INICIAL) {
    fallar(`El primer frame es ${numeros[0]}, se esperaba ${NUMERO_INICIAL}.`);
  }

  numeros.forEach((numero, indice) => {
    const esperado = NUMERO_INICIAL + indice;
    if (numero !== esperado) {
      fallar(`Hueco en la numeración: falta el frame ${String(esperado).padStart(DIGITOS_NUMERO, '0')}.`);
    }
  });

  const ultimo = numeros[numeros.length - 1];
  console.log(`✔ ${numeros.length} frames contiguos (${pad(NUMERO_INICIAL)} → ${pad(ultimo)})`);
  return numeros.length;
}

function pad(numero) {
  return String(numero).padStart(DIGITOS_NUMERO, '0');
}

function rutaFrame(numero) {
  return path.join(CARPETA_FRAMES, `${PREFIJO_FRAME}${numero}${EXTENSION_FRAME}`);
}

/* ─── Generación ────────────────────────────────────────────── */
/** ffmpeg lee la secuencia hasta el primer número inexistente; ya se validó contigua. */
function argsEntradaSecuencia() {
  return [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-framerate', String(FPS_ENTRADA),
    '-start_number', String(NUMERO_INICIAL),
    '-i', rutaFrame(`%0${DIGITOS_NUMERO}d`),
  ];
}

const FILTRO_INTERPOLACION =
  `minterpolate=fps=${FPS_SALIDA}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`;

const ARGS_CODIFICACION = [
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF),
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
];

function crearVideo(nombre, filtros) {
  const salida = path.join(CARPETA_VIDEO, nombre);
  console.log(`… codificando ${salida} (la interpolación tarda ~1 min)`);
  ejecutar('ffmpeg', [
    ...argsEntradaSecuencia(),
    '-vf', filtros.join(','),
    ...ARGS_CODIFICACION,
    salida,
  ]);
  return salida;
}

function crearPoster(nombre, filtros) {
  const salida = path.join(CARPETA_IMAGENES, nombre);
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', rutaFrame(pad(NUMERO_INICIAL)),
  ];
  if (filtros.length) args.push('-vf', filtros.join(','));
  args.push('-frames:v', '1', '-c:v', 'libwebp', '-quality', String(CALIDAD_POSTER), salida);
  ejecutar('ffmpeg', args);
  return salida;
}

function revisarPresupuesto(ruta, limite) {
  const bytes = fs.statSync(path.join(RAIZ, ruta)).size;
  const kb = (bytes / 1024).toFixed(1);
  const ok = bytes <= limite;
  console.log(`${ok ? '✔' : '✖'} ${ruta}: ${kb} KB (máx. ${limite / 1024} KB)`);
  return ok;
}

/* ─── Flujo principal ───────────────────────────────────────── */
function main() {
  verificarFfmpeg();
  listarFramesContiguos();

  fs.mkdirSync(path.join(RAIZ, CARPETA_VIDEO), { recursive: true });
  fs.mkdirSync(path.join(RAIZ, CARPETA_IMAGENES), { recursive: true });

  const desktop = crearVideo('carta-hero-desktop.mp4', [FILTRO_INTERPOLACION]);
  // Recortar antes de interpolar: menos píxeles que estimar, mismo resultado.
  const mobile = crearVideo('carta-hero-mobile.mp4', [RECORTE_MOBILE, FILTRO_INTERPOLACION]);
  const posterDesktop = crearPoster('carta-hero-poster-desktop.webp', []);
  const posterMobile = crearPoster('carta-hero-poster-mobile.webp', [RECORTE_MOBILE]);

  const dentroDePresupuesto = [
    revisarPresupuesto(desktop, PRESUPUESTO.desktop),
    revisarPresupuesto(mobile, PRESUPUESTO.mobile),
    revisarPresupuesto(posterDesktop, PRESUPUESTO.poster),
    revisarPresupuesto(posterMobile, PRESUPUESTO.poster),
  ].every(Boolean);

  if (!dentroDePresupuesto) {
    fallar('Algún archivo supera su presupuesto de peso. Sube CRF a 28 y vuelve a ejecutar.');
  }
  console.log('\n✔ Video de bienvenida generado.\n');
}

main();
