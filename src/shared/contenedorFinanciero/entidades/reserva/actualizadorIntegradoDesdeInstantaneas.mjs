import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { procesador } from "../../procesador.mjs"

export const actualizadorIntegradoDesdeInstantaneas = async (reservaUID) => {
    const desgloseFinanciero = await procesador({
        entidades: {
            reserva: {
                origen: "hubReservas",
                reservaUID: reservaUID
            },
            complementosAlojamiento: {
                origen: "instantaneaComplementosAlojamientoEnReserva",
                reservaUID: reservaUID
            },
            servicios: {
                origen: "instantaneaServiciosEnReserva",
                reservaUID: reservaUID
            },
        },
        capas: {
            impuestos: {
                origen: "instantaneaImpuestosEnReserva",
                reservaUID: reservaUID
            }
        }
    })
    await actualizarDesgloseFinacieroPorReservaUID({
        desgloseFinanciero,
        reservaUID
    })
    return desgloseFinanciero
}