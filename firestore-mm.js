let currentStep = 1;

function showStep(step) {
  ["step-1", "step-2", "step-3"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("step-hidden");
  });

  const activeStep = document.getElementById("step-" + step);
  if (activeStep) {
    activeStep.classList.remove("step-hidden");
  }
}

function nextStep() {
  if (currentStep < 3) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 1 && document.getElementById("step-" + (currentStep - 1))) {
    currentStep--;
    showStep(currentStep);
  } else {
    window.location.href = "payment_form_spinner_fixed.html";
  }
}

function handlePaymentSubmit(event) {
  event.preventDefault();

  const txInput = document.getElementById("transaction_id");
  if (!txInput) {
    console.error("transaction_id input not found.");
    return;
  }

  const txIdInput = txInput.value.trim();
  if (!txIdInput) {
    alert("Please enter your Transaction ID.");
    return;
  }

  const displayTxId = document.getElementById("displayTxId");
  if (displayTxId) {
    displayTxId.textContent = txIdInput.toUpperCase();
  }

  const modal = document.getElementById("verificationModal");
  if (modal) {
    modal.classList.add("payment-modal-open");
    setTimeout(() => {
      modal.classList.remove("payment-modal-open");
      window.location.href = "chats.html";
    }, 6000);
  } else {
    setTimeout(() => {
      window.location.href = "chats.html";
    }, 4000);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("step-1") && document.getElementById("step-2")) {
    currentStep = 2;
  }
  showStep(currentStep);
});
