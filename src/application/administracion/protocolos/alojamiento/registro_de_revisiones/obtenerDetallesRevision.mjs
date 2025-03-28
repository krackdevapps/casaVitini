import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarElemento } from "../../../../../shared/inventario/validarElemento.mjs";
import { obtenerRevisionPorRevisionUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorRevisionUID.mjs";
import { obtenerTareaPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareaPorUID.mjs";
import { obtenerProtocoloPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocoloPorUID.mjs";

export const obtenerDetallesRevision = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const elementoValidado = validarElemento({
            o: entrada.body,
            filtrosIDV: [
                "revisionUID"
            ]
        })
        const revisionUID = elementoValidado.revisionUID
        const revision = await obtenerRevisionPorRevisionUID(revisionUID)

        const revisionInventario = revision?.revisionInventario || []
        const reposicionInventario = revision?.reposicionInventario || []
        const tareas = revision?.tareas || []

        for (const r of revisionInventario) {
            const uid = r.uid
            const protocolo = await obtenerProtocoloPorUID(uid)
            if (protocolo) {
                r.nombre = protocolo.nombre
            }
        }

        for (const r of reposicionInventario) {
            const uid = r.uid
            const protocolo = await obtenerProtocoloPorUID(uid)
            if (protocolo) {
                r.nombre = protocolo.nombre
            }
        }

        for (const t of tareas) {
            const uid = t.uid
            const tarea = await obtenerTareaPorUID(uid)
            if (tarea) {
                t.tareaUI = tarea.tareaUI
            }
        }

        const ok = {
            ok: "Detalles de la revisión",
            revision
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}