import Decimal from "decimal.js"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { constructorIndiceTotales } from "./constructorInficeTotales.mjs"
import { constructorObjetoEstructuraPrecioDia } from "../precios/constructorObjetoEstructuraPrecioDia.mjs"
import { calcularTotal } from "./calcularTotal.mjs"

export const aplicarDescuento = async (data) => {
    try {
        const ofertarParaAplicarDescuentos = data.ofertarParaAplicarDescuentos
        const totalesBase = data.totalesBase
        const indiceTotales = constructorIndiceTotales(totalesBase)
        //totalesBase.indiceTotalesTest = indiceTotales
        totalesBase.global.ofertasAplicadas = {
            ofertas: {},
            porTotal: [],
            porApartamento: {},
            porDia: {},
        }
        const totalNeto = new Decimal(totalesBase.totales.totalNeto)
        const contenedorOfertas = totalesBase.global.ofertasAplicadas.ofertas
        const contenedorPorTotal = totalesBase.global.ofertasAplicadas.porTotal
        const contenedorPorApartamento = totalesBase.global.ofertasAplicadas.porApartamento
        const contenedorPorDia = totalesBase.global.ofertasAplicadas.porDia

        for (const oferta of ofertarParaAplicarDescuentos) {
            const descuentos = oferta.oferta.descuentosJSON
            const ofertaUID = oferta.oferta.ofertaUID
            const tipoDescuento = descuentos.tipoDescuento

            if (tipoDescuento === "totalNeto") {
                const tipoAplicacion = descuentos.tipoAplicacion
                const descuentoTotal = descuentos.descuentoTotal
                contenedorOfertas[ofertaUID] = oferta

                const totalCalculado = calcularTotal({
                    tipoAplicacion,
                    descuentoTotal,
                    total: totalNeto
                })

                const descuentoAplicado = {
                    tipoAplicacion,
                    ofertaUID,
                    ...totalCalculado
                }
                contenedorPorTotal.push(descuentoAplicado)

            } else if (tipoDescuento === "individualPorApartamento") {
                const apartamentos = descuentos.apartamentos
                contenedorOfertas[ofertaUID] = oferta

                for (const descuentoDelApartamento of apartamentos) {

                    const apartamentoIDV = descuentoDelApartamento.apartamentoIDV
                    const descuentoTotal = descuentoDelApartamento.descuentoTotal
                    const tipoAplicacion = descuentoDelApartamento.tipoAplicacion

                    const indiceTotalApartamento = indiceTotales.indicePorApartamentos[apartamentoIDV].posicion
                    const totalPorApartametno = totalesBase.desglosePorApartamento[indiceTotalApartamento].totalNeto

                    if (!contenedorPorApartamento.hasOwnProperty(apartamentoIDV)) {
                        contenedorPorApartamento[apartamentoIDV] = []
                    }
                    const totalCalculado = calcularTotal({
                        tipoAplicacion,
                        descuentoTotal,
                        total: totalPorApartametno
                    })

                    const porApartamento = {
                        apartamentoIDV,
                        ofertaUID,
                        tipoAplicacion: tipoAplicacion,
                        ...totalCalculado
                    }
                    contenedorPorApartamento[apartamentoIDV].push(porApartamento)
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
                            fechaInicioRango_ISO: fechaInicioRango_ISO,
                            fechaFinRango_ISO: fechaFinalRango_ISO
                        })
                        if (fechaDentroDelRango) {
                            if (!contenedorPorDia.hasOwnProperty(fechaDelDia)) {
                                contenedorPorDia[fechaDelDia] = {}
                            }

                            if (tipoDescuento === "netoPorApartamentoDelDia") {

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

                                    const totalPorApartamento = totalesBase.
                                        desglosePorNoche
                                    [indicePosicionApartamento]
                                        .apartamentosPorNoche
                                    [indiceTotalPorApartamento]
                                        .precioNetoApartamento


                                    const totalCalculado = calcularTotal({
                                        tipoAplicacion,
                                        descuentoTotal,
                                        total: totalPorApartamento
                                    })

                                    const porDia = {
                                        apartamentoIDV,
                                        ofertaUID,
                                        tipoAplicacion: tipoAplicacion,
                                        fecha: fechaDelDia,
                                        ...totalCalculado
                                    }

                                    if (!contenedorPorDia[fechaDelDia].hasOwnProperty("porApartameto")) {
                                        contenedorPorDia[fechaDelDia].porApartameto = {}
                                    }
                                    const contenedorApartamentoMismoDia = contenedorPorDia[fechaDelDia].porApartameto
                                    if (!contenedorApartamentoMismoDia.hasOwnProperty(apartamentoIDV)) {
                                        contenedorApartamentoMismoDia[apartamentoIDV] = []
                                    }
                                    contenedorApartamentoMismoDia[apartamentoIDV].push(porDia)
                                }
                            }

                            if (tipoDescuento === "netoPorDia") {
                                const descuentoTotal = descuentoPorDia.descuentoTotal
                                const tipoAplicacion = descuentoPorDia.tipoAplicacion

                                const indicePosicionNetoPorDiaApartamento = indiceTotales.indicePorNoche[fechaDelDia].posicion

                                const totalNetoPorDia = totalesBase.
                                    desglosePorNoche
                                [indicePosicionNetoPorDiaApartamento]
                                    .precioNetoNoche

                                const totalCalculado = calcularTotal({
                                    tipoAplicacion,
                                    descuentoTotal,
                                    total: totalNetoPorDia
                                })

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
                            }
                        }
                    }
                }
                if (subTipoDescuento === "totalNetoPorRango") {
                    const diasArray = constructorObjetoEstructuraPrecioDia(fechaInicioRango_ISO, fechaFinalRango_ISO)

                    for (const fechaDelDia of diasArray) {
                        const fechaDentroDelRango = await validadoresCompartidos.fechas.fechaEnRango({
                            fechaAComprobrarDentroDelRango: fechaDelDia,
                            fechaInicioRango_ISO: fechaInicioRango_ISO,
                            fechaFinRango_ISO: fechaFinalRango_ISO
                        })
                        if (fechaDentroDelRango) {
                            if (!contenedorPorDia.hasOwnProperty(fechaDelDia)) {
                                contenedorPorDia[fechaDelDia] = {}
                            }
                            const descuentoTotal = descuentos.descuentoTotal
                            const tipoAplicacion = descuentos.tipoAplicacion


                            const indicePosicionNetoPorDiaApartamento = indiceTotales.indicePorNoche[fechaDelDia].posicion

                            const totalNetoPorDia = totalesBase.
                                desglosePorNoche
                            [indicePosicionNetoPorDiaApartamento]
                                .precioNetoNoche


                            const totalCalculado = calcularTotal({
                                tipoAplicacion,
                                descuentoTotal,
                                total: totalNetoPorDia
                            })

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
                        }
                    }
                }
            }
        }
    } catch (error) {
        throw error
    }
}