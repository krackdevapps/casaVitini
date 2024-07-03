import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { aplicarImpuestos } from "./aplicarImpuestos.mjs";
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { constructorInstantaneaNoches } from "./constructorInstantaneaNoches.mjs";

export const actualizarDesgloseFinancieroDesdeInstantaneas = async (data) => {
    try {
        const estructura = data.estructura
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const fechaEntrada = reserva.fechaEntrada
        const fechaSalida = reserva.fechaSalida
        const fechaCreacion_simple = reserva.fechaCreacion_simple

        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        })
        const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)

        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion || []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador || []

        await constructorInstantaneaNoches({
            estructura,
            instantaneaNoches,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            fechaCreacion_ISO: fechaCreacion_simple,
            apartamentosArray
        })

        await totalesBasePorRango({
            reservaUID,
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
        await aplicarDescuento({
            origen: "porAdministrador",
            ofertasParaAplicarDescuentos: instantaneaOfertasPorAdministrador,
            estructura: estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })
        await aplicarImpuestos({
            estructura,
            reservaUID,
            origen: "reserva"
        })
    } catch (error) {
        throw error
    }
}