(function initAllPopups() {
  function bindPopupClose() {
    const overlay = document.getElementById("allpopupOverlay");
    if (!overlay || overlay.dataset.bound === "true") return;
    overlay.dataset.bound = "true";

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay || event.target.closest(".allpopup-close")) {
        overlay.style.display = "none";
      }
    });
  }

  if (typeof window.showPopup !== "function") {
    window.showPopup = function (text) {
      const popupText = document.getElementById("allpopupText");
      const overlay = document.getElementById("allpopupOverlay");
      if (!popupText || !overlay) return;
      popupText.textContent = text;
      overlay.style.display = "flex";
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindPopupClose);
  } else {
    bindPopupClose();
  }
})();
