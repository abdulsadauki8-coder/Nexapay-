const Pi = window.Pi;

let accessToken = null;
let currentUser = null;
let currentPaymentId = null;

// Initialize Pi SDK
Pi.init({
  version: "2.0",
  sandbox: true
});

// Handle incomplete payments
function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment:", payment);

  if (payment && payment.identifier) {
    currentPaymentId = payment.identifier;
  }

  showMessage("An sami incomplete payment. Za mu duba shi.");
}

// Pi Login
async function loginWithPi() {
  const button = document.getElementById("loginBtn");

  button.disabled = true;
  button.innerText = "Connecting to Pi...";

  try {
    const auth = await Pi.authenticate(
      ["username", "payments"],
      onIncompletePaymentFound
    );

    accessToken = auth.accessToken;
    currentUser = auth.user;

    document.getElementById("username").innerText =
      currentUser.username;

    document.getElementById("userBox").style.display = "block";
    button.style.display = "none";

    const payButton = document.getElementById("payBtn");

    if (payButton) {
      payButton.style.display = "block";
    }

    showMessage(
      "Pi Login successful! Welcome " +
      currentUser.username
    );

  } catch (error) {
    console.error("Pi authentication error:", error);

    showMessage(
      "Pi Login failed. Please open NexaPay inside Pi Browser."
    );

    button.disabled = false;
    button.innerText = "Sign in with Pi";
  }
}

// Start Test-Pi Payment
function startPayment() {

  if (!accessToken) {
    showMessage("Da farko ka shiga da Pi.");
    return;
  }

  showMessage("Ana shirya Test-Pi payment...");

  const paymentData = {
    amount: 0.1,
    memo: "NexaPay Test Payment",
    metadata: {
      app: "NexaPay",
      purpose: "Testnet payment"
    }
  };

  const paymentCallbacks = {

    // Pi is ready for backend approval
    onReadyForServerApproval: async (paymentId) => {

      console.log(
        "Payment ready for approval:",
        paymentId
      );

      currentPaymentId = paymentId;

      try {

        const response = await fetch(
          "/api/pi/approve",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              paymentId: paymentId
            })
          }
        );

        const data = await response.json();

        console.log("Approval response:", data);

        if (!response.ok) {
          throw new Error(
            data.error || "Payment approval failed"
          );
        }

        showMessage(
          "Payment approved. Waiting for transaction..."
        );

      } catch (error) {

        console.error(
          "Approval error:",
          error
        );

        showMessage(
          "Payment approval failed."
        );
      }
    },

    // Pi transaction is ready for completion
    onReadyForServerCompletion: async (
      paymentId,
      txid
    ) => {

      console.log(
        "Payment ready for completion:",
        paymentId,
        txid
      );

      currentPaymentId = paymentId;

      try {

        const response = await fetch(
          "/api/pi/complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              paymentId: paymentId,
              txid: txid
            })
          }
        );

        const data = await response.json();

        console.log(
          "Completion response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.error || "Payment completion failed"
          );
        }

        showMessage(
          "🎉 Test-Pi payment completed successfully!"
        );

      } catch (error) {

        console.error(
          "Completion error:",
          error
        );

        showMessage(
          "Payment completion failed."
        );
      }
    },

    onCancel: (paymentId) => {

      console.log(
        "Payment cancelled:",
        paymentId
      );

      showMessage(
        "Payment was cancelled."
      );
    },

    onError: (error, payment) => {

      console.error(
        "Pi payment error:",
        error,
        payment
      );

      showMessage(
        "Payment error. Please try again."
      );
    }
  };

  try {

    Pi.createPayment(
      paymentData,
      paymentCallbacks
    );

  } catch (error) {

    console.error(
      "Create payment error:",
      error
    );

    showMessage(
      "Unable to start payment."
    );
  }
}

// Message helper
function showMessage(text) {

  const box =
    document.getElementById("message");

  if (!box) return;

  box.innerText = text;
  box.style.display = "block";
}

// Logout
function logoutUser() {

  accessToken = null;
  currentUser = null;
  currentPaymentId = null;

  document.getElementById("userBox").style.display =
    "none";

  document.getElementById("loginBtn").style.display =
    "block";

  document.getElementById("loginBtn").disabled =
    false;

  document.getElementById("loginBtn").innerText =
    "Sign in with Pi";

  const payButton =
    document.getElementById("payBtn");

  if (payButton) {
    payButton.style.display = "none";
  }

  showMessage(
    "You have been signed out."
  );
}