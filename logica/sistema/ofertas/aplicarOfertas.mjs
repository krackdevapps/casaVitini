import { obtenerOfertasPorRangoPorEstado } from "../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoPorEstado.mjs"
import { aplicarDescuento } from "./aplicarDescuento.mjs"
import { selectorPorCondicion } from "./selectorPorCondicion.mjs"

export const aplicarOfertas = async (data) => {
    try {
        const estructura = data.estructura
        const fechaActual = data.fechaActual
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosArray = data.apartamentosArray
        const zonasDeLaOferta = data.zonasDeLaOferta
        const descuentosParaRechazar = data.descuentosParaRechazar // array
        
        const ofertasSeleccionadasPorRango = await obtenerOfertasPorRangoPorEstado({
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida,
            estado: "activado",
            zonasDeLaOferta
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
            ofertaAnalizadasPorCondiciones.push(resultadoSelector)
        }

        await aplicarDescuento({
            ofertarParaAplicarDescuentos: ofertaAnalizadasPorCondiciones,
            estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })



    } catch (error) {
        throw error
    }
}
