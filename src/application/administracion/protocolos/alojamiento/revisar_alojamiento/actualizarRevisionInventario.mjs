import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarRevisionInventarioAlojamiento } from "../../../../../shared/protocolos/validarRevisionInventarioAlojamiento.mjs";
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import { actualizarRevisionInventarioPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/actualizarRevisionInventarioPorUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const actualizarRevisionInventario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const data = entrada.body

        const protocolVal = await validarRevisionInventarioAlojamiento({
            o: data,
            filtrosIDV: [
                "uid",
                "respuestas"
            ]
        })

        const usuarioSolicitante = IDX.usuario
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

        const revision = await actualizarRevisionInventarioPorUID({
            uid: uidRevision,
            revisionInventario: JSON.stringify(protocolVal.respuestas),
            resposicionInventario: null
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizar la revision",
            revision,
        }


        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}