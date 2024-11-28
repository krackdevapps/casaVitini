import { eliminarDataFinancieraPorSimulacionUID } from "../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/eliminarDataFinancieraPorSimulacionUID.mjs"
import { utilidades } from "../utilidades.mjs"
import { generarDesgloseSimpleGuardarlo } from "./generarDesgloseSimpleGuardarlo.mjs"
import { soloFiltroDataGlobal } from "./soloFiltroDataGlobal.mjs"

export const controladorGeneracionDesgloseFinanciero = async (simulacionUID) => {
    try {

        const llavesGlobalesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        if (llavesGlobalesFaltantes.length > 0) {
            await eliminarDataFinancieraPorSimulacionUID(simulacionUID)
            const llavesPrimeraMayuscula = llavesGlobalesFaltantes.map(l => {

                return l.charAt(0).toUpperCase() + l.slice(1);
            })

            const llavesFaltantesUI = utilidades.constructorComasEY({
                array: llavesPrimeraMayuscula,
                articulo: ""
            })
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