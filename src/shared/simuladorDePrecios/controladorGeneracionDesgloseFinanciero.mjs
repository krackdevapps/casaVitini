import { eliminarDataFinancieraPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/eliminarDataFinancieraPorSimulacionUID.mjs"
import { generarDesgloseSimpleGuardarlo } from "./generarDesgloseSimpleGuardarlo.mjs"
import { soloFiltroDataGlobal } from "./soloFiltroDataGlobal.mjs"

export const controladorGeneracionDesgloseFinanciero = async (simulacionUID) => {
    try {

        const llavesGlobalesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        if (llavesGlobalesFaltantes.length > 0) {
            await eliminarDataFinancieraPorSimulacionUID(simulacionUID)
            throw {
                error: "No se puede generar el contenedor financiero de la simulación porque faltan datos globales. Para su comomidad los datos globales faltantes parpadearan de color azul. Recuerde que también debe revisar la pestaña alojamiento y cerciorarse de que al menos haya un alojamiento insertado en la simulación.",
                errorID: "llavesFaltantes",
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