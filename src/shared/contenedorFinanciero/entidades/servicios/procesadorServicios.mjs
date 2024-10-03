import { obtenerServicioPorServicioUID } from "../../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs"
import { constructorInstantaneaServicios } from "./constructorInstantaneaServicios.mjs"
import { obtenerServiciosPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs"
import { obtenerServiciosPorReservaUID } from "../../../../infraestructure/repository/reservas/servicios/obtenerServiciosPorReservaUID.mjs"

export const procesadorServicios = async (data) => {
    try {
        const estructura = data.estructura
        const origen = data.origen
        const serviciosUIDSolicitados = data.serviciosUIDSolicitados
        const servicios = []
        if (origen === "hubServicios") {
            for (const servicioUID of serviciosUIDSolicitados) {
                const servicio = await obtenerServicioPorServicioUID(servicioUID)
                servicios.push(servicio)
            }
        } else if (origen === "instantaneaServiciosEnReserva") {
            const reservaUID = data.reservaUID
            if (!reservaUID) {
                const m = "No llega el reseervaUID a instantaneaServicioEnReserva"
                throw new Error(m)
            }
            const serviciosDeLaReserva = await obtenerServiciosPorReservaUID(reservaUID)
            servicios.push(...serviciosDeLaReserva)
        } else if (origen === "instantaneaServiciosEnSimulacion") {
            const simulacionUID = data.simulacionUID
            if (!simulacionUID) {
                const m = "No llega el simulacionUID a instantaneaServiciosEnSimulacion"
                throw new Error(m)
            }
            const serviciosDeLaSimulacion = await obtenerServiciosPorSimulacionUID(simulacionUID)


            servicios.push(...serviciosDeLaSimulacion)
        } else {
            const m = "La confguracion de servicios en el procesador esta mal configurada, necesita origen en huServicios o instantaneaServiciosEnReserva"
            throw new Error(m)
        }

        await constructorInstantaneaServicios({
            estructura,
            servicios
        })
    } catch (error) {
        throw error
    }
}