import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerCalendarioPorPlataformaIDV } from "../../../../repositorio/configuracion/calendarioSincronizados/obtenerCalendarioPorPlataformaIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const obtenerCalendarios = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const plataformaCalendarios = validadoresCompartidos.tipos.cadena({
            string: entrada.body.plataformaCalendarios,
            nombreCampo: "plataformaCalendarios",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const ok = {
            ok: []
        };
        const calendarioSincronizado = await obtenerCalendarioPorPlataformaIDV(plataformaCalendarios)
        for (const detallesDelCalendario of calendarioSincronizado) {
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);
            detallesDelCalendario.apartamentoUI = apartamentoUI;
            ok.ok.push(detallesDelCalendario)
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}