import { obtenerOfertasPorRangoActualPorEstado } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoActualPorEstado.mjs"
import { selectorPorCondicion } from "./selectorPorCondicion.mjs"

export const selecionarOfertasPorCondicion = async (data) => {
    try {
        const fechaActual = data.fechaActual
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosArray = data.apartamentosArray || []
        const zonasArray = data.zonasArray
        const codigoDescuentosArrayBASE64 = data.codigoDescuentosArrayBASE64 || []
        const ignorarCodigosDescuentos = data.ignorarCodigosDescuentos


        const ofertasSeleccionadasPorRango = await obtenerOfertasPorRangoActualPorEstado({
            fechaActual: fechaActual,
            estadoIDV: "activado",
            zonasArray,
            entidadIDV: "reserva"
        })
        const ofertaAnalizadasPorCondiciones = []
        for (const oferta of ofertasSeleccionadasPorRango) {
            const resultadoSelector = await selectorPorCondicion({
                oferta,
                apartamentosArray,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntrada,
                fechaSalida_reserva: fechaSalida,
                codigoDescuentosArrayBASE64: codigoDescuentosArrayBASE64,
                ignorarCodigosDescuentos: ignorarCodigosDescuentos
            })
            resultadoSelector.autorizacion = "aceptada"
            const condicionesQueNoSeCumple = resultadoSelector.condicionesQueNoSeCumple

            if (condicionesQueNoSeCumple.length === 0) {
                ofertaAnalizadasPorCondiciones.push(resultadoSelector)
            }
        }
        return ofertaAnalizadasPorCondiciones
    } catch (error) {
        throw error
    }
}
