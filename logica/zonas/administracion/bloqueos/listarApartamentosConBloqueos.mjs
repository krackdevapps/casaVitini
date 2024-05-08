import { resolverApartamentoUI } from "../../../sistema/resolucion/resolverApartamentoUI.mjs";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";

export const listarApartamentosConBloqueos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        await eliminarBloqueoCaducado();
        const consultaApartamentosConBloqueo = `
                            SELECT
                            uid,
                            to_char(entrada, 'DD/MM/YYYY') as entrada, 
                            to_char(salida, 'DD/MM/YYYY') as salida, 
                            apartamento,
                            "tipoBloqueo"
                            FROM "bloqueosApartamentos";`;
        const resuelveApartamentosBloqueados = await conexion.query(consultaApartamentosConBloqueo);
        const ok = {};
        if (resuelveApartamentosBloqueados.rowCount === 0) {
            ok.ok = [];
        }
        if (resuelveApartamentosBloqueados.rowCount > 0) {
            const bloqueosEncontrados = resuelveApartamentosBloqueados.rows;
            const apartamentosEncontradosConDuplicados = [];
            bloqueosEncontrados.map((detalleBloqueo) => {
                const apartamento = detalleBloqueo.apartamento;
                apartamentosEncontradosConDuplicados.push(apartamento);
            });
            const apartamentosEncontrados = [...new Set(apartamentosEncontradosConDuplicados)];
            const estructuraSalidaFinal = [];
            for (const apartamento of apartamentosEncontrados) {
                const apartamentoUI = await resolverApartamentoUI(apartamento);
                const conteoDeBloqueosPorApartamento = `
                                    SELECT
                                    apartamento
                                    FROM "bloqueosApartamentos"
                                    WHERE apartamento = $1;`;
                const resuelveConteoDeBloqueosPorApartamento = await conexion.query(conteoDeBloqueosPorApartamento, [apartamento]);
                const numeroDeBloqueosPorApartamento = resuelveConteoDeBloqueosPorApartamento.rowCount;
                const estructuraFinal = {
                    apartamentoIDV: apartamento,
                    apartamentoUI: apartamentoUI,
                    numeroDeBloqueos: numeroDeBloqueosPorApartamento,
                };
                estructuraSalidaFinal.push(estructuraFinal);
            }
            ok.ok = estructuraSalidaFinal;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}