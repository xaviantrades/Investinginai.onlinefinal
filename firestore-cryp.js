document.addEventListener("DOMContentLoaded", function () {
  const savedAmount = sessionStorage.getItem("tempUsdtAmount");
  const paymentAmountEl = document.getElementById("paymentAmount");

  if (savedAmount && paymentAmountEl) {
    const num = Number(savedAmount);
    paymentAmountEl.textContent = Number.isFinite(num) && num > 0
      ? `UGX ${num.toLocaleString("en-US")}`
      : `${savedAmount} UGX`;
  }
});
