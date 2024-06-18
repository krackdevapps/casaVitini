import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID.mjs";

export const actualizarDesgloseFinancieroDesdeInstantaneas = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada del actualizarDesgloseFinanciero"
        })

        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida del actualizarDesgloseFinanciero"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: data.fechaEntrada,
            fechaSalida_ISO: data.fechaSalida,
            tipoVector: "diferente"
        })

        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el actualizarDesgloseFinanciero",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: data?.reservaUID ?? "",
            nombreCampo: "El campo de reservaUID dentro dle actualizarDesgloseFinanciero",
            filtro: "numeroSimple",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const ofertaUID = data.ofertaUID
        const nuevaAutorizacion = data.nuevaAutorizacion
        if (nuevaAutorizacion !== "aceptada" && nuevaAutorizacion !== "rechazada") {
            const error = "El campo nuevaAutorizacion solo puede ser aceptada o rechazada actualizarDesgloseFinancieroDesdeInstantaneas"
            throw new Error(error)
        }

        const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion ?? []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador ?? []

        await totalesBasePorRango({
            estructura,
            instantaneaNoches,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray
        })
        constructorEstructuraDescuentos(estructura)
        contructorEstructuraDescuentosReserva(estructura)

        // for (const contenedorOferta of instantaneaOfertasPorCondicion) {
        //     const ofertaUIDContenedor = contenedorOferta.oferta.ofertaUID
        //     if (ofertaUIDContenedor === ofertaUID) {
        //         contenedorOferta.oferta.autorizacion = nuevaAutorizacion
        //         break
        //     }
        // }

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
    } catch (error) {
        throw error
    }
}