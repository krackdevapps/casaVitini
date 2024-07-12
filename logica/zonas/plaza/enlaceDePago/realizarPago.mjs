import { Mutex } from "async-mutex";
import { obtenerEnlaceDePagoPorCodigoUPID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerTotalesGlobal } from "../../../repositorio/reservas/transacciones/totales/obtenerTotalesGlobal.mjs";
import { actualizarEstadoEnlaceDePagoPorEnlaceUID } from "../../../repositorio/enlacesDePago/actualizarEstadoEnlaceDePagoPorEnlaceUID.mjs";
import { insertarPago } from "../../../repositorio/reservas/transacciones/pagos/insertarPago.mjs";

export const realizarPago = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const enlaceUPID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            soloMinusculas: "si",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const enlaceDePago = await obtenerEnlaceDePagoPorCodigoUPID({
            codigoUPID: enlaceUPID,
            errorSi: "noExiste"
        })
        const enlaceUID = enlaceDePago.enlaceUID
        const reservaUID = enlaceDePago.reservaUID;
        const totalPago = enlaceDePago.cantidad;
        const estadoPagoObtenido = enlaceDePago.estadoPago;
        if (estadoPagoObtenido === "pagado") {
            const error = "Este enlace de pago ya esta pagado";
            throw new Error(error);
        }
        const reserva = obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoReservaIDV;
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada";
            throw new Error(error);
        }
        const totalesReserva = await obtenerTotalesGlobal(reservaUID)
        if (totalesReserva.length === 0) {
            const error = "Esta reserva no tiene totales";
            throw new Error(error);
        }
        // const totalConImpuestosFormatoFinal = Number(totalPago.replaceAll(".", ""));
        // const token = entrada.body.token;
        // const idempotencyKey = entrada.body.idempotencyKey;
        // const locationResponse = await clienteSquare.locationsApi.retrieveLocation(SQUARE_LOCATION_ID);
        // const currency = locationResponse.result.location.currency;
        // // Charge the customer's card
        // const pago = {
        //     idempotencyKey,
        //     sourceId: token,
        //     //buyer_email_address: "test@test.com",
        //     amountMoney: {
        //         amount: totalConImpuestosFormatoFinal, // $1.00 charge
        //         currency
        //     }
        // };
        // const detallesDelPago = await componentes.pasarela.crearPago(pago);
        // const tarjeta = detallesDelPago.cardDetails.card.cardBrand;
        // const tarjetaDigitos = detallesDelPago.cardDetails.card.last4;
        // const pagoUIDPasarela = detallesDelPago.id;
        // const cantidadSinPunto = detallesDelPago.amountMoney.amount;
        // const cantidadConPunto = utilidades.deFormatoSquareAFormatoSQL(cantidadSinPunto);
        // const fechaDePago = detallesDelPago.createdAt;
        // const plataformaDePago = "pasarela";

        const nuevoPago = await insertarPago({
            plataformaDePago: plataformaDePago,
            tarjeta: tarjeta,
            tarjetaDigitos: tarjetaDigitos,
            pagoUIDPasarela: pagoUIDPasarela,
            reservaUID: reservaUID,
            cantidadConPunto: cantidadConPunto,
            fechaPago: fechaDePago

        })
        const pagoUID = nuevoPago.pagoUID;
        await actualizarEstadoEnlaceDePagoPorEnlaceUID({
            estado: "pagado",
            enlaceUID: enlaceUID
        })

        await actualizarEstadoPago(reserva);
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Pago realizado correctamente",
            x: "casaVitini.ui.vistas.pagos.pagoConfirmado",
            detalles: {
                pagoUID: pagoUID,
                mensaje: "Pago realizado correctamente"
            }
        }
        return ok
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
        throw errorFinal;
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}