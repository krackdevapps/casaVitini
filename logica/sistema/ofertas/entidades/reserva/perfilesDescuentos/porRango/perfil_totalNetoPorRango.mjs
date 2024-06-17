import Decimal from "decimal.js"
import { calcularTotal } from "../../calcularTotal.mjs"
import { validadoresCompartidos } from "../../../../../validadores/validadoresCompartidos.mjs"
import { controlInstanciaDecimal } from "../../controlInstanciaDecimal.mjs"
import { constructorObjetoEstructuraPrecioDia } from "../../../../../contenedorFinanciero/entidades/reserva/constructorObjetoEstructuraPrecioDia.mjs"

export const perfil_totalNetoPorRango = async (data) => {
    try {

        const ofertaUID = data.ofertaUID
        const descuentos = data.descuentos
        const oferta = data.oferta
        const nombreOferta = data.nombreOferta
        const contenedorPorDia = data.contenedorPorDia
        const fechaInicioRango_ISO = data.fechaInicioRango_ISO
        const fechaFinalRango_ISO = data.fechaFinalRango_ISO
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const estructura = data.estructura
        const contenedorOfertas = data.contenedorOfertas
        const totalDescuento = new Decimal(estructura.global.totales.totalDescuento)
        contenedorOfertas.push(oferta)

        const diasArrayReserva = constructorObjetoEstructuraPrecioDia(fechaEntradaReserva_ISO, fechaSalidaReserva_ISO)
        for (const fechaDelDia of diasArrayReserva) {
            const fechaDentroDelRango = await validadoresCompartidos.fechas.fechaEnRango({
                fechaAComprobrarDentroDelRango: fechaDelDia,
                fechaInicioRango_ISO: fechaInicioRango_ISO,
                fechaFinRango_ISO: fechaFinalRango_ISO
            })

            if (!fechaDentroDelRango) {
                continue
            }

            if (!contenedorPorDia.hasOwnProperty(fechaDelDia)) {
                const precioNetoNoche = estructura.entidades.reserva.desglosePorNoche[fechaDelDia].precioNetoNoche
                contenedorPorDia[fechaDelDia] = {
                    totalSinDescuentos: precioNetoNoche,
                    totalConDescuentos: precioNetoNoche,
                    totalDescuentosAplicados: controlInstanciaDecimal("0.00"),
                }
            }
            const descuentoTotal = descuentos.descuentoTotal
            const tipoAplicacion = descuentos.tipoAplicacion
            const totalNetoPorDia = estructura.entidades.reserva
                .desglosePorNoche
            [fechaDelDia]
                ?.precioNetoNoche
            if (!totalNetoPorDia) {
                continue
            }

            const totalCalculado = calcularTotal({
                tipoAplicacion,
                descuentoTotal,
                total: totalNetoPorDia
            })
            estructura.global.totales.totalDescuento = totalDescuento.plus(totalCalculado.descuentoAplicado)

            const porDia = {
                ofertaUID,
                nombreOferta,
                tipoAplicacion: tipoAplicacion,
                fecha: fechaDelDia,
                ...totalCalculado
            }

            if (!contenedorPorDia[fechaDelDia].hasOwnProperty("porTotalNetoDia")) {
                contenedorPorDia[fechaDelDia].porTotalNetoDia = []
            }
            contenedorPorDia[fechaDelDia].porTotalNetoDia.push(porDia)
            contenedorPorDia[fechaDelDia].totalConDescuentos = new Decimal(contenedorPorDia[fechaDelDia].totalConDescuentos).minus(totalCalculado.descuentoAplicado).toFixed(2)
            const totalDescuentosAplicados = controlInstanciaDecimal(contenedorPorDia[fechaDelDia]
                .totalDescuentosAplicados).plus(totalCalculado.descuentoAplicado).toFixed(2)

            contenedorPorDia[fechaDelDia].totalDescuentosAplicados = totalDescuentosAplicados
        }
    } catch (error) {
        throw error
    }
}