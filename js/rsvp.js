/* =============================================================
   rsvp.js — Formulario inteligente de confirmación (RSVP)
   -------------------------------------------------------------
   - Validación en cliente
   - Envío AJAX (fetch) a Google Apps Script SIN recargar
   - Estado de carga + mensaje de éxito animado
   - Botón "Añadir a Google Calendar" generado dinámicamente
   ============================================================= */

(function (global) {
  "use strict";

  /* -------------------------------------------------------------
     ⚙️  CONFIGURACIÓN — PEGA AQUÍ TU URL DE GOOGLE APPS SCRIPT
     Reemplaza el valor de ENDPOINT por la URL /exec que te da
     Google al publicar el script como Aplicación Web.
     Ejemplo: https://script.google.com/macros/s/AKfy..../exec
  ------------------------------------------------------------- */
  var CONFIG = {
    ENDPOINT: "https://script.google.com/macros/s/AKfycbzFwiRanU54aAjuAvnn_JowSPfDo4RbggUy1t7G1xShpxZPvZTVHxwJv0CCTEPx9Fy_/exec",

    // Datos del evento para Google Calendar
    EVENT: {
      title: "🎉 Cumpleaños de Miguel Espinoza",
      details: "¡Te esperamos para celebrar! Almuerzo y celebración.",
      location: "Urbanización El Bosque T-6, Castilla - Piura, Perú"
    }
  };

  // ---------- REFERENCIAS DOM ----------
  var form        = document.getElementById("rsvpForm");
  var submitBtn   = document.getElementById("submitBtn");
  var statusEl    = document.getElementById("formStatus");
  var successBox  = document.getElementById("successBox");
  var successMsg  = document.getElementById("successMsg");
  var calendarBtn = document.getElementById("calendarBtn");
  var editAgain   = document.getElementById("editAgain");

  if (!form) return;

  form.addEventListener("change", function (e) {
    clearError(e.target);
  });

  // ---------- VALIDACIÓN ----------
  function setError(fieldName, message) {
    var small = form.querySelector('.field-error[data-for="' + fieldName + '"]');
    var field = form.querySelector('[name="' + fieldName + '"]');
    if (small) small.textContent = message || "";
    if (field) {
      var wrap = field.closest(".field");
      if (wrap) wrap.classList.toggle("invalid", !!message);
    }
  }

  function clearError(target) {
    if (!target || !target.name) return;
    setError(target.name, "");
  }

  function validate(data) {
    var ok = true;

    if (!data.nombre || data.nombre.trim().length < 3) {
      setError("nombre", "Por favor ingresa tu nombre completo.");
      ok = false;
    } else {
      setError("nombre", "");
    }

    if (!data.asistencia) {
      setError("asistencia", "Selecciona una opción.");
      ok = false;
    } else {
      setError("asistencia", "");
    }

    return ok;
  }

  // ---------- CONSTRUIR ENLACE DE GOOGLE CALENDAR ----------
  function buildCalendarLink() {
    var target = (global.Countdown && global.Countdown.getTargetDate)
      ? global.Countdown.getTargetDate()
      : new Date();

    var start = new Date(target.getTime());
    var end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // dura 4 horas

    function fmt(d) {
      // Formato UTC requerido por Google Calendar: YYYYMMDDTHHMMSSZ
      return d.getUTCFullYear() +
        pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
        pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
    }
    function pad(n) { return (n < 10 ? "0" : "") + n; }

    var params = new URLSearchParams({
      action: "TEMPLATE",
      text: CONFIG.EVENT.title,
      dates: fmt(start) + "/" + fmt(end),
      details: CONFIG.EVENT.details,
      location: CONFIG.EVENT.location
    });

    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  // ---------- ESTADO DE CARGA ----------
  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      statusEl.classList.remove("error");
      statusEl.textContent = "Enviando confirmación…";
    } else {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  }

  // ---------- MOSTRAR ÉXITO ----------
  function showSuccess(data) {
    form.hidden = true;
    successBox.hidden = false;

    if (data.asistencia === "No podré asistir") {
      successMsg.textContent = "¡Gracias por avisar, " + firstName(data.nombre) +
        "! Te vamos a extrañar. 💛";
      if (calendarBtn) calendarBtn.style.display = "none";
    } else {
      successMsg.textContent = "¡Gracias, " + firstName(data.nombre) +
        "! Tu lugar está reservado. Nos vemos en la celebración. 🥂";
      if (calendarBtn) {
        calendarBtn.style.display = "";
        calendarBtn.href = buildCalendarLink();
      }
    }

    successBox.scrollIntoView({ behavior: "smooth", block: "center" });

    // Confeti de celebración si está disponible (app.js)
    if (global.Celebrate && typeof global.Celebrate.burst === "function") {
      global.Celebrate.burst();
    }
  }

  function firstName(full) {
    return (full || "").trim().split(/\s+/)[0] || "";
  }

  // ---------- ENVÍO ----------
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var data = {
      nombre:        (form.nombre.value || "").trim(),
      asistencia:    (form.asistencia.value || ""),
      mensaje:       (form.mensaje.value || "").trim(),
      fecha_envio:   new Date().toISOString()
    };

    if (!validate(data)) {
      statusEl.classList.add("error");
      statusEl.textContent = "Revisa los campos marcados.";
      return;
    }

    setLoading(true);
    sendToServer(data);
  });

  function sendToServer(data) {
    // Si aún no se configuró el endpoint, mostramos modo demo
    if (!CONFIG.ENDPOINT || CONFIG.ENDPOINT.indexOf("REEMPLAZA") === 0) {
      console.warn("[RSVP] ENDPOINT no configurado. Ejecutando en modo DEMO.");
      global.setTimeout(function () {
        setLoading(false);
        showSuccess(data);
      }, 1200);
      return;
    }

    // Google Apps Script + fetch.
    // Usamos text/plain (evita preflight CORS) y enviamos JSON en el cuerpo,
    // ya que application/x-www-form-urlencoded puede perder el body en la
    // redirección interna de Apps Script (e.parameter llega vacío).
    fetch(CONFIG.ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json().catch(function () { return { result: "success" }; }); })
      .then(function (json) {
        setLoading(false);
        if (json && json.result === "error") {
          throw new Error(json.message || "Error del servidor");
        }
        showSuccess(data);
      })
      .catch(function (err) {
        console.error("[RSVP] Error al enviar:", err);
        setLoading(false);
        statusEl.classList.add("error");
        statusEl.textContent = "Hubo un problema al enviar. Intenta de nuevo o avisa por WhatsApp.";
      });
  }

  // ---------- ENVIAR OTRA RESPUESTA ----------
  if (editAgain) {
    editAgain.addEventListener("click", function () {
      successBox.hidden = true;
      form.hidden = false;
      form.reset();
      statusEl.textContent = "";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Exponer por si app.js necesita la config
  global.RSVP = { config: CONFIG, buildCalendarLink: buildCalendarLink };
})(window);
