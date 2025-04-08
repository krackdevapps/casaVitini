
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { acoplarHabitacionesAComplemento } from "../../../shared/complementosDeAlojamiento/acoplarHabitacionesAComplemento.mjs";

export const detallesComplemento = async (entrada) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El identificador universal del complementoUID (complementoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const complemento = await obtenerComplementoPorComplementoUID(complementoUID)
        const apartamentoIDV = complemento.apartamentoIDV
        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamento.apartamentoUI
        const habitacionUID = complemento.habitacionUID

        const habitacionesDelComplemento = await acoplarHabitacionesAComplemento({
            habitacionUID,
            apartamentoIDV
        })

        delete complemento.testingVI
        const ok = {
            ok: complemento,
            apartamentoUI,
            configuracionHabitacion: habitacionesDelComplemento


        };

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}