import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { obtenerOfertasPorEntidadPorOfertaUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorEntidadPorOfertaUID.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { selectorPorCondicion } from "../../../ofertas/entidades/reserva/selectorPorCondicion.mjs";
import { aplicarImpuestos } from "./aplicarImpuestos.mjs";

export const insertarDescuentoCompatibleConReserva = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada del insertarDescuentoCompatibleConReserva"
        })

        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida del insertarDescuentoCompatibleConReserva"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: data.fechaEntrada,
            fechaSalida_ISO: data.fechaSalida,
            tipoVector: "diferente"
        })

        const fechaActual = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaActual,
            nombreCampo: "La fecha de actual del insertarDescuentoCompatibleConReserva"
        })

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

        const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion || []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador || []


        await totalesBasePorRango({
            estructura,
            instantaneaNoches,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray
        })
        constructorEstructuraDescuentos(estructura)
        contructorEstructuraDescuentosReserva(estructura)

        const ofertaFormateada = await selectorPorCondicion({
            oferta,
            apartamentosArray,
            fechaActual_reserva: fechaActual,
            fechaEntrada_reserva: fechaEntrada,
            fechaSalida_reserva: fechaSalida,
        })
        ofertaFormateada.autorizacion = "aceptada"
        if (ofertaFormateada.oferta.ofertaUID !== ofertaUID) {
            const error = "La oferta seleccionada no es compatible condicionalmente con esta reserva. Si desea igualmente aplicar los descuentos de esta oferta hazlo mediante el boton de insertar descuentos"
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

        await aplicarImpuestos({
            estructura,
            origen: "reserva"
        })

    } catch (error) {
        throw error
    }
}