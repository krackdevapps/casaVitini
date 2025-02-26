import { obtenerOferatPorOfertaUID } from "../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"
export const obtenerOfertaConApartamentos = async (ofertaUID) => {
    try {
        const oferta = await obtenerOferatPorOfertaUID(ofertaUID)
        return oferta
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
