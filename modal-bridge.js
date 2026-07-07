/* =====================================================================
   modal-bridge.js  —  Xmas Hexa Sort (Construct 3, build de ESTUDO)
   Substitui os modais nativos por modais HTML/CSS customizaveis, mantendo
   a logica do jogo (abrir/fechar, audio, etc.) via a API de script do C3.
   Padrao inspirado no Color Blocks. Carrega DEPOIS do runtime (modo DOM).
   ===================================================================== */
(function () {
  "use strict";
  var TAG = "[modal-bridge]";
  var RT = null;              // runtime do C3
  var lastSettingsOpen = false;
  var registered = false;

  /* ---------- selo de status visivel (debug) ---------- */
  var badge = null;
  function setStatus(txt, color) {
    try {
      if (!badge) {
        badge = document.createElement("div");
        badge.style.cssText =
          "position:fixed;left:6px;bottom:6px;z-index:100000;background:#000a;color:#fff;" +
          "font:12px/1.3 monospace;padding:4px 8px;border-radius:6px;pointer-events:none;max-width:70vw";
        (document.body || document.documentElement).appendChild(badge);
      }
      badge.textContent = "bridge: " + txt;
      badge.style.color = color || "#8f8";
    } catch (e) {}
  }

  /* ---------- captura do runtime via API de script do C3 ---------- */
  function boot() {
    setStatus("aguardando runOnStartup...", "#fd8");
    tryRegister();
  }
  function tryRegister() {
    if (registered) return;
    var ros = (typeof runOnStartup === "function") ? runOnStartup
            : (self && typeof self.runOnStartup === "function" ? self.runOnStartup : null);
    if (ros) {
      registered = true;
      setStatus("registrado; aguardando runtime...", "#fd8");
      try {
        ros(function (runtime) {
          RT = runtime;
          window.__c3 = runtime;
          setStatus("runtime OK", "#8f8");
          console.log(TAG, "runtime capturado", runtime);
          logCapabilities();
          try { runtime.addEventListener("tick", onTick); }
          catch (e) { setInterval(onTick, 100); }
        });
      } catch (e) {
        setStatus("erro no runOnStartup: " + e.message, "#f88");
        console.warn(TAG, e);
      }
    } else {
      setTimeout(tryRegister, 10);
    }
  }

  function logCapabilities() {
    try {
      var objs = RT.objects ? Object.keys(RT.objects) : [];
      console.log(TAG, "TODOS os objetos (" + objs.length + "):", objs);
      console.log(TAG, "globalVars:", RT.globalVars ? Object.keys(RT.globalVars) : "n/d");
      window.__c3objs = objs;
    } catch (e) {}
  }

  // escaneia objetos e retorna os visiveis cujo nome sugere modal
  function scanVisibleModals() {
    var hits = [];
    try {
      var names = RT.objects ? Object.keys(RT.objects) : [];
      for (var i = 0; i < names.length; i++) {
        var nm = names[i];
        if (!/setting|popup|controller|container|modal|window|panel|dialog|ajuste/i.test(nm)) continue;
        var o = RT.objects[nm];
        if (!o || !o.getAllInstances) continue;
        var insts = o.getAllInstances();
        for (var j = 0; j < insts.length; j++) {
          if (insts[j].isVisible) { hits.push(nm); break; }
        }
      }
    } catch (e) {}
    return hits;
  }

  /* ---------- helpers de acesso ao jogo ---------- */
  function getInst(name) {
    try {
      var o = RT && RT.objects && RT.objects[name];
      if (!o) return null;
      var inst = o.getFirstInstance ? o.getFirstInstance() : null;
      return inst || null;
    } catch (e) { return null; }
  }
  function isVisible(name) {
    var i = getInst(name);
    return !!(i && i.isVisible);
  }
  function callFn(name) {
    try {
      if (RT && typeof RT.callFunction === "function") {
        var args = Array.prototype.slice.call(arguments, 1);
        return RT.callFunction.apply(RT, [name].concat(args));
      }
    } catch (e) { console.warn(TAG, "callFunction falhou:", name, e); }
    return undefined;
  }
  function getGV(name) { try { return RT.globalVars ? RT.globalVars[name] : undefined; } catch (e) { return undefined; } }
  function setGV(name, val) { try { if (RT.globalVars && name in RT.globalVars) RT.globalVars[name] = val; } catch (e) {} }

  /* ---------- deteccao dos modais nativos ---------- */
  var tickCount = 0;
  function onTick() {
    if (!RT) return;
    tickCount++;
    if (tickCount % 15 === 0) {
      var vis = scanVisibleModals();
      setStatus("runtime OK | visiveis: " + (vis.length ? vis.join(", ") : "(nenhum)"), vis.length ? "#8ff" : "#8f8");
    }
  }

  function hideNativeSettings() {
    // some com os objetos nativos do modal de settings (nao fecha a logica)
    ["setting_controller", "setting_container", "setting_btn_close",
     "settings_txt_lang", "settings_txt_earse", "btn_audio"].forEach(function (n) {
      try {
        var o = RT.objects[n]; if (!o || !o.getAllInstances) return;
        o.getAllInstances().forEach(function (i) { i.isVisible = false; });
      } catch (e) {}
    });
  }

  /* ---------- UI HTML ---------- */
  var overlay = null;
  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "mb-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;" +
      "background:rgba(15,18,32,.5);backdrop-filter:blur(4px);font-family:system-ui,Arial,sans-serif;";
    document.body.appendChild(overlay);
    var style = document.createElement("style");
    style.textContent =
      "#mb-overlay .mb-card{position:relative;width:min(86vw,360px);background:#FFFDF8;border-radius:26px;" +
      "box-shadow:0 24px 60px rgba(0,0,0,.35);padding:22px 20px 24px;animation:mbPop .22s cubic-bezier(.34,1.56,.64,1)}" +
      "@keyframes mbPop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}" +
      "#mb-overlay .mb-eyebrow{text-align:center;text-transform:uppercase;letter-spacing:1px;font-size:13px;font-weight:800;color:#c0863a;margin-bottom:2px}" +
      "#mb-overlay .mb-title{text-align:center;font-size:26px;font-weight:900;color:#26324a;margin:0 0 16px}" +
      "#mb-overlay .mb-close{position:absolute;top:-14px;right:-14px;width:46px;height:46px;border:none;border-radius:50%;" +
      "background:#ff5252;color:#fff;font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.3)}" +
      "#mb-overlay .mb-row{display:flex;align-items:center;gap:14px;padding:14px 6px;border-bottom:1px solid #eef1f7}" +
      "#mb-overlay .mb-row:last-child{border-bottom:none}" +
      "#mb-overlay .mb-ico{font-size:26px;width:36px;text-align:center}" +
      "#mb-overlay .mb-lbl{flex:1;font-size:19px;font-weight:800;color:#2d3348}" +
      "#mb-overlay .mb-sw{position:relative;width:64px;height:34px;border-radius:17px;background:#cfd6e4;cursor:pointer;transition:background .18s}" +
      "#mb-overlay .mb-sw.on{background:linear-gradient(180deg,#6fdc4f,#3cb527)}" +
      "#mb-overlay .mb-sw i{position:absolute;top:3px;left:3px;width:28px;height:28px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.25);transition:left .18s}" +
      "#mb-overlay .mb-sw.on i{left:33px}" +
      "#mb-overlay .mb-btn{width:100%;margin-top:18px;border:none;border-radius:16px;padding:15px;font-size:19px;font-weight:800;color:#fff;cursor:pointer;background:linear-gradient(180deg,#6fdc4f,#3cb527);box-shadow:0 5px 0 rgba(0,0,0,.18)}";
    document.head.appendChild(style);
    return overlay;
  }

  function openSettingsHTML() {
    hideNativeSettings();
    var ov = ensureOverlay();
    var audioOn = readAudioState();
    ov.innerHTML =
      '<div class="mb-card">' +
      '  <button class="mb-close" id="mbClose">&#10005;</button>' +
      '  <div class="mb-eyebrow">Options</div>' +
      '  <div class="mb-title">Settings</div>' +
      '  <div class="mb-row"><div class="mb-ico">\u{1F50A}</div><div class="mb-lbl">Sound</div>' +
      '    <div class="mb-sw ' + (audioOn ? "on" : "") + '" id="mbSound"><i></i></div></div>' +
      '  <div class="mb-row"><div class="mb-ico">\u{1F30D}</div><div class="mb-lbl">Language</div>' +
      '    <div class="mb-lbl" style="flex:none;color:#63708a;font-weight:700" id="mbLang">EN</div></div>' +
      '  <button class="mb-btn" id="mbOk">Continue</button>' +
      '</div>';
    ov.style.display = "flex";
    document.getElementById("mbClose").onclick = function () { closeSettingsHTML(false); };
    document.getElementById("mbOk").onclick = function () { closeSettingsHTML(false); };
    document.getElementById("mbSound").onclick = function () {
      var on = !this.classList.contains("on");
      this.classList.toggle("on", on);
      writeAudioState(on);
    };
  }

  function closeSettingsHTML(fromNative) {
    if (overlay) overlay.style.display = "none";
    if (!fromNative) {
      // fecha tambem o modal nativo (dispara a logica de fechar do jogo)
      var closeBtn = getInst("setting_btn_close");
      // tentativa 1: chamar a funcao Settings (costuma alternar/fechar)
      // tentativa 2: esconder o controller
      try {
        var o = RT.objects["setting_controller"];
        if (o && o.getAllInstances) o.getAllInstances().forEach(function (i) { i.isVisible = false; });
      } catch (e) {}
      callFn("Settings"); // se a funcao alterna, isso fecha
    }
    lastSettingsOpen = false;
  }

  /* ---------- estado de audio (varias tentativas) ---------- */
  function readAudioState() {
    // tenta global var 'audio', senao o estado do stub, senao true
    var g = getGV("audio");
    if (typeof g === "boolean") return g;
    if (typeof g === "number") return g !== 0;
    return true;
  }
  function writeAudioState(on) {
    setGV("audio", on);
    // muitos jogos C3 tem uma funcao p/ aplicar o audio
    callFn("Audio", on ? 1 : 0);
    // fallback: mutar via runtime
    try { if (RT && RT.audio && typeof RT.audio.setSilent === "function") RT.audio.setSilent(!on); } catch (e) {}
  }

  boot();
})();
