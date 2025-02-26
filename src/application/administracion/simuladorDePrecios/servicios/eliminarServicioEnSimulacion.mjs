import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarServicioEnSimulacionPorServicioUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/eliminarServicioEnSimulacionPorServicioUID.mjs"
import { obtenerServicioEnSimulacionPorServicioUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServicioEnSimulacionPorServicioUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"

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
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el servicio de la reserva",
            simulacionUID,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}