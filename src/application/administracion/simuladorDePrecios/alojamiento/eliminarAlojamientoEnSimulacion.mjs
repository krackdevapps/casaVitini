import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarApartamentoEnSimulacion } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/eliminarApartamentoEnSimulacion.mjs"
import { obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID.mjs"
import { eliminarDataFinancieraPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/eliminarDataFinancieraPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { eliminarTodosLosServiciosDeLaSimulacion } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/eliminarTodosLosServiciosDeLaSimulacion.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { soloFiltroDataGlobal } from "../../../../shared/simuladorDePrecios/soloFiltroDataGlobal.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"


export const eliminarAlojamientoEnSimulacion = async (entrada) => {
    try {


        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        await obtenerSimulacionPorSimulacionUID(simulacionUID)

        await campoDeTransaccion("iniciar")
        // No puede haber dos apartametnos iguales en la simulacion
        const nuevoApartamento = await eliminarApartamentoEnSimulacion({
            simulacionUID,
            apartamentoIDV
        })

        const restoAlojamientos = await obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID(simulacionUID)

        const ok = {
            ok: "Se ha eliminado el apartamento en la simulacion",
            simulacionUID,
            nuevoApartamento,
        }

        if (restoAlojamientos.length === 0) {
            await eliminarDataFinancieraPorSimulacionUID(simulacionUID)
            await eliminarTodosLosServiciosDeLaSimulacion(simulacionUID)
            ok.llavesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        } else {
            ok.postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        }
        await campoDeTransaccion("confirmar")
        return ok
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error
    }
}