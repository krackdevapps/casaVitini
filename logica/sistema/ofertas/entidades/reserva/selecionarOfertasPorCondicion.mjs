import { obtenerOfertasPorRangoActualPorEstado } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoActualPorEstado.mjs"
import { obtenerOfertasPorRangoPorEstado } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoPorEstado.mjs"
import { selectorPorCondicion } from "./selectorPorCondicion.mjs"

export const selecionarOfertasPorCondicion = async (data) => {
    try {
        const fechaActual = data.fechaActual
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosArray = data.apartamentosArray
        const zonasArray = data.zonasArray
        const descuentosParaRechazar = data?.descuentosParaRechazar || []

        const ofertasSeleccionadasPorRango = await obtenerOfertasPorRangoActualPorEstado({
            fechaActual: fechaActual,
            estadoIDV: "activado",
            zonasArray,
            entidadIDV: "reserva"
        })

        const ofertaAnalizadasPorCondiciones = []
        for (const oferta of ofertasSeleccionadasPorRango) {
            const ofertaUID = String(oferta.ofertaUID)

            if (descuentosParaRechazar.length > 0 && descuentosParaRechazar.includes(ofertaUID)) {
                continue
            }
            const resultadoSelector = await selectorPorCondicion({
                oferta,
                apartamentosArray,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntrada,
                fechaSalida_reserva: fechaSalida,
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
