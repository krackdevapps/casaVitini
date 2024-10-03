import Decimal from "decimal.js"
import { obtenerPagosPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/pagos/obtenerPagosPorReservaUID.mjs"
import { actualizarEstadoPagoPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/pagos/actualizarEstadoPagoPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs"

export const actualizarEstadoPago = async (reservaUID) => {

    try {

        const desgloseGlobal = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const totalFinal = desgloseGlobal.desgloseFinanciero.global.totales.totalFinal


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
            const error = "Error en el cálculo del estado del pago"
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
