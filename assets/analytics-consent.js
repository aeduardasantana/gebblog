/* Blog GEB - Google Analytics 4 with prior opt-in. No GA requests before consent. */
(function () {
  "use strict";
  var ID = "G-DB40430ZVR";
  var KEY = "geb_blog_analytics_consent_v1";
  var active = false;
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  function enable() {
    if (active) return;
    active = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ID, { send_page_view: true });
    var el = document.createElement("script");
    el.async = true;
    el.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(el);
  }
  function save(value) {
    choice = value;
    try { localStorage.setItem(KEY, value); } catch (e) {}
    if (value === "granted") enable();
    else if (active && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    hideDialog();
  }
  function hideDialog() {
    var dialog = document.getElementById("geb-analytics-dialog");
    if (dialog) dialog.remove();
  }
  function showDialog() {
    hideDialog();
    var dialog = document.createElement("section");
    dialog.id = "geb-analytics-dialog";
    dialog.setAttribute("aria-label", "Preferências de privacidade e medição");
    dialog.style.cssText = "position:fixed;z-index:2147483000;bottom:16px;left:16px;right:16px;max-width:620px;margin:auto;background:#fff;color:#182b2a;border:1px solid #50645d;padding:18px 20px;box-shadow:0 8px 32px rgba(0,0,0,.18);font:14px/1.5 system-ui,Arial,sans-serif";
    var heading = document.createElement("strong");
    heading.textContent = "Privacidade no Blog GEB";
    heading.style.cssText = "display:block;font-size:16px;margin-bottom:7px";
    var text = document.createElement("p");
    text.style.cssText = "margin:0 0 14px";
    text.textContent = "Com sua autorização, usamos o Google Analytics para entender visitas e melhorar os conteúdos. Você pode continuar sem medição e mudar sua escolha depois.";
    var actions = document.createElement("div");
    actions.style.cssText = "display:flex;flex-wrap:wrap;gap:9px";
    function button(label, granted) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.style.cssText = "cursor:pointer;min-height:44px;padding:9px 13px;font:600 13px system-ui,Arial,sans-serif;border:1px solid #172e32;background:" + (granted ? "#172e32;color:white" : "white;color:#172e32");
      b.addEventListener("click", function () { save(granted ? "granted" : "denied"); });
      actions.appendChild(b);
    }
    button("Continuar sem medição", false);
    button("Aceitar medição", true);
    dialog.appendChild(heading);
    dialog.appendChild(text);
    dialog.appendChild(actions);
    document.body.appendChild(dialog);
  }
  function setup() {
    var prefs = document.createElement("button");
    prefs.type = "button";
    prefs.textContent = "Privacidade";
    prefs.setAttribute("aria-label", "Alterar preferências de medição do Blog GEB");
    prefs.style.cssText = "position:fixed;bottom:8px;left:8px;z-index:2147482999;background:#fff;color:#172e32;border:1px solid #50645d;padding:6px 9px;min-height:34px;font:12px system-ui,Arial,sans-serif;cursor:pointer";
    prefs.addEventListener("click", showDialog);
    document.body.appendChild(prefs);
    if (choice === "granted") enable();
    else if (choice !== "denied") showDialog();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();
})();
