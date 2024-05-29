import { obtenerOfertasPorRangoPorEstado } from "../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoPorEstado.mjs"
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
        console.log("ofertas seleccion inicial por fecha", ofertasSeleccionadasPorRango)

        const ofertaAnalizadasPorCondiciones = []
        for (const oferta of ofertasSeleccionadasPorRango) {
            const resultadoSelector = await selectorPorCondicion({
                oferta,
                apartamentosArray,
                totalesBase,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntrada,
                fechaSalida_reserva: fechaSalida,
            })
            ofertaAnalizadasPorCondiciones.push(resultadoSelector)
        }

        console.log("ofertaAnalizadasPorCondiciones", ofertaAnalizadasPorCondiciones)


        // // Coincidencia por condciones de oferta
        // // aplicar descuentos

        // reserva.fechas.fechaActualProcesada_ISO = fechaActualTZ
        // const contenedorOferta = []
        // let descuentoTotal = new Decimal(0)
        // const ofertasPorNumeroDeApartamentos = await porNumeroDeApartamentos(reserva)
        // contenedorOferta.push(ofertasPorNumeroDeApartamentos)
        // const ofertasPorApartamentosEspecificos = await porApartamentosEspecificos(reserva)
        // contenedorOferta.push(ofertasPorApartamentosEspecificos)
        // const ofertasPorDiasDeReserva = await porDiasDeReserva(reserva)
        // contenedorOferta.push(ofertasPorDiasDeReserva)
        // const ofertasPorRangoDeFecha = await porRangoDeFechas(reserva)
        // contenedorOferta.push(ofertasPorRangoDeFecha)
        // const ofertasPorDiasDeAntelacion = await porDiasDeAntelacion(reserva)
        // contenedorOferta.push(ofertasPorDiasDeAntelacion)

        // //Sumar el total
        // for (const detallesOferta of contenedorOferta) {
        //     const totalOferta = detallesOferta.descuentoGlobal
        //     descuentoTotal = descuentoTotal.plus(totalOferta)
        //     delete detallesOferta.descuentoGlobal
        // }
        // const descuentoFinal = descuentoTotal.isPositive() ? descuentoTotal : "0.00"
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
