import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from "../../../repositorio/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const listaBloquoeosDelApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await eliminarBloqueoCaducado();
        await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);
        const bloqueosDelApartamento = await obtenerBloqueosDelApartamentoPorApartamentoIDV(apartamentoIDV)

        const ok = {};
        if (bloqueosDelApartamento.length === 0) {
            ok.apartamentoIDV = apartamentoIDV;
            ok.apartamentoUI = apartamentoUI;
            ok.ok = [];
        }
        if (bloqueosDelApartamento.length > 0) {
            const bloqueosDelApartamentoEntonctrado = [];
            bloqueosDelApartamento.forEach((bloqueoDelApartamento) => {
                const uidBloqueo = bloqueoDelApartamento.uid;
                const tipoBloqueo = bloqueoDelApartamento.tipoBloqueo;
                const entrada = bloqueoDelApartamento.entrada;
                const salida = bloqueoDelApartamento.salida;
                const motivo = bloqueoDelApartamento.motivo;
                const zona = bloqueoDelApartamento.zona;
                const estructuraBloqueo = {
                    uidBloqueo: uidBloqueo,
                    tipoBloqueo: tipoBloqueo,
                    entrada: entrada,
                    salida: salida,
                    motivo: motivo,
                    zona: zona
                };
                bloqueosDelApartamentoEntonctrado.push(estructuraBloqueo);
            });
            ok.apartamentoIDV = apartamentoIDV;
            ok.apartamentoUI = apartamentoUI;
            ok.ok = bloqueosDelApartamentoEntonctrado;
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}