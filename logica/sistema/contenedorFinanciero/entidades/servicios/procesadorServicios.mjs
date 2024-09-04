import { obtenerServiciosPorReservaUID } from "../../../../repositorio/servicios/obtenerServiciosPorReservaUID.mjs"
import { obtenerServicioPorServicioUID } from "../../../../repositorio/servicios/obtenerServicioPorServicioUID.mjs"
import { constructorInstantaneaServicios } from "./constructorInstantaneaServicios.mjs"

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