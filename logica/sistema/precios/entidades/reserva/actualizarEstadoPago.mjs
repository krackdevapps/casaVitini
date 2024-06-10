import Decimal from "decimal.js"
import { obtenerPagosPorReservaUID } from "../../../../repositorio/reservas/transacciones/pagos/obtenerPagosPorReservaUID.mjs"
import { actualizarEstadoPagoPorReservaUID } from "../../../../repositorio/reservas/transacciones/pagos/actualizarEstadoPagoPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerDesgloseFinancieroPorReservaUID.mjs"

export const actualizarEstadoPago = async (reservaUID) => {

    try {
        // Seleccionar el total
        const desgloseGlobal = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const totalFinal = desgloseGlobal.desgloseFinanciero.global.totales.totalFinal

        // Seleccionar todos los pagos de la reserva
        const pagosDeLaReserva = await obtenerPagosPorReservaUID(reservaUID)
        const pagos = pagosDeLaReserva.map((pago) => {
            return pago.cantidad
        })
        let totalPagado = new Decimal("0")
        for (const pago of pagos) {
            totalPagado = totalPagado.plus(pago)
        }

        const faltantePorPagar = new Decimal(totalFinal).minus(totalPagado)
        const totalPagadoDecimal = new Decimal(totalPagado);
        const faltantePorPagarDecimal = new Decimal(faltantePorPagar);

        let estadoDelpago
        if (totalPagadoDecimal.equals(0)) {
            estadoDelpago = "noPagado";
        } else if (faltantePorPagarDecimal.equals(0)) {
            estadoDelpago = "pagado";
        } else if (faltantePorPagarDecimal.lessThan(0)) {
            estadoDelpago = "pagadoSuperadamente";
        } else if (faltantePorPagarDecimal.lessThan(totalFinal)) {
            estadoDelpago = "pagadoParcialmente";
        } else {
            const error = "Error en el calculo del estado del pago"
            throw new Error(error)
        }
        await actualizarEstadoPagoPorReservaUID({
            reservaUID,
            estadoPagoIDV: estadoDelpago
        })
    } catch (errorCapturado) {
        throw errorCapturado
    }
}