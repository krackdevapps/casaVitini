import { aplicarDescuento } from "../../../ofertas/entidades/simulacion/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/simulacion/contructorEstructuraDescuentosReserva.mjs";
import { obtenerOfertasPorEntidadPorOfertaUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorEntidadPorOfertaUID.mjs";
import { totalesBasePorRango } from "../simulacion/totalesBasePorRango.mjs";
import { selectorPorCondicion } from "../../../ofertas/entidades/reserva/selectorPorCondicion.mjs";
import { aplicarImpuestos } from "./aplicarImpuestos.mjs";
import { constructorInstantaneaNoches } from "../simulacion/constructorInstantaneaNoches.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";

export const insertarDescuentoCompatibleConSimulacion = async (data) => {
    try {
        const estructura = data.estructura
        const simulacionUID = data.simulacionUID
        const ofertaUID = data.ofertaUID
        const oferta = await obtenerOfertasPorEntidadPorOfertaUID({
            ofertaUID,
            entidadIDV: "reserva"
        })
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const fechaCreacion = simulacion.fechaCreacion
        const apartamentosArray = simulacion.apartamentosIDVARRAY
        const desgloseFinancieroReserva = {
            desgloseFinanciero: simulacion.desgloseFinanciero,
            instantaneaNoches: simulacion.instantaneaNoches,
            instantaneaSobreControlPrecios: simulacion.instantaneaSobreControlPrecios,
            instantaneaOfertasPorAdministrador: simulacion.instantaneaOfertasPorAdministrador,
            instantaneaImpuestos: simulacion.instantaneaImpuestos,
        }

        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion || []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador || []

        await constructorInstantaneaNoches({
            estructura,
            instantaneaNoches,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            fechaCreacion_ISO: fechaCreacion,
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
            fechaActual_reserva: fechaCreacion,
            fechaEntrada_reserva: fechaEntrada,
            fechaSalida_reserva: fechaSalida,
        })
        ofertaFormateada.autorizacion = "aceptada"

        if (ofertaFormateada.oferta.ofertaUID !== String(ofertaUID)) {
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
        const capaImpuestos = data.capaImpuestos
        if (capaImpuestos !== "si" && capaImpuestos !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaImpuestos en si o no"
            throw new Error(error)
        }
        if (capaImpuestos === "si") {
            await aplicarImpuestos({
                estructura,
                simulacionUID,
                origen: "simulacion"
            })
        }

    } catch (error) {
        throw error
    }
}