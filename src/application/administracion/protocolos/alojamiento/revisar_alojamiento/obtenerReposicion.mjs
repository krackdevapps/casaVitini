
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import Decimal from "decimal.js";

export const obtenerReposicion = async (entrada) => {
    try {
        const protocolVal = validarInventarioDelProtocolo({
            o: entrada.body,
            filtrosIDV: [
                "uid"
            ]
        })
        const usuarioSolicitante = entrada.session.usuario
        const uid = protocolVal.uid
        await campoDeTransaccion("iniciar")

        const revision = await obtenerRevisionPorUID(uid)
        if (!revision) {
            throw new Error("No existe la revision")
        }
        const estadoRevision = revision.estadoRevision
        const apartamentoIDV = revision.apartamentoIDV

        //revisar que exista al conf de alojamiento
        const alojamiento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = alojamiento.apartamentoUI

        if (estadoRevision === "finalizada") {
            throw new Error("La revision esta finalizada")
        }
        const usuarioEnRevision = revision?.usuario
        if (usuarioEnRevision !== usuarioSolicitante) {
            const error = `El usuari@ ${usuarioEnRevision} esta realizando la revision de ${apartamentoUI}`
            throw new Error(error)
        }
        const revisionInventario = revision?.revisionInventario || []
        if (revisionInventario.lenght === 0) {
            const error = `Realiza primero la revision del inventario para poder obtener la reposicion del inventario`
            throw new Error(error)
        }

        const protocolosIndizados = {}
        const protolosInventarioAlojameinto = await obtenerProtocolosPorApartamentoIDV(apartamentoIDV)
        protolosInventarioAlojameinto.forEach(p => {
            const uid = p.uid
            protocolosIndizados[uid] = p
        })
        const ok = {
            ok: "Lista de elementos para reponer en el alojamiento",
            reposicionFinal: [],
            apartamentoUI
        }

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
                ok.reposicionFinal.push(r)
            }
        })
        await campoDeTransaccion("confirmar")
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorCapturado
    }
}