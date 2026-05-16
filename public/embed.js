(function () {
  "use strict";

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var botId = script.getAttribute("data-bot-id");
  if (!botId) {
    console.warn("[BotForge] data-bot-id attribute is required");
    return;
  }

  var baseUrl = script.src.replace("/embed.js", "");

  // Create iframe container
  var container = document.createElement("div");
  container.id = "botforge-widget-" + botId;
  container.style.cssText = [
    "position: fixed",
    "bottom: 24px",
    "right: 24px",
    "z-index: 2147483647",
    "width: 360px",
    "height: 520px",
    "border: none",
    "border-radius: 16px",
    "box-shadow: 0 20px 60px rgba(0,0,0,0.15)",
    "overflow: hidden",
  ].join(";");

  var iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/chat/" + botId;
  iframe.style.cssText = "width:100%;height:100%;border:none;";
  iframe.setAttribute("title", "Chat Widget");
  iframe.setAttribute("allow", "microphone");

  container.appendChild(iframe);
  document.body.appendChild(container);
})();
