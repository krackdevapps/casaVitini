async function SquarePaymentFlow() {
  // Create card payment object and attach to page
  CardPay(document.getElementById('card-container'), document.getElementById('card-button'));

  // Create Apple pay instance
  //ApplePay(document.getElementById('apple-pay-button'));

  // Create Google pay instance
  GooglePay(document.getElementById('google-pay-button'));

  // Create ACH payment
  //ACHPay(document.getElementById('ach-button'));
}
window.payments = Square.payments(window.applicationId, window.locationId);

window.paymentFlowMessageEl = document.getElementById('payment-flow-message');

window.showSuccess = function (message) {
  window.paymentFlowMessageEl.classList.add('success');
  window.paymentFlowMessageEl.classList.remove('error');
  window.paymentFlowMessageEl.innerText = message;

}

window.showError = function (message) {
  window.paymentFlowMessageEl.classList.add('error');
  window.paymentFlowMessageEl.classList.remove('success');
  window.paymentFlowMessageEl.innerText = message;

}

window.createPayment = async function (token, verificationToken) {
  casaVitini.componentes.flujoPagoUI.infoDuranteFlujo()
  console.log("Se Inicia el pago")

  // Aqui se deberua recoger el objeto reserva e intergrarlo en el objeto que hay dentro de dataJsonString
  const destinoDinamico = document.querySelector("[pasarelaZonaDePago]")?.getAttribute("pasarelaZonaDePago")
  if (!destinoDinamico) {
    const error = "windows.createPayment necesita un elmeneto pasarela=zonaDePago donde se defina el objeto"
    return casaVitini.ui.vistas.advertenciaInmersiva(error)
  }
  const acoplador = {}
  if (destinoDinamico === "confirmarReserva") {
    const reservaLocal = JSON.parse(sessionStorage.getItem("reserva"))
    const nombreTitular = document.querySelector("[campo=nombreTitular]").value
    const pasaporteTitular = document.querySelector("[campo=pasaporteTitular]").value
    const correoTitular = document.querySelector("[campo=correoTitular]").value
    const telefonoTitular = document.querySelector("[campo=telefonoTitular]").value

    const datosTitular = {
      nombreTitular: nombreTitular,
      pasaporteTitular: pasaporteTitular,
      correoTitular: correoTitular,
      telefonoTitular: telefonoTitular
    }
    reservaLocal.datosTitular = datosTitular
    console.info("reservaLocal", reservaLocal)
    acoplador.zona = "plaza/reservas/confirmarReserva"
    acoplador.reserva = reservaLocal

  }
  console.log("destinoDinamico", destinoDinamico)

  if (destinoDinamico === "enlaceDePago") {
    console.log("enlacesDedpago",)

    const enlaceUID = document.querySelector("[pagoUID]").getAttribute("pagoUID")
    acoplador.zona = "plaza/enlaceDePago/realizarPago"
    acoplador.enlaceUID = enlaceUID

  }
  const squareMetadatos = {
    token,
    idempotencyKey: window.idempotencyKey
  };
  const dataJsonString = {
    ...squareMetadatos,
    ...acoplador,

  };
  if (verificationToken !== undefined) {
    dataJsonString.verificationToken = verificationToken;
  }
  try {
    const instanciaUID = document.querySelector("section").getAttribute("instanciaUID")
    const response = await fetch('/puerto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataJsonString)
    });
    const data = await response.json();
    console.info("respuesta >>>>>>>", data)

    if (data.error) {
      await casaVitini.componentes.square.crearSesionPago(instanciaUID)
      console.info("error zona 1 >>>", data.error)
      return casaVitini.componentes.flujoPagoUI.errorInfo(data.error)
      //return window.showError(data.error);
    }
    if (data.errors && data.errors.length > 0) {
      console.info("error zona 2 >>>", data.error)
      await casaVitini.componentes.square.crearSesionPago(instanciaUID)
      if (data.errors[0].detail) {

        return casaVitini.componentes.flujoPagoUI.errorInfo(data.errors[0].detail)
        window.showError(data.errors[0].detail);
      }
    } else {
      // Pago exitoso
      casaVitini.componentes.limpiarAdvertenciasInmersivas()
      if (data.ok) {
        console.info("Pago Existoso !!!!")
        const detalles = data.detalles
        const x = eval(data.x)
        window.showSuccess('Pago realizado correctmente y reserva confirmada!');
        console.info("data", data)

        // Verificar si la función existe
        if (typeof x === 'function') {
          // Ejecutar la función si existe
          return x(detalles);
        } else {
          const error = "No exista la funcion a la que se esta llamando tras confirmar la reserva"
          return casaVitini.ui.vistas.advertenciaInmersiva(error)
        }
      } else {
        window.showError('Ha ocurrido un error inesperado!');
      }
    }
  } catch (error) {
    console.error('Error capturado:', error.message);
    console.error('Error capturado:', error.result);
    console.error('Error capturado:', error);

    // salida.json(error.result);
  }
}

// Hardcoded for testing purpose, only used for Apple Pay and Google Pay
window.getPaymentRequest = function () {
  return {
    countryCode: window.country,
    currencyCode: window.currency,
    lineItems: [
      { amount: '1.23', label: 'Cat', pending: false },
      { amount: '4.56', label: 'Dog', pending: false },
    ],
    requestBillingContact: false,
    requestShippingContact: true,
    shippingContact: {
      addressLines: ['123 Test St', ''],
      city: 'San Francisco',
      countryCode: 'US',
      email: 'test@test.com',
      familyName: 'Last Name',
      givenName: 'First Name',
      phone: '1111111111',
      postalCode: '94109',
      state: 'CA',
    },
    shippingOptions: [
      { amount: '0.00', id: 'FREE', label: 'Free' },
      { amount: '9.99', id: 'XP', label: 'Express' },
    ],
    total: { amount: '1.00', label: 'Total', pending: false },
  };
};

SquarePaymentFlow();
