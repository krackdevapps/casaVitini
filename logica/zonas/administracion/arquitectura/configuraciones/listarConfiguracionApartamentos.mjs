import { resolverApartamentoUI } from "../../../../sistema/resolucion/resolverApartamentoUI.mjs";
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const listarConfiguracionApartamentos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        const seleccionaApartamentos = `
                                    SELECT 
                                    uid,
                                    "apartamentoIDV",
                                    "estadoConfiguracion"
                                    FROM "configuracionApartamento"
                                    `;
        const resuelveSeleccionaApartamentos = await conexion.query(seleccionaApartamentos);
        const apartamentosConConfiguracion = [];
        if (resuelveSeleccionaApartamentos.rowCount > 0) {
            const apartamentoEntidad = resuelveSeleccionaApartamentos.rows;
            for (const detallesDelApartamento of apartamentoEntidad) {
                const apartamentoIDV = detallesDelApartamento.apartamentoIDV;
                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                const estadoConfiguracion = detallesDelApartamento.estadoConfiguracion;
                const estructuraFinal = {
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                    estadoConfiguracion: estadoConfiguracion
                };
                apartamentosConConfiguracion.push(estructuraFinal);
            }
        }
        const ok = {
            ok: apartamentosConConfiguracion
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}