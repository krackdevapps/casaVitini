import { obtenerOfertasPorArrayUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorArrayUID.mjs"

export const aplicarDescuentosPersonalizados = async (data) => {
    const descuentosArray = data.descuentosArray
    const ofertasSeleccionadas = await obtenerOfertasPorArrayUID(descuentosArray)
    const ofertaAnalizadasPorCondiciones = []
    for (const oferta of ofertasSeleccionadas) {
        const ofertaEstructura = {
            oferta
        }
        ofertaAnalizadasPorCondiciones.push(ofertaEstructura)
    }
    return ofertaAnalizadasPorCondiciones
}