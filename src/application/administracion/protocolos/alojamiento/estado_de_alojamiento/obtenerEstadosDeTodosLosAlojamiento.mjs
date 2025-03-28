import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV.mjs";

export const obtenerEstadosDeTodosLosAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const configuracionesDeLosApartamento = await obtenerTodasLasConfiguracionDeLosApartamento()

        const apartamentosConConfiguracion = [];
        for (const detallesDelApartamento of configuracionesDeLosApartamento) {
            const apartamentoIDV = detallesDelApartamento.apartamentoIDV;
            const zonaIDV = detallesDelApartamento.zonaIDV;
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            });
            const estadoConfiguracion = detallesDelApartamento.estadoConfiguracionIDV;

            const ultimaRevision = await obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV(apartamentoIDV)
            const estructuraFinal = {
                apartamentoIDV: apartamentoIDV,
                zonaIDV,
                apartamentoUI: apartamento.apartamentoUI,
                estadoConfiguracion: estadoConfiguracion,
            };
            // Obtener la ultima revision
            if (ultimaRevision) {
                estructuraFinal.ultimaRevision = ultimaRevision
            }


            apartamentosConConfiguracion.push(estructuraFinal);
        }

        const ok = {
            ok: apartamentosConConfiguracion
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}