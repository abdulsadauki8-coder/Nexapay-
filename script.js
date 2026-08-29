// NexaPay Pi Testnet

const Pi = window.Pi;

let accessToken = null;
let currentUser = null;

// Initialize Pi SDK
Pi.init({
  version: "2.0",
  sandbox: true
});

// Incomplete payment
function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment:", payment);

  showMessage(
    "There is an incomplete payment. Please try again."
  );
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

    document.getElementById("userBox").style.display =
      "block";

    button.style.display = "none";

    showMessage(
      "Pi Login successful! Welcome " +
      currentUser.username
    );

  } catch (error) {
    console.error("Pi Login error:", error);

    showMessage(
      "Pi Login failed. Open NexaPay in Pi Browser and try again."
    );

    button.disabled = false;
    button.innerText = "Sign in with Pi";
  }
}

// Message
function showMessage(text) {
  const box = document.getElementById("message");

  box.innerText = text;
  box.style.display = "block";
}

// Logout
function logoutUser() {
  accessToken = null;
  currentUser = null;

  document.getElementById("userBox").style.display =
    "none";

  document.getElementById("loginBtn").style.display =
    "block";

  document.getElementById("loginBtn").disabled =
    false;

  document.getElementById("loginBtn").innerText =
    "Sign in with Pi";

  showMessage("You have been signed out.");
}