/* =============================================================
   app.js — Orquestador principal de la experiencia
   -------------------------------------------------------------
   - Transición Splash -> Invitación (fade + zoom)
   - Reproductor de música (play/pausa, mute, volumen, ecualizador)
   - Partículas de brillo de fondo (canvas)
   - Confeti / fuegos artificiales al abrir y al confirmar
   - Revelado de secciones al hacer scroll (IntersectionObserver)
   ============================================================= */

(function (global) {
  "use strict";

  var doc = document;

  // ---------- REFERENCIAS ----------
  var splash     = doc.getElementById("splash");
  var openBtn    = doc.getElementById("openBtn");
  var invitation = doc.getElementById("invitation");
  var player     = doc.getElementById("player");
  var audio      = doc.getElementById("audio");
  var playerTgl  = doc.getElementById("playerToggle");
  var muteTgl    = doc.getElementById("muteToggle");
  var volume     = doc.getElementById("volume");
  var accHead    = doc.getElementById("accHead");
  var accBody    = doc.getElementById("accBody");

  var prefersReduced = global.matchMedia &&
    global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =============================================================
     1) TRANSICIÓN SPLASH -> INVITACIÓN
     ============================================================= */
  function openInvitation() {
    if (!splash || splash.classList.contains("is-hidden")) return;

    // Iniciar audio de forma limpia (gesto del usuario => permitido)
    startAudio();

    global.setTimeout(function () {
      splash.classList.add("is-hidden");
      if (invitation) {
        invitation.hidden = false;
        // forzar reflow para que las animaciones .reveal disparen
        void invitation.offsetWidth;
        revealSections();
      }
      if (player) player.hidden = false;

      // Confeti sutil al revelar
      Celebrate.burst();

      // Quitar el splash del árbol tras la transición
      global.setTimeout(function () {
        if (splash && splash.parentNode) splash.style.display = "none";
      }, 950);
    }, 350);
  }

  if (openBtn) openBtn.addEventListener("click", openInvitation);

  /* =============================================================
     2) REPRODUCTOR DE MÚSICA
     ============================================================= */
  var isMuted = false;
  var lastVolume = 0.65;

  function startAudio() {
    if (!audio) return;
    audio.volume = lastVolume;
    var p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(function () {
        player.classList.add("is-playing");
      }).catch(function () {
        // Autoplay bloqueado: se quedará pausado hasta que el usuario toque el disco
        player.classList.remove("is-playing");
      });
    } else {
      player.classList.add("is-playing");
    }
  }

  function togglePlay() {
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(function () {
        player.classList.add("is-playing");
      }).catch(function (err) { console.warn("[Audio] No se pudo reproducir:", err); });
    } else {
      audio.pause();
      player.classList.remove("is-playing");
    }
  }

  if (playerTgl) playerTgl.addEventListener("click", togglePlay);

  // Sincronizar clase al pausar/reproducir desde cualquier fuente
  if (audio) {
    audio.addEventListener("play",  function () { player.classList.add("is-playing"); });
    audio.addEventListener("pause", function () { player.classList.remove("is-playing"); });
  }

  // Volumen
  if (volume) {
    volume.addEventListener("input", function () {
      lastVolume = parseInt(volume.value, 10) / 100;
      if (audio) audio.volume = lastVolume;
      isMuted = lastVolume === 0;
      updateMuteIcon();
    });
  }

  // Silenciar / activar
  function updateMuteIcon() {
    if (!muteTgl) return;
    muteTgl.textContent = (isMuted || (audio && audio.volume === 0)) ? "🔇" : "🔊";
  }
  if (muteTgl) {
    muteTgl.addEventListener("click", function () {
      if (!audio) return;
      isMuted = !isMuted;
      if (isMuted) {
        audio.volume = 0;
        if (volume) volume.value = 0;
      } else {
        audio.volume = lastVolume || 0.65;
        if (volume) volume.value = Math.round((lastVolume || 0.65) * 100);
      }
      updateMuteIcon();
    });
  }

  /* =============================================================
     3) ACORDEÓN "CÓMO LLEGAR"
     ============================================================= */
  if (accHead && accBody) {
    accHead.addEventListener("click", function () {
      var expanded = accHead.getAttribute("aria-expanded") === "true";
      accHead.setAttribute("aria-expanded", String(!expanded));
      accBody.hidden = expanded;
    });
  }

  /* =============================================================
     4) REVELADO DE SECCIONES AL SCROLL
     ============================================================= */
  function revealSections() {
    var items = doc.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in global)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* =============================================================
     5) PARTÍCULAS DE BRILLO DE FONDO
     ============================================================= */
  (function initParticles() {
    var canvas = doc.getElementById("particles");
    if (!canvas || prefersReduced) return;
    var ctx = canvas.getContext("2d");
    var W, H, particles = [];

    function resize() {
      W = canvas.width = global.innerWidth;
      H = canvas.height = global.innerHeight;
    }
    resize();
    global.addEventListener("resize", resize);

    var COUNT = Math.min(60, Math.floor(global.innerWidth / 14));
    for (var i = 0; i < COUNT; i++) {
      particles.push(newParticle());
    }
    function newParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vy: -(Math.random() * 0.4 + 0.1),
        vx: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.005
      };
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y += p.vy; p.x += p.vx;
        p.a += p.tw;
        var alpha = 0.35 + Math.abs(Math.sin(p.a)) * 0.5;

        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(252, 211, 77, " + alpha + ")";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
        ctx.fill();
      }
      global.requestAnimationFrame(tick);
    }
    tick();
  })();

  /* =============================================================
     6) CONFETI / FUEGOS ARTIFICIALES (módulo Celebrate)
     ============================================================= */
  var Celebrate = (function () {
    var canvas = doc.getElementById("confetti");
    var ctx = canvas ? canvas.getContext("2d") : null;
    var pieces = [];
    var running = false;
    var W, H;

    var COLORS = ["#f59e0b", "#fcd34d", "#d97706", "#10b981", "#ffffff", "#fbbf24"];

    function resize() {
      if (!canvas) return;
      W = canvas.width = global.innerWidth;
      H = canvas.height = global.innerHeight;
    }
    if (canvas) { resize(); global.addEventListener("resize", resize); }

    function spawn(amount) {
      for (var i = 0; i < amount; i++) {
        pieces.push({
          x: Math.random() * W,
          y: -20 - Math.random() * H * 0.3,
          w: Math.random() * 8 + 4,
          h: Math.random() * 5 + 4,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 3 + 2,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          life: 1
        });
      }
    }

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = pieces.length - 1; i >= 0; i--) {
        var p = pieces[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
        p.life -= 0.006;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.y > H + 30 || p.life <= 0) pieces.splice(i, 1);
      }
      if (pieces.length > 0) {
        global.requestAnimationFrame(loop);
      } else {
        running = false;
        if (ctx) ctx.clearRect(0, 0, W, H);
      }
    }

    function burst() {
      if (!ctx || prefersReduced) return;
      spawn(140);
      // Segunda oleada sutil
      global.setTimeout(function () { spawn(70); }, 400);
      if (!running) { running = true; loop(); }
    }

    return { burst: burst };
  })();

  // Exponer módulos globales
  global.Celebrate = Celebrate;

  /* =============================================================
     7) FALLBACK: si el usuario recarga con #invitation, saltar splash
     ============================================================= */
  if (global.location.hash === "#invitation" && splash) {
    splash.style.display = "none";
    if (invitation) invitation.hidden = false;
    if (player) player.hidden = false;
    revealSections();
  }
})(window);
