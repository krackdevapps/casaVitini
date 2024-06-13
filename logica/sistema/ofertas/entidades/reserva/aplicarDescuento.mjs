import Decimal from "decimal.js"
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
//import { constructorIndiceTotales } from "./constructorInficeTotales.mjs"
import { constructorObjetoEstructuraPrecioDia } from "../../../precios/entidades/reserva/constructorObjetoEstructuraPrecioDia.mjs"
import { calcularTotal } from "./calcularTotal.mjs"
import { controlInstanciaDecimal } from "./controlInstanciaDecimal.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"

export const aplicarDescuento = async (data) => {
    try {
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const ofertarParaAplicarDescuentos = data.ofertarParaAplicarDescuentos
        const origen = data.origen
        const estructura = data.estructura
        if (origen !== "porCondicion" && origen !== "porAdministrador") {
            const error = "aplicarDescuento necesita llave origen, esta puede ser porCondicion o porAdminstrador"
            throw new Error(error)
        }

        if (!estructura.hasOwnProperty("ofertasAplicadas")) {
            estructura.ofertasAplicadas = {
                ofertas: {
                    porCondicion: {},
                    porAdministrador: {}
                },
                porTotal: [],
                entidades: {
                    reserva: {
                        porApartamento: {},
                        porDia: {},
                    }
                }
            }
        }

        const contenedorTotalesBase = estructura.global.totales
        const totalNeto = new Decimal(contenedorTotalesBase.totalNeto)
        const contenedorOfertas = estructura.ofertasAplicadas.ofertas[origen]
        const contenedorPorTotal = estructura.ofertasAplicadas.porTotal
        const contenedorPorApartamento = estructura.ofertasAplicadas.entidades.reserva.porApartamento
        const contenedorPorDia = estructura.ofertasAplicadas.entidades.reserva.porDia


        let totalGlobalDescuento = new Decimal("0.00")

        const controlCantidadOfertas = (data) => {
            const contenedorOfertas = data.contenedorOfertas
            const ofertaUID = data.ofertaUID
            const contenedor = data.contenedor

            if (!contenedorOfertas.hasOwnProperty(ofertaUID)) {
                contenedorOfertas[ofertaUID] = {
                    cantidad: new Decimal("1"),
                    contenedor
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
            const autorizacion = oferta.autorizacion
            const nombreOferta = oferta.oferta.nombreOferta

            if (origen === "porCondicion" && autorizacion !== "aceptada") {
                continue
            }
            if (tipoDescuento === "totalNeto") {
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
                totalGlobalDescuento = totalGlobalDescuento.plus(totalCalculado.descuentoAplicado)

                const descuentoAplicado = {
                    tipoAplicacion,
                    ofertaUID,
                    nombreOferta,
                    ...totalCalculado
                }
                contenedorPorTotal.push(descuentoAplicado)

            } else if (tipoDescuento === "individualPorApartamento") {
                const apartamentos = descuentos.apartamentos
                controlCantidadOfertas({
                    ofertaUID,
                    contenedor: oferta,
                    contenedorOfertas
                })
                for (const descuentoDelApartamento of apartamentos) {
                    const apartamentoIDV = descuentoDelApartamento.apartamentoIDV
                    const descuentoTotal = descuentoDelApartamento.descuentoTotal
                    const tipoAplicacion = descuentoDelApartamento.tipoAplicacion
                    descuentoDelApartamento.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)).apartamentoUI

                    const totalPorApartametno = estructura.entidades.reserva?.desglosePorApartamento[apartamentoIDV]?.totalNeto
                    if (!totalPorApartametno) {
                        continue
                    }

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
                        nombreOferta,
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
                                    nombreOferta,
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
                            totalGlobalDescuento = totalGlobalDescuento.plus(totalCalculado.descuentoAplicado)

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
                            contenedorPorDia[fechaDelDia].totalConDescuentos = contenedorPorDia[fechaDelDia]
                                .totalConDescuentos
                                .plus(totalCalculado.totalConDescuento)
                        }
                    }
                }

                if (subTipoDescuento === "totalNetoPorRango") {
                    controlCantidadOfertas({
                        ofertaUID,
                        contenedor: oferta,
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
                        const totalNetoPorDia = estructura.entidades.reserva
                            .desglosePorNoche
                        [fechaDelDia]
                            .precioNetoNoche

                        const totalCalculado = calcularTotal({
                            tipoAplicacion,
                            descuentoTotal,
                            total: totalNetoPorDia
                        })
                        totalGlobalDescuento = totalGlobalDescuento.plus(totalCalculado.descuentoAplicado)

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