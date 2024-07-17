import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { obtenerTodosLosBloqueos } from "../../../repositorio/bloqueos/obtenerTodosLosBloqueos.mjs";
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from "../../../repositorio/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const listarApartamentosConBloqueos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        await eliminarBloqueoCaducado();

        const todosLosBloqueos = await obtenerTodosLosBloqueos()
        const ok = {};
        if (todosLosBloqueos.length === 0) {
            ok.ok = [];
        }
        if (todosLosBloqueos.length > 0) {
            const apartamentosEncontradosConDuplicados = [];
            todosLosBloqueos.forEach((detalleBloqueo) => {
                const apartamento = detalleBloqueo.apartamento;
                apartamentosEncontradosConDuplicados.push(apartamento);
            });
            const apartamentosEncontrados = [...new Set(apartamentosEncontradosConDuplicados)];
            const estructuraSalidaFinal = [];
            for (const apartamento of apartamentosEncontrados) {
                const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV: apartamento,
                    errorSi: "noExiste"
                }).apartamentoUI
                const bloqueosDelApartamento = await obtenerBloqueosDelApartamentoPorApartamentoIDV(apartamento)
                const estructuraFinal = {
                    apartamentoIDV: apartamento,
                    apartamentoUI: apartamentoUI,
                    numeroDeBloqueos: bloqueosDelApartamento.length,
                };
                estructuraSalidaFinal.push(estructuraFinal);
            }
            ok.ok = estructuraSalidaFinal;
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}