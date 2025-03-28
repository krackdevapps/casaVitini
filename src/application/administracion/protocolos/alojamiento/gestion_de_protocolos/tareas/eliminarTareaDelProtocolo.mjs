import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarTareaDelProtocolo } from "../../../../../shared/protocolos/validarTareaDelProtocolo.mjs";
import { eliminarTareaDelProtocoloPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/tareas/eliminarTareaDelProtocoloPorUID.mjs";
import { actualizarOrdenDePosicionesTareas } from "../../../../../infraestructure/repository/protocolos/alojamiento/tareas/actualizarOrdenDePosicionesTareas.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const eliminarTareaDelProtocolo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const data = entrada.body


        const protocolVal = validarTareaDelProtocolo({
            o: data,
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
            apartamentoIDV : apartamentoIDV
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