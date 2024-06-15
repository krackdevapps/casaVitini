import Decimal from "decimal.js"
import { calcularTotal } from "../../calcularTotal.mjs"
import { controlCantidadOfertas } from "../../controlCantidadOfertas.mjs"
import { validadoresCompartidos } from "../../../../../validadores/validadoresCompartidos.mjs"
import { controlInstanciaDecimal } from "../../controlInstanciaDecimal.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"

export const perfil_porDiasDelRango = async (data) => {
    try {

        const ofertaUID = data.ofertaUID
        const oferta = data.oferta
        const nombreOferta = data.nombreOferta
        const dias = data.dias
        const contenedorPorDia = data.contenedorPorDia
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const estructura = data.estructura
        const contenedorOfertas = data.contenedorOfertas
        const totalDescuento = new Decimal(estructura.global.totales.totalDescuento)

        for (const descuentoPorDia of dias) {
            const fechaDelDia = descuentoPorDia.fecha
            const apartamentos = descuentoPorDia.apartamentos
            const tipoDescuento = descuentoPorDia.tipoDescuento

            const fechaDentroDelRango = await validadoresCompartidos.fechas.fechaEnRango({
                fechaAComprobrarDentroDelRango: fechaDelDia,
                fechaInicioRango_ISO: fechaEntradaReserva_ISO,
                fechaFinRango_ISO: fechaSalidaReserva_ISO
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
            if (tipoDescuento === "netoPorApartamentoDelDia") {
                controlCantidadOfertas({
                    ofertaUID,
                    contenedor: oferta,
                    contenedorOfertas
                })

                for (const apartamento of apartamentos) {
                    const apartamentoIDV = apartamento.apartamentoIDV
                    const descuentoTotal = new Decimal(apartamento.descuentoTotal)
                    const tipoAplicacion = apartamento.tipoAplicacion
                    apartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)).apartamentoUI


                    const totalPorApartamento = estructura.entidades.reserva
                        ?.desglosePorNoche
                    [fechaDelDia]
                        ?.apartamentosPorNoche
                    [apartamentoIDV]
                        ?.precioNetoApartamento
                    if (!totalPorApartamento) {
                        continue
                    }

                    if (!contenedorPorDia[fechaDelDia].hasOwnProperty("porApartamento")) {
                        contenedorPorDia[fechaDelDia].porApartamento = {}
                    }
                    const contenedorApartamentoMismoDia = contenedorPorDia[fechaDelDia].porApartamento

                    if (!contenedorApartamentoMismoDia.hasOwnProperty(apartamentoIDV)) {
                        contenedorApartamentoMismoDia[apartamentoIDV] = {
                            totalSinDescuentos: totalPorApartamento,
                            totalConDescuentos: new Decimal(totalPorApartamento),
                            totalDescuentosAplicados: new Decimal("0.00"),
                            descuentosAplicados: []
                        }
                    } else {
                        contenedorApartamentoMismoDia[apartamentoIDV].totalConDescuentos = controlInstanciaDecimal(contenedorApartamentoMismoDia[apartamentoIDV].totalConDescuentos);
                    }
                    const totalCalculado = calcularTotal({
                        tipoAplicacion,
                        descuentoTotal,
                        total: totalPorApartamento
                    })

                    estructura.global.totales.totalDescuento = totalDescuento.plus(totalCalculado.descuentoAplicado)

                    const porDia = {
                        apartamentoIDV,
                        ofertaUID,
                        nombreOferta,
                        tipoAplicacion: tipoAplicacion,
                        fecha: fechaDelDia,
                        ...totalCalculado
                    }
                    const contenedorPorApartamentoDentroDelDia = contenedorApartamentoMismoDia[apartamentoIDV]
                    contenedorPorApartamentoDentroDelDia.descuentosAplicados.push(porDia)


                    const totalConDescuentosPorApartamento = contenedorPorApartamentoDentroDelDia.totalConDescuentos
                        .minus(totalCalculado.descuentoAplicado)
                    contenedorPorApartamentoDentroDelDia.totalConDescuentos = new Decimal(totalConDescuentosPorApartamento).isPositive() ? totalConDescuentosPorApartamento.toFixed(2) : "0.00"

                    const totalConDescuentosPorDia = new Decimal(contenedorPorDia[fechaDelDia].totalConDescuentos).minus(totalCalculado.descuentoAplicado)
                    contenedorPorDia[fechaDelDia].totalConDescuentos = totalConDescuentosPorDia.isPositive() ? totalConDescuentosPorDia.toFixed(2) : "0.00"
                    const descuentosAplicados = new Decimal(contenedorPorDia[fechaDelDia]
                        .totalDescuentosAplicados)
                        .plus(totalCalculado.descuentoAplicado)

                    contenedorPorDia[fechaDelDia].totalDescuentosAplicados = descuentosAplicados.toFixed(2)

                    const totalDescuentosAplicadosPorApartamento = new Decimal(contenedorPorApartamentoDentroDelDia
                        .totalDescuentosAplicados
                    ).plus(totalCalculado.descuentoAplicado)

                    contenedorPorApartamentoDentroDelDia.totalDescuentosAplicados = totalDescuentosAplicadosPorApartamento.toFixed(2)
                }
            }

            if (tipoDescuento === "netoPorDia") {
                controlCantidadOfertas({
                    ofertaUID,
                    contenedor: oferta,
                    contenedorOfertas
                })

                const descuentoTotal = descuentoPorDia.descuentoTotal
                const tipoAplicacion = descuentoPorDia.tipoAplicacion
                const totalNetoPorDia = estructura.entidades.reserva.
                    desglosePorNoche
                [fechaDelDia]
                    .precioNetoNoche

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

                const totalConDescuentosPorDia = new Decimal(contenedorPorDia[fechaDelDia]
                    .totalConDescuentos)
                    .minus(totalCalculado.descuentoAplicado)

                contenedorPorDia[fechaDelDia].totalConDescuentos = totalConDescuentosPorDia.isPositive() ? totalConDescuentosPorDia.toFixed(2) : "0.00"
                contenedorPorDia[fechaDelDia].totalDescuentosAplicados = new Decimal(contenedorPorDia[fechaDelDia].totalDescuentosAplicados).plus(totalCalculado.descuentoAplicado).toFixed(2)
            }
        }
    } catch (error) {
        throw error
    }
}