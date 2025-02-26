import { eliminarDataFinancieraPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/eliminarDataFinancieraPorSimulacionUID.mjs"
import { generarDesgloseSimpleGuardarlo } from "./generarDesgloseSimpleGuardarlo.mjs"
import { soloFiltroDataGlobal } from "./soloFiltroDataGlobal.mjs"

export const controladorGeneracionDesgloseFinanciero = async (simulacionUID) => {
    try {

        const llavesGlobalesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        if (llavesGlobalesFaltantes.length > 0) {
            await eliminarDataFinancieraPorSimulacionUID(simulacionUID)
            return {
                info: "No se puede generar el contenedor financiero de la simulación porque faltan datos globales",
                llavesFaltantes: llavesGlobalesFaltantes
            }
        } else {
            const desgloseFinanciero = await generarDesgloseSimpleGuardarlo(simulacionUID)
            return {
                desgloseFinanciero
            }
        }
    } catch (error) {
        throw error
    }
}