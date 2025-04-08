import { actualizarTareaEnProtocoloPorUID } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/actualizarTareaEnProtocoloPorUID.mjs"
import { validarTareaDelProtocolo } from "../../../../../../shared/protocolos/validarTareaDelProtocolo.mjs"

export const actualizarTareaEnProtocolo = async (entrada, salida) => {
    try {


        const nuevoElemento = entrada.body
        const protocolVal = validarTareaDelProtocolo({
            o: nuevoElemento,
            filtrosIDV: [
                "uid",
                "tipoDiasIDV",
                "tareaUI"
            ]
        })

        const tarea = await actualizarTareaEnProtocoloPorUID({
            tipoDiasIDV: protocolVal.tipoDiasIDV,
            tareaUI: protocolVal.tareaUI,
            uid: protocolVal.uid
        })

        const ok = {
            ok: "Se ha actualizaro la tarea en el protocolo de alojamiento",
            tarea: tarea.uid
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}