import { obtenerNumeroDeTodasLasImagenesPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/gestionDeImagenes/obtenerNumeroDeTodasLasImagenesPorApartamentoIDV.mjs";
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
            estadoConfiguracionIDV_array: ["activado"]
        })

        const numeroImg = await obtenerNumeroDeTodasLasImagenesPorApartamentoIDV(apartamentoIDV)
        const numeroTotal = numeroImg.totalImagenes
        const ok = {
            ok: "Imagen de apartamento PNG en base64",
            imagen: configuracionDelApartamento.imagen,
            numeroImagenesGaleria: numeroTotal
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}