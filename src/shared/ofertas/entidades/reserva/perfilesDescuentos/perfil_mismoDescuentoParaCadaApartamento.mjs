import Decimal from "decimal.js"
import { calcularTotal } from "../calcularTotal.mjs"
export const perfil_mismoDescuentoParaCadaApartamento = (data) => {
    try {
        const descuentos = data.descuentos
        const oferta = data.oferta
        const ofertaUID = data.ofertaUID
        const estructura = data.estructura
        const apartamentosIDVArray = Object.keys(estructura.entidades.reserva.desglosePorApartamento)
        const descuentoTotal = descuentos.descuentoTotal
        const tipoAplicacion = descuentos.tipoAplicacion
        const nombreOferta = data.nombreOferta
        const contenedorPorApartamento = data.contenedorPorApartamento

        for (const apartamentoIDV of apartamentosIDVArray) {

            const totalPorApartametno = estructura.entidades.reserva?.desglosePorApartamento[apartamentoIDV]?.totalNeto
            if (!totalPorApartametno) {
                continue
            }
            if (!contenedorPorApartamento.hasOwnProperty(apartamentoIDV)) {
                contenedorPorApartamento[apartamentoIDV] = {
                    totalDescuentosAplicados: new Decimal("0.00"),
                    totalNetoSinDescuentos: totalPorApartametno,
                    totalNetoConDescuentos: totalPorApartametno,
                    descuentosAplicados: []
                }
            } else {
                contenedorPorApartamento[apartamentoIDV].totalDescuentosAplicados = new Decimal(contenedorPorApartamento[apartamentoIDV].totalDescuentosAplicados);
            }
            const contenedorDelApartamento = contenedorPorApartamento[apartamentoIDV]
            const totalCalculado = calcularTotal({
                tipoAplicacion,
                descuentoTotal,
                total: totalPorApartametno
            })
            const totalDescuento = estructura.entidades.reserva.global.totales.totalDescuento
            estructura.entidades.reserva.global.totales.totalDescuento = new Decimal(totalDescuento).plus(totalCalculado.descuentoAplicado)

            const porApartamento = {
                apartamentoIDV,
                ofertaUID,
                nombreOferta,
                tipoAplicacion: tipoAplicacion,
                ...totalCalculado
            }
            contenedorDelApartamento.descuentosAplicados.push(porApartamento)
            contenedorDelApartamento.totalDescuentosAplicados = new Decimal(contenedorDelApartamento.totalDescuentosAplicados).plus(totalCalculado.descuentoAplicado).toFixed(2)
            const totalNetoConDescuentos = new Decimal(contenedorDelApartamento.totalNetoConDescuentos).minus(totalCalculado.descuentoAplicado)
            contenedorDelApartamento.totalNetoConDescuentos = totalNetoConDescuentos.isPositive() ? totalNetoConDescuentos.toFixed(2) : "0.00"
        }
    } catch (error) {
        throw error
    }



}