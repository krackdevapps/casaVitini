import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarApartamentoEnSimulacion } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/eliminarApartamentoEnSimulacion.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"

export const eliminarAlojamientoEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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
        await campoDeTransaccion("confirmar")
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        return {
            ok: "Se ha eliminado el apartamento en la simulacion",
            simulacionUID,
            nuevoApartamento,
            ...postProcesadoSimualacion
        }
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error
    }
}