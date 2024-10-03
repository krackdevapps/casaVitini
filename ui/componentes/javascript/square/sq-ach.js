async function ACHPay(buttonEl) {
  const accountHolderNameEl = document.getElementById('ach-account-holder-name');
  const achMessageEl = document.getElementById('ach-message');
  const achWrapperEl = document.getElementById('ach-wrapper');
  let ach;
  try {
    ach = await window.payments.ach();
    achWrapperEl.style.display = 'block';
  } catch (e) {


    if (e.name === 'PaymentMethodUnsupportedError') {
      achMessageEl.textContent = 'ACH payment is not supported by your account';
      accountHolderNameEl.disabled = true;
    }

    return;
  }
  async function eventHandler(event) {
    const accountHolderName = accountHolderNameEl.value.trim()
    if (accountHolderName === '') {
      achMessageEl.textContent = 'Please input full name';
      return;
    }

    window.paymentFlowMessageEl.textContent = '';
    try {
      const result = await ach.tokenize({
        accountHolderName,
      });
      if (result.status === 'OK') {

        window.createPayment(result.token);
      }
    } catch (e) {
      if (e.message) {
        window.showError(`Error: ${e.message}`);
      } else {
        window.showError('Something went wrong');
      }
    }
  }
  buttonEl.addEventListener('click', eventHandler);
}
