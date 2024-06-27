import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { aplicarDescuentosPersonalizados } from "../../../ofertas/entidades/reserva/aplicarDescuentosPersonalizados.mjs";
import { obtenerOfertasPorEntidadPorOfertaUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorEntidadPorOfertaUID.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { aplicarImpuestos } from "./aplicarImpuestos.mjs";
import { constructorInstantaneaNoches } from "./constructorInstantaneaNoches.mjs";
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";

export const insertarDescuentoPorAdministrador = async (data) => {
    try {
        const estructura = data.estructura

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: data?.reservaUID ?? "",
            nombreCampo: "El campo de reservaUID dentro dle actualizarDesgloseFinanciero",
            filtro: "numeroSimple",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const ofertaUID = validadoresCompartidos.tipos.numero({
            number: data?.ofertaUID,
            nombreCampo: "El campo de ofertaUID dentro del actualizarDesgloseFinanciero",
            filtro: "numeroSimple",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const fechaEntrada = reserva.fechaEntrada
        const fechaSalida = reserva.fechaSalida
        const fechaCreacion_simple = reserva.fechaCreacion_simple
        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        })

        await obtenerOfertasPorEntidadPorOfertaUID({
            ofertaUID,
            entidadIDV: "reserva"
        })

        const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion ?? []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador ?? []

        await constructorInstantaneaNoches({
            estructura,
            instantaneaNoches,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            fechaCreacion_ISO: fechaCreacion_simple,
            apartamentosArray
        })

        await totalesBasePorRango({
            estructura,
            instantaneaNoches,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray
        })
        constructorEstructuraDescuentos(estructura)
        contructorEstructuraDescuentosReserva(estructura)
        await aplicarDescuento({
            origen: "porCondicion",
            ofertasParaAplicarDescuentos: instantaneaOfertasPorCondicion,
            estructura: estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })

        const ofertasSelecionadasPorAdminstrador = await aplicarDescuentosPersonalizados({
            descuentosArray: [ofertaUID]
        })

        const contenedorOfertasPorAdminstrador = [
            ...instantaneaOfertasPorAdministrador,
            ...ofertasSelecionadasPorAdminstrador
        ]
        await aplicarDescuento({
            origen: "porAdministrador",
            ofertasParaAplicarDescuentos: contenedorOfertasPorAdminstrador,
            estructura: estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })
        const capaImpuestos = data.capaImpuestos
        if (capaImpuestos !== "si" && capaImpuestos !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaImpuestos en si o no"
            throw new Error(error)
        }
        if (capaImpuestos === "si") {
            await aplicarImpuestos({
                estructura,
                origen: "reserva",
                reservaUID
            })
        }
    } catch (error) {
        throw error
    }
}