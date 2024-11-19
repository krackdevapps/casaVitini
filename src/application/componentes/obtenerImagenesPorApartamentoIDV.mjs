import { obtenerTodasLasImagenesPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerTodasLasImagenesPorApartamentoIDV.mjs";
import { obtenerImagenApartamentoPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerImagenApartamentoPorApartamentoIDV.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";

export const obtenerImagenesPorApartamentoIDV = async (entrada) => {
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

        const imagenes = await obtenerTodasLasImagenesPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: `Todas las imagenes del ${apartamentoIDV}`,
            imagenes
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}