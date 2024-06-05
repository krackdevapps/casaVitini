import Decimal from "decimal.js"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { constructorIndiceTotales } from "./constructorInficeTotales.mjs"
import { constructorObjetoEstructuraPrecioDia } from "../precios/constructorObjetoEstructuraPrecioDia.mjs"
import { calcularTotal } from "./calcularTotal.mjs"
import { controlInstanciaDecimal } from "./controlInstanciaDecimal.mjs"

export const aplicarDescuento = async (data) => {
    try {
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const ofertarParaAplicarDescuentos = data.ofertarParaAplicarDescuentos
        const totalesBase = data.totalesBase
        const indiceTotales = constructorIndiceTotales(totalesBase)

        if (!totalesBase.hasOwnProperty("ofertasAplicadas")) {
            totalesBase.ofertasAplicadas = {
                ofertas: {},
                porTotal: [],
                entidades: {
                    reservas: {
                        porApartamento: {},
                        porDia: {},
                    }
                }

            }
        }

        const contenedorTotalesBase = totalesBase.totales
        const totalNeto = new Decimal(contenedorTotalesBase.totalNeto)
        const contenedorOfertas = totalesBase.ofertasAplicadas.ofertas
        const contenedorPorTotal = totalesBase.ofertasAplicadas.porTotal
        const contenedorPorApartamento = totalesBase.ofertasAplicadas.entidades.reservas.porApartamento
        const contenedorPorDia = totalesBase.ofertasAplicadas.entidades.reservas.porDia

        let totalGlobalDescuento = new Decimal("0.00")

        const controlCantidadOfertas = (data) => {
            const contenedorOfertas = data.contenedorOfertas
            const ofertaUID = data.ofertaUID
            const oferta = data.oferta

            if (!contenedorOfertas.hasOwnProperty(ofertaUID)) {
                contenedorOfertas[ofertaUID] = {
                    cantidad: new Decimal("1"),
                    oferta
                }
            } else {
                const cantidad = contenedorOfertas[ofertaUID].cantidad
                contenedorOfertas[ofertaUID].cantidad = cantidad.plus("1")
            }

        }
        
        for (const oferta of ofertarParaAplicarDescuentos) {
            const descuentos = oferta.oferta.descuentosJSON
            const ofertaUID = oferta.oferta.ofertaUID
            const tipoDescuento = descuentos.tipoDescuento

            if (tipoDescuento === "totalNeto") {
                const tipoAplicacion = descuentos.tipoAplicacion
                const descuentoTotal = descuentos.descuentoTotal
                controlCantidadOfertas({
                    ofertaUID,
                    oferta,
                    contenedorOfertas
                })
                const totalCalculado = calcularTotal({
                    tipoAplicacion,
                    descuentoTotal,
                    total: totalNeto
                })
                totalGlobalDescuento = totalGlobalDescuento.plus(totalCalculado.descuentoAplicado)

                const descuentoAplicado = {
                    tipoAplicacion,
                    ofertaUID,
                    ...totalCalculado
                }
                contenedorPorTotal.push(descuentoAplicado)

            } else if (tipoDescuento === "individualPorApartamento") {
                const apartamentos = descuentos.apartamentos
                controlCantidadOfertas({
                    ofertaUID,
                    oferta,
                    contenedorOfertas
                })
                for (const descuentoDelApartamento of apartamentos) {
                    const apartamentoIDV = descuentoDelApartamento.apartamentoIDV
                    const descuentoTotal = descuentoDelApartamento.descuentoTotal
                    const tipoAplicacion = descuentoDelApartamento.tipoAplicacion

                    const indiceTotalApartamento = indiceTotales.indicePorApartamentos[apartamentoIDV].posicion
                    
                    const totalPorApartametno = totalesBase.entidades.reservas.desglosePorApartamento[indiceTotalApartamento].totalNeto

                    if (!contenedorPorApartamento.hasOwnProperty(apartamentoIDV)) {
                        contenedorPorApartamento[apartamentoIDV] = {
                            totalConDescuentos: new Decimal("0.00"),
                            descuentosAplicados: []
                        }
                    } else {
                        contenedorPorApartamento[apartamentoIDV].totalConDescuentos = controlInstanciaDecimal(contenedorPorApartamento[apartamentoIDV].totalConDescuentos);
                    }
                    const contenedorDelApartamento = contenedorPorApartamento[apartamentoIDV]
                    const totalCalculado = calcularTotal({
                        tipoAplicacion,
                        descuentoTotal,
                        total: totalPorApartametno
                    })
                    const totalConDescuentos = totalCalculado.totalConDescuento
                    totalGlobalDescuento = totalGlobalDescuento.plus(totalConDescuentos)
                    const porApartamento = {
                        apartamentoIDV,
                        ofertaUID,
                        tipoAplicacion: tipoAplicacion,
                        ...totalCalculado
                    }
                    contenedorDelApartamento.descuentosAplicados.push(porApartamento)
                    contenedorDelApartamento.totalConDescuentos = contenedorDelApartamento.totalConDescuentos.plus(totalConDescuentos)
                }
            } else if (tipoDescuento === "porRango") {
                const dias = descuentos.descuentoPorDias
                const subTipoDescuento = descuentos.subTipoDescuento
                const fechaInicioRango_ISO = descuentos.fechaInicioRango_ISO
                const fechaFinalRango_ISO = descuentos.fechaFinalRango_ISO

                if (subTipoDescuento === "porDiasDelRango") {

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
                            contenedorPorDia[fechaDelDia] = {}
                        }
                        if (!contenedorPorDia[fechaDelDia].hasOwnProperty("totalConDescuentos")) {
                            contenedorPorDia[fechaDelDia].totalConDescuentos = new Decimal("0.00")
                        } else {
                            contenedorPorDia[fechaDelDia].totalConDescuentos = controlInstanciaDecimal(contenedorPorDia[fechaDelDia].totalConDescuentos);
                        }

                        if (tipoDescuento === "netoPorApartamentoDelDia") {
                            controlCantidadOfertas({
                                ofertaUID,
                                oferta,
                                contenedorOfertas
                            })

                            for (const apartamento of apartamentos) {
                                const apartamentoIDV = apartamento.apartamentoIDV
                                const descuentoTotal = new Decimal(apartamento.descuentoTotal)
                                const tipoAplicacion = apartamento.tipoAplicacion
                                const indicePosicionApartamento = indiceTotales.indicePorNoche[fechaDelDia].posicion
                                const indiceTotalPorApartamento = indiceTotales.indicePorNoche
                                [fechaDelDia]
                                    .apartamentosPorNoche
                                [apartamentoIDV]
                                    .posicion
                                const totalPorApartamento = totalesBase.entidades.reservas.
                                    desglosePorNoche
                                [indicePosicionApartamento]
                                    .apartamentosPorNoche
                                [indiceTotalPorApartamento]
                                    .precioNetoApartamento

                                if (!contenedorPorDia[fechaDelDia].hasOwnProperty("porApartamento")) {
                                    contenedorPorDia[fechaDelDia].porApartamento = {}
                                }
                                const contenedorApartamentoMismoDia = contenedorPorDia[fechaDelDia].porApartamento

                                if (!contenedorApartamentoMismoDia.hasOwnProperty(apartamentoIDV)) {
                                    contenedorApartamentoMismoDia[apartamentoIDV] = {
                                        totalConDescuentos: new Decimal("0.00"),
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
                                totalGlobalDescuento = totalGlobalDescuento.plus(totalCalculado.descuentoAplicado)

                                const porDia = {
                                    apartamentoIDV,
                                    ofertaUID,
                                    tipoAplicacion: tipoAplicacion,
                                    fecha: fechaDelDia,
                                    ...totalCalculado
                                }
                                const contenedorApartamento = contenedorApartamentoMismoDia[apartamentoIDV]
                                contenedorApartamento.descuentosAplicados.push(porDia)
                                contenedorApartamento.totalConDescuentos = contenedorApartamento.totalConDescuentos
                                    .plus(totalCalculado.totalConDescuento)
                                contenedorPorDia[fechaDelDia].totalConDescuentos = contenedorPorDia[fechaDelDia]
                                    .totalConDescuentos
                                    .plus(totalCalculado.totalConDescuento)
                            }
                        }

                        if (tipoDescuento === "netoPorDia") {
                            controlCantidadOfertas({
                                ofertaUID,
                                oferta,
                                contenedorOfertas
                            })

                            const descuentoTotal = descuentoPorDia.descuentoTotal
                            const tipoAplicacion = descuentoPorDia.tipoAplicacion
                            const indicePosicionNetoPorDiaApartamento = indiceTotales.indicePorNoche[fechaDelDia].posicion
                            const totalNetoPorDia = totalesBase.entidades.reservas.
                                desglosePorNoche
                            [indicePosicionNetoPorDiaApartamento]
                                .precioNetoNoche

                            const totalCalculado = calcularTotal({
                                tipoAplicacion,
                                descuentoTotal,
                                total: totalNetoPorDia
                            })
                            totalGlobalDescuento = totalGlobalDescuento.plus(totalCalculado.descuentoAplicado)

                            const porDia = {
                                ofertaUID,
                                tipoAplicacion: tipoAplicacion,
                                fecha: fechaDelDia,
                                ...totalCalculado
                            }

                            if (!contenedorPorDia[fechaDelDia].hasOwnProperty("porTotalNetoDia")) {
                                contenedorPorDia[fechaDelDia].porTotalNetoDia = []
                            }
                            contenedorPorDia[fechaDelDia].porTotalNetoDia.push(porDia)
                            contenedorPorDia[fechaDelDia].totalConDescuentos = contenedorPorDia[fechaDelDia]
                                .totalConDescuentos
                                .plus(totalCalculado.totalConDescuento)
                        }
                    }
                }

                if (subTipoDescuento === "totalNetoPorRango") {
                    controlCantidadOfertas({
                        ofertaUID,
                        oferta,
                        contenedorOfertas
                    })
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
                            contenedorPorDia[fechaDelDia] = {}
                        }
                        if (!contenedorPorDia[fechaDelDia].hasOwnProperty("totalConDescuentos")) {
                            contenedorPorDia[fechaDelDia].totalConDescuentos = new Decimal("0.00")
                        } else {
                            contenedorPorDia[fechaDelDia].totalConDescuentos = controlInstanciaDecimal(contenedorPorDia[fechaDelDia].totalConDescuentos);
                        }
                        const descuentoTotal = descuentos.descuentoTotal
                        const tipoAplicacion = descuentos.tipoAplicacion
                        const indicePosicionNetoPorDiaApartamento = indiceTotales.indicePorNoche[fechaDelDia].posicion

                        const totalNetoPorDia = totalesBase.entidades.reservas
                            .desglosePorNoche
                        [indicePosicionNetoPorDiaApartamento]
                            .precioNetoNoche

                        const totalCalculado = calcularTotal({
                            tipoAplicacion,
                            descuentoTotal,
                            total: totalNetoPorDia
                        })
                        totalGlobalDescuento = totalGlobalDescuento.plus(totalCalculado.descuentoAplicado)

                        const porDia = {
                            ofertaUID,
                            tipoAplicacion: tipoAplicacion,
                            fecha: fechaDelDia,
                            ...totalCalculado
                        }

                        if (!contenedorPorDia[fechaDelDia].hasOwnProperty("porTotalNetoDia")) {
                            contenedorPorDia[fechaDelDia].porTotalNetoDia = []
                        }
                        contenedorPorDia[fechaDelDia].porTotalNetoDia.push(porDia)
                        contenedorPorDia[fechaDelDia].totalConDescuentos = contenedorPorDia[fechaDelDia]
                            .totalConDescuentos
                            .plus(totalCalculado.totalConDescuento)
                    }
                }
            }
        }

        // Redondeos
        Object.entries(contenedorPorApartamento).forEach((apartamento) => {
            const totalConDescuentoApartamento = controlInstanciaDecimal(apartamento[1].totalConDescuentos)
            apartamento[1].totalConDescuentos = totalConDescuentoApartamento.toFixed(2)
        })

        Object.entries(contenedorPorDia).forEach(([fecha, datosDia]) => {
            const totalConDescuentosDia = controlInstanciaDecimal(datosDia.totalConDescuentos)
            datosDia.totalConDescuentos = totalConDescuentosDia.toFixed(2)
            if (datosDia.porApartamento) {
                Object.entries(datosDia.porApartamento).forEach(([apartamentoIDV, datosApartamento]) => {
                    const totalConDescuentosApartamento = controlInstanciaDecimal(datosApartamento.totalConDescuentos)
                    datosApartamento.totalConDescuentos = totalConDescuentosApartamento.toFixed(2)
                }
                )
            }
        })

        contenedorTotalesBase.totalDescuento = totalGlobalDescuento.toFixed(2)
        const totalFinalConDescuentos = totalNeto.minus(totalGlobalDescuento)
        if (totalFinalConDescuentos.isPositive()) {
            contenedorTotalesBase.totalFinal = totalFinalConDescuentos.toFixed(2)
        } else {
            contenedorTotalesBase.totalFinal = "0.00"
        }
    } catch (error) {
        throw error
    }
}