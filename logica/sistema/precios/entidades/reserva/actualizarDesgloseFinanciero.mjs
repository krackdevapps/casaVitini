import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { aplicarDescuentosDesdeInstantanea } from "../../../ofertas/entidades/reserva/aplicarDescuentosDesdeInstantanea.mjs";
// import { aplicarOfertas } from "../../../ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/obtenerDesgloseFinancieroPorReservaUID.mjs";

export const actualizarDesgloseFinanciero = async (data) => {
    try {
        const estructura = data.estructura
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada del procesador de precios"
        })

        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida del procesador de precios"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: data.fechaEntrada,
            fechaSalida_ISO: data.fechaSalida,
            tipoVector: "diferente"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActual = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data?.fechaActual || DateTime.now().setZone(zonaHoraria).toISODate(),
            nombreCampo: "La fecha de actual del procesador de precios"
        })
        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el procesador de precios",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: data?.reservaUID ?? "",
            nombreCampo: "El campo de reservaUID dentro dle procesadorReserva",
            filtro: "numeroSimple",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        // Ojo por que puede que la reserva tenga un apartametnoque ya no existe en configuraciones de alojamiento entonces aqui hay un debate
        // for (const apartamentoIDV of apartamentosArray) {
        //     await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        // }

        const capaOfertas = data?.capaOfertas
        const capaDescuentosPersonalizados = data?.capaDescuentosPersonalizados

        if (capaOfertas !== "si" && capaOfertas !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaOfertas"
            throw new Error(error)
        }
        if (capaDescuentosPersonalizados !== "si" && capaDescuentosPersonalizados !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaDescuentosPersonalizados con un si o un no"
            throw new Error(error)
        }
        const descuentosArray = validadoresCompartidos.tipos.array({
            array: data.descuentosArray,
            nombreCampo: "El array de descuentosArray en el procesador de precios",
            filtro: "cadenaConNumerosEnteros",
            sePermitenDuplicados: "si"
        })


        const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches

        await totalesBasePorRango({
            estructura,
            instantaneaNoches,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray
        })


        const zonasDeLaOferta = ["publica", "privada", "global"]

        const descuentosParaRechazar = validadoresCompartidos.tipos.array({
            array: data?.descuentosParaRechazar || [],
            nombreCampo: "descuentosParaRechazar en el procesador de precios",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "si",
            sePermiteArrayVacio: "si"
        })

        // Obtenemos la instantanea de ofertas y la pasamos a aplicar descuentos



        // await aplicarOfertas({
        //     estructura,
        //     fechaActual,
        //     fechaEntrada,
        //     fechaSalida,
        //     apartamentosArray,
        //     zonasDeLaOferta,
        //     descuentosParaRechazar
        // })
        return
        await aplicarDescuentosDesdeInstantanea({
            estructura,
            descuentosArray,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })
    } catch (error) {
        throw error
    }
}