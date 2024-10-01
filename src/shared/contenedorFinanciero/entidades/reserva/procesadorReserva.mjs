import { DateTime } from "luxon"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs"
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs"
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { constructorInstantaneaNoches } from "./constructorInstantaneaNoches.mjs"
import { totalesBasePorRango } from "./totalesBasePorRango.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"


export const procesadorReserva = async (data) => {
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
        const simulacionUID = data.simulacionUID

        let origenSobreControl
        if (origen === "externo") {

            fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: data.fechaEntrada,
                nombreCampo: "La fecha de entrada del procesador de precios"
            })

            fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: data.fechaSalida,
                nombreCampo: "La fecha de salida del procesador de precios"
            })


            fechaActual = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: data.fechaActual,
                nombreCampo: "La fecha de creacion del procesador de precios"
            })

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: data.fechaEntrada,
                fechaSalida: data.fechaSalida,
                tipoVector: "diferente"
            })

            //  const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            // fechaActual = DateTime.now().setZone(zonaHoraria).toISODate()

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
            origenSobreControl = data.origenSobreControl
        } else if (origen === "hubReservas") {
            const reserva = await obtenerReservaPorReservaUID(reservaUID)
            fechaEntrada = reserva.fechaEntrada
            fechaSalida = reserva.fechaSalida
            fechaActual = reserva.fechaCreacion_simple
            origenSobreControl = "reserva"

            const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
            apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
                return detallesApartamento.apartamentoIDV
            })

            const desgloseFinancieroReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
            instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
            instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion || []
            instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador || []
        } else if (origen === "hubSimulaciones") {
            const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
            fechaEntrada = simulacion.fechaEntrada
            fechaSalida = simulacion.fechaSalida
            fechaActual = simulacion.fechaCreacion
            apartamentosArray = simulacion.apartamentosIDVARRAY
            origenSobreControl = "simulacion"

            for (const apartamentoIDV of apartamentosArray) {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
            }

            const desgloseFinancieroReserva = {
                desgloseFinanciero: simulacion.desgloseFinanciero,
                instantaneaNoches: simulacion.instantaneaNoches,
                instantaneaSobreControlPrecios: simulacion.instantaneaSobreControlPrecios,
                instantaneaOfertasPorAdministrador: simulacion.instantaneaOfertasPorAdministrador,
                instantaneaOfertasPorCondicion: simulacion.instantaneaOfertasPorCondicion,
                instantaneaImpuestos: simulacion.instantaneaImpuestos,
            }

            instantaneaNoches = desgloseFinancieroReserva.instantaneaNoches
            instantaneaOfertasPorCondicion = desgloseFinancieroReserva.instantaneaOfertasPorCondicion || []
            instantaneaOfertasPorAdministrador = desgloseFinancieroReserva.instantaneaOfertasPorAdministrador || []
        } else {
            const m = "El procesador de precios esta mal configurado, se necesita determinar origen en externo o hubReservas dentro de la llave reserva"
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
            simulacionUID,
            origenSobreControl,
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