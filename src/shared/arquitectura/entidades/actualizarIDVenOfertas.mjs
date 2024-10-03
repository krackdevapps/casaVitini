import { actualizarOfertaPorOfertaUID } from "../../../infraestructure/repository/ofertas/actualizarOfertaPorOfertaUID.mjs"
import { obtenerTodasLasOfertas } from "../../../infraestructure/repository/ofertas/obtenerTodasLasOfertas.mjs"
import { actualizaApartamentoIDVEnObjetoOfertas } from "./actualizaApartamentoIDVEnObjetoOfertas.mjs"

export const actualizarIDVenOfertas = async (data) => {


    const origenIDV = data.origenIDV
    const destinoIDV = data.destinoIDV
    const todasLasOfertas = await obtenerTodasLasOfertas()

    for (const contenedorOferta of todasLasOfertas) {
        const ofertaUID = contenedorOferta.ofertaUID
        const nombreOferta = contenedorOferta.nombreOferta
        const entidadIDV = contenedorOferta.entidadIDV
        const fechaInicio = contenedorOferta.fechaInicio
        const fechaFinal = contenedorOferta.fechaFinal
        const condicionesArray = contenedorOferta.condicionesArray
        const descuentosJSON = contenedorOferta.descuentosJSON
        const zonaIDV = contenedorOferta.zonaIDV

        actualizaApartamentoIDVEnObjetoOfertas({
            contenedorOferta,
            origenIDV,
            destinoIDV
        })

        await actualizarOfertaPorOfertaUID({
            ofertaUID,
            nombreOferta,
            entidadIDV,
            fechaInicio,
            fechaFinal,
            condicionesArray,
            descuentosJSON,
            zonaIDV
        })
    }
}