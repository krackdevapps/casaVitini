
import { configuracionApartamento as configuracionApartamento_ } from "../../../shared/configuracionApartamento.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";


export const configuracionApartamento = async (entrada) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentos",
            filtro: "strictoIDV",
            sePermitenDuplicados: "no"
        })
        const transactor = await configuracionApartamento_(apartamentos);
        return transactor
    } catch (errorCapturado) {
        throw errorCapturado
    }
}