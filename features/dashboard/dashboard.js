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
    window.location.href = '/analysis.php?id=' + id;
  }

  function openChat(opts) {
    Roller.open({
      id: "analysis-chat",
      title: "Новый разбор",
      content: '<div id="chat-mount"></div>'
    });
    setTimeout(function () {
      if (typeof Chat !== "undefined") {
        Chat.init("chat-mount", Object.assign({}, opts || {}, {
          onComplete: function (d) {
            window.location.href = '/analysis.php?id=' + d.analysis_id;
          }
        }));
      }
    }, 60);
  }

  return { openAnalysis: openAnalysis, openChat: openChat };
})();
