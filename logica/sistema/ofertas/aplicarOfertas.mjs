import { obtenerOfertasPorRangoPorEstado } from "../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoPorEstado.mjs"
import { aplicarDescuento } from "./aplicarDescuento.mjs"
import { selectorPorCondicion } from "./selectorPorCondicion.mjs"

export const aplicarOfertas = async (data) => {

    try {
        const totalesBase = data.totalesBase
        const fechaActual = data.fechaActual
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosArray = data.apartamentosArray

        const ofertasSeleccionadasPorRango = await obtenerOfertasPorRangoPorEstado({
            fechaSalidaReserva_ISO: fechaEntrada,
            fechaEntradaReserva_ISO: fechaSalida,
            estado: "activado"
        })

        const ofertaAnalizadasPorCondiciones = []
        for (const oferta of ofertasSeleccionadasPorRango) {
            const resultadoSelector = await selectorPorCondicion({
                oferta,
                apartamentosArray,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntrada,
                fechaSalida_reserva: fechaSalida,
            })
            ofertaAnalizadasPorCondiciones.push(resultadoSelector)
        }

        // console.log("ofertaAnalizadasPorCondiciones", ofertaAnalizadasPorCondiciones)
        // console.log("_________________________________________")

        const descuentosAplicado = aplicarDescuento({
            ofertarParaAplicarDescuentos: ofertaAnalizadasPorCondiciones,
            totalesBase: totalesBase,
        })

   
        const contenedorOferta = " de momento vacio"
        const descuentoFinal = " de momento vacio"

        const estructura = {
            ofertasAplicadas: contenedorOferta,
            descuentoFinal: descuentoFinal
        }
        return estructura
    } catch (error) {
        throw error
    }
}
