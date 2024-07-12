import Decimal from "decimal.js"
import { calcularTotal } from "../calcularTotal.mjs"
import { controlCantidadOfertas } from "../controlCantidadOfertas.mjs"
import { controlInstanciaDecimal } from "../controlInstanciaDecimal.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"

export const perfil_individualPorApartamento = async (data) => {
    try {

        const descuentos = data.descuentos
        const oferta = data.oferta
        const ofertaUID = data.ofertaUID
        const estructura = data.estructura
        const nombreOferta = data.nombreOferta
        const contenedorPorApartamento = data.contenedorPorApartamento
        const contenedorOfertas = data.contenedorOfertas
        const totalDescuento = new Decimal(estructura.global.totales.totalDescuento)

        const apartamentos = descuentos.apartamentos

        for (const descuentoDelApartamento of apartamentos) {
            const apartamentoIDV = descuentoDelApartamento.apartamentoIDV
            const descuentoTotal = descuentoDelApartamento.descuentoTotal
            const tipoAplicacion = descuentoDelApartamento.tipoAplicacion
            descuentoDelApartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })).apartamentoUI

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
                contenedorPorApartamento[apartamentoIDV].totalDescuentosAplicados = controlInstanciaDecimal(contenedorPorApartamento[apartamentoIDV].totalDescuentosAplicados);
            }
            const contenedorDelApartamento = contenedorPorApartamento[apartamentoIDV]
            const totalCalculado = calcularTotal({
                tipoAplicacion,
                descuentoTotal,
                total: totalPorApartametno
            })
            const totalConDescuentos = totalCalculado.totalConDescuento
            const resultadoTotalCondescuentos = totalDescuento.plus(totalConDescuentos)
            estructura.global.totales.totalDescuento = resultadoTotalCondescuentos.isPositive() ? resultadoTotalCondescuentos.toFixed(2) : "0.00"

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