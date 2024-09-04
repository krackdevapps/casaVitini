import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { constructorInstantaneaNoches } from "./constructorInstantaneaNoches.mjs";

export const crearDesgloseFinanciero = async (data) => {
    try {
        const estructura = data.estructura
        const origen = data.origen
        const pipe = data.pipe

        let fechaEntrada
        let fechaSalida
        let fechaActual
        let apartamentosArray

        let instantaneaNoches
        let instantaneaOfertasPorCondicion
        let instantaneaOfertasPorAdministrador
        const operacion = data.operacion
        const reservaUID = data.reservaUID


        if (origen === "externo") {

            fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: data.fechaEntrada,
                nombreCampo: "La fecha de entrada del procesador de precios"
            })

            fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: data.fechaSalida,
                nombreCampo: "La fecha de salida del procesador de precios"
            })

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: data.fechaEntrada,
                fechaSalida: data.fechaSalida,
                tipoVector: "diferente"
            })

            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            fechaActual = DateTime.now().setZone(zonaHoraria).toISODate()

            apartamentosArray = validadoresCompartidos.tipos.array({
                array: data.apartamentosArray,
                nombreCampo: "El array de apartamentos en el procesador de precios",
                filtro: "soloCadenasIDV",
                sePermitenDuplicados: "no"
            })

            for (const apartamentoIDV of apartamentosArray) {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
            }

        } else if (origen === "hubReservas") {
            const reserva = await obtenerReservaPorReservaUID(reservaUID)
            fechaEntrada = reserva.fechaEntrada
            fechaSalida = reserva.fechaSalida
            fechaActual = reserva.fechaCreacion_simple

            const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
            apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
                return detallesApartamento.apartamentoIDV
            })

            const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
            instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
            instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion || []
            instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador || []
        } else {
            const m = "El procesador de precios esta mal configurado, se necesita determinal origen en externo o hubReservas dentro de la llave reserva"
            throw new Error(m)
        }

        pipe.fechaActual = fechaActual
        pipe.apartamentosArray = apartamentosArray
        pipe.instantaneaOfertasPorCondicion = instantaneaOfertasPorCondicion || []
        pipe.instantaneaOfertasPorAdministrador = instantaneaOfertasPorAdministrador || []

        await constructorInstantaneaNoches({
            estructura,
            instantaneaNoches,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            fechaCreacion_ISO: fechaActual,
            apartamentosArray
        })
        await totalesBasePorRango({
            reservaUID,
            estructura,
            instantaneaNoches,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosArray,
        })

    } catch (error) {
        throw error
    }
}