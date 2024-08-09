import Decimal from "decimal.js"
import { perfil_totalNeto } from "./perfilesDescuentos/perfil_totalNeto.mjs"
import { perfil_individualPorApartamento } from "./perfilesDescuentos/perfil_individualPorApartamento.mjs"
import { perfil_porDiasDelRango } from "./perfilesDescuentos/porRango/perfil_porDiasDelRango.mjs"
import { perfil_totalNetoPorRango } from "./perfilesDescuentos/porRango/perfil_totalNetoPorRango.mjs"
import { perfil_mismoDescuentoParaCadaApartamento } from "./perfilesDescuentos/perfil_mismoDescuentoParaCadaApartamento.mjs"

export const aplicarDescuento = async (data) => {
    try {
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const ofertasParaAplicarDescuentos = data.ofertasParaAplicarDescuentos

        const origen = data.origen
        const estructura = data.estructura
        if (origen !== "porCondicion" && origen !== "porAdministrador") {
            const error = "aplicarDescuento necesita llave origen, esta puede ser porCondicion o porAdminstrador"
            throw new Error(error)
        }
        const contenedorTotalesBase = estructura.global.totales
        const totalNeto = new Decimal(contenedorTotalesBase.totalNeto)
        const contenedorOfertas = estructura.contenedorOfertas.entidades.reserva.ofertas[origen]
        const contenedorPorTotal = estructura.contenedorOfertas.entidades.reserva.desgloses.porTotal
        const contenedorPorApartamento = estructura.contenedorOfertas.entidades.reserva.desgloses.porApartamento
        const contenedorPorDia = estructura.contenedorOfertas.entidades.reserva.desgloses.porDia


        if (!contenedorTotalesBase.hasOwnProperty("totalDescuento")) {
            contenedorTotalesBase.totalDescuento = "0.00"
        }

        for (const oferta of ofertasParaAplicarDescuentos) {

            const descuentos = oferta?.oferta?.descuentosJSON || []
            const ofertaUID = oferta?.oferta?.ofertaUID
            const tipoDescuento = descuentos?.tipoDescuento
            const autorizacion = oferta?.autorizacion
            const nombreOferta = oferta?.oferta?.nombreOferta
            contenedorOfertas.push(oferta)

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
            } else if (tipoDescuento === "mismoDescuentoParaCadaApartamento") {
                perfil_mismoDescuentoParaCadaApartamento({
                    ofertaUID,
                    oferta,
                    descuentos,
                    contenedorOfertas,
                    totalNeto,
                    nombreOferta,
                    contenedorPorTotal,
                    contenedorPorApartamento,
                    estructura
                })
            } else if (tipoDescuento === "individualPorApartamento") {
                await perfil_individualPorApartamento({
                    descuentos,
                    nombreOferta,
                    oferta,
                    ofertaUID,
                    estructura,
                    contenedorPorApartamento,
                    contenedorOfertas,
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
            } else {
                const error = "No se reconoce el tipoDescuento en aplicarDescuento"
                throw new Error(error)
            }
        }

        const totalDescuento = estructura.global.totales.totalDescuento
        estructura.global.totales.totalDescuento = new Decimal(totalDescuento).toFixed(2)

        const totalFinalConDescuentos = totalNeto.minus(totalDescuento)
        if (totalFinalConDescuentos.isPositive()) {
            contenedorTotalesBase.totalFinal = totalFinalConDescuentos.toFixed(2)
        } else {
            contenedorTotalesBase.totalFinal = "0.00"
        }
        const totalFinal = contenedorTotalesBase.totalFinal
        const nochesReserva = estructura.entidades.reserva.nochesReserva
        const promedioNocheNetoConDescuentos = new Decimal(totalFinal).div(nochesReserva)
        contenedorTotalesBase.promedioNocheNetoConDescuentos = promedioNocheNetoConDescuentos.isPositive() ? promedioNocheNetoConDescuentos.toFixed(2) : "0.00"

        const totalNetoSinDescuentosAplicados = new Decimal(totalNeto).minus(totalDescuento)
        contenedorTotalesBase.totalNetoConDescuentos = totalNetoSinDescuentosAplicados.isPositive() ? totalNetoSinDescuentosAplicados.toFixed(2) : "0.00"

    } catch (error) {
        throw error
    }
}