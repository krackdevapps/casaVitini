import { actualizarRangoFechasPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/actualizarRangoFechasPorSimulacionUID.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../../simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { validarDataGlobalSimulacion } from "./validarDataGlobalSimulacion.mjs"

export const actualizarSimulacionDesdeDataGlobal = async (data) => {
    try {
        
        throw new Error("quien me llama")

        const dataValidada = await validarDataGlobalSimulacion(data)
        const fechaCreacion = dataValidada.fechaCreacion
        const fechaEntrada = dataValidada.fechaEntrada
        const fechaSalida = dataValidada.fechaSalida
        const simulacionUID = dataValidada.simulacionUID
        const zonaIDV = dataValidada.zonaIDV

        await actualizarRangoFechasPorSimulacionUID({
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            simulacionUID,
            zonaIDV
        })

        const desgloseFinanciero = await generarDesgloseSimpleGuardarlo(simulacionUID)
        return desgloseFinanciero
    } catch (errorCapturado) {
        throw errorCapturado
    }
}




