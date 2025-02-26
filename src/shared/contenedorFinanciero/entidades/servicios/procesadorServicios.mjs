import { obtenerServicioPorServicioUID } from "../../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs"
import { constructorInstantaneaServicios } from "./constructorInstantaneaServicios.mjs"
import { obtenerServiciosPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs"
import { obtenerServiciosPorReservaUID } from "../../../../infraestructure/repository/reservas/servicios/obtenerServiciosPorReservaUID.mjs"

export const procesadorServicios = async (data) => {
    try {
        const estructura = data.estructura
        const origen = data.origen
        const serviciosSolicitados = data.serviciosSolicitados
        const opcionesSolicitadasDelservicio = {}
        const servicios = []
        if (origen === "hubServicios") {
            for (const servicioSol of serviciosSolicitados) {
                const servicioUID = servicioSol.servicioUID
                const servicio = await obtenerServicioPorServicioUID(servicioUID)
                servicios.push(servicio)
                opcionesSolicitadasDelservicio[servicioUID] = servicioSol
            }

        } else if (origen === "instantaneaServiciosEnReserva") {
            const reservaUID = data.reservaUID
            if (!reservaUID) {
                const m = "No llega el reseervaUID a instantaneaServicioEnReserva"
                throw new Error(m)
            }
            const serviciosDeLaReserva = await obtenerServiciosPorReservaUID(reservaUID)
            serviciosDeLaReserva.forEach(s => {
                const servicioUID = s.servicioUID
                const opcionesSel = s.opcionesSel
                opcionesSolicitadasDelservicio[servicioUID] = {
                    servicioUID,
                    opcionesSeleccionadas: opcionesSel
                }
            })
            servicios.push(...serviciosDeLaReserva)
        } else if (origen === "instantaneaServiciosEnSimulacion") {
            const simulacionUID = data.simulacionUID
            if (!simulacionUID) {
                const m = "No llega el simulacionUID a instantaneaServiciosEnSimulacion"
                throw new Error(m)
            }
            const serviciosDeLaSimulacion = await obtenerServiciosPorSimulacionUID(simulacionUID)
            serviciosDeLaSimulacion.forEach(s => {
                const servicioUID = s.servicioUID
                const opcionesSel = s.opcionesSel
                opcionesSolicitadasDelservicio[servicioUID] = {
                    servicioUID,
                    opcionesSeleccionadas: opcionesSel
                }
            })
            servicios.push(...serviciosDeLaSimulacion)
        } else {
            const m = "La confguracion de servicios en el procesador esta mal configurada, necesita origen en huServicios o instantaneaServiciosEnReserva"
            throw new Error(m)
        }
        await constructorInstantaneaServicios({
            estructura,
            servicios,
            opcionesSolicitadasDelservicio
        })
    } catch (error) {
        throw error
    }
}