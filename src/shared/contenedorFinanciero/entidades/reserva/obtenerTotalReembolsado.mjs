import Decimal from "decimal.js"
import { obtenerPagosPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/pagos/obtenerPagosPorReservaUID.mjs"
import { obtenerReembolsosPorPagoUID } from "../../../../infraestructure/repository/reservas/transacciones/reembolsos/obtenerReembolsosPorPagoUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"

export const obtenerTotalReembolsado = async (reservaUID) => {
    try {
        await obtenerReservaPorReservaUID(reservaUID)
        // Obtener todos los pagoUID de la reserva
        const pagosDeLaReserva = await obtenerPagosPorReservaUID(reservaUID)
        const contenedorPagosUID = pagosDeLaReserva.map((detallesPagoUID) => {
            return detallesPagoUID.pagoUID
        })
        let totalReembolsado = 0

        // Obten todos los reembolsos de la reserva        
        for (const pagoUID of contenedorPagosUID) {
            const reembolsosDelPago = await obtenerReembolsosPorPagoUID(pagoUID)
            reembolsosDelPago.forEach(reembolso => {
                const cantidadDelreembolso = reembolso.cantidad
                totalReembolsado = new Decimal(totalReembolsado).plus(cantidadDelreembolso)
            })
        }
        return totalReembolsado
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
