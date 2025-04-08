
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionDeProtocolos } from "../../../../../infraestructure/repository/protocolos/configuracion/obtenerConfiguracionDeProtocolos.mjs";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";
import { obtenerEstadoRevisionDelAlojamiento } from "../../../../../shared/protocolos/obtenerEstadoRevisionDelAlojamiento.mjs";

export const obtenerEstadosDeTodosLosAlojamiento = async () => {
    try {


        const configuracionesDeLosApartamento = await obtenerTodasLasConfiguracionDeLosApartamento()
        const configuracionProtocolos = await obtenerConfiguracionDeProtocolos()

        delete configuracionProtocolos?.uid
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const fechaActualUTC = DateTime.now().toUTC()
        const fechaActualLocal = DateTime.now().setZone(zonaHoraria).toISO()

        const ok = {
            ok: "Estados de todos los apartamentos",
            estadosRevision: [],
            configuracionGlobal: configuracionProtocolos,
            dataGlobal: {
                fechaActualLocal,
                fechaActualUTC
            }
        };

        for (const detallesDelApartamento of configuracionesDeLosApartamento) {
            const apartamentoIDV = detallesDelApartamento.apartamentoIDV;
            const zonaIDV = detallesDelApartamento.zonaIDV;
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            });
            const estadoConfiguracion = detallesDelApartamento.estadoConfiguracionIDV;
            const estadoPreparacion = await obtenerEstadoRevisionDelAlojamiento({
                apartamentoIDV
            })

            const estructuraFinal = {
                apartamentoIDV: apartamentoIDV,
                zonaIDV,
                apartamentoUI: apartamento.apartamentoUI,
                estadoConfiguracion: estadoConfiguracion,
                ...estadoPreparacion
            };

            ok.estadosRevision.push(estructuraFinal);
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}