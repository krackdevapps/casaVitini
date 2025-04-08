
import { validarRevisionInventarioAlojamiento } from "../../../../../shared/protocolos/validarRevisionInventarioAlojamiento.mjs";
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import Decimal from "decimal.js";
import { actualizarReposicionInventarioPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/actualizarReposicionInventarioPorUID.mjs";
import { obtenerTareaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareaPorApartamentoIDV.mjs";
import { finalizaRevision } from "../../../../../shared/protocolos/finalizaRevision.mjs";

export const actualizarReposicionInventario = async (entrada) => {
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

        const protocolo = await obtenerProtocolosPorApartamentoIDV(apartamentoIDV)
        const reposicionEnEspera = []
        const protocolosIndizados = {}
        protocolo.forEach(p => {
            const uid = p.uid
            protocolosIndizados[uid] = p
        })
        revisionInventario.forEach(r => {
            const uid = r.uid
            const color = r.color
            if (protocolosIndizados.hasOwnProperty(uid) && color === "rojo") {
                const protocolo = protocolosIndizados[uid]
                const cantidadEncontrada = r.cantidadEncontrada
                const cantidad_enAlojamiento = protocolo.cantidad_enAlojamiento
                r.cantidad_enAlojamiento = cantidad_enAlojamiento
                r.nombre = protocolo.nombre
                const diferencia = new Decimal(cantidad_enAlojamiento).minus(cantidadEncontrada)
                if (diferencia.isNegative()) {
                    r.cantidadParaReponer = "0"
                } else {
                    r.cantidadParaReponer = diferencia
                }
                reposicionEnEspera.push({
                    uid,
                    cantidadParaReponer: r.cantidadParaReponer,
                    nombre: r.nombre
                })
            }
        })

        const respuestasReposicion = protocolVal.respuestas
        const respuestasIndizadas = {}
        respuestasReposicion.forEach(p => {
            const uid = p.uid
            respuestasIndizadas[uid] = p
        })

        for (const rEE of reposicionEnEspera) {
            const uid = rEE.uid
            const cantidadParaReponer = rEE.cantidadParaReponer
            const nombre = rEE.nombre

            if (!respuestasIndizadas.hasOwnProperty(uid)) {
                throw new Error(`Por favor revisa ${nombre}`)
            }

            const respuestaPorValidar = respuestasIndizadas[uid]
            const cantidadParaReponerSolicitada = respuestaPorValidar.cantidadEncontrada
            const cPRS = Number(cantidadParaReponerSolicitada)

            if (cPRS < 0) {
                throw new Error(`La reposición de ${nombre} no puede ser inferior a cero`)
            } else if (cPRS > Number(cantidadParaReponer)) {
                throw new Error(`La reposición ${nombre} no pude ser superior a ${cantidadParaReponer}`)
            }

        }

        const reposicionInventario = await actualizarReposicionInventarioPorUID({
            uid: uidRevision,
            reposicionInventario: JSON.stringify(protocolVal.respuestas)
        })
        const ok = {
            ok: "Se ha actualizado la reposicion del inventario",
            reposicionInventario
        }

        const tareasDelProtocolo = await obtenerTareaPorApartamentoIDV(apartamentoIDV)
        if (tareasDelProtocolo.length === 0) {
            ok.siguientePaso = "fin"
            ok.revisionCompletada = await finalizaRevision({
                revisionUID: uidRevision
            })
        } else {
            ok.siguientePaso = "tareas"
            ok.tareasDelProtocolo = tareasDelProtocolo
        }

        await campoDeTransaccion("confirmar")

        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}