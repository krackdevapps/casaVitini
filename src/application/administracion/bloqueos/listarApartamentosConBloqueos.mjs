import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { obtenerTodosLosBloqueos } from "../../../infraestructure/repository/bloqueos/obtenerTodosLosBloqueos.mjs";
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from "../../../infraestructure/repository/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const listarApartamentosConBloqueos = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
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
                const apartamentoIDV = detalleBloqueo.apartamentoIDV;
                apartamentosEncontradosConDuplicados.push(apartamentoIDV);
            });
            const apartamentosEncontrados = [...new Set(apartamentosEncontradosConDuplicados)];
            const estructuraSalidaFinal = [];
            for (const apartamentoIDV of apartamentosEncontrados) {
                const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV: apartamentoIDV,
                    errorSi: "noExiste"
                })
                const apartamentoUI = apartamento.apartamentoUI
                const bloqueosDelApartamento = await obtenerBloqueosDelApartamentoPorApartamentoIDV(apartamentoIDV)
                const estructuraFinal = {
                    apartamentoIDV: apartamentoIDV,
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