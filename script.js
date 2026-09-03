'use strict';

// NexaPay Pi Testnet frontend
// IMPORTANT: Pi API key must stay on the server, never in this file.

const Pi = window.Pi;
const API = {
  approve: '/api/pi/payments/approve',
  complete: '/api/pi/payments/complete'
};

let accessToken = null;
let currentUser = null;
let paymentBusy = false;

function el(id) {
  return document.getElementById(id);
}

function showMessage(text) {
  const box = el('message');
  if (!box) return;
  box.textContent = text;
  box.style.display = 'block';
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Server error (${response.status})`);
  }
  return data;
}

function onIncompletePaymentFound(payment) {
  console.log('Incomplete payment:', payment);
  showMessage('An incomplete payment was found. Please contact support or try again.');
}

async function loginWithPi() {
  const button = el('loginBtn');

  if (!Pi) {
    showMessage('Pi SDK bai load ba. Ka bude NexaPay a Pi Browser.');
    return;
  }

  button.disabled = true;
  button.textContent = 'Connecting to Pi...';

  try {
    const auth = await Pi.authenticate(
      ['username', 'payments'],
      onIncompletePaymentFound
    );

    accessToken = auth.accessToken;
    currentUser = auth.user;

    el('username').textContent = currentUser.username || 'Unknown';
    el('userBox').style.display = 'block';
    button.style.display = 'none';

    // Show the payment button only if it exists in index.html.
    if (el('payBtn')) el('payBtn').style.display = 'block';

    showMessage(`Pi Login successful! Welcome ${currentUser.username}.`);
  } catch (error) {
    console.error('Pi Login error:', error);
    showMessage('Pi Login failed. Open NexaPay in Pi Browser and try again.');
    button.disabled = false;
    button.textContent = 'Sign in with Pi';
  }
}

async function startPayment() {
  if (!Pi || !accessToken) {
    showMessage('Da fatan ka fara Sign in with Pi kafin biyan kuɗi.');
    return;
  }

  if (paymentBusy) return;
  paymentBusy = true;

  const payButton = el('payBtn');
  if (payButton) payButton.disabled = true;
  showMessage('Ana shirya Test-Pi payment...');

  const paymentData = {
    amount: 0.1,
    memo: 'NexaPay Test Transaction',
    metadata: {
      type: 'test_payment',
      app: 'nexapay'
    }
  };

  const callbacks = {
    onReadyForServerApproval: async (paymentId) => {
      try {
        await postJson(API.approve, { paymentId });
        showMessage('Payment approved. Ka tabbatar da shi a Pi Wallet.');
      } catch (error) {
        console.error('Payment approval error:', error);
        showMessage(`Server approval failed: ${error.message}`);
        resetPaymentButton();
      }
    },

    onReadyForServerCompletion: async (paymentId, txid) => {
      try {
        await postJson(API.complete, { paymentId, txid });
        showMessage(`Transaction successful!\nTxID: ${txid}`);
      } catch (error) {
        console.error('Payment completion error:', error);
        showMessage(`Server completion failed: ${error.message}`);
      } finally {
        resetPaymentButton();
      }
    },

    onCancel: (paymentId) => {
      console.log('Payment cancelled:', paymentId);
      resetPaymentButton();
      showMessage('Payment cancelled.');
    },

    onError: (error) => {
      console.error('Pi payment error:', error);
      resetPaymentButton();
      showMessage(`Payment error: ${error.message || error}`);
    }
  };

  try {
    Pi.createPayment(paymentData, callbacks);
  } catch (error) {
    console.error('createPayment error:', error);
    resetPaymentButton();
    showMessage(`Could not start payment: ${error.message || error}`);
  }
}

function resetPaymentButton() {
  paymentBusy = false;
  const payButton = el('payBtn');
  if (payButton) payButton.disabled = false;
}

function logoutUser() {
  accessToken = null;
  currentUser = null;
  paymentBusy = false;

  el('userBox').style.display = 'none';
  if (el('payBtn')) {
    el('payBtn').style.display = 'none';
    el('payBtn').disabled = false;
  }

  const button = el('loginBtn');
  button.style.display = 'block';
  button.disabled = false;
  button.textContent = 'Sign in with Pi';
  showMessage('You have been signed out.');
}

function initNexaPay() {
  if (!window.Pi) {
    showMessage('Pi SDK bai load ba. Ka bude NexaPay a Pi Browser.');
    return;
  }

  // Initialize the SDK exactly once.
  Pi.init({
    version: '2.0',
    sandbox: true
  });

  el('loginBtn')?.addEventListener('click', loginWithPi);
  el('logoutBtn')?.addEventListener('click', logoutUser);
  el('payBtn')?.addEventListener('click', startPayment);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNexaPay);
} else {
  initNexaPay();
}