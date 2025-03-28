import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerRevisionPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionPorUID.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import Decimal from "decimal.js";
import { actualizarReposicionInventarioPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/actualizarReposicionInventarioPorUID.mjs";
import { validarConfiguracion } from "../../../../../shared/protocolos/validarConfiguracion.mjs";
import { actualizaConfiguracionDeProtocolos } from "../../../../../infraestructure/repository/protocolos/configuracion/actualizaConfiguracionDeProtocolos.mjs";

export const actualizarConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const data = entrada.body

        const protocolVal = await validarConfiguracion({
            o: data,
            filtrosIDV: [
                "diasCaducidadRevision",
                "diasAntelacionPorReserva"
            ]
        })

        const diasCaducidadRevision = protocolVal.diasCaducidadRevision
        const diasAntelacionPorReserva = protocolVal.diasAntelacionPorReserva

        await campoDeTransaccion("iniciar")

        const reposicionParaActualizar = await actualizaConfiguracionDeProtocolos({
            diasCaducidadRevision,
            diasAntelacionPorReserva
        })

        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha actualizado la configuración de los protocolos de alojamiento",
            reposicionParaActualizar
        }

        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}