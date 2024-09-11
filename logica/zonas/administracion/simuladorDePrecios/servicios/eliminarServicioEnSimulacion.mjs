import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { eliminarServicioEnSimulacionPorServicioUID } from "../../../../repositorio/simulacionDePrecios/servicios/eliminarServicioEnSimulacionPorServicioUID.mjs"
import { obtenerServicioEnSimulacionPorServicioUID } from "../../../../repositorio/simulacionDePrecios/servicios/obtenerServicioEnSimulacionPorServicioUID.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../../../sistema/simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../sistema/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"

export const eliminarServicioEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const servicioUID_enSimulacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enSimulacion,
            nombreCampo: "El identificador universal de la servicio (servicioUID_enSimulacion)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        await campoDeTransaccion("iniciar")
        const serviciosEnSimulacion = await obtenerServicioEnSimulacionPorServicioUID(servicioUID_enSimulacion)
        const simulacionUID = serviciosEnSimulacion.simulacionUID
        await eliminarServicioEnSimulacionPorServicioUID(servicioUID_enSimulacion)
        await validarDataGlobalDeSimulacion(simulacionUID)
        const desgloseFinanciero = await generarDesgloseSimpleGuardarlo(simulacionUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el servicio de la reserva",
            desgloseFinanciero: desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}