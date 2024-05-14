import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerCalendarioPorPlataformaIDV } from "../../../../repositorio/configuracion/calendarioSincronizados/obtenerCalendarioPorPlataformaIDV.mjs";

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
            const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
            detallesDelCalendario.apartamentoUI = apartamentoUI;
            ok.ok.push(detallesDelCalendario)
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}