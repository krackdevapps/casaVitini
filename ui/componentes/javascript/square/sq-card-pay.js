async function verifyBuyer(payments, token) {
  const verificationDetails = {
    amount: '1.00',
    billingContact: {
      addressLines: ['123 Main Street', 'Apartment 1'],
      familyName: 'Doe',
      givenName: 'John',
      email: 'jondoe@gmail.com',
      country: 'GB',
      phone: '3214563987',
      region: 'LND',
      city: 'London',
    },
    currencyCode: 'GBP',
    intent: 'CHARGE',
  };
  const verificationResults = await payments.verifyBuyer(
    token,
    verificationDetails
  );
  return verificationResults.token;
}
async function CardPay(fieldEl, buttonEl) {
  // Create a card payment object and attach to page
  const card = await window.payments.card({
    style: {
      '.input-container.is-focus': {
        borderColor: '#006AFF'
      },
      '.message-text.is-error': {
        color: '#BF0020'
      }
    }
  });
  await card.attach(fieldEl);
  async function eventHandler(event) {
    // Clear any existing messages
    console.info(">>> Se inicia el procesod de pago")
    window.paymentFlowMessageEl.innerText = '';
    const destinoDinamico = document.querySelector("[pasarelaZonaDePago]")?.getAttribute("pasarelaZonaDePago")
    if (!destinoDinamico) {
      const error = "sq-cardpay necesita un elmeneto pasarela=zonaDePago donde se defina el objeto"
      return casaVitini.ui.componentes.advertenciaInmersiva(error)
    }
    if (destinoDinamico === "confirmarReserva") {
      try {
        casaVitini.ui.vistas.reservasNuevo.controlPrevioEnvioDatos()
      } catch (errorCapturado) {
        return casaVitini.ui.componentes.advertenciaInmersiva(error.message)
      }
    }
    try {
      casaVitini.componentes.pasarela.square.flujoPagoUI.desplegarUI()
      const result = await card.tokenize();
      const verificationToken = await verifyBuyer(window.payments, result.token);
      if (result.status === 'OK') {
        // Use global method from sq-payment-flow.js
        window.createPayment(
          result.token,
          verificationToken
        );
      }
    } catch (e) {
      if (e.message) {
        casaVitini.componentes.flujoPagoUI.errorInfo(e.message)
        casaVitini.shell.controladoresUI.limpiarAdvertenciasInmersivas()

        //window.showError(`Error: ${e.message}`);
      } else {

        const errorGenerico = "Ha ocurrido un error"
        casaVitini.componentes.flujoPagoUI.errorInfo(errorGenerico)
        window.showError('Something went wrong');
      }
    }
  }
  buttonEl.addEventListener('click', eventHandler);
}
