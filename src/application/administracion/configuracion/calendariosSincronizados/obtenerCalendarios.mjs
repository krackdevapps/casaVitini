
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerCalendariosPorPlataformaIDV } from "../../../../infraestructure/repository/calendario/obtenerCalendariosPorPlataformaIDV.mjs";

export const obtenerCalendarios = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
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
        const calendarioSincronizado = await obtenerCalendariosPorPlataformaIDV(plataformaCalendarios)
        for (const detallesDelCalendario of calendarioSincronizado) {
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
            const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })).apartamentoUI;
            detallesDelCalendario.apartamentoUI = apartamentoUI;
            ok.ok.push(detallesDelCalendario)
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}