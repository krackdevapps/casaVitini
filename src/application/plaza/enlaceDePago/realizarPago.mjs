import { Mutex } from "async-mutex";
import { obtenerEnlaceDePagoPorCodigoUPID } from "../../../infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerTotalesGlobal } from "../../../infraestructure/repository/reservas/transacciones/totales/obtenerTotalesGlobal.mjs";
import { actualizarEstadoEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/actualizarEstadoEnlaceDePagoPorEnlaceUID.mjs";
import { insertarPago } from "../../../infraestructure/repository/reservas/transacciones/pagos/insertarPago.mjs";

export const realizarPago = async (entrada, salida) => {

    try {
        const error = "Función deshabilitada";
        throw new Error(error);

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
            const error = "Este enlace de pago ya está pagado.";
            throw new Error(error);
        }
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
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