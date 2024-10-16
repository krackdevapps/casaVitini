import { obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"

export const validadorCompartidoDataGlobalDeSimulacion = async (simulacionUID) => {
    try {
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const fechaEntrada = simulacion?.fechaEntrada
        const fechaSalida = simulacion?.fechaSalida
        const fechaCreacion = simulacion?.fechaCreacion
        //const apartamentosIDVARRAY = simulacion?.apartamentosIDVARRAY
        const zonaIDV = simulacion?.zonaIDV

        const global = {
            fechaEntrada,
            fechaSalida,
            fechaCreacion,
            //  apartamentosIDVARRAY,
            zonaIDV
        }
        const control = (data) => {
            if (
                data === null
                ||
                data === undefined
                ||
                !data
                ||
                data.length === 0
            ) { return true }
            else { return false }
        }
        const llavesSinData = []
        Object.entries(global).forEach(([llave, valor]) => {
            if (control(valor)) {
                llavesSinData.push(llave)
            }
        })
        const alojamientoSimulacion = await obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID(simulacionUID)
        if (alojamientoSimulacion.length === 0) {
            llavesSinData.push("apartamentosIDVARRAY")
        }
        if (llavesSinData.length > 0) {
            const custonError = {
                info: "Faltan las siguientes llaves globales para poder renderizar el contenedor financiero de la simulación",
                llavesFaltantes: llavesSinData
            }
            throw custonError
        }
    } catch (error) {
        throw error
    }
}