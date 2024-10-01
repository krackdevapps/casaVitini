import { aplicarDescuento } from "../../../ofertas/entidades/simulacion/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/constructorEstructuraDescuentos.mjs";
import { constructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/simulacion/constructorEstructuraDescuentosReserva.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { aplicarImpuestos } from "./aplicarImpuestos.mjs";
import { constructorInstantaneaNoches } from "./constructorInstantaneaNoches.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";

export const actualizarDesgloseFinancieroDesdeInstantaneas = async (data) => {
    try {
        const estructura = data.estructura
        const simulacionUID = data.simulacionUID

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
            instantaneaOfertasPorCondicion: simulacion.instantaneaOfertasPorCondicion,
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
            simulacionUID,
            estructura,
            instantaneaNoches,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosArray
        })

        constructorEstructuraDescuentos(estructura)
        constructorEstructuraDescuentosReserva(estructura)

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
            simulacionUID: Number(simulacionUID),
            origen: "simulacion"
        })
    } catch (error) {
        throw error
    }
}