import { constructorInstantaneaComplementosAlojamiento } from "./constructorInstantaneaComplementosAlojamiento.mjs"
import { obtenerServiciosPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs"
import { obtenerComplementoPorComplementoUID } from "../../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs"
import { obtenerComplementosAlojamientoPorReservaUID } from "../../../../infraestructure/repository/reservas/complementosAlojamiento/obtenerComplementosAlojamientoPorReservaUID.mjs"
import { obtenerComplementosAlojamientoPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/complementosDeAlojamiento/obtenerComplementosAlojamientoPorSimulacionUID.mjs"

export const procesadorComplementosAlojamiento = async (data) => {
    try {
        const estructura = data.estructura
        const origen = data.origen
        const complementosUIDSolicitados = data.complementosUIDSolicitados
        const complementos = []
        if (origen === "hubComplementosAlojamiento") {
            for (const complementoUID of complementosUIDSolicitados) {
                const complemento = await obtenerComplementoPorComplementoUID(complementoUID)
                complementos.push(complemento)
            }
        } else if (origen === "instantaneaComplementosAlojamientoEnReserva") {
            const reservaUID = data.reservaUID
            if (!reservaUID) {
                const m = "No llega el reseervaUID a instantaneaComplementosAlojamientoEnReserva"
                throw new Error(m)
            }
            const complementosDeLaReserva = await obtenerComplementosAlojamientoPorReservaUID(reservaUID)
            complementos.push(...complementosDeLaReserva)
        } else if (origen === "instantaneaComplementosalojamientoEnSimulacion") {
            const simulacionUID = data.simulacionUID
            // Implementar esto:
            if (!simulacionUID) {
                const m = "No llega el simulacionUID a instantaneaComplementosalojamientoEnSimulacion"
                throw new Error(m)
            }
            // implementar hay que hacer el metodo de obtener complementos desde la instantanea de la simulacion!!!!
            const complementosDeLaSimulacion = await obtenerComplementosAlojamientoPorSimulacionUID(simulacionUID)
            complementos.push(...complementosDeLaSimulacion)
        } else {
            const m = "La confguracion de complementosDeAlojamiento en el procesador esta mal configurada, necesita origen en hubComplementosAlojamiento, instantaneaComplementosAlojamientoEnReserva o instantaneaComplementosalojamientoEnSimulacion"
            throw new Error(m)
        }

        await constructorInstantaneaComplementosAlojamiento({
            estructura,
            complementos
        })
    } catch (error) {
        throw error
    }
}