import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../../repositorio/arquitectura/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const listarConfiguracionApartamentos = async (entrada, salida) => {
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
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);
            const estadoConfiguracion = detallesDelApartamento.estadoConfiguracion;
            const estructuraFinal = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                estadoConfiguracion: estadoConfiguracion
            };
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