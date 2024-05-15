export const realizarPago = async (entrada, salida) => {
    await mutex.acquire();
    try {
        const error = "Esta opcion esta actuamente deshabilitada";
        throw new Error(error);
        const enlaceUID = entrada.body.enlaceUID;
        const filtroCadena = /^[a-z0-9]+$/;
        if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
            const error = "el codigo de un enlace de pago solo puede ser una cadena de minuscuals y numeros y ya esta";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")
        const consultaDetallesEnlace = `
            SELECT
            reserva,
            cantidad,
            "estadoPago"
            FROM "enlacesDePago"
            WHERE codigo = $1;`;
        const resuelveConsultaDetallesEnlace = await conexion.query(consultaDetallesEnlace, [enlaceUID]);
        if (resuelveConsultaDetallesEnlace.rowCount === 0) {
            const error = "No existe ningún pago con este identificador de pago, por favro revisa que el identificador de pago sea correcto y no halla caducado";
            throw new Error(error);
        }
        if (resuelveConsultaDetallesEnlace.rowCount === 1) {
            const detallesEnlace = resuelveConsultaDetallesEnlace.rows[0];
            const reserva = detallesEnlace.reserva;
            const totalPago = detallesEnlace.cantidad;
            const estadoPagoObtenido = detallesEnlace.estadoPago;
            if (estadoPagoObtenido === "pagado") {
                const error = "Este enlace de pago ya esta pagado";
                throw new Error(error);
            }
            const consultaEstadoPago = `
                SELECT
                "estadoPago",
                "estadoReserva"
                FROM reservas
                WHERE reserva = $1;`;
            const resuelveConsultaEstadoPago = await conexion.query(consultaEstadoPago, [reserva]);
            const estadoReserva = resuelveConsultaEstadoPago.rows[0].estadoReserva;
            if (estadoReserva === "cancelada") {
                const error = "La reserva esta cancelada";
                throw new Error(error);
            }
            const totalConImpuestosIDV = "totalConImpuestos";
            const consultaTotalesReserva = `
                SELECT
                "totalConImpuestos"
                FROM "reservaTotales"
                WHERE reserva = $1;`;
            const resuelveConsultaTotalesReserva = await conexion.query(consultaTotalesReserva, [reserva]);
            if (resuelveConsultaTotalesReserva.rowCount === 0) {
                const error = "Esta reserva no tiene totales";
                throw new Error(error);
            }
            const totalConImpuestosFormatoFinal = Number(totalPago.replaceAll(".", ""));
            const token = entrada.body.token;
            const idempotencyKey = entrada.body.idempotencyKey;
            const locationResponse = await clienteSquare.locationsApi.retrieveLocation(SQUARE_LOCATION_ID);
            const currency = locationResponse.result.location.currency;
            // Charge the customer's card
            const pago = {
                idempotencyKey,
                sourceId: token,
                //buyer_email_address: "test@test.com",
                amountMoney: {
                    amount: totalConImpuestosFormatoFinal, // $1.00 charge
                    currency
                }
            };
            const detallesDelPago = await componentes.pasarela.crearPago(pago);
            const tarjeta = detallesDelPago.cardDetails.card.cardBrand;
            const tarjetaDigitos = detallesDelPago.cardDetails.card.last4;
            const pagoUIDPasarela = detallesDelPago.id;
            const cantidadSinPunto = detallesDelPago.amountMoney.amount;
            const cantidadConPunto = utilidades.deFormatoSquareAFormatoSQL(cantidadSinPunto);
            const fechaDePago = detallesDelPago.createdAt;
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
                ($1, $2, $3, $4, $5, $6, $7)
                RETURNING
                "pagoUID"
                `;
            const datosPago = [
                plataformaDePago,
                tarjeta,
                tarjetaDigitos,
                pagoUIDPasarela,
                reserva,
                cantidadConPunto,
                fechaDePago
            ];
            const resolverPago = await conexion.query(asociarPago, datosPago);
            const pagoUID = resolverPago.rows[0].pagoUID;
            const actualizarEstadoPagoEnlaces = `
                UPDATE "enlacesDePago"
                SET 
                    "estadoPago" = $1
                WHERE 
                    codigo = $2;
                `;
            const estadoPagado = "pagado";
            const actualizarDatos = [
                estadoPagado,
                enlaceUID
            ];
            await conexion.query(actualizarEstadoPagoEnlaces, actualizarDatos);
            await actualizarEstadoPago(reserva);
            const detalles = {
                pagoUID: pagoUID,
                mensaje: "Pago realizado correctamente"
            };
            const ok = {
                ok: "Pago realizado correctamente",
                x: "casaVitini.ui.vistas.pagos.pagoConfirmado",
                detalles: detalles
            };
            salida.json(ok);
            await campoDeTransaccion("confirmar")
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        let errorFinal;
        if (errorCapturado.message) {
            const error = {
                error: errorCapturado.message
            };
            errorFinal = error;
        }
        if (errorCapturado.errors) {
            errorFinal.error = errorCapturado.errors[0].detail;
        }
        salida.json(errorFinal);
    } finally {
        mutex.release();
    }
}