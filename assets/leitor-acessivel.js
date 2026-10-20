(function () {
  "use strict";
  var intro = "Bem-vindo ao Blog GEB, do Grupo Eduarda Bispo. Aqui, informação amplia perspectivas e conhecimento orienta decisões. Explore conteúdos sobre negócios, educação, saúde, inclusão, tecnologia, desenvolvimento humano e fé. Você pode pesquisar assuntos, escolher uma editoria e ouvir cada artigo utilizando seu próprio leitor de áudio. A leitura é iniciada somente quando você desejar.";
  var synth = window.speechSynthesis;
  var active = null;
  function splitText(text) {
    var chunks = [], remaining = String(text || "").replace(/\s+/g, " ").trim();
    while (remaining.length) {
      if (remaining.length <= 190) { chunks.push(remaining); break; }
      var slice = remaining.slice(0, 190);
      var cut = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("? "), slice.lastIndexOf("! "), slice.lastIndexOf("; "));
      if (cut < 60) cut = slice.lastIndexOf(" ");
      if (cut < 40) cut = 190;
      else if (slice.charAt(cut + 1) === " ") cut += 1;
      chunks.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }
    return chunks.filter(Boolean);
  }
  function articleText() {
    var title = document.getElementById("titulo");
    var subtitle = document.getElementById("subtitulo");
    var body = document.getElementById("conteudo-artigo");
    if (!body || !body.textContent.trim()) return "";
    var clone = body.cloneNode(true);
    clone.querySelectorAll("script,style,iframe,video,audio,button,form,nav,[aria-hidden='true'],[hidden],.inline-experience,.cta-component,.offer-component").forEach(function (el) { el.remove(); });
    var parts = [title && title.textContent, subtitle && !subtitle.hidden && subtitle.textContent];
    clone.querySelectorAll("h2,h3,h4,p,li,blockquote").forEach(function (el) {
      if (el.closest("li") && el.tagName !== "LI") return;
      if (el.closest("blockquote") && el.tagName !== "BLOCKQUOTE") return;
      if (el.tagName === "LI" && el.querySelector("p")) return;
      var text = el.textContent.trim();
      if (text) parts.push(text);
    });
    return parts.filter(Boolean).join(". ");
  }
  function status(player, message) { player.querySelector("[data-tts-status]").textContent = message; }
  function state(player, playing, paused) {
    player.querySelector("[data-tts-play]").textContent = paused ? "Continuar" : "Ouvir";
    player.querySelector("[data-tts-pause]").disabled = !playing || paused;
    player.querySelector("[data-tts-stop]").disabled = !playing;
  }
  function stop() {
    if (active) {
      active.cancelled = true;
      var previous = active.player;
      active = null;
      state(previous, false, false);
      status(previous, "Leitura interrompida.");
    }
    if (synth) synth.cancel();
  }
  function speakNext(session) {
    if (!synth || session !== active || session.cancelled) return;
    if (session.index >= session.parts.length) {
      active = null;
      state(session.player, false, false);
      status(session.player, "Leitura concluída.");
      return;
    }
    var utterance = new SpeechSynthesisUtterance(session.parts[session.index]);
    utterance.lang = "pt-BR";
    utterance.rate = session.rate;
    var voices = synth.getVoices();
    var preferred = voices.find(function (v) { return /^pt[-_]BR$/i.test(v.lang); });
    if (preferred) utterance.voice = preferred;
    utterance.onend = function () { if (active === session && !session.cancelled) { session.index += 1; speakNext(session); } };
    utterance.onerror = function (e) {
      if (active !== session || session.cancelled) return;
      if (e.error === "interrupted" || e.error === "canceled") return;
      active = null; state(session.player, false, false);
      status(session.player, "Não foi possível continuar a leitura. Verifique a voz disponível no navegador.");
    };
    synth.speak(utterance);
  }
  function init(container) {
    if (container.dataset.ttsReady) return;
    container.dataset.ttsReady = "true";
    var isArticle = container.id === "geb-leitor-artigo";
    container.innerHTML = '<div class="geb-tts__heading"><strong>' + (isArticle ? "Ouça este artigo" : "Conheça o Blog GEB em áudio") + '</strong><span>Leitura em português</span></div>' +
      '<div class="geb-tts__controls"><button type="button" data-tts-play>Ouvir</button><button type="button" data-tts-pause disabled>Pausar</button><button type="button" data-tts-stop disabled>Parar</button>' +
      '<label>Velocidade <select data-tts-rate aria-label="Velocidade da leitura"><option value="0.8">0,8×</option><option value="1" selected>1×</option><option value="1.2">1,2×</option><option value="1.5">1,5×</option></select></label></div>' +
      '<p class="geb-tts__status" data-tts-status role="status" aria-live="polite">Pressione Ouvir para iniciar. O áudio não começa automaticamente.</p>';
    var play = container.querySelector("[data-tts-play]");
    var pause = container.querySelector("[data-tts-pause]");
    var stopButton = container.querySelector("[data-tts-stop]");
    if (!synth || !window.SpeechSynthesisUtterance) {
      play.disabled = true; status(container, "Leitura por voz indisponível neste navegador. O texto permanece acessível para leitores de tela."); return;
    }
    play.addEventListener("click", function () {
      if (active && active.player === container && synth.paused) {
        synth.resume(); state(container, true, false); status(container, "Leitura retomada."); return;
      }
      stop();
      var content = isArticle ? articleText() : intro;
      if (!content) { status(container, "O conteúdo do artigo ainda não está disponível."); return; }
      active = { player:container, parts:splitText(content), index:0, rate: Number(container.querySelector("[data-tts-rate]").value), cancelled:false };
      state(container, true, false); status(container, "Reproduzindo leitura.");
      speakNext(active);
    });
    pause.addEventListener("click", function () {
      if (active && active.player === container) {
        synth.pause(); state(container, true, true); status(container, "Leitura pausada.");
      }
    });
    stopButton.addEventListener("click", stop);
    container.querySelector("[data-tts-rate]").addEventListener("change", function () {
      status(container, "Velocidade selecionada. A alteração será aplicada ao reiniciar a leitura.");
    });
  }
  document.querySelectorAll("[data-geb-tts]").forEach(init);
  document.addEventListener("visibilitychange", function () { if (document.hidden && active) stop(); });
  window.addEventListener("pagehide", stop);
})();