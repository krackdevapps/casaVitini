async function GooglePay(buttonEl) {
  const paymentRequest = window.payments.paymentRequest(

    window.getPaymentRequest()
  );
  const googlePay = await payments.googlePay(paymentRequest);
  await googlePay.attach(buttonEl);
  async function eventHandler(event) {

    window.paymentFlowMessageEl.textContent = '';
    try {
      const result = await googlePay.tokenize();
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
