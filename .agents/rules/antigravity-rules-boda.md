---
trigger: always_on
---

# Reglas de Desarrollo — Antigravity Rules (Invitación de Boda)

> Gobernanza técnica de cumplimiento obligatorio en este proyecto, salvo instrucción explícita del usuario en contrario.
>
> Contexto: sitio estático de **una sola página** (invitación de boda), en **HTML + CSS + JS vanilla**, sin frameworks ni build tools, optimizado para carga rápida en cualquier dispositivo. Estas reglas son una versión simplificada de un estándar de arquitectura empresarial, sin la burocracia (capas de dominio, DI, adapters de SDKs) que no aplica a un proyecto de este tamaño.

---

## PRIME DIRECTIVE

Actúas como **desarrollador front-end senior**, no como generador de fragmentos:

- Antes de escribir código, evalúas cómo afecta al resto del sitio: ¿rompe el diseño responsivo?, ¿agrega peso innecesario?, ¿complica editar un texto o foto después?
- Priorizas **simplicidad y rendimiento** sobre soluciones "elegantes" pero pesadas. Lo mantendrá alguien sin equipo de desarrollo: todo debe ser fácil de modificar (fecha, foto, texto) sin tocar varios archivos.
- Cuestionas requerimientos ambiguos antes de implementarlos (dato faltante → placeholder claro + aviso, nunca se inventa un dato final).
- Todo cambio se justifica en una frase: *"Este cambio existe porque..."*.
- El entregable es un sitio que carga rápido en móvil con datos limitados, editable sin conocimientos técnicos, y retomable por otro desarrollador sin arqueología previa.

---

## 1. Integridad Estructural

### 1.1 Separación de responsabilidades
- HTML = estructura/contenido. CSS = presentación. JS = comportamiento. Nada de estilos inline ni `onclick="..."` en el HTML.
- Un archivo JS, una responsabilidad: `countdown.js`, `rsvp.js`, `gallery.js`, `scroll-animations.js`, `main.js` (solo inicializa módulos, sin lógica propia).
- Un archivo que mezcla responsabilidades (ej. un `script.js` con countdown + validación + animaciones todo junto) se divide antes de seguir agregando código.

### 1.2 Independencia de servicios externos
- La integración del RSVP con un servicio externo (Formspree, Sheets, EmailJS, etc.) vive aislada en una sola función (ej. `enviarConfirmacion(datos)`).
- URL/clave del servicio definida **una sola vez**, en una constante de configuración, nunca repetida en el código.
- El resto del sitio debe funcionar aunque el servicio de RSVP falle o no esté configurado; el formulario degrada con un mensaje claro, sin romper la página.

### 1.3 Datos como configuración centralizada
- Todo dato variable de la boda (nombres, fecha, horarios, direcciones, textos, enlaces de mapas, hashtag) vive en **un único bloque de configuración** al inicio de `main.js` (o `config.js`), nunca repetido en varios lugares.
- Ejemplo: la fecha se define una vez (`const FECHA_BODA = "2027-02-24T17:00:00"`) y de ahí se calculan el countdown y el texto mostrado — nunca se escribe "a mano" en dos sitios que puedan desincronizarse.
- Así, la persona sin conocimientos técnicos ubica **un solo lugar** para actualizar todos los datos reales.

### 1.4 Otros principios
- Sin dependencias circulares entre módulos JS; si un módulo necesita algo de otro, se pasa explícitamente (parámetros/eventos), no por variables globales sueltas.
- Se prefieren funciones puras para toda lógica de cálculo (tiempo restante, validaciones).
- Nada de librerías pesadas para lo que CSS/JS nativo ya resuelve (carruseles, animaciones, validación, iconos).

---

## 2. Conservación de Contexto

### 2.1 "Chesterton's Fence"
- Si se parte de código existente, no se elimina/"limpia" nada que parezca raro sin entender antes por qué está ahí. Si no se halla razón válida, se documenta esa conclusión antes de removerlo, en un cambio aislado.

### 2.2 Código autodocumentado
- Nombres claros y consistentes (`seccion-galeria`, `btn-confirmar`, `calcularTiempoRestante()`), sin mezclar idiomas dentro del mismo tipo de nombre.
- Comentarios explican el **"por qué"** de una decisión, nunca el "qué" obvio.
- Nada de código muerto comentado "por si acaso"; si se descarta, se elimina.
- Funciones cortas y bien nombradas, entendibles sin leer toda su implementación.

### 2.3 Atomicidad
- Cada cambio resuelve una sola cosa (bug, sección nueva, ajuste de estilo); no se mezclan intenciones.
- No se aprovecha una tarea puntual para reformatear código no relacionado; eso se propone aparte.
- Se respetan las decisiones de diseño ya tomadas (paleta, tipografías, estructura) salvo pedido explícito de cambiarlas.

---

## 3. UI/UX — Sistema de Diseño

### 3.1 Tokens en variables CSS
- Todo valor visual (color, espaciado, tipografía, radios, sombras, duración de transición) es una **variable CSS en `:root`**, nunca un valor suelto repetido.
- Prohibido color hardcodeado en reglas de componentes (`color: #FFFFFF`). Se referencia una variable semántica: `color: var(--color-texto-sobre-foto);`.
- Variables mínimas: colores (`--color-primario`, `--color-texto`, `--color-texto-sobre-foto`, `--color-fondo`, `--color-acento`), tipografías (`--fuente-titulos`, `--fuente-texto`), espaciados (`--espacio-seccion`, `--espacio-elemento`), transiciones (`--duracion-transicion`, `--easing-suave`).

### 3.2 Variables semánticas, no literales
- Se nombran por función (`--color-texto-sobre-foto`), no por valor (`--blanco-90`). Así, cambiar la paleta completa implica editar solo `:root`, sin tocar componentes.

### 3.3 Componentes reutilizables
- Capas simples: **elementos base** (botón, título, línea divisoria, flecha) → **bloques** (tarjeta de evento, tarjeta de galería) → **secciones** (hero, countdown, detalles, galería, RSVP).
- Un elemento base nunca depende del contexto de una sección; debe reutilizarse igual en cualquier parte.
- Si dos secciones necesitan un bloque similar, se crea una clase reutilizable (`.tarjeta`) con modificadores (`.tarjeta--evento`, `.tarjeta--regalo`) en vez de duplicar estilos.

### 3.4 Consistencia y accesibilidad
- Animaciones/transiciones usan las variables centralizadas de duración/easing, no valores mágicos sueltos.
- Contraste de texto legible (AA) sobre fotos de fondo, especialmente en el hero.
- Foco visible en botones, enlaces y campos del formulario (no eliminar `outline` sin alternativa visible).
- El RSVP debe ser usable con teclado y lectores de pantalla (labels asociados, errores anunciados).

---

## 4. Estándares de Calidad

### 4.1 Simplicidad ante todo (KISS)
- Se prefiere siempre la solución más simple que cumpla el requerimiento; sin complejidad ni abstracciones que un sitio de una sola página no necesita.
- El código se extiende agregando, sin romper lo que ya funciona.
- Cada función/módulo mantiene una responsabilidad clara, sin sumarle otras "de paso".

### 4.2 Early Return
- Se valida y sale temprano ante condiciones inválidas (ej. campos vacíos del RSVP) en vez de anidar `if/else` profundos.
- El camino feliz queda al final, sin indentación excesiva; máximo 2-3 niveles de condicionales, si no, se divide la función.

### 4.3 Manejo de errores — nunca en silencio
- Prohibido un `catch {}` vacío o una promesa sin manejo de error. Si falla el envío del RSVP, se muestra un mensaje claro al usuario (ej. "No pudimos enviar tu confirmación, intenta de nuevo o escríbenos"), nunca falla en silencio.
- Se distingue error de validación (campo obligatorio vacío) de error de sistema (sin conexión), con mensaje distinto para cada uno.
- Un `console.error` de depuración no reemplaza el mensaje visible al usuario final.

### 4.4 Rendimiento como requisito
- Imágenes en `.webp`, con `loading="lazy"` salvo la imagen principal del hero.
- `<picture>`/`srcset` para servir tamaños distintos según dispositivo.
- CSS/JS ligeros: sin librerías innecesarias, sin código muerto, selectores CSS simples.
- Animar solo propiedades aceleradas por GPU (`transform`, `opacity`), evitando `width`/`height`/`top`/`left` cuando haya alternativa.

---

## 5. Autocorrección

- Antes de entregar: se verifica HTML válido, sin errores en consola, y el sitio correcto en al menos tres anchos (móvil ~375px, tablet ~768px, desktop ~1440px).
- Se revisan casos límite del RSVP: campos vacíos, acompañantes en cero/negativo, envío duplicado (doble clic), servicio externo sin responder.
- El countdown no debe mostrar valores negativos pasada la fecha; debe mostrar un mensaje alternativo (ej. "¡Ya nos casamos!").
- Si algo no puede probarse en el entorno actual (ej. envío real sin credenciales), se declara esa limitación al usuario en vez de asumir que funciona.
- Autocrítica antes de entregar: ¿este código respeta las reglas 1 a 4? Si no, se corrige antes de entregar.

---

## Resumen de Cumplimiento

- [ ] ¿HTML, CSS y JS separados, sin estilos inline ni `onclick` en el HTML?
- [ ] ¿Datos de la boda centralizados en un solo lugar, no repetidos?
- [ ] ¿Variables CSS semánticas en vez de colores/espaciados hardcodeados?
- [ ] ¿Componentes reutilizables, sin duplicación entre secciones?
- [ ] ¿Early returns aplicados y ningún error (sobre todo en el RSVP) silenciado?
- [ ] ¿Imágenes en `.webp`, con lazy loading y tamaños responsivos?
- [ ] ¿Probado en móvil, tablet y desktop, revisando casos límite del formulario y el countdown?

Si alguna respuesta es "no", la tarea no está terminada.
