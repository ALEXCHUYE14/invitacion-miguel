/* =============================================================
   countdown.js — Reloj de cuenta regresiva en tiempo real
   -------------------------------------------------------------
   Objetivo: Domingo 27 de Septiembre, 1:30 PM (hora de Perú).
   El año se toma automáticamente (el próximo 27-Sep disponible),
   pero puedes fijarlo manualmente en EVENT_CONFIG.year.
   ============================================================= */

(function (global) {
  "use strict";

  // ---------- CONFIGURACIÓN DEL EVENTO ----------
  var EVENT_CONFIG = {
    year: null,   // null = automático. Pon 2026 para fijarlo.
    month: 9,     // Septiembre (1-12)
    day: 27,
    hour: 13,     // 1:30 PM en formato 24h
    minute: 30,
    second: 0
  };

  /**
   * Devuelve la fecha objetivo como objeto Date.
   * Si el año no está fijado, elige el próximo 27-Sep 1PM que aún no haya pasado.
   */
  function getTargetDate() {
    var now = new Date();
    var year = EVENT_CONFIG.year;

    if (year === null || year === undefined) {
      year = now.getFullYear();
      var candidate = new Date(year, EVENT_CONFIG.month - 1, EVENT_CONFIG.day,
                               EVENT_CONFIG.hour, EVENT_CONFIG.minute, EVENT_CONFIG.second);
      // Si ya pasó este año, salta al siguiente
      if (candidate.getTime() < now.getTime()) {
        year += 1;
      }
    }

    return new Date(year, EVENT_CONFIG.month - 1, EVENT_CONFIG.day,
                    EVENT_CONFIG.hour, EVENT_CONFIG.minute, EVENT_CONFIG.second);
  }

  var TARGET = getTargetDate();

  // ---------- REFERENCIAS DOM ----------
  var el = {
    days:    document.getElementById("cd-days"),
    hours:   document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds"),
    grid:    document.getElementById("countdown"),
    done:    document.getElementById("countdown-done")
  };

  var timerId = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function render() {
    var diff = TARGET.getTime() - Date.now();

    if (diff <= 0) {
      // ¡Llegó el día!
      setValues(0, 0, 0, 0);
      if (el.grid) el.grid.setAttribute("aria-hidden", "false");
      if (el.done) el.done.hidden = false;
      stop();
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days    = Math.floor(totalSeconds / 86400);
    var hours   = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    setValues(days, hours, minutes, seconds);
  }

  function setValues(d, h, m, s) {
    if (el.days)    el.days.textContent    = pad(d);
    if (el.hours)   el.hours.textContent   = pad(h);
    if (el.minutes) el.minutes.textContent = pad(m);
    if (el.seconds) el.seconds.textContent = pad(s);
  }

  function start() {
    if (!el.days) return; // no hay countdown en el DOM
    render();
    timerId = global.setInterval(render, 1000);
  }

  function stop() {
    if (timerId) { global.clearInterval(timerId); timerId = null; }
  }

  // API pública mínima (usada por app.js / rsvp.js si se necesita la fecha)
  global.Countdown = {
    start: start,
    stop: stop,
    getTargetDate: function () { return TARGET; },
    config: EVENT_CONFIG
  };

  // Autoarranque cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
