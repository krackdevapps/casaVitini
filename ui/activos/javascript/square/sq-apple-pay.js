async function ApplePay(buttonEl) {
  const paymentRequest = window.payments.paymentRequest(

    window.getPaymentRequest()
  );
  let applePay;
  try {
    applePay = await window.payments.applePay(paymentRequest);
  } catch (e) {
    console.error(e)
    return;
  }
  async function eventHandler(event) {

    window.paymentFlowMessageEl.textContent = '';
    try {
      const result = await applePay.tokenize();
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
