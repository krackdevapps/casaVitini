
import { obtenerOfertaConApartamentos } from "../../../shared/ofertas/obsoleto/obtenerOfertaConApartamentos.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";


export const detallesOferta = async (entrada, salida) => {
    // try {

    //     validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
    //         objeto: entrada.body,
    //         numeroDeLLavesMaximo: 1
    //     })
    //     const ofertaUID = validadoresCompartidos.tipos.numero({
    //         string: entrada.body.ofertaUID,
    //         nombreCampo: "El identificador universal de la oferta (ofertaUID)",
    //         filtro: "numeroSimple",
    //         sePermiteVacio: "no",
    //         limpiezaEspaciosAlrededor: "si",
    //         sePermitenNegativos: "no"
    //     })
    //     const detallesOferta = await obtenerOfertaConApartamentos(ofertaUID);
    //     const ok = {
    //         ok: detallesOferta
    //     };
    //     return ok
    // } catch (errorCapturado) {
    //     throw errorCapturado
    //}
}