import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarElemento } from "../../../../../shared/inventario/validarElemento.mjs";
import { obtenerRevisionPorRevisionUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorRevisionUID.mjs";
import { reversionDeMovimiento } from "../../../../../shared/inventario/reversionDeMovimiento.mjs";
import { eliminarRevisionPorRevisionUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/eliminarRevisionPorRevisionUID.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const eliminarRevision = async (entrada) => {
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

        await campoDeTransaccion("iniciar")

        const revision = await obtenerRevisionPorRevisionUID(revisionUID)
        const reposicionInventario = revision?.reposicionInventario || []

        for (const r of reposicionInventario) {
            const registroEnlazado = r?.registroEnlazado
            if (registroEnlazado) {
                const registroUID = registroEnlazado.registroUID
                await reversionDeMovimiento({
                    registroUID
                })
            }
        }


        await eliminarRevisionPorRevisionUID(revisionUID)
        await campoDeTransaccion("confirmar")


        const ok = {
            ok: "Detalles de la revisión",
            revision
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}