


/* ==============================
       OPEN DEPOSIT
    =============================== */

    function openDeposit() {

        window.location.href = "payment_form_spinner_fixed.html";
    }
  
    /* ==============================
       OPEN WITHDRAW
    =============================== */

    function openWithdraw() {

        document.getElementById("withdrawOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }

  
    /* ==============================
       OPEN BILL
    =============================== */

  
    
    /* ==============================
       OPEN BILL
    =============================== */

    
    /* ==============================
       OPEN BILL
    =============================== */

    function openInvite() {

        document.getElementById("inviteOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    function openMyteam() {

        document.getElementById("myteamoverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    function openViptask() {

        document.getElementById("vipOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    function openReward() {

        document.getElementById("rewardOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */

    
    /* ==============================
       OPEN BILL
    =============================== */

    function openManager() {

        document.getElementById("manageOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
    }
    /* ==============================
       OPEN BILL
    =============================== */


function openDownloadapp() {

        document.getElementById("appOverlay")
            .classList.add("active");

        document.body.style.overflow = "hidden";
}



    /* ==============================
       CLOSE POPUP WINDOWS
    =============================== */

    function closeWindow() {
        document.getElementById("withdrawOverlay")
            .classList.remove("active");
      document.getElementById("billOverlay")
            .classList.remove("active");
      document.getElementById("inviteOverlay")
            .classList.remove("active");document.getElementById("rewardOverlay")
            .classList.remove("active");document.getElementById("vipOverlay")
            .classList.remove("active");document.getElementById("manageOverlay")
  
            .classList.remove("active");document.getElementById("appOverlay")
            .classList.remove("active");document.getElementById("raffleOverlay")
            .classList.remove("active");document.getElementById("myteamoverlay")

        document.body.style.overflow = "";
    }

     function closeDeposit() {
        document.getElementById("depositOverlay")
            .classList.add("active");
        document.body.style.overflow = "";
     }

    function returnHome() {
      window.location.href = "user-account.html";
    }
    /* ==============================
       MOBILE MONEY TAB
    =============================== */

    function showMomo() {

        document.getElementById("momoTab")
            .classList.add("active");

        document.getElementById("usdtTab")
            .classList.remove("active");

        document.getElementById("momoSection")
            .classList.remove("hidden");

        document.getElementById("momoSection")
            .classList.add("active");

        document.getElementById("usdtSection")
            .classList.remove("active");
    }


    /* ==============================
       USDT TAB
    =============================== */

    function showUsdt() {

        document.getElementById("usdtTab")
            .classList.add("active");

        document.getElementById("momoTab")
            .classList.remove("active");

        document.getElementById("momoSection")
            .classList.add("hidden");

        document.getElementById("momoSection")
            .classList.remove("active");

        document.getElementById("usdtSection")
            .classList.add("active");
    }


    /* ==============================
       UPDATE AMOUNT DISPLAY
    =============================== */

    function updateAmount() {

        let amount =
            document.getElementById("amountInput").value;

        if (amount === "") {
            amount = "0.00";
        } else {
            amount =
                Number(amount).toLocaleString(
                    "en-US",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );
        }

        document.getElementById("amountDisplay")
            .textContent = amount;
    }




/* ==============================
   DEPOSIT ACTION AND LOGICS
=============================== */

function processDeposit() {
    // 1. Check active payment tab
    const usdtTab = document.getElementById("usdtTab");
    const isUsdtActive = usdtTab && usdtTab.classList.contains("active");

    // 2. Get input values
    const amount = document.getElementById("amountInput").value.trim();
    const phoneInput = document.getElementById("phoneNumber");
    const phone = phoneInput ? phoneInput.value.trim() : "";
  // Display the entered values in Step 1
document.getElementById("displayPhone").textContent = phone;
document.getElementById("displayAmount").textContent =
    "UGX " + Number(amount).toLocaleString();
document.getElementById("payment-text").textContent =
    "UGX " + Number(amount).toLocaleString();

    // 3. Process based on selected payment method
    if (isUsdtActive) {
        /* --------------------------
           USDT DEPOSIT LOGIC
        --------------------------- */
      
      

      goToPayment()

      
        console.log("Processing USDT Deposit:", { amount });

        closeDeposit();

    } else {
        /* --------------------------
           MOBILE MONEY (MTN / AIRTEL) LOGIC
        --------------------------- */
        if (phone === "") {
            alert("Please enter your MTN or Airtel number.");
            return;
        }

        if (amount === "" || Number(amount) <= 0) {
            alert("Please enter a valid deposit amount.");
            return;
        }
      closeDeposit();

        console.log("Processing Mobile Money Deposit:", { phone, amount });

        

        
    }
}




function goToPayment() {
        // 1. Get the value from the input
        const amount = document.getElementById("usdtcrypto-amount").value;
        
        // 2. Save it to sessionStorage (temporary browser storage)
        if(amount) {
            sessionStorage.setItem("tempUsdtAmount", amount);
        }

        // 3. Redirect to your second page (change 'page2.html' to your actual file name)
        window.location.href = "crypto_payment_confirmation.html";
}




document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('fullscreen-popup');
  const closeBtn = document.getElementById('close-popup');
  const popupTitle = document.getElementById('popup-title');
  const popupTextbox = document.getElementById('popup-textbox');
  
  // ==========================================
  // 🛡️ SAFETY CHECK (Prevents crashes on other pages)
  // ==========================================
  // If any of these essential elements are missing on the current page, stop the script.
  if (!popup || !closeBtn || !popupTitle || !popupTextbox) {
      return; 
  }

  // ==========================================
  // ✏️ EDIT YOUR CUSTOM MESSAGES HERE
  // ==========================================
  const customMessages = {
      "msg-machine": "📈 Investing In AI Hardware & Companies (The Physical AI Machine)Investing in the physical components and creators of AI involves funding the underlying guts of the technology ecosystem.Infrastructure Layer: Buying shares in companies that manufacture advanced chips, graphics processing units (GPUs), and semiconductor equipment essential for training models (e.g., NVIDIA or TSMC).Cloud & Compute Providers: Investing in major data center operators and cloud providers that rent out massive computing power required to run AI systems (e.g., Microsoft Azure or Alphabet / Google Cloud).Application/Software Layer: Investing in enterprise software companies integrating AI into everyday business tools (pure-play AI or SaaS providers).",
      
      "msg-invite": "How the Process Works Step-by-StepShare Link: You grab your unique referral code or link from your investment app dashboard and send it to a friend.Friend Registers: Your friend signs up for a new account using that specific link or code.Meet Conditions: Your friend completes the qualification criteria, such as depositing a minimum amount (e.g., $50 or €100) or buying an asset.Receive Reward: Both you and your friend receive the bonus, which is credited either as cash, trading credit, or a percentage commission on their investments.",
      
      "msg-team": "Information on Team Income. Describe the multi-level commission structure and how team size impacts earnings.",
      
      "msg-vip": "VIP Rewards breakdown. List the perks, higher percentage yields, or exclusive benefits for VIP members.",
      
      "msg-salary": "Monthly Salary details. Explain the requirements to qualify for a fixed monthly payout and when it is disbursed."
  };
  // ==========================================

  const messageItems = document.querySelectorAll('.ite');

  // Loop through each item and add a click event
  messageItems.forEach(item => {
      item.addEventListener('click', function() {
          
          // 1. Get the title text and clean it (removes the "1: " part)
          const rawText = this.querySelector('.text').innerText;
          const cleanText = rawText.includes(': ') ? rawText.split(': ')[1] : rawText;
          
          // 2. Get the specific ID of the clicked item (e.g., "msg-machine")
          const clickedId = this.id;

          // 3. Look up the custom message from our dictionary above.
          const textToShow = customMessages[clickedId] || "Content coming soon...";
          
          // 4. Update the popup's title and text box content
          popupTitle.innerText = cleanText;
          popupTextbox.textContent = textToShow;
          
          // 5. Show the popup
          popup.style.display = 'flex';
      });
  });

  // Close popup when the X is clicked
  closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
  });

  // Close popup if user clicks anywhere outside the white box
  window.addEventListener('click', (event) => {
      if (event.target === popup) {
          popup.style.display = 'none';
      }
  });
});


//---------
//BILLING AREA LOGICS
////
