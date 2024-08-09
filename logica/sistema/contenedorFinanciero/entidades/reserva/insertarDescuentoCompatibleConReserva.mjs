import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { obtenerOfertasPorEntidadPorOfertaUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorEntidadPorOfertaUID.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { selectorPorCondicion } from "../../../ofertas/entidades/reserva/selectorPorCondicion.mjs";
import { aplicarImpuestos } from "./aplicarImpuestos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { constructorInstantaneaNoches } from "./constructorInstantaneaNoches.mjs";

export const insertarDescuentoCompatibleConReserva = async (data) => {
    try {
        const estructura = data.estructura
        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el insertarDescuentoCompatibleConReserva",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })
        const reservaUID = data.reservaUID
        const ofertaUID = data.ofertaUID
        const oferta = await obtenerOfertasPorEntidadPorOfertaUID({
            ofertaUID,
            entidadIDV: "reserva"
        })
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const fechaEntrada = reserva.fechaEntrada
        const fechaSalida = reserva.fechaSalida
        const fechaCreacion_simple = reserva.fechaCreacion_simple

        const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion || []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador || []


        await constructorInstantaneaNoches({
            estructura,
            instantaneaNoches,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            fechaCreacion_ISO: fechaCreacion_simple,
            apartamentosArray
        })

        await totalesBasePorRango({
            estructura,
            instantaneaNoches,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosArray
        })
        constructorEstructuraDescuentos(estructura)
        contructorEstructuraDescuentosReserva(estructura)

        const ofertaFormateada = await selectorPorCondicion({
            oferta,
            apartamentosArray,
            fechaActual_reserva: fechaCreacion_simple,
            fechaEntrada_reserva: fechaEntrada,
            fechaSalida_reserva: fechaSalida,
        })
        ofertaFormateada.autorizacion = "aceptada"



        if (ofertaFormateada.oferta.ofertaUID !== String(ofertaUID)) {
            const error = "La oferta seleccionada no es compatible condicionalmente con esta reserva. Si desea igualmente aplicar los descuentos de esta oferta, hazlo mediante el botón de insertar descuentos."
            throw new Error(error)
        }

        instantaneaOfertasPorCondicion.push(ofertaFormateada)
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
        const capaImpuestos = data.capaImpuestos
        if (capaImpuestos !== "si" && capaImpuestos !== "no") {
            const error = "El procesador de precios está mal configurado, necesita parámetros capaImpuestos en sí o no."
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