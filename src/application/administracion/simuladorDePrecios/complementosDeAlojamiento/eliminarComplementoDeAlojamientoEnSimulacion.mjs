import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarComplementoAlojamientoEnSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/complementosDeAlojamiento/eliminarComplementoAlojamientoEnSimulacionPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"

export const eliminarComplementoDeAlojamientoEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const complementoUID_enSimulacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID_enSimulacion,
            nombreCampo: "El complementoUID_enSimulacion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        await campoDeTransaccion("iniciar")
        const complementoDeAlojamiento = await eliminarComplementoAlojamientoEnSimulacionPorSimulacionUID(complementoUID_enSimulacion)
        const simulacionUID = complementoDeAlojamiento.simulacionUID
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        await campoDeTransaccion("confirmar")
        return {
            ok: "Se ha insertado el complemento de alojamiento en la simulacion",
            complementoDeAlojamiento,
            simulacionUID,
            ...postProcesadoSimualacion
        }
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error
    }
}