import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerRevisionPorApartamentoIDVPorEstado } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorApartamentoIDVPorEstado.mjs";
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { crearRevisionPorUsuario } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/crearRevisionPorUsuario.mjs";
import { DateTime } from "luxon";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import { obtenerTareasDelProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareasDelProtocolosPorApartamentoIDV.mjs";

export const obtenerRevision = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const data = entrada.body

        const protocolVal = validarInventarioDelProtocolo({
            o: data,
            filtrosIDV: [
                "apartamentoIDV"
            ]
        })
        const usuarioSolicitante = IDX.usuario
        const apartamentoIDV = protocolVal.apartamentoIDV
        await campoDeTransaccion("iniciar")


        //revisar que exista al conf de alojamiento
        const alojamiento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = alojamiento.apartamentoUI
        const ok = {
            ok: "Aqui tienes la revisión",
            apartamentoUI: apartamentoUI
        }

        const revision = await obtenerRevisionPorApartamentoIDVPorEstado({
            apartamentoIDV,
            estadoRevision: "enCurso"
        })
        if (revision) {
            const usuarioEnRevision = revision?.usuario
            if (usuarioEnRevision !== usuarioSolicitante) {
                const error = `El usuari@ ${usuarioEnRevision} esta realizando la revision de ${apartamentoUI}`
                throw new Error(error)
            }

            ok.revision = revision
        } else {
            const tiempoZH = DateTime.now();
            const fechaActual = tiempoZH.toISO();
            const nuevaRevision = await crearRevisionPorUsuario({
                fechaInicio: fechaActual,
                usuario: usuarioSolicitante,
                apartamentoUI,
                apartamentoIDV,
                estadoRevision: "enCurso"

            })
            ok.revision = nuevaRevision
        }
        const inventarioAlojamiento = await obtenerProtocolosPorApartamentoIDV(apartamentoIDV)
        const tareasAlojamiento = await obtenerTareasDelProtocolosPorApartamentoIDV(apartamentoIDV)


        ok.protocolo = {
            inventarioAlojamiento,
            tareasAlojamiento
        }
        await campoDeTransaccion("confirmar")

        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorCapturado
    }
}