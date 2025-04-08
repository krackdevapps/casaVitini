
import { validarTareaDelProtocolo } from "../../../../../../shared/protocolos/validarTareaDelProtocolo.mjs";
import { insertarTareaEnProtocoloAlojamiento } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/insertarTareaEnProtocoloAlojamiento.mjs";
import { obtenerTareasDelProtocolosPorApartamentoIDV } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareasDelProtocolosPorApartamentoIDV.mjs";

export const insertarTareaEnProtocolo = async (entrada) => {
    try {

        const protocolVal = validarTareaDelProtocolo({
            o: entrada.body,
            filtrosIDV: [
                "apartamentoIDV",
                "tipoDiasIDV",
                "tareaUI"
            ]
        })

        const elementosDelInventario = await obtenerTareasDelProtocolosPorApartamentoIDV(protocolVal.apartamentoIDV)
        const posicionSiguiente = elementosDelInventario.length + 1

        const tarea = await insertarTareaEnProtocoloAlojamiento({
            tipoDiasIDV: protocolVal.tipoDiasIDV,
            apartamentoIDV: protocolVal.apartamentoIDV,
            tareaUI: protocolVal.tareaUI,
            posicion: posicionSiguiente
        })

        const ok = {
            ok: "Se ha insertado la tarea en el protocolo de alojamiento",
            tarea: tarea.uid
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}