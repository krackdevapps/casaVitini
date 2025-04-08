
import { validarRevisionInventarioAlojamiento } from "../../../../../shared/protocolos/validarRevisionInventarioAlojamiento.mjs";
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import { actualizarRevisionInventarioPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/actualizarRevisionInventarioPorUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerTareaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareaPorApartamentoIDV.mjs";
import { finalizaRevision } from "../../../../../shared/protocolos/finalizaRevision.mjs";

export const actualizarRevisionInventario = async (entrada) => {
    try {
        const protocolVal = await validarRevisionInventarioAlojamiento({
            o: entrada.body,
            filtrosIDV: [
                "uid",
                "respuestas"
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
            //revisar que exista al conf de alojamiento
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

        const protocoloInventario = await obtenerProtocolosPorApartamentoIDV(apartamentoIDV)

        const respuestasFormateadas = {}
        protocolVal.respuestas.forEach(r => {
            const uid = r.uid
            respuestasFormateadas[uid] = r
        })
        for (const p of protocoloInventario) {
            const uid = p.uid
            const nombre = p.nombre
            const cantidad_enAlojamiento = p.cantidad_enAlojamiento
            if (!respuestasFormateadas.hasOwnProperty(uid)) {
                throw {
                    error: `Por favor revisa ${nombre}, marca en verde si esta en el alojamiento o marca en rojo si no esta o no estan las ${cantidad_enAlojamiento} unidades`
                }
            }
            const respuesta = respuestasFormateadas[uid]
            const cantidadEncontrada = respuesta.cantidadEncontrada
            const cENumero = Number(cantidadEncontrada)
            if (cENumero < 0) {
                throw {
                    error: `En ${nombre} hay un numero de cantidad inferior a cero`
                }
            } else if (cENumero > Number(cantidad_enAlojamiento)) {
                throw {
                    error: `En ${nombre} hay un numero de cantidad superior a ${cantidad_enAlojamiento}`
                }
            } else if (cENumero === Number(cantidad_enAlojamiento)) {
                respuesta.color = "verde"
            }
        }


        const respuestas = protocolVal.respuestas
        const revision = await actualizarRevisionInventarioPorUID({
            uid: uidRevision,
            revisionInventario: JSON.stringify(respuestas),
            resposicionInventario: null,
            revision: revisionParaActualizar
        })

        const ok = {
            ok: "Se ha actualizar la revision",
            revision,
        }
        const siguientePasoReposicion = respuestas.every(r => r.color === "verde")

        if (siguientePasoReposicion) {
            ok.siguientePaso = "tareas"
            const tareasDelProtocolo = await obtenerTareaPorApartamentoIDV(apartamentoIDV)
            if (tareasDelProtocolo.length === 0) {
                ok.siguientePaso = "fin"
                ok.revisionCompletada = await finalizaRevision({
                    revisionUID: uidRevision
                })
            } else {
                ok.tareasDelProtocolo = tareasDelProtocolo
            }
        } else {
            ok.siguientePaso = "reposicion"
        }

        await campoDeTransaccion("confirmar")
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}