import { obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"

export const soloFiltroDataGlobal = async(simulacionUID) => {

    const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
    const alojamientoSimulacion = await obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID(simulacionUID)
    const dataGlobalRequerida = [
        "fechaCreacion",
        "fechaEntrada",
        "fechaSalida",
        "zonaIDV"
    ]
    const llavesGlobalesFaltantes = []
    dataGlobalRequerida.forEach(d => {
        const selData = simulacion[d]
        if (selData === null || !selData || selData.length === 0) {
            llavesGlobalesFaltantes.push(d)
        }
    })

    if (alojamientoSimulacion.length === 0) {
        llavesGlobalesFaltantes.push("alojamiento")
    }

    return llavesGlobalesFaltantes
}