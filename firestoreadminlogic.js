// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    doc,
    setDoc,
    increment,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCywqYls2mJfY9maHRhsHRTP6OmPgC1Kf0",
    authDomain: "x-shopping-6611d.firebaseapp.com",
    projectId: "x-shopping-6611d",
    storageBucket: "x-shopping-6611d.firebasestorage.app",
    messagingSenderId: "177602183210",
    appId: "1:177602183210:web:011c708002426b37cb8353",
    measurementId: "G-QKLP9H1N9P"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================

function getCurrentUser() {

    const isLoggedIn =
        localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
        return null;
    }

    let userData = {};

    try {

        userData = JSON.parse(
            localStorage.getItem("userData") || "{}"
        );

    } catch (error) {

        console.error(
            "Invalid userData in localStorage:",
            error
        );

    }

    return {

        isLoggedIn: true,

        userId:
            localStorage.getItem("userId"),

        phone:
            localStorage.getItem("userPhone"),

        ...userData

    };
}


// ==========================================
// CRYPTO PAYMENT
// ==========================================

const cryptobtn =
    document.getElementById("cryptobtn");


if (cryptobtn) {

    cryptobtn.addEventListener(
        "click",
        async function () {

            try {

                // -----------------------------
                // GET CURRENT USER
                // -----------------------------

                const currentUser =
                    getCurrentUser();


                if (
                    !currentUser ||
                    !currentUser.userId
                ) {

                    console.error(
                        "No logged-in user found."
                    );

                    return;
                }


                // -----------------------------
                // GET SAVED USDT AMOUNT
                // -----------------------------

                const savedAmount =
                    sessionStorage.getItem(
                        "tempUsdtAmount"
                    );


                if (!savedAmount) {

                    console.error(
                        "No USDT amount found."
                    );

                    return;
                }


                // -----------------------------
                // CONVERT TO NUMBER
                // (increment() requires a number,
                // not a string)
                // -----------------------------

                const cryptoAmountNumber =
                    parseFloat(savedAmount);


                if (
                    isNaN(cryptoAmountNumber) ||
                    cryptoAmountNumber <= 0
                ) {

                    console.error(
                        "Invalid USDT amount:",
                        savedAmount
                    );

                    return;
                }


                // -----------------------------
                // GET PHONE
                // -----------------------------

                const phoneInput =
                    document.getElementById(
                        "phoneNumber"
                    );


                const phone =
                    phoneInput
                        ? phoneInput.value.trim()
                        : "";


                // -----------------------------
                // FIRESTORE USER DOCUMENT
                // users/{userId}
                // -----------------------------

                const userRef =
                    doc(
                        db,
                        "users",
                        currentUser.userId
                    );


                // -----------------------------
                // SAVE TO FIRESTORE
                // (increment adds to the existing
                // amount instead of overwriting it)
                // -----------------------------

                await setDoc(

                    userRef,

                    {

                        phone: phone,

                        amount:
                            increment(cryptoAmountNumber),

                        updatedAt:
                            serverTimestamp()

                    },

                    {

                        merge: true

                    }

                );


                // -----------------------------
                // SUCCESS
                // -----------------------------

                console.log(
                    "Crypto data successfully sent to Firestore."
                );


                console.log({

                    userId:
                        currentUser.userId,

                    phone: phone,

                    amountAdded: cryptoAmountNumber

                });


                // Remove temporary amount
                sessionStorage.removeItem(
                    "tempUsdtAmount"
                );


            } catch (error) {

                console.error(
                    "Error sending crypto data to Firestore:",
                    error
                );

            }

        }
    );

}


// ==========================================
// MOBILE MONEY
// ==========================================

const momobtn =
    document.getElementById("momobtn");


if (momobtn) {

    momobtn.addEventListener(
        "click",
        async function () {

            try {

                // -----------------------------
                // GET CURRENT USER
                // -----------------------------

                const currentUser =
                    getCurrentUser();


                if (
                    !currentUser ||
                    !currentUser.userId
                ) {

                    console.error(
                        "No logged-in user found."
                    );

                    return;
                }

                // -----------------------------
                // GET MOMO AMOUNT
                // -----------------------------

                const paymentText =
                    document.getElementById(
                        "payment-text"
                    );


                const savedmomoAmount =
                    paymentText
                        ? paymentText.textContent.trim().replace(/[^0-9]/g, "")
                        : "";

                if (!savedmomoAmount) {

                    console.error(
                        "No MOMO amount found."
                    );

                    return;
                }


                // -----------------------------
                // CONVERT TO NUMBER
                // (increment() requires a number,
                // not a string)
                // -----------------------------

                const momoAmountNumber =
                    parseFloat(savedmomoAmount);


                if (
                    isNaN(momoAmountNumber) ||
                    momoAmountNumber <= 0
                ) {

                    console.error(
                        "Invalid MOMO amount:",
                        savedmomoAmount
                    );

                    return;
                }


                // -----------------------------
                // GET PHONE
                // -----------------------------

                const phoneInput =
                    document.getElementById(
                        "phoneNumber"
                    );


                const phone =
                    phoneInput
                        ? phoneInput.value.trim()
                        : "";


                // -----------------------------
                // FIRESTORE USER DOCUMENT
                // users/{userId}
                // -----------------------------

                const userRef =
                    doc(
                        db,
                        "users",
                        currentUser.userId
                    );


                // -----------------------------
                // SAVE TO FIRESTORE
                // (increment adds to the existing
                // amount instead of overwriting it)
                // -----------------------------

                await setDoc(

                    userRef,

                    {

                        phone: phone,

                        amount:
                            increment(momoAmountNumber),

                        updatedAt:
                            serverTimestamp()

                    },

                    {

                        merge: true

                    }

                );


                // -----------------------------
                // SUCCESS
                // -----------------------------

                console.log(
                    "Mobile money data successfully sent to Firestore."
                );


                console.log({

                    userId:
                        currentUser.userId,

                    phone: phone,

                    amountAdded: momoAmountNumber

                });


            } catch (error) {

                console.error(
                    "Error sending mobile money data to Firestore:",
                    error
                );

            }

        }
    );

}


// ==========================================
// DISPLAY TOTAL DEPOSITED AMOUNT
// (live-updates whenever amount changes)
// ==========================================

function displayTotalDeposited() {

    const currentUser =
        getCurrentUser();

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        console.error(
            "No logged-in user found."
        );

        return;
    }


    // Change "total-deposited" to match
    // the id of the element in your HTML
    const totalEl =
        document.getElementById(
            "total-deposited"
        );

    if (!totalEl) {

        console.error(
            "No element with id 'total-deposited' found."
        );

        return;
    }


    const userRef =
        doc(
            db,
            "users",
            currentUser.userId
        );


    onSnapshot(

        userRef,

        (docSnap) => {

            if (docSnap.exists()) {

                const data =
                    docSnap.data();

                const total =
                    data.amount || 0;

                totalEl.textContent =
    `UGX ${Number(total).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

            } else {

                totalEl.textContent = "0.00";

            }

        },

        (error) => {

            console.error(
                "Error listening to total deposited:",
                error
            );

        }

    );

}


displayTotalDeposited();


console.log(
                    "ADMIN LOGI JS IS RUNNING:"
                );