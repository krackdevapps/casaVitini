import { obtenerComponente as obtenerComponente_} from "../../shared/obtenerComponente.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";

export const obtenerComponente = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const componente = validadoresCompartidos.tipos.cadena({
            string: entrada.body.componente,
            nombreCampo: "La ruta del componente",
            filtro: "url",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        if (!componente) {
            const error = "Tienes que definir 'componente' con el nombre de la componente";
            throw new Error(error);
        }
        const transaccionInterna = await obtenerComponente_({
            componente: componente,
            usuario: entrada.session?.usuario,
            rolIDV: entrada.session?.rolIDV
        })
        return transaccionInterna
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

