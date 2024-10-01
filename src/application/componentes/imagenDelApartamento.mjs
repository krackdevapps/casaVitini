import { obtenerImagenApartamentoPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerImagenApartamentoPorApartamentoIDV.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";

export const imagenDelApartamento = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo del identiifcador visual de apartamento (apartamentoIDV)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const configuracionDelApartamento = await obtenerImagenApartamentoPorApartamentoIDV({
            apartamentoIDV,
            estadoConfiguracionIDV_array: ["disponible"]
        })
        const ok = {
            ok: "Imagen de apartamento PNG en base64",
            imagen: configuracionDelApartamento.imagen
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}