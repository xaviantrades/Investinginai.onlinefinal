/* ==============================
   NAVIGATION & OVERLAY CONTROLS
=============================== */

function openDeposit() {
  window.location.href = "payment_form_spinner_fixed.html";
}

function openWithdraw() {
  const el = document.getElementById("withdrawOverlay");
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function openInvite() {
  const el = document.getElementById("inviteOverlay");
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function openMyteam() {
  const el = document.getElementById("myteamoverlay");
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function openViptask() {
  const el = document.getElementById("vipOverlay");
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function openReward() {
  const el = document.getElementById("rewardOverlay");
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function openManager() {
  const el = document.getElementById("manageOverlay");
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function openDownloadapp() {
  const el = document.getElementById("appOverlay");
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeWindow() {
  const overlayIds = [
    "withdrawOverlay",
    "billOverlay",
    "inviteOverlay",
    "rewardOverlay",
    "vipOverlay",
    "manageOverlay",
    "appOverlay",
    "raffleOverlay",
    "myteamoverlay",
    "settingOverlay"
  ];

  overlayIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  document.body.style.overflow = "";
  if (window.location.hash === "#withdraw") {
    history.replaceState(null, "", window.location.pathname);
  }
}

function closeDeposit() {
  const el = document.getElementById("depositOverlay");
  if (el) el.classList.add("active");
  document.body.style.overflow = "";
}

function returnHome() {
  window.location.href = "user-account.html";
}

/* ==============================
   WITHDRAW TABS (MOMO / USDT)
=============================== */

function showMomo() {
  document.getElementById("momoTab")?.classList.add("active");
  document.getElementById("usdtTab")?.classList.remove("active");
  const momo = document.getElementById("momoSection");
  if (momo) {
    momo.classList.remove("hidden");
    momo.classList.add("active");
  }
  document.getElementById("usdtSection")?.classList.remove("active");
}

function showUsdt() {
  document.getElementById("usdtTab")?.classList.add("active");
  document.getElementById("momoTab")?.classList.remove("active");
  const momo = document.getElementById("momoSection");
  if (momo) {
    momo.classList.add("hidden");
    momo.classList.remove("active");
  }
  document.getElementById("usdtSection")?.classList.add("active");
}

function updateAmount() {
  const input = document.getElementById("amountInput");
  const display = document.getElementById("amountDisplay");
  if (!input || !display) return;

  let amount = input.value;
  if (amount === "" || Number.isNaN(Number(amount))) {
    amount = "0.00";
  } else {
    amount = Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  display.textContent = amount;
}

/* ==============================
   CRYPTO DEPOSIT REDIRECT
=============================== */

function goToPayment() {
  const amountEl = document.getElementById("usdtcrypto-amount");
  const amount = amountEl ? amountEl.value.trim() : "";

  if (amount) {
    sessionStorage.setItem("tempUsdtAmount", amount);
  }

  window.location.href = "crypto_payment_confirmation.html";
}

function processDeposit() {
  const usdtTab = document.getElementById("usdtTab");
  const isUsdtActive = usdtTab && usdtTab.classList.contains("active");

  const amountEl = document.getElementById("amountInput");
  const amount = amountEl ? amountEl.value.trim() : "";
  const phoneInput = document.getElementById("phoneNumber");
  const phone = phoneInput ? phoneInput.value.trim() : "";

  const displayPhone = document.getElementById("displayPhone");
  const displayAmount = document.getElementById("displayAmount");
  const paymentText = document.getElementById("payment-text");

  if (displayPhone) displayPhone.textContent = phone;
  if (displayAmount) displayAmount.textContent = "UGX " + Number(amount || 0).toLocaleString();
  if (paymentText) paymentText.textContent = "UGX " + Number(amount || 0).toLocaleString();

  if (isUsdtActive) {
    goToPayment();
    closeDeposit();
  } else {
    if (phone === "") {
      alert("Please enter your MTN or Airtel number.");
      return;
    }
    if (amount === "" || Number(amount) <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }
    closeDeposit();
  }
}

/* Expose globally so inline onclick handlers work in both module and classic contexts */
Object.assign(window, {
  openDeposit,
  openWithdraw,
  openInvite,
  openMyteam,
  openViptask,
  openReward,
  openManager,
  openDownloadapp,
  closeWindow,
  closeDeposit,
  returnHome,
  showMomo,
  showUsdt,
  updateAmount,
  processDeposit,
  goToPayment
});

/* ==============================
   LANDING MESSAGE POPUP & HASH HOOK
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#withdraw") {
    openWithdraw();
  }

  const popup = document.getElementById("fullscreen-popup");
  const closeBtn = document.getElementById("close-popup");
  const popupTitle = document.getElementById("popup-title");
  const popupTextbox = document.getElementById("popup-textbox");

  if (!popup || !closeBtn || !popupTitle || !popupTextbox) {
    return;
  }

  const customMessages = {
    "msg-machine":
      "WisdomTree International AI Enhanced Value Fund seeks income and capital appreciation by investing primarily in equity securities selected from developed market equities that exhibit strong value fundamentals, powered by a proprietary quantitative artificial intelligence (AI) model.",

    "msg-invite":
      "• Gain dynamic core value exposure to developed international equities with alpha potential.\n\n• Complement or upgrade mid- and large-cap core value allocations.\n\n• Access an actively managed investment strategy driven by deep financial fundamentals and machine learning.",

    "msg-team":
      "Firms in the United States attract the largest share of AI venture capital by a wide margin (~75% of global AI VC deal value), followed by the EU27 (6%), China (5%), and the United Kingdom (5%).\n\nSince 2023, AI infrastructure, cloud compute, and hosting companies have led global investment inflows as capital concentrates into high-growth compute clusters critical to scaling frontier AI models. While long-term prospects for AI remain strong, financial markets are cyclical and historical trends should be evaluated thoughtfully.",

    "msg-vip":
      "• United States: Leads global private AI investment ($471B+ cumulative), focused on generative AI, semiconductor infrastructure, and enterprise cloud.\n\n• China: Ranks second globally (~$119B cumulative), targeting autonomous systems, smart manufacturing, and healthcare AI.\n\n• UK & Europe: Over $28B+ committed in the UK alongside major French and German industrial AI initiatives.\n\n• Asia-Pacific: South Korea, Taiwan, and Japan anchor global AI semiconductor fabrication and high-bandwidth memory supply.",

    "msg-salary":
      "Please review the fund's objectives, lock-up terms, risks, and fee structure carefully before investing.\n\nAll investments involve risk, including potential fluctuations in market value. International and digital-asset strategies may be affected by currency movements, liquidity conditions, or market volatility. Quantitative AI models rely on live and historical market signals and returns are settled upon completion of each designated lock-up cycle."
  };

  const messageItems = document.querySelectorAll(".ite");

  messageItems.forEach((item) => {
    item.addEventListener("click", function () {
      const rawText = this.querySelector(".text")?.innerText || "Information";
      const cleanText = rawText.includes(": ") ? rawText.split(": ")[1] : rawText;
      const clickedId = this.id;
      const textToShow = customMessages[clickedId] || "Details coming soon.";

      popupTitle.innerText = cleanText;
      popupTextbox.textContent = textToShow;
      popup.style.display = "flex";
    });
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });
});
