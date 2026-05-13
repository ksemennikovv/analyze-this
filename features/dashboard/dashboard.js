var Dashboard = (function () {
  var dbStartBtn = document.getElementById("dbStartBtn");
  var dbMessage  = document.getElementById("dbMessage");

  if (dbStartBtn) {
    dbStartBtn.addEventListener("click", function () {
      var msg = dbMessage ? dbMessage.value.trim() : "";
      openChat({ initialMessage: msg });
    });
  }
  if (dbMessage) {
    dbMessage.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 180) + "px";
    });
    dbMessage.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); dbStartBtn && dbStartBtn.click(); }
    });
  }

  function openAnalysis(id) {
    Roller.open({
      id: "analysis-chat",
      title: "Разбор",
      content: '<div id="chat-mount"></div>'
    });
    setTimeout(function () {
      if (typeof Chat !== "undefined") {
        Chat.init("chat-mount", { resume: true, analysisId: id });
      }
    }, 60);
  }

  function openChat(opts) {
    Roller.open({
      id: "analysis-chat",
      title: "Новый разбор",
      content: '<div id="chat-mount"></div>'
    });
    setTimeout(function () {
      if (typeof Chat !== "undefined") {
        Chat.init("chat-mount", opts || {});
      }
    }, 60);
  }

  return { openAnalysis: openAnalysis, openChat: openChat };
})();
