import { obtenerOferatPorOfertaUID } from "../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs"
export const obtenerOfertaConApartamentos = async (ofertaUID) => {
    try {
        const oferta = await obtenerOferatPorOfertaUID(ofertaUID)
        return oferta
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
