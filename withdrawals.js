import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  setDoc,
  increment,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* =========================================================
 * Config
 * ======================================================= */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCywqYls2mJfY9maHRhsHRTP6OmPgC1Kf0",
  authDomain: "x-shopping-6611d.firebaseapp.com",
  projectId: "x-shopping-6611d",
  storageBucket: "x-shopping-6611d.firebasestorage.app",
  messagingSenderId: "177602183210",
  appId: "1:177602183210:web:011c708002426b37cb8353",
  measurementId: "G-QKLP9H1N9P"
};

const COLLECTION_NAME = "withdrawals";
const CONTAINER_ID = "withdraw-container";

const AI_FALLBACK_IMAGES = [
  "assets/ai-tier-1.jpg",
  "assets/ai-tier-2.jpg",
  "assets/ai-tier-3.jpg"
];

const DEFAULT_AI_MODELS = [
  {
    id: "default-ai-1",
    type: "AIVI Neural Core S1",
    lock: "3 days",
    price: 30000,
    totalIncome: 42000,
    descrip: "Entry quantitative AI compute tier with automated 72-hour yield settlement.",
    imageUrl: "assets/ai-tier-1.jpg"
  },
  {
    id: "default-ai-2",
    type: "AIVI Alpha Engine Pro",
    lock: "7 days",
    price: 100000,
    totalIncome: 155000,
    descrip: "High-frequency neural arbitrage engine designed for steady weekly compounding.",
    imageUrl: "assets/ai-tier-2.jpg"
  },
  {
    id: "default-ai-3",
    type: "AIVI Supercluster VIP",
    lock: "14 days",
    price: 300000,
    totalIncome: 510000,
    descrip: "Enterprise GPU cluster allocation delivering maximum institutional AI returns.",
    imageUrl: "assets/ai-tier-3.jpg"
  }
];

/* =========================================================
 * Firebase init
 * ======================================================= */
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const withdrawalsCollection = collection(db, COLLECTION_NAME);

/* =========================================================
 * GET LOGGED IN USER INFORMATION
 * ======================================================= */
function getCurrentUser() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") return null;

  let userData = {};
  try {
    userData = JSON.parse(localStorage.getItem("userData") || "{}");
  } catch (error) {
    console.error("Invalid userData in localStorage:", error);
  }

  return {
    isLoggedIn: true,
    userId: localStorage.getItem("userId"),
    phone: localStorage.getItem("userPhone"),
    ...userData
  };
}

/* =========================================================
 * POPUP HELPER & CLOSE BINDING
 * ======================================================= */
let popupHideTimer = null;

function bindAllPopupClose() {
  const overlay = document.getElementById("allpopupOverlay");
  if (!overlay || overlay.dataset.closeBound === "true") return;
  overlay.dataset.closeBound = "true";

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest(".allpopup-close")) {
      overlay.style.display = "none";
      if (popupHideTimer) clearTimeout(popupHideTimer);
    }
  });
}

function showPopup(text) {
  bindAllPopupClose();
  const popup = document.getElementById("allpopupText");
  const overlay = document.getElementById("allpopupOverlay");
  if (!popup || !overlay) {
    alert(text);
    return;
  }

  popup.textContent = text;
  overlay.style.display = "flex";

  if (popupHideTimer) clearTimeout(popupHideTimer);
  popupHideTimer = setTimeout(() => {
    overlay.style.display = "none";
  }, 8000);
}

window.showPopup = showPopup;
bindAllPopupClose();

/* =========================================================
 * GET & DEDUCT DEPOSIT AMOUNT
 * ======================================================= */
async function getCurrentAmount() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) return 0;

  try {
    const userRef = doc(db, "users", currentUser.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return Number(userSnap.data().amount) || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching deposit amount:", error);
    return 0;
  }
}

async function deductAmount(amountToDeduct) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) {
    showPopup("Please log in to complete this transaction.");
    return false;
  }

  const deductNumber = parseFloat(amountToDeduct);
  if (isNaN(deductNumber) || deductNumber <= 0) return false;

  try {
    const currentAmount = await getCurrentAmount();

    if (currentAmount < deductNumber) {
      showPopup(
        `Insufficient balance! UGX ${deductNumber.toLocaleString()} exceeds your available account balance. Please deposit funds to continue.`
      );
      return false;
    }

    const userRef = doc(db, "users", currentUser.userId);

    await setDoc(
      userRef,
      {
        amount: increment(-deductNumber),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error deducting amount:", error);
    showPopup("Unable to process transaction right now. Please try again.");
    return false;
  }
}

/* =====================================
   RAFFLE CONFIRM BUY
===================================== */
const confirmBuy = document.getElementById("confirmBuy");

if (confirmBuy) {
  confirmBuy.addEventListener("click", async function () {
    const selectedNumEl = document.getElementById("selectedNumber");
    const num = selectedNumEl ? selectedNumEl.textContent.trim() : "";
    if (!num || num === "0000") return;

    const ok = await deductAmount(20000);
    if (ok) {
      document.getElementById("buyPopup")?.classList.remove("show");
      showPopup(`Raffle card #${num} purchased! UGX 20,000 has been deducted from your balance.`);
    }
  });
}

/* =========================================================
 * Helpers
 * ======================================================= */
function formatMoney(value) {
  const number = Number(value);
  if (value === null || value === undefined || value === "" || Number.isNaN(number)) {
    return "—";
  }
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* =========================================================
 * AI Model Cards Rendering
 * ======================================================= */
function createImage(imageUrl, index = 0) {
  const wrapper = el("div", "withdraw-image");
  const fallbackSrc = AI_FALLBACK_IMAGES[index % AI_FALLBACK_IMAGES.length];

  const image = el("img");
  image.src = imageUrl || fallbackSrc;
  image.alt = "AI Investment Model";
  image.loading = "lazy";

  image.addEventListener("error", () => {
    if (image.src.indexOf(fallbackSrc) === -1) {
      image.src = fallbackSrc;
    }
  });

  wrapper.appendChild(image);
  return wrapper;
}

function createInfo(data) {
  const info = el("div", "withdraw-info");

  info.append(
    el("h2", "withdraw-title", data.type || "AI Model Tier"),
    el("p", "withdraw-line", `Lock Period: ${data.lock || "—"}`),
    el("p", "withdraw-descrip", data.descrip || "Automated quantitative AI yield contract."),
    el("p", "withdraw-line", `Buy Price: UGX ${formatMoney(data.price)}`),
    el("p", "withdraw-line", `Payout Income: UGX ${formatMoney(data.totalIncome)}`)
  );

  return info;
}

function createWithdrawalCard(data, index = 0) {
  const card = el("article", "withdraw-card");
  const fallbackSrc = AI_FALLBACK_IMAGES[index % AI_FALLBACK_IMAGES.length];
  const enrichedData = { ...data, resolvedImage: data.imageUrl || fallbackSrc };

  card.append(createImage(data.imageUrl, index), createInfo(data));

  card.addEventListener("click", () => {
    handleCardClick(enrichedData);
    if (typeof window.openAi === "function") {
      window.openAi();
    } else {
      const overlay = document.getElementById("aiOverlay");
      if (overlay) {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  });

  return card;
}

function renderWithdrawals(container, items) {
  const fragment = document.createDocumentFragment();
  items.forEach((data, idx) => fragment.appendChild(createWithdrawalCard(data, idx)));
  container.replaceChildren(fragment);
}

function renderEmpty(container, text) {
  container.replaceChildren(el("p", "withdraw-empty", text));
}

async function fetchWithdrawals() {
  const snapshot = await getDocs(query(withdrawalsCollection, orderBy("createdAt", "desc")));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

let selectedItem = null;

export function handleCardClick(data) {
  selectedItem = data;

  const title = document.getElementById("withdraw-title");
  const lock = document.getElementById("withdraw-lock");
  const price = document.getElementById("withdraw-price");
  const totalIncome = document.getElementById("withdraw-total-income");
  const modalImg = document.getElementById("withdraw-modal-img");

  if (title) title.textContent = data.type || "AI Model Tier";
  if (lock) lock.textContent = `Lock Period: ${data.lock || "—"}`;
  if (price) price.textContent = `Investment Price: UGX ${formatMoney(data.price)}`;
  if (totalIncome) totalIncome.textContent = `Total Payout: UGX ${formatMoney(data.totalIncome)}`;
  if (modalImg) {
    modalImg.src = data.resolvedImage || data.imageUrl || "assets/ai-tier-1.jpg";
    modalImg.onerror = () => {
      modalImg.src = "assets/ai-tier-1.jpg";
    };
  }
}

const placeAibuyBtn = document.getElementById("place-aibuy");

if (placeAibuyBtn) {
  placeAibuyBtn.addEventListener("click", async function () {
    if (!selectedItem) return;

    try {
      const success = await deductAmount(selectedItem.price);
      if (!success) return;

      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const lockDays = parseInt(String(selectedItem.lock).replace(/\D/g, ""), 10);
      if (isNaN(lockDays)) return;

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + lockDays);

      const investmentData = {
        type: selectedItem.type || "AI Model",
        category: "ai",
        price: Number(selectedItem.price) || 0,
        totalIncome: Number(selectedItem.totalIncome) || 0,
        lock: lockDays,
        expiry: expiry,
        createdAt: new Date()
      };

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        investments: arrayUnion(investmentData)
      });

      if (typeof window.closeAi === "function") {
        window.closeAi();
      }

      showPopup(
        `Success! UGX ${Number(selectedItem.price).toLocaleString()} invested in ${selectedItem.type}.`
      );
    } catch (error) {
      console.error("Buy/investment error:", error);
    }
  });
}

/* =========================================================
 * INVESTMENT HISTORY (history.html)
 * ======================================================= */
function checkExpiry(expiry) {
  if (!expiry) return false;
  const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
  return new Date() >= expiryDate;
}

function applyHistoryTabFilter(tab = "ai") {
  const container = document.getElementById("investments-container");
  const noInvMsg = document.getElementById("no-investments-message");
  const totalEl = document.getElementById("total-investments");
  if (!container) return;

  const cards = container.querySelectorAll(".investment-card");
  let visibleCount = 0;
  let visibleTotal = 0;

  cards.forEach((card) => {
    const cat = card.dataset.category || "ai";
    const match = cat === tab;
    card.hidden = !match;
    if (match) {
      visibleCount++;
      visibleTotal += Number(card.dataset.price || 0);
    }
  });

  if (totalEl) {
    totalEl.textContent = `UGX ${visibleTotal.toLocaleString("en-US")}`;
  }

  if (noInvMsg) {
    noInvMsg.style.display = visibleCount === 0 ? "block" : "none";
    noInvMsg.textContent =
      tab === "crypto"
        ? "No Crypto investments found yet."
        : "No AI investments found yet.";
  }
}

window.filterInvestmentCards = applyHistoryTabFilter;

async function checkInvestmentExpiry() {
  const container = document.getElementById("investments-container");
  if (!container) return false;

  const statusMsg = document.getElementById("status-message");
  const noInvMsg = document.getElementById("no-investments-message");
  const errorMsg = document.getElementById("error-message");
  const userIdEl = document.getElementById("user-id");

  const userId = localStorage.getItem("userId");

  if (!userId) {
    if (userIdEl) userIdEl.textContent = "Guest";
    if (noInvMsg) {
      noInvMsg.textContent = "Please log in to view your investment transactions.";
      noInvMsg.style.display = "block";
    }
    return false;
  }

  if (userIdEl) {
    try {
      userIdEl.textContent = decodeURIComponent(userId);
    } catch {
      userIdEl.textContent = userId;
    }
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      if (noInvMsg) {
        noInvMsg.textContent = "No investments found yet.";
        noInvMsg.style.display = "block";
      }
      return false;
    }

    const userData = userSnap.data();
    const investments = userData.investments || [];
    const btcBalance = Number(userData.btcBalance) || 0;

    container.innerHTML = "";

    investments.forEach((investment, index) => {
      const expired = checkExpiry(investment.expiry);
      const expiryDate = investment.expiry?.toDate
        ? investment.expiry.toDate()
        : investment.expiry
        ? new Date(investment.expiry)
        : null;

      const createdDate = investment.createdAt?.toDate
        ? investment.createdAt.toDate()
        : investment.createdAt
        ? new Date(investment.createdAt)
        : null;

      const rawType = String(investment.type || "AI Model");
      const isCrypto =
        String(investment.category || "").toLowerCase() === "crypto" ||
        /crypto|btc|bitcoin|usdt|eth|sol|bnb|xrp|doge/i.test(rawType);

      const card = document.createElement("div");
      card.className = "investment-card";
      card.dataset.category = isCrypto ? "crypto" : "ai";
      card.dataset.price = String(Number(investment.price) || 0);

      const title = document.createElement("h3");
      title.className = "investment-title";
      title.innerText = `${rawType} (#${index + 1})`;
      card.appendChild(title);

      const priceEl = document.createElement("p");
      priceEl.className = "investment-info investment-price";
      priceEl.innerText = `Invested: UGX ${Number(investment.price || 0).toLocaleString()}`;
      card.appendChild(priceEl);

      const incomeEl = document.createElement("p");
      incomeEl.className = "investment-info investment-profit";
      incomeEl.innerText = `Expected Payout: UGX ${Number(investment.totalIncome || 0).toLocaleString()}`;
      card.appendChild(incomeEl);

      const lockEl = document.createElement("p");
      lockEl.className = "investment-info investment-lock";
      lockEl.innerText = `Lock Period: ${investment.lock} days`;
      card.appendChild(lockEl);

      const createdEl = document.createElement("p");
      createdEl.className = "investment-info investment-created";
      createdEl.innerText = `Created: ${createdDate ? createdDate.toLocaleString() : "N/A"}`;
      card.appendChild(createdEl);

      const expiryEl = document.createElement("p");
      expiryEl.className = "investment-info investment-payout";
      expiryEl.innerText = `Payout Date: ${expiryDate ? expiryDate.toLocaleString() : "N/A"}`;
      card.appendChild(expiryEl);

      const statusEl = document.createElement("p");
      statusEl.className = `investment-status ${expired ? "status-paid" : "status-active"}`;
      statusEl.innerText = `Status: ${expired ? "SETTLED / PAID OUT" : "ACTIVE — ACCRUING YIELD"}`;
      card.appendChild(statusEl);

      if (!expired && expiryDate) {
        const remaining = expiryDate.getTime() - Date.now();
        const remainingDays = Math.max(0, Math.floor(remaining / (1000 * 60 * 60 * 24)));
        const remainingHours = Math.max(
          0,
          Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        );

        const remainingEl = document.createElement("p");
        remainingEl.className = "investment-info";
        remainingEl.innerText = `Time Remaining: ${remainingDays}d ${remainingHours}h`;
        card.appendChild(remainingEl);
      }

      container.appendChild(card);
    });

    if (btcBalance > 0) {
      const cryptoCard = document.createElement("div");
      cryptoCard.className = "investment-card";
      cryptoCard.dataset.category = "crypto";
      cryptoCard.dataset.price = String(btcBalance);
      cryptoCard.innerHTML = `
        <h3 class="investment-title">Active Spot Crypto Allocation</h3>
        <p class="investment-info investment-price">Allocated Capital: UGX ${btcBalance.toLocaleString("en-US")}</p>
        <p class="investment-info">Tracking live BTC/USDT spot market performance (5x dynamic index).</p>
        <p class="investment-status status-active">Status: ACTIVE PORTFOLIO</p>
      `;
      container.appendChild(cryptoCard);
    }

    const activeTab = document.getElementById("btn-crypto")?.classList.contains("active")
      ? "crypto"
      : "ai";
    applyHistoryTabFilter(activeTab);

    if (statusMsg) statusMsg.textContent = "";
    return true;
  } catch (err) {
    console.error("Error checking investments:", err);
    if (errorMsg) {
      errorMsg.textContent = "Unable to load transactions right now. Please refresh.";
      errorMsg.style.display = "block";
    }
    return false;
  }
}

/* =========================================================
 * Load AI Models on ai.html
 * ======================================================= */
async function loadWithdrawals() {
  const container = document.getElementById(CONTAINER_ID);
  if (!container) return;

  renderEmpty(container, "Loading AI investment models…");

  try {
    const withdrawals = await fetchWithdrawals();

    if (withdrawals.length === 0) {
      renderWithdrawals(container, DEFAULT_AI_MODELS);
      return;
    }

    renderWithdrawals(container, withdrawals);
  } catch (error) {
    console.error("Error loading AI model data from Firestore:", error);
    renderWithdrawals(container, DEFAULT_AI_MODELS);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadWithdrawals);
} else {
  loadWithdrawals();
}

export { loadWithdrawals };

/* =========================================================
 * BTC / CRYPTO PORTFOLIO LOGIC
 * ======================================================= */
async function saveBTCBalance(btcBalance) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) return false;

  try {
    const userRef = doc(db, "users", currentUser.userId);
    await setDoc(
      userRef,
      { btcBalance: increment(Number(btcBalance)) },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Error updating BTC balance:", error);
    return false;
  }
}

async function saveInitialBTCPrice(price) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) return false;

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return false;

  try {
    const userRef = doc(db, "users", currentUser.userId);
    await setDoc(userRef, { initialBTCPrice: numericPrice }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving initial BTC price:", error);
    return false;
  }
}

async function getInitialBTCPrice() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) return null;

  try {
    const userRef = doc(db, "users", currentUser.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;

    const storedPrice = Number(userSnap.data().initialBTCPrice);
    return Number.isFinite(storedPrice) && storedPrice > 0 ? storedPrice : null;
  } catch (error) {
    console.error("Error getting initial BTC price:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const slider = document.getElementById("invest-slider");
  const displayBalance = document.getElementById("display-balance");
  const investAmount = document.getElementById("invest-amount");
  const investPercentageText = document.getElementById("invest-percentage-text");
  const buybtn = document.getElementById("buy-buttoncry");
  const coinamount = document.getElementById("selectedAmount");

  if (!slider || !displayBalance || !investAmount || !investPercentageText || !buybtn || !coinamount) {
    return;
  }

  let currentBalance = await getCurrentAmount();
  displayBalance.innerText = `${currentBalance.toLocaleString("en-US")} UGX`;

  let calculatedAmount = 0;

  function updateInvestment() {
    const percentage = Number(slider.value) || 0;
    calculatedAmount = (percentage / 100) * currentBalance;
    investAmount.innerText = calculatedAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    investPercentageText.innerText = `${percentage}% of Balance`;
    slider.style.setProperty("--slider-progress", `${percentage}%`);
    coinamount.innerText = `UGX ${calculatedAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  slider.addEventListener("input", updateInvestment);

  buybtn.addEventListener("click", async function () {
    if (calculatedAmount <= 0) {
      document.getElementById("buyPopup")?.classList.remove("show");
      showPopup(
        currentBalance <= 0
          ? "Your account balance is UGX 0.00. Please deposit funds first to invest in crypto."
          : "Move the slider above 0% to choose an investment amount."
      );
      return;
    }

    const deducted = await deductAmount(calculatedAmount);
    if (!deducted) return;

    const success = await saveBTCBalance(calculatedAmount);
    if (success) {
      currentBalance = Math.max(0, currentBalance - calculatedAmount);
      displayBalance.innerText = `${currentBalance.toLocaleString("en-US")} UGX`;
      updateInvestment();
      document.getElementById("buyPopup")?.classList.remove("show");
      showPopup(`Success! UGX ${formatMoney(calculatedAmount)} allocated to your crypto portfolio.`);
    }
  });

  updateInvestment();
});

function setSlider(value) {
  const slider = document.getElementById("invest-slider");
  if (slider) {
    slider.value = value;
    slider.dispatchEvent(new Event("input"));
  }
}

window.setSlider = setSlider;

/* =========================================================
 * WITHDRAWAL BUTTON LOGIC
 * ======================================================= */
(function () {
  const btn = document.getElementById("withdrawl-btn");
  const input1 = document.getElementById("inputcrypt");
  const input2 = document.getElementById("amountInput");

  if (!btn || (!input1 && !input2)) return;

  btn.addEventListener("click", function () {
    const value1 = input1 ? input1.value.trim() : "";
    const value2 = input2 ? input2.value.trim() : "";

    const number1 = value1 !== "" && !isNaN(value1) ? Number(value1) : null;
    const number2 = value2 !== "" && !isNaN(value2) ? Number(value2) : null;

    let selectedNumber = null;
    if (number1 !== null && number1 > 0) {
      selectedNumber = number1;
    } else if (number2 !== null && number2 > 0) {
      selectedNumber = number2;
    }

    if (selectedNumber === null) {
      showPopup("Please enter a valid withdrawal amount first.");
      return;
    }

    const newnumber = selectedNumber + 30000;
    showPopup(`UGX ${newnumber.toLocaleString("en-US")} is the minimum amount required for withdrawal.`);
  });
})();

/* =========================================================
 * LIVE BTC PORTFOLIO VALUATION
 * ======================================================= */
async function getBTCBalance() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) return 0;

  try {
    const userRef = doc(db, "users", currentUser.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return Number(userSnap.data().btcBalance) || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching BTC balance:", error);
    return 0;
  }
}

async function getBTCPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    if (!response.ok) throw new Error("BTC API request failed");

    const data = await response.json();
    const btcPrice = Number(data?.bitcoin?.usd);
    if (!Number.isFinite(btcPrice) || btcPrice <= 0) {
      throw new Error("Invalid BTC price returned");
    }
    return btcPrice;
  } catch (error) {
    return null;
  }
}

let lockedStartingPrice = null;
let lockedInitialAmount = null;

async function initializeBTCLogic() {
  const btcBalance = await getBTCBalance();
  lockedInitialAmount = btcBalance;

  const cryptoPriceEl = document.getElementById("cryptoprice");
  if (cryptoPriceEl) {
    cryptoPriceEl.textContent = `UGX ${Number(btcBalance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  const resNewAmountEl = document.getElementById("res-new-amount");
  if (resNewAmountEl && btcBalance > 0) {
    resNewAmountEl.textContent = `UGX ${Number(btcBalance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  let storedStartingPrice = await getInitialBTCPrice();

  if (storedStartingPrice === null) {
    const apiPrice = await getBTCPrice();
    if (apiPrice === null) return;
    const saved = await saveInitialBTCPrice(apiPrice);
    if (!saved) return;
    storedStartingPrice = apiPrice;
  }

  lockedStartingPrice = storedStartingPrice;
  await updateBTCValue();
}

async function updateBTCValue() {
  if (lockedStartingPrice === null || lockedInitialAmount === null) return;

  const currentPrice = await getBTCPrice();
  if (currentPrice === null) return;

  const startPrice = lockedStartingPrice;
  const initialAmount = lockedInitialAmount;
  const priceDifference = currentPrice - startPrice;
  const factor = priceDifference / startPrice;
  const multiplier = 5;
  const valueChange = initialAmount * factor * multiplier;
  const newAmount = initialAmount + valueChange;

  const resDiff = document.getElementById("res-difference");
  const resPerc = document.getElementById("res-percentage");
  const resValChange = document.getElementById("res-value-change");
  const resNewAmount = document.getElementById("res-new-amount");
  const cryptoPriceEl = document.getElementById("cryptoprice");

  if (resDiff) resDiff.innerText = priceDifference.toFixed(2);
  if (resPerc) resPerc.innerText = (factor * 100).toFixed(2) + "%";
  if (resValChange) resValChange.innerText = valueChange.toFixed(8);

  const formattedNew =
    "UGX " +
    Number(newAmount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  if (resNewAmount) {
    resNewAmount.innerText = formattedNew;
    resNewAmount.style.color = newAmount < initialAmount ? "#ef4444" : "#00e676";
  }

  if (cryptoPriceEl) {
    cryptoPriceEl.textContent = formattedNew;
  }
}

initializeBTCLogic();
setInterval(updateBTCValue, 30000);

async function updateTotalAccountBalance() {
  const balanceElement = document.getElementById("totalAccountBalance");
  if (!balanceElement) return;

  try {
    const btcBalance = await getBTCBalance();
    const currentAmount = await getCurrentAmount();
    const totalBalance = (Number(btcBalance) || 0) + (Number(currentAmount) || 0);

    balanceElement.textContent = `UGX ${Number(totalBalance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } catch (error) {
    console.error("Failed to calculate total account balance:", error);
    balanceElement.textContent = "UGX 0.00";
  }
}

updateTotalAccountBalance();
checkInvestmentExpiry();

/* =========================================================
 * AI INCOME ACCRUAL & DISPLAY
 * ======================================================= */
async function processExpiredInvestments() {
  const userId = localStorage.getItem("userId");
  if (!userId) return false;

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    const investments = userData.investments || [];

    let expiredIncome = 0;
    let changed = false;

    investments.forEach((investment) => {
      const expired = checkExpiry(investment.expiry);
      if (expired && investment.incomeAdded !== true) {
        const income = Number(investment.totalIncome) || 0;
        if (income > 0) {
          expiredIncome += income;
          investment.incomeAdded = true;
          changed = true;
        }
      }
    });

    if (expiredIncome <= 0) return true;

    if (changed) {
      await setDoc(userRef, { investments: investments }, { merge: true });
    }

    const aiIncomeRef = doc(db, "aiincome", userId);
    await setDoc(
      aiIncomeRef,
      {
        totalIncome: increment(expiredIncome),
        updatedAt: new Date()
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error processing expired investments:", error);
    return false;
  }
}

async function displayAIIncome() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {
    const aiIncomeRef = doc(db, "aiincome", userId);
    const aiIncomeSnap = await getDoc(aiIncomeRef);

    let totalIncome = 0;
    if (aiIncomeSnap.exists()) {
      totalIncome = Number(aiIncomeSnap.data().totalIncome) || 0;
    }

    const formatted = `UGX ${totalIncome.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

    const aiinocmu = document.getElementById("aiinocmu");
    if (aiinocmu) aiinocmu.innerText = formatted;

    const aiincomm = document.getElementById("aiincomm");
    if (aiincomm) aiincomm.innerText = formatted;

    const aiinocu = document.getElementById("aiinocu");
    if (aiinocu) aiinocu.innerText = formatted;
  } catch (error) {
    console.error("Error getting AI income:", error);
  }
}

async function initializeAIIncome() {
  await processExpiredInvestments();
  await displayAIIncome();
}

initializeAIIncome();
