
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerTareaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareaPorApartamentoIDV.mjs";
import { validarTareaRealizada } from "../../../../../shared/protocolos/validarTareaRealizada.mjs";
import { filtroTareasPorDia } from "../../../../../shared/protocolos/filtroTareasPorDia.mjs";
import { finalizaRevision } from "../../../../../shared/protocolos/finalizaRevision.mjs";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";
import { obtenerElementoInventarioDesdeUIDDelElementoEnProtoolo } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerElementoInventarioDesdeUIDDelElementoEnProtoolo.mjs";
import { controladorDelMovimiento } from "../../../../../shared/inventario/controladorDeMovimiento.mjs";
import { actualizarTareasPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/actualizarTareasPorUID.mjs";

export const actualizarTareasRealizadasAlojamientoFinalizaRevision = async (entrada) => {
    try {

        const protocolVal = await validarTareaRealizada({
            o: entrada.body,
            filtrosIDV: [
                "uid",
                "respuestas"
            ]
        })

        const usuarioSolicitante = entrada.session.usuario
        const uidRevision = protocolVal.uid
        await campoDeTransaccion("iniciar")

        const reposicionParaActualizar = await obtenerRevisionPorUID(uidRevision)
        if (!reposicionParaActualizar) {
            const error = `No existe la revision, actualiza`
            throw new Error(error)
        }
        const estadoRevision = reposicionParaActualizar.estadoRevision
        const apartamentoIDV = reposicionParaActualizar.apartamentoIDV
        if (estadoRevision === "finalizada") {
            throw {
                error: `La revision ya esta finalizada, para volver ha realizar otra revision, inicia otra revision `,
                code: "revisionFinalizada"
            }
        }

        const usuarioEnRevision = reposicionParaActualizar.usuario
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

        const revisionInventario = reposicionParaActualizar?.revisionInventario || []
        if (revisionInventario.lenght === 0) {
            const error = `Realiza primero la revision del inventario para poder obtener la reposicion del inventario`
            throw new Error(error)
        }
        const tareasDelProtocolo = await obtenerTareaPorApartamentoIDV(apartamentoIDV)
        const tareasDelDia = await filtroTareasPorDia({
            tareas: tareasDelProtocolo,
            apartamentoIDV
        })

        const tareasRespuestaIndizadas = {}
        const tareasRespuesta = protocolVal.respuestas
        tareasRespuesta.forEach(t => {
            const uid = t.uid
            tareasRespuestaIndizadas[uid] = t
        })

        tareasDelDia.forEach(t => {
            const uid = t.uid
            const tareaUI = t.tareaUI

            if (!tareasRespuestaIndizadas.hasOwnProperty(uid)) {
                throw new Error(`Por favor revisa la tarea ${tareaUI}`)
            }
        })

        const tiempoZH = DateTime.now();
        const fechaActual = tiempoZH.toISO();
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActualLocal = tiempoZH.setZone(zonaHoraria).toISO()


        const reposicionInventario = reposicionParaActualizar?.reposicionInventario || []

        for (const elementoRepuesto of reposicionInventario) {
            const uid = elementoRepuesto.uid
            const cantidadParaMover = elementoRepuesto.cantidadEncontrada

            const elementoDelInventario = await obtenerElementoInventarioDesdeUIDDelElementoEnProtoolo(uid)

            const elementoUID = elementoDelInventario.elementoUID
            const registro = await controladorDelMovimiento({
                elementoUID,
                operacionIDV: "elementoHaciaAlojamiento",
                cantidadEnMovimiento: cantidadParaMover
            })
            const registroUID = registro.nuevoRegistro.uid
            elementoRepuesto.registroEnlazado = {
                registroUID
            }
        }

        await actualizarTareasPorUID({
            uid: uidRevision,
            tareas: JSON.stringify(protocolVal.respuestas),
            reposicionInventario: JSON.stringify(reposicionInventario)

        })

        const revisionCompletada = await finalizaRevision({
            revisionUID: uidRevision
        })

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado las tareas del protocolo de alojamineto",
            revisionCompletada,
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}