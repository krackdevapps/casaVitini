
import { validarRevisionInventarioAlojamiento } from "../../../../../shared/protocolos/validarRevisionInventarioAlojamiento.mjs";
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { eliminarRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/eliminarRevisionPorUID.mjs";

export const cancelarRevision = async (entrada) => {
    try {


        const protocolVal = await validarRevisionInventarioAlojamiento({
            o: entrada.body,
            filtrosIDV: [
                "uid"
            ]
        })

        const usuarioSolicitante = entrada.session.usuario
        const uidRevision = protocolVal.uid
        await campoDeTransaccion("iniciar")

        const revisionParaActualizar = await obtenerRevisionPorUID(uidRevision)
        if (!revisionParaActualizar) {
            const error = `No existe la revision, actualiza`
            throw new Error(error)
        }
        const estadoRevision = revisionParaActualizar.estadoRevision
        const apartamentoIDV = revisionParaActualizar.apartamentoIDV

        if (estadoRevision === "finalizada") {
            throw {
                error: `La revision ya esta finalizada, para volver ha realizar otra revision, inicia otra revision `,
                code: "revisionFinalizada"
            }
        }

        const usuarioEnRevision = revisionParaActualizar.usuario
        if (estadoRevision === "enCurso" && usuarioEnRevision !== usuarioSolicitante) {
            const alojamiento = await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
            const apartamentoUI = alojamiento.apartamentoUI
            throw {
                error: `El usuari@ ${usuarioEnRevision} esta realizando la revision de ${apartamentoUI}`,
                code: "revisionEnCursoPorOTroUsuario"
            }
        }

        const revisionEliminada = await eliminarRevisionPorUID(uidRevision)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha cancelalo la revisión",
            revisionEliminada
        }


        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}