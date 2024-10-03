import Decimal from "decimal.js"
import { calcularTotal } from "../calcularTotal.mjs"
import { controlInstanciaDecimal } from "../controlInstanciaDecimal.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"

export const perfil_individualPorApartamento = async (data) => {
    try {

        const descuentos = data.descuentos
        const oferta = data.oferta
        const ofertaUID = data.ofertaUID
        const estructura = data.estructura
        const nombreOferta = data.nombreOferta
        const contenedorPorApartamento = data.contenedorPorApartamento
        const apartamentos = descuentos.apartamentos

        for (const descuentoDelApartamento of apartamentos) {
            const apartamentoIDV = descuentoDelApartamento.apartamentoIDV
            const descuentoTotal = descuentoDelApartamento.descuentoTotal
            const tipoAplicacion = descuentoDelApartamento.tipoAplicacion

            const configuracionAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })
            if (configuracionAlojamiento?.apartamentoIDV) {
                descuentoDelApartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                }))?.apartamentoUI
            } else {
                const m = `Atención, esta oferta no puede aplicarse porque en "descuentos individuales por apartamento" dentro de esta oferta, se hace referencia al identificador visual IDV (${apartamentoIDV}) y esta configuración de alojamiento no existe. O bien cree la configuración de alojamiento o borre este apartamento de la oferta.  Antes de dar por válida una oferta se recomienda probarla en el simulador de precios para evitar esto. Si simplemente quiere añadir esta oferta ahora mismo a una reserva activa, borre la referencia al configuración de alojamiento dentro de la oferta.`
                throw new Error(m)
            }

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