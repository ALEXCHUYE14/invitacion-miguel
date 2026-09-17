/**
 * =============================================================
 *  Code.gs — Backend RSVP con Google Apps Script + Google Sheets
 * =============================================================
 *
 *  Recibe las confirmaciones del formulario web (fetch/AJAX) y
 *  las guarda como filas en una Hoja de Cálculo de Google.
 *
 *  ─────────────────────────────────────────────────────────
 *  CÓMO INSTALARLO (5 pasos):
 *  ─────────────────────────────────────────────────────────
 *  1) Crea una Hoja de Cálculo nueva en Google Sheets.
 *  2) Menú:  Extensiones ▸ Apps Script.
 *  3) Borra el contenido y PEGA todo este archivo.
 *  4) Menú:  Implementar ▸ Nueva implementación ▸ Tipo: "Aplicación web".
 *       - Ejecutar como:  Yo (tu cuenta)
 *       - Quién tiene acceso:  "Cualquier usuario"
 *     Copia la URL que termina en /exec.
 *  5) Pega esa URL en  js/rsvp.js  ▸  CONFIG.ENDPOINT.
 *
 *  (Opcional) Ejecuta una vez la función  setup()  desde el editor
 *  para crear los encabezados automáticamente.
 * =============================================================
 */

// Nombre de la pestaña donde se guardan las confirmaciones.
var SHEET_NAME = "Confirmaciones";

// Encabezados de las columnas (orden de guardado).
var HEADERS = [
  "Fecha de envío",
  "Nombre y Apellidos",
  "Asistencia",
  "N° Acompañantes",
  "Restricciones / Bebida",
  "Mensaje para Miguel"
];

/**
 * Punto de entrada para las peticiones POST (envío del formulario).
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita escrituras simultáneas

  try {
    var sheet = getSheet_();

    // Los datos llegan como x-www-form-urlencoded => e.parameter
    var params = (e && e.parameter) ? e.parameter : {};

    var row = [
      params.fecha_envio ? new Date(params.fecha_envio) : new Date(),
      sanitize_(params.nombre),
      sanitize_(params.asistencia),
      sanitize_(params.acompanantes) || "0",
      sanitize_(params.restricciones),
      sanitize_(params.mensaje)
    ];

    sheet.appendRow(row);

    return json_({ result: "success", message: "Confirmación registrada" });
  } catch (err) {
    return json_({ result: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Punto de entrada GET — útil para probar que el despliegue funciona.
 * Abre la URL /exec en el navegador y deberías ver un JSON de estado.
 */
function doGet() {
  return json_({
    result: "success",
    message: "Endpoint RSVP activo ✔. Usa POST para registrar confirmaciones."
  });
}

/* ---------------------------------------------------------------
   FUNCIONES AUXILIARES
--------------------------------------------------------------- */

/**
 * Devuelve la hoja de trabajo, creándola con encabezados si no existe.
 */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    formatHeader_(sheet);
  }
  return sheet;
}

/**
 * Da formato bonito a la fila de encabezados.
 */
function formatHeader_(sheet) {
  var range = sheet.getRange(1, 1, 1, HEADERS.length);
  range.setFontWeight("bold")
       .setBackground("#0f172a")
       .setFontColor("#f59e0b")
       .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

/**
 * Limpia el texto de entrada (evita inyección de fórmulas en Sheets).
 */
function sanitize_(value) {
  if (value === undefined || value === null) return "";
  var s = String(value).trim();
  // Neutraliza fórmulas que empiecen con = + - @
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/**
 * Construye una respuesta JSON estándar.
 */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * (Opcional) Ejecuta esto UNA vez desde el editor para preparar
 * la hoja con encabezados sin esperar la primera confirmación.
 */
function setup() {
  getSheet_();
  SpreadsheetApp.getUi
    ? Logger.log("Hoja lista: " + SHEET_NAME)
    : null;
}
