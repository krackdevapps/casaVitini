import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { procesador } from "../../procesador.mjs"

export const actualizadorIntegradoDesdeInstantaneas = async (reservaUID) => {
    const desgloseFinanciero = await procesador({
        entidades: {
            reserva: {
                tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                reservaUID: reservaUID,
                capaImpuestos: "si"
            }
        },
    })
    await actualizarDesgloseFinacieroPorReservaUID({
        desgloseFinanciero,
        reservaUID
    })
    return desgloseFinanciero
}