export const confirmarReserva = async (entrada, salida) => {
    salida.end();
    return;
    await mutex.acquire();
    try {
        const reserva = entrada.body.reserva;


        await conexion.query('BEGIN');
        const resuelveValidacionObjetoReserva = await validarObjetoReserva(reserva);
        if (!resuelveValidacionObjetoReserva.ok) {
            const error = "Ha ocurrido un error desconocido en la validacion del objeto";
            throw new Error(error);
        }
        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
        const metadatos = {
            tipoProcesadorPrecio: "objeto",
            reserva: reserva
        };
        const resuelvePrecioReserva = await precioReserva(metadatos);
        const totalConImpuestos = resuelvePrecioReserva.ok.desgloseFinanciero.totales.totalConImpuestos;
        if (!totalConImpuestos) {
            const error = "Debido a un error inesperado no se ha podido obtener el precio final";
            throw new Error(error);
        }
        const precioBrutoFinal = totalConImpuestos.replaceAll(".", "");
        const token = entrada.body.token;
        const idempotencyKey = entrada.body.idempotencyKey;
        const moduloPagoEstado = "activado";
        if (!token || !idempotencyKey) {
            const error = "Falta el token o el idempotencyKey por lo tanto se cancela el proceso de pago";
            if (moduloPagoEstado === "desactivado") {
                throw new Error(error);
            }
        }
        const locationResponse = await clienteSquare.locationsApi.retrieveLocation(SQUARE_LOCATION_ID);
        const currency = locationResponse.result.location.currency;
        const pago = {
            idempotencyKey,
            verificationToken: entrada.body.verificationToken,
            sourceId: token,
            amountMoney: {
                amount: Number(precioBrutoFinal), // $1.00 charge = 100
                currency
            }
        };
        const resolverPago = await componentes.pasarela.crearPago(pago);
        const resolvertInsertarReserva = await insertarReserva(reserva);
        const reservaUID = resolvertInsertarReserva.reservaUID;
        const tarjeta = resolverPago.cardDetails.card.cardBrand;
        const tarjetaDigitos = resolverPago.cardDetails.card.last4;
        const cantidadSinPunto = resolverPago.amountMoney.amount;
        const cantidadConPunto = utilidades.deFormatoSquareAFormatoSQL(cantidadSinPunto);
        const fechaDePago = resolverPago.createdAt;
        const pagoUIDPasarela = resolverPago.id;
        const plataformaDePago = "pasarela";
        const asociarPago = `
                INSERT INTO
                "reservaPagos"
                (
                "plataformaDePago",
                tarjeta,
                "tarjetaDigitos",
                "pagoUIDPasarela",
                reserva,
                cantidad,
                "fechaPago"
                )
                VALUES 
                ($1, $2, $3, $4, $5, $6, $7);
                `;
        const datosPago = [
            plataformaDePago,
            tarjeta,
            tarjetaDigitos,
            pagoUIDPasarela,
            reservaUID,
            cantidadConPunto,
            fechaDePago
        ];
        await conexion.query(asociarPago, datosPago);
        await actualizarEstadoPago(reservaUID);
        if (resolvertInsertarReserva.ok) {
            const metadatos = {
                reservaUID: reservaUID,
                solo: "globalYFinanciera"
            };
            const resolverDetallesReserva = await detallesReserva(metadatos);
            const enlacePDF = await componentes.gestionEnlacesPDF.crearEnlacePDF(reservaUID);
            resolverDetallesReserva.enlacePDF = enlacePDF;
            const ok = {
                ok: "Reserva confirmada y pagada",
                x: "casaVitini.ui.vistas.reservasNuevo.reservaConfirmada.sustitutorObjetos",
                detalles: resolverDetallesReserva
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT');
        // Si hay un error en el envio del email, este no escala, se queda local.
        enviarEmailReservaConfirmada(reservaUID);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const errorFinal = {};
        if (errorCapturado.message && !errorCapturado.errors) {
            errorFinal.error = errorCapturado.message;
        }
        if (errorCapturado.errors) {
            errorFinal.error = errorCapturado.errors[0].detail;
        }
        salida.json(errorFinal);
    } finally {
        mutex.release();
    }
}