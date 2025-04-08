import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerCalendarioPorCalendarioUID } from "../../../../infraestructure/repository/calendario/obtenerCalendarioPorCalendarioUID.mjs";

import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

export const detallesDelCalendario = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const calendarioSincronziado = await obtenerCalendarioPorCalendarioUID(calendarioUID)
        const apartamentoIDV = calendarioSincronziado.apartamentoIDV;
        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI;
        calendarioSincronziado.apartamentoUI = apartamentoUI;

        const ok = {
            ok: calendarioSincronziado
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}