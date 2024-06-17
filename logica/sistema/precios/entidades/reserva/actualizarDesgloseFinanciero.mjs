import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { aplicarDescuentosDesdeInstantanea } from "../../../ofertas/entidades/reserva/aplicarDescuentosDesdeInstantanea.mjs";
// import { aplicarOfertas } from "../../../ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { aplicarDescuentosPersonalizados } from "../../../ofertas/entidades/reserva/aplicarDescuentosPersonalizados.mjs";
import { obtenerOfertasPorEntidadPorOfertaUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorEntidadPorOfertaUID.mjs";

export const actualizarDesgloseFinanciero = async (data) => {
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

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActual = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data?.fechaActual || DateTime.now().setZone(zonaHoraria).toISODate(),
            nombreCampo: "La fecha de actual del actualizarDesgloseFinanciero"
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

        const capaDescuentosPersonalizados = data?.capaDescuentosPersonalizados
        if (capaDescuentosPersonalizados !== "si" && capaDescuentosPersonalizados !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaDescuentosPersonalizados con un si o un no"
            throw new Error(error)
        }
        const ofertaUID = validadoresCompartidos.tipos.numero({
            number: data?.ofertaUID,
            nombreCampo: "El campo de ofertaUID dentro del actualizarDesgloseFinanciero",
            filtro: "numeroSimple",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        await obtenerOfertasPorEntidadPorOfertaUID({
            ofertaUID,
            entidadIDV: "reserva"
        })

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
        await aplicarDescuento({
            origen: "porCondicion",
            ofertarParaAplicarDescuentos: instantaneaOfertasPorCondicion,
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
            ofertarParaAplicarDescuentos: contenedorOfertasPorAdminstrador,
            estructura: estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })
    } catch (error) {
        throw error
    }
}