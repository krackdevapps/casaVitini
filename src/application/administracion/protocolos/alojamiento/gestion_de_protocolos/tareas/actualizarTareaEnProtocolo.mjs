import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarTareaDelProtocolo } from "../../../../../shared/protocolos/validarTareaDelProtocolo.mjs";
import { actualizarTareaEnProtocoloPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/tareas/actualizarTareaEnProtocoloPorUID.mjs";

export const actualizarTareaEnProtocolo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

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