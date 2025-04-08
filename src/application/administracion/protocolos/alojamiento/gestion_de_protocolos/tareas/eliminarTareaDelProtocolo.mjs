import { campoDeTransaccion } from "../../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { actualizarOrdenDePosicionesTareas } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/actualizarOrdenDePosicionesTareas.mjs"
import { eliminarTareaDelProtocoloPorUID } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/eliminarTareaDelProtocoloPorUID.mjs"
import { validarTareaDelProtocolo } from "../../../../../../shared/protocolos/validarTareaDelProtocolo.mjs"

export const eliminarTareaDelProtocolo = async (entrada) => {
    try {

        const protocolVal = validarTareaDelProtocolo({
            o: entrada.body,
            filtrosIDV: [
                "uid",
            ]
        })
        await campoDeTransaccion("iniciar")

        const elementoEliminado = await eliminarTareaDelProtocoloPorUID(protocolVal.uid)
        const posicionEliminada = elementoEliminado.posicion
        const apartamentoIDV = elementoEliminado.apartamentoIDV

        await actualizarOrdenDePosicionesTareas({
            posicion: posicionEliminada,
            apartamentoIDV: apartamentoIDV
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha eliminado la tarea del protocolo del alojamiento",
            elementoEliminado
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorCapturado
    }
}