import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  increment,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCywqYls2mJfY9maHRhsHRTP6OmPgC1Kf0",
  authDomain: "x-shopping-6611d.firebaseapp.com",
  projectId: "x-shopping-6611d",
  storageBucket: "x-shopping-6611d.firebasestorage.app",
  messagingSenderId: "177602183210",
  appId: "1:177602183210:web:011c708002426b37cb8353",
  measurementId: "G-QKLP9H1N9P"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function processMomoPayment() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      console.error("No logged-in user found.");
      return;
    }

    const savedmomoAmount =
      document.getElementById("amount")?.value?.trim().replace(/[^0-9]/g, "") || "";

    if (!savedmomoAmount) {
      console.error("No MOMO amount found.");
      return;
    }

    const momoAmountNumber = parseFloat(savedmomoAmount);
    if (isNaN(momoAmountNumber) || momoAmountNumber <= 0) {
      console.error("Invalid MOMO amount:", savedmomoAmount);
      return;
    }

    const phoneInput = document.getElementById("phone");
    const phone = phoneInput ? phoneInput.value.trim() : "";

    const userRef = doc(db, "users", currentUser.userId);

    await setDoc(
      userRef,
      {
        phone: phone,
        amount: increment(Number(momoAmountNumber)),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    console.log("Mobile money data successfully sent to Firestore.");
  } catch (error) {
    console.error("Error sending mobile money data to Firestore:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.getElementById("payBtn");
  if (!payBtn) return;

  const currentUse = getCurrentUser();
  const userId = currentUse?.userId || "";

  const phone = document.getElementById("phone");
  const amount = document.getElementById("amount");
  const statusEl = document.getElementById("status");
  const details = document.getElementById("details");
  const referenceEl = document.getElementById("reference");
  const stateEl = document.getElementById("state");

  const API_BASE = "https://marzpay-api.investinginaionline.workers.dev";

  let timer = null;
  let active = false;

  function message(t, c = "") {
    if (!statusEl) return;
    statusEl.textContent = t;
    statusEl.className = "status " + c;
  }

  function stop() {
    active = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function busy(v) {
    payBtn.disabled = v;
    payBtn.textContent = v ? "Processing..." : "Pay Now";
  }

  payBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    stop();

    const uid = userId || getCurrentUser()?.userId || "";
    const ph = phone ? phone.value.trim() : "";
    const amt = amount ? Number(amount.value) : 0;

    if (!uid) return message("Please log in first before making a deposit.", "error");
    if (!ph) return message("Please enter your mobile money number.", "error");
    if (!Number.isInteger(amt) || amt < 500 || amt > 10000000) {
      return message("Amount must be between UGX 500 and UGX 10,000,000.", "error");
    }

    busy(true);
    message("Starting payment...", "processing");

    try {
      const r = await fetch(API_BASE + "/collect-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, phone: ph, amount: amt })
      });
      const d = await r.json();

      if (!r.ok || d.status !== "success") {
        throw new Error(d.message || "Payment could not be initiated.");
      }

      const t = d?.data?.transaction || {};
      const ref = t.reference || d?.data?.reference || "";

      if (!ref) throw new Error("Payment gateway did not return a reference.");

      if (referenceEl) referenceEl.textContent = ref;
      if (stateEl) stateEl.textContent = t.status || "processing";
      if (details) details.classList.remove("hidden");
      message("Payment request sent. Approve the MTN or Airtel prompt on your phone.", "processing");

      poll(ref);
    } catch (err) {
      message(err.message || "Unable to start payment.", "error");
      busy(false);
    }
  });

  function poll(ref) {
    active = true;
    let n = 0;

    (async function check() {
      if (!active) return;
      n++;

      try {
        const r = await fetch(API_BASE + "/payment-status/" + encodeURIComponent(ref), { cache: "no-store" });
        const d = await r.json();

        if (!r.ok || d.status !== "success") {
          throw new Error(d.message || "Status check failed.");
        }

        const p = d.data || {};
        const s = p.status || "processing";

        if (stateEl) stateEl.textContent = s;

        if (s === "paid") {
          stop();
          message("Payment successful!", "success");
          try {
            await processMomoPayment();
          } catch (error) {
            console.error(error);
          }
          busy(false);
          return;
        }
        if (s === "failed") {
          stop();
          message("Payment failed. Please try again.", "error");
          busy(false);
          return;
        }
        if (s === "cancelled") {
          stop();
          message("Payment was cancelled.", "error");
          busy(false);
          return;
        }

        message("Waiting for payment confirmation. Approve the prompt on your phone.", "processing");

        if (n >= 60) {
          stop();
          message("Confirmation is taking longer than expected. Please check your payment status before retrying.", "processing");
          busy(false);
          return;
        }

        timer = setTimeout(check, 3000);
      } catch (err) {
        if (n >= 60) {
          stop();
          message("Unable to confirm the payment automatically. Please check your payment status before retrying.", "error");
          busy(false);
          return;
        }
        timer = setTimeout(check, 3000);
      }
    })();
  }
});

function displayTotalDeposited() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) return;

  const totalEl = document.getElementById("total-deposited");
  if (!totalEl) return;

  const userRef = doc(db, "users", currentUser.userId);

  onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const total = data.amount || 0;
        totalEl.textContent = `UGX ${Number(total).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      } else {
        totalEl.textContent = "UGX 0.00";
      }
    },
    (error) => {
      console.error("Error listening to total deposited:", error);
    }
  );
}

displayTotalDeposited();
