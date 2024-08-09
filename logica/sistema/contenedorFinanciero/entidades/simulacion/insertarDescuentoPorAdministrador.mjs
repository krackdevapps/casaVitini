import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/simulacion/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/simulacion/contructorEstructuraDescuentosReserva.mjs";
import { aplicarDescuentosPersonalizados } from "../../../ofertas/entidades/reserva/aplicarDescuentosPersonalizados.mjs";
import { obtenerOfertasPorEntidadPorOfertaUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorEntidadPorOfertaUID.mjs";
import { totalesBasePorRango } from "../simulacion/totalesBasePorRango.mjs";
import { aplicarImpuestos } from "../simulacion/aplicarImpuestos.mjs";
import { constructorInstantaneaNoches } from "../simulacion/constructorInstantaneaNoches.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";

export const insertarDescuentoPorAdministrador = async (data) => {
    try {
        const estructura = data.estructura
        const simulacionUID = data.simulacionUID

        const ofertaUID = validadoresCompartidos.tipos.numero({
            number: data?.ofertaUID,
            nombreCampo: "El campo de ofertaUID dentro del actualizarDesgloseFinanciero",
            filtro: "numeroSimple",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
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
        await obtenerOfertasPorEntidadPorOfertaUID({
            ofertaUID,
            entidadIDV: "reserva"
        })

        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
        const instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion ?? []
        const instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador ?? []

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
            const error = "El procesador de precios está mal configurado, necesita parámetros capaImpuestos en sí o no."
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