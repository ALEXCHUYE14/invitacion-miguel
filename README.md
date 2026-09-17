# 🎉 Invitación Web Interactiva · Cumpleaños de Miguel Espinoza

Tarjeta de invitación web **ultra-premium**, responsiva (mobile-first) y con una experiencia de *unboxing*: sobre virtual → apertura con confeti → tarjeta inmersiva con cuenta regresiva, música, guía de llegada y confirmación RSVP conectada a Google Sheets.

---

## 📁 Estructura del proyecto

```
invitacion-miguel/
├── index.html              # Estructura (Splash + Tarjeta principal)
├── css/
│   └── styles.css          # Estilos premium, glassmorphism, animaciones
├── js/
│   ├── app.js              # Orquestador: transición, música, confeti, partículas
│   ├── countdown.js        # Reloj de cuenta regresiva
│   └── rsvp.js             # Formulario RSVP + envío AJAX + Google Calendar
├── google-script/
│   └── Code.gs             # Backend Apps Script (pegar en Google Sheets)
├── assets/
│   ├── audio/
│   │   └── musica.mp3      # ⬅️ COLOCA AQUÍ TU CANCIÓN (ver abajo)
│   └── img/                # (opcional) imágenes propias
└── README.md
```

---

## 🎵 1. Colocar la música

La canción asignada es **Gian Marco – El Ritmo de mi Corazón ft. Grupo 5 · Tony Succar**.

1. Consigue el archivo en formato **MP3**.
2. Renómbralo exactamente a **`musica.mp3`**.
3. Colócalo en la carpeta **`assets/audio/`**.

> El reproductor está listo para ese nombre. Si usas otro nombre o formato, actualiza la línea `<source src="assets/audio/musica.mp3" ...>` en `index.html`.
>
> ⚠️ *Nota de derechos:* usa el archivo solo para tu evento privado. Verifica que tienes permiso para usar la canción.

---

## 📊 2. Conectar el formulario a Google Sheets

El RSVP guarda cada confirmación en una hoja de cálculo, sin recargar la página.

1. Crea una **Hoja de Cálculo** nueva en [Google Sheets](https://sheets.google.com).
2. Ve a **Extensiones ▸ Apps Script**.
3. Borra el código de ejemplo y **pega todo el contenido de `google-script/Code.gs`**.
4. (Opcional) Ejecuta la función `setup()` una vez para crear los encabezados.
5. Haz clic en **Implementar ▸ Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Tú (tu cuenta)**
   - Quién tiene acceso: **Cualquier usuario**
6. Autoriza los permisos y **copia la URL** que termina en `/exec`.
7. Abre **`js/rsvp.js`** y reemplaza el valor de `CONFIG.ENDPOINT`:

   ```js
   var CONFIG = {
     ENDPOINT: "https://script.google.com/macros/s/AKfy..../exec",
     ...
   };
   ```

> 💡 **Modo demo:** mientras no configures el `ENDPOINT`, el formulario funciona en modo de prueba (muestra el mensaje de éxito sin guardar). Perfecto para revisar el diseño antes de conectar la hoja.

---

## 📅 3. Cambiar la fecha (si hace falta)

La cuenta regresiva apunta al **27 de Septiembre, 1:00 PM**. El año se calcula automáticamente (toma el próximo 27-Sep que no haya pasado). Para fijarlo manualmente, edita `js/countdown.js`:

```js
var EVENT_CONFIG = {
  year: 2026,   // fija el año aquí (o déjalo en null para automático)
  month: 9,
  day: 27,
  hour: 13,     // 1:00 PM
  minute: 0,
  second: 0
};
```

---

## 🚀 4. Publicar la web GRATIS

Es un sitio 100% estático (HTML/CSS/JS), así que puedes publicarlo en cualquiera de estas plataformas sin costo:

### Opción A — Netlify (la más rápida) ⭐
1. Entra a [app.netlify.com/drop](https://app.netlify.com/drop).
2. **Arrastra la carpeta `invitacion-miguel`** completa a la ventana.
3. ¡Listo! Te da una URL pública al instante (ej. `https://tu-invitacion.netlify.app`).

### Opción B — Vercel
1. Instala Vercel CLI: `npm i -g vercel` (o usa la web).
2. En la carpeta del proyecto ejecuta: `vercel`.
3. Sigue los pasos; obtendrás una URL `https://....vercel.app`.
   *(También puedes subir la carpeta arrastrándola en el dashboard de Vercel.)*

### Opción C — GitHub Pages
1. Crea un repositorio en GitHub y sube todos los archivos.
2. Ve a **Settings ▸ Pages**.
3. En *Source* elige la rama `main` y carpeta `/root`.
4. Guarda; tu web quedará en `https://tu-usuario.github.io/tu-repo/`.

> En cualquier opción, asegúrate de subir **toda la carpeta** (incluyendo `assets/audio/musica.mp3`) para que la música y los estilos carguen bien.

---

## ✨ Características incluidas

- **Splash / Sobre virtual** con brillos, partículas y botón *pulse* “Abrir invitación”.
- **Transición fluida** (fade-out + zoom) y **confeti** al revelar la tarjeta.
- **Cuenta regresiva** en tiempo real (días, horas, minutos, segundos).
- **Tarjetas de detalles** con efecto *glassmorphism*.
- **Guía “Cómo llegar”** en acordeón + botón VIP a **Google Maps**.
- **Reproductor flotante** estilo vinilo con ecualizador, play/pausa, mute y volumen.
- **Formulario RSVP inteligente** con validación, estado de carga y envío AJAX a Google Sheets.
- **Botón “Añadir a Google Calendar”** tras confirmar.
- **100% responsive** (iPhone, Android, tablets, desktop) y accesible (soporta *reduce motion*).

---

## 🎨 Personalización rápida

| Qué cambiar            | Dónde                                   |
|------------------------|-----------------------------------------|
| Colores / dorado / navy| `css/styles.css` → bloque `:root`       |
| Textos y nombre        | `index.html`                            |
| Fecha del evento       | `js/countdown.js` → `EVENT_CONFIG`      |
| Enlace de Google Maps  | `index.html` → botón `.btn-maps`        |
| Datos del calendario   | `js/rsvp.js` → `CONFIG.EVENT`           |
| Canción de fondo       | `assets/audio/musica.mp3`               |

---

Hecho con 💛 para la celebración de **Miguel Espinoza**.
