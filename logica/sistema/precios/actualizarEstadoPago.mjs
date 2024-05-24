import Decimal from "decimal.js"
import { obtenerTotalesReservaPorReservaUID } from "../../repositorio/reservas/reserva/obtenerTotalesReservaPorReservaUID.mjs"
import { obtenerPagosPorReservaUID } from "../../repositorio/reservas/transacciones/pagos/obtenerPagosPorReservaUID.mjs"

export const actualizarEstadoPago = async (reservaUID) => {

    try {
        // Seleccionar el total
        const totalesDeLaReserva = await obtenerTotalesReservaPorReservaUID(reservaUID)
        const totalConImpuestos = totalesDeLaReserva.totalConImpuestos

        // Seleccionar todos los pagos de la reserva
        const pagosDeLaReserva = await obtenerPagosPorReservaUID(reservaUID)
        const pagos = pagosDeLaReserva.map((pago) => {
            return pago.cantidad
        })
        let totalPagado = "0"
        for (const pago of pagos) {
            totalPagado = new Decimal(totalPagado).plus(pago)
        }
        const faltantePorPagar = new Decimal(totalConImpuestos).minus(totalPagado)
        const totalPagadoDecimal = new Decimal(totalPagado);
        const faltantePorPagarDecimal = new Decimal(faltantePorPagar);

        let estadoDelpago
        if (totalPagadoDecimal.equals(0)) {
            estadoDelpago = "noPagado";
        } else if (faltantePorPagarDecimal.equals(0)) {
            estadoDelpago = "pagado";
        } else if (faltantePorPagarDecimal.lessThan(0)) {
            estadoDelpago = "pagadoSuperadamente";
        } else if (faltantePorPagarDecimal.lessThan(totalConImpuestos)) {
            estadoDelpago = "pagadoParcialmente";
        } else {
            const error = "Error en el calculo del estado del pago"
            throw new Error(error)
        }
        await actualizarEstadoPago(reservaUID)
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
