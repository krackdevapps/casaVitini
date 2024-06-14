import Decimal from "decimal.js"
import { calcularTotal } from "../calcularTotal.mjs"
import { controlCantidadOfertas } from "../controlCantidadOfertas.mjs"
import { controlInstanciaDecimal } from "../controlInstanciaDecimal.mjs"

export const perfil_totalNeto = (data) => {
    try {
        const ofertaUID = data.ofertaUID
        const oferta = data.oferta
        const nombreOferta = data.nombreOferta
        const contenedorOfertas = data.contenedorOfertas
        const descuentos = data.descuentos
        const contenedorPorTotal = data.contenedorPorTotal
        const totalNeto = data.totalNeto
        const estructura = data.estructura
        const totalDescuento = new Decimal(estructura.global.totales.totalDescuento)


        const tipoAplicacion = descuentos.tipoAplicacion
        const descuentoTotal = descuentos.descuentoTotal
        controlCantidadOfertas({
            ofertaUID,
            contenedor: oferta,
            contenedorOfertas
        })
        const totalCalculado = calcularTotal({
            tipoAplicacion,
            descuentoTotal,
            total: totalNeto
        })
        estructura.global.totales.totalDescuento = totalDescuento.plus(totalCalculado.descuentoAplicado)

        const descuentoAplicado = {
            tipoAplicacion,
            ofertaUID,
            nombreOferta,
            ...totalCalculado
        }
        contenedorPorTotal.push(descuentoAplicado)
    } catch (error) {
        throw error
    }



}