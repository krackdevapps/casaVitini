import Decimal from "decimal.js"
import { controlInstanciaDecimal } from "./controlInstanciaDecimal.mjs"
import { perfil_totalNeto } from "./perfilesDescuentos/perfil_totalNeto.mjs"
import { perfil_individualPorApartamento } from "./perfilesDescuentos/perfil_individualPorApartamento.mjs"
import { perfil_porDiasDelRango } from "./perfilesDescuentos/porRango/perfil_porDiasDelRango.mjs"
import { perfil_totalNetoPorRango } from "./perfilesDescuentos/porRango/perfil_totalNetoPorRango.mjs"
import { constructorEstructuraDescuentos } from "./contructorEstructuraDescuentos.mjs"

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

        constructorEstructuraDescuentos(estructura)

        const contenedorTotalesBase = estructura.global.totales
        const totalNeto = new Decimal(contenedorTotalesBase.totalNeto)
        const contenedorOfertas = estructura.ofertasAplicadas.ofertas[origen]
        const contenedorPorTotal = estructura.ofertasAplicadas.porTotal
        const contenedorPorApartamento = estructura.ofertasAplicadas.entidades.reserva.porApartamento
        const contenedorPorDia = estructura.ofertasAplicadas.entidades.reserva.porDia

        let totalGlobalDescuento = new Decimal("0.00")
        if (!contenedorTotalesBase.hasOwnProperty("totalDescuento")) {
            contenedorTotalesBase.totalDescuento = "0.00"
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
                perfil_totalNeto({
                    ofertaUID,
                    oferta,
                    descuentos,
                    contenedorOfertas,
                    totalNeto,
                    nombreOferta,
                    contenedorPorTotal,
                    estructura
                })
            }

            else if (tipoDescuento === "individualPorApartamento") {
                await perfil_individualPorApartamento({
                    descuentos,
                    nombreOferta,
                    oferta,
                    ofertaUID,
                    estructura,
                    contenedorPorApartamento,
                    contenedorOfertas,
                    estructura
                })

            } else if (tipoDescuento === "porRango") {
                const dias = descuentos.descuentoPorDias
                const subTipoDescuento = descuentos.subTipoDescuento
                const fechaInicioRango_ISO = descuentos.fechaInicioRango_ISO
                const fechaFinalRango_ISO = descuentos.fechaFinalRango_ISO

                if (subTipoDescuento === "porDiasDelRango") {
                    await perfil_porDiasDelRango({
                        ofertaUID,
                        nombreOferta,
                        oferta,
                        dias,
                        contenedorPorDia,
                        fechaEntradaReserva_ISO,
                        fechaSalidaReserva_ISO,
                        estructura,
                        contenedorOfertas
                    })
                }

                if (subTipoDescuento === "totalNetoPorRango") {
                    await perfil_totalNetoPorRango({
                        ofertaUID,
                        nombreOferta,
                        oferta,
                        dias,
                        contenedorPorDia,
                        fechaInicioRango_ISO,
                        fechaFinalRango_ISO,
                        fechaEntradaReserva_ISO,
                        fechaSalidaReserva_ISO,
                        estructura,
                        contenedorOfertas,
                        descuentos,
                    })
                }
            }
        }
        const totalDescuento = estructura.global.totales.totalDescuento

        // Redondeos y totalNetoConDescunetos
        // Object.entries(contenedorPorApartamento).forEach(([apartamentoIDV, detallesApartamento]) => {
        //     const totalDescuentosAplicados = controlInstanciaDecimal(detallesApartamento.totalDescuentosAplicados)
        //     const totalPorApartamento = estructura.entidades.reserva?.desglosePorApartamento[apartamentoIDV]?.totalNeto
        //     const totalNetoConDescuentos = totalPorApartamento.minus(totalDescuentosAplicados).toFixed(2)

        //     if (new Decimal(totalNetoConDescuentos).isPositive()) {
        //         detallesApartamento.totalNetoConDescuentos = totalNetoConDescuentos
        //     } else {
        //         detallesApartamento.totalNetoConDescuentos = "0.00"
        //     }
        //     detallesApartamento.totalDescuentosAplicados = totalDescuentosAplicados.toFixed(2)
        // })

        // Object.entries(contenedorPorDia).forEach(([fecha, datosDia]) => {
        //     const totalConDescuentosDia = controlInstanciaDecimal(datosDia.totalConDescuentos)
        //     datosDia.totalConDescuentos = totalConDescuentosDia.toFixed(2)
        //     if (datosDia.porApartamento) {
        //         Object.entries(datosDia.porApartamento).forEach(([apartamentoIDV, datosApartamento]) => {
        //             const totalConDescuentosApartamento = controlInstanciaDecimal(datosApartamento.totalConDescuentos)
        //             datosApartamento.totalConDescuentos = totalConDescuentosApartamento.toFixed(2)
        //         }
        //         )
        //     }
        // })

        // contenedorTotalesBase.totalDescuento = totalGlobalDescuento.toFixed(2)
        const totalFinalConDescuentos = totalNeto.minus(totalDescuento)
        if (totalFinalConDescuentos.isPositive()) {
            contenedorTotalesBase.totalFinal = totalFinalConDescuentos.toFixed(2)
        } else {
            contenedorTotalesBase.totalFinal = "0.00"
        }
    } catch (error) {
        throw error
    }
}