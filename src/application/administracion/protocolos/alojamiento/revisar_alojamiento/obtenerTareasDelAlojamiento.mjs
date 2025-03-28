import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { obtenerTareasDelProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareasDelProtocolosPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";
import { obtenerReservasPorRangoConfirmadas } from "../../../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorRangoConfirmadas.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs";
import { filtroTareasPorDia } from "../../../../../shared/protocolos/filtroTareasPorDia.mjs";

export const obtenerTareasDelAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const data = entrada.body
        const protocolVal = validarInventarioDelProtocolo({
            o: data,
            filtrosIDV: [
                "apartamentoIDV",
            ]
        })
        const apartamentoIDV = protocolVal.apartamentoIDV
        const alojamiento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: apartamentoIDV,
            errorSi: "noExiste"
        })

        const tareasDelProtocolo = await obtenerTareasDelProtocolosPorApartamentoIDV(apartamentoIDV)

        const tareasDelDia = await filtroTareasPorDia({
            tareas: tareasDelProtocolo,
            apartamentoIDV
        })
        const arrayOrdenado = tareasDelDia.sort((a, b) => a.posicion - b.posicion);

        const ok = {
            ok: "Tareas del alojamiento filtradas por dias",
            alojamiento,
            tareasDelDia,
            tipoDiaActual: arrayOrdenado,
            arrayOrdenado,
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}