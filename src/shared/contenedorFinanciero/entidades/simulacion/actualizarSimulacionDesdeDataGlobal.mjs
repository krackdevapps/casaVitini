import { actualizarRangoFechasPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/actualizarRangoFechasPorSimulacionUID.mjs"
import { eliminarBloqueoCaducado } from "../../../bloqueos/eliminarBloqueoCaducado.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../../simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { validarDataGlobalSimulacion } from "./validarDataGlobalSimulacion.mjs"

export const actualizarSimulacionDesdeDataGlobal = async (data) => {
    try {

        const dataValidada = await validarDataGlobalSimulacion(data)

        const fechaCreacion = dataValidada.fechaCreacion
        const fechaEntrada = dataValidada.fechaEntrada
        const fechaSalida = dataValidada.fechaSalida
        const apartamentosIDVARRAY = dataValidada.apartamentosIDVARRAY
        const simulacionUID = dataValidada.simulacionUID
        const zonaIDV = dataValidada.zonaIDV

        await eliminarBloqueoCaducado()
        await actualizarRangoFechasPorSimulacionUID({
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentosIDVARRAY,
            simulacionUID,
            zonaIDV
        })
        const desgloseFinanciero = await generarDesgloseSimpleGuardarlo(simulacionUID)
        return desgloseFinanciero
    } catch (errorCapturado) {
        throw errorCapturado
    }
}




