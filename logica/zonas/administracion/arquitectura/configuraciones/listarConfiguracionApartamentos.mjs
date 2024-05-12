import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../../repositorio/arquitectura/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerNombreApartamentoUI } from "../../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";

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
            const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
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
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}