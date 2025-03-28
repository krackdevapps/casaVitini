import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerTareaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareaPorApartamentoIDV.mjs";
import { validarTareaRealizada } from "../../../../../shared/protocolos/validarTareaRealizada.mjs";
import { filtroTareasPorDia } from "../../../../../shared/protocolos/filtroTareasPorDia.mjs";
import { actualizarTareasPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/actualizarTareasPorUID.mjs";
import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { obtenerElementoInventarioDesdeUIDDelElementoEnProtoolo } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerElementoInventarioDesdeUIDDelElementoEnProtoolo.mjs";
import { actualizarCantidadPorElementoUID } from "../../../../../infraestructure/repository/inventario/actualizarCantidadPorElementoUID.mjs";
import { insertarRegistro } from "../../../../../infraestructure/repository/inventario/insertarRegistro.mjs";
import Decimal from "decimal.js";
import { controladorDelMovimiento } from "../../../../../shared/inventario/controladorDeMovimiento.mjs";

export const actualizarTareasRealizadasAlojamientoFinalizaRevision = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const data = entrada.body

        const protocolVal = await validarTareaRealizada({
            o: data,
            filtrosIDV: [
                "uid",
                "respuestas"
            ]
        })

        const usuarioSolicitante = IDX.usuario
        const uidRevision = protocolVal.uid
        await campoDeTransaccion("iniciar")

        const reposicionParaActualizar = await obtenerRevisionPorUID(uidRevision)
        if (!reposicionParaActualizar) {
            const error = `No existe la revision, actualiza`
            throw new Error(error)
        }
        const estadoRevision = reposicionParaActualizar.estadoRevision
        const apartamentoIDV = reposicionParaActualizar.apartamentoIDV
        const revisionUID = reposicionParaActualizar.uid

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


        const revisionCompletada = await actualizarTareasPorUID({
            uid: uidRevision,
            tareas: JSON.stringify(protocolVal.respuestas),
            fechaFin: fechaActual,
            estadoRevision: "finalizada",
            reposicionInventario: JSON.stringify(reposicionInventario)

        })
        const alojamiento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = alojamiento.apartamentoUI



        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado las tareas del protocolo de alojamineto",
            revisionCompletada,
            apartamentoUI,
            fechaFinLocal: fechaActualLocal,
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}