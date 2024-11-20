import { DateTime } from "luxon"
import { obtenerBloqueosPorRangoPorApartamentoIDV } from "../../../infraestructure/repository/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs"
import { reservasPorRangoPorApartamentosArray } from "../../../infraestructure/repository/reservas/selectoresDeReservas/reservasPorRangoPorApartamentosArray.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "../../calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs"
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs"
import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"

export const validadorPasado = async (data) => {
    try {
        const anoCalendario = data.anoCalendario
        const mesCalendario = data.mesCalendario
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const apartamentosReservaActual = data.apartamentosReservaActual
        const reservaUID = data.reservaUID
        const anoReservaSalida = fechaSalidaReserva_ISO.split("-")[0]
        const mesReservaSalida = fechaSalidaReserva_ISO.split("-")[1]

        const fechaSeleccionadaParaPasado_Objeto = DateTime.fromObject({
            year: anoCalendario,
            month: mesCalendario, day: 1
        })
            .minus({ months: 1 }).endOf('month')
        const fechaSeleccionadaParaPasado_ISO = fechaSeleccionadaParaPasado_Objeto.toISODate().toString()
        if (anoReservaSalida < anoCalendario || mesReservaSalida < mesCalendario && anoReservaSalida === anoCalendario) {
            const error = "El mes de entrada seleccionado no puede ser igual o superior a al mes de fecha de salida de la reserva"
            throw new Error(error)
        }

        const bloqueosSeleccionados = await obtenerBloqueosPorRangoPorApartamentoIDV({
            fechaInicio: fechaSeleccionadaParaPasado_ISO,
            fechaFin: fechaEntradaReserva_ISO,
            apartamentosIDV_array: apartamentosReservaActual,
            zonaBloqueo_array: [
                "global",
                "privada"
            ]
        })
        const contenedorBloqueosEncontrados = []
        for (const detallesDelBloqueo of bloqueosSeleccionados) {
            const fechaEntradaBloqueo_ISO = detallesDelBloqueo.fechaInicio
            const fechaSalidaBloqueo_ISO = detallesDelBloqueo.fechaFin
            const apartamento = detallesDelBloqueo.apartamentoIDV
            const bloqueoUID = detallesDelBloqueo.bloqueoUID
            const motivo = detallesDelBloqueo.motivo
            const tipoBloqueo = detallesDelBloqueo.tipoBloqueoIDV
            const estructura = {
                fechaEntrada: fechaEntradaBloqueo_ISO,
                fechaSalida: fechaSalidaBloqueo_ISO,
                uid: bloqueoUID,
                tipoElemento: "bloqueo",
                apartamentoIDV: apartamento,
                tipoBloqueo: tipoBloqueo,
                motivo: motivo || "(Sin motivo especificado en el bloqueo)"
            }
            contenedorBloqueosEncontrados.push(estructura)
        }
        const contenedorReservaEncontradas = []

        const reservasSeleccionadas = await reservasPorRangoPorApartamentosArray({
            fechaInicioRango_ISO: fechaSeleccionadaParaPasado_ISO,
            fechaFinRango_ISO: fechaEntradaReserva_ISO,
            reservaUID: reservaUID,
            apartamentosIDV_array: apartamentosReservaActual,
        })

        for (const detallesReserva of reservasSeleccionadas) {
            const reservaUID = detallesReserva.reservaUID
            const fechaEntrada = detallesReserva.fechaEntrada
            const fechaSalida = detallesReserva.fechaSalida
            const apartamentos = detallesReserva.apartamentosIDV
            const estructura = {
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                uid: reservaUID,
                tipoElemento: "reserva",
                apartamentos: apartamentos
            }
            contenedorReservaEncontradas.push(estructura)
        }

        const calendariosSincronizados = []
        for (const apartamentoIDV of apartamentosReservaActual) {
            const eventosCalendarioPorIDV = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV)
            calendariosSincronizados.push(eventosCalendarioPorIDV)
        }

        const contenedorEventosCalendariosSincronizados = []

        for (const contenedorCalendariosPorIDV of calendariosSincronizados) {

            const apartamentoIDV = contenedorCalendariosPorIDV.apartamentoIDV
            const calendariosPorApartamento = contenedorCalendariosPorIDV.calendariosPorApartamento

            for (const eventosDelCalendario of calendariosPorApartamento) {
                const eventosCalendario = eventosDelCalendario.calendarioObjeto

                for (const detallesDelEvento of eventosCalendario) {
                    const fechaFinal = detallesDelEvento.fechaFinal
                    const fechaInicio = detallesDelEvento.fechaInicio
                    const nombreEvento = detallesDelEvento.nombreEvento
                    const descripcion = detallesDelEvento.descripcion
                    const rangoInterno = await selectorRangoUniversal({
                        fechaInicio_rango_ISO: fechaSeleccionadaParaPasado_ISO,
                        fechaFin_rango_ISO: fechaEntradaReserva_ISO,
                        fechaInicio_elemento_ISO: fechaInicio,
                        fechaFin_elemento_ISO: fechaFinal,
                        tipoLimite: "noIncluido"
                    })
                    if (rangoInterno) {
                        const estructura = {
                            apartamentoIDV: apartamentoIDV,
                            fechaEntrada: fechaInicio,
                            fechaSalida: fechaFinal,
                            tipoElemento: "eventoCalendarioSincronizado",
                            nombreEvento: nombreEvento,
                            descripcion: descripcion,
                            tipoElemento: "eventoSincronizado"
                        }
                        contenedorEventosCalendariosSincronizados.push(estructura)
                    }
                }
            }
        }
        const fechaFinRango_entradaReserva_objeto = DateTime.fromISO(fechaEntradaReserva_ISO);
        const contenedorGlobal = [
            ...contenedorBloqueosEncontrados,
            ...contenedorReservaEncontradas,
            ...contenedorEventosCalendariosSincronizados,
        ]
        const contenedorDeEventosQueDejanSinRangoDisponible = []

        for (const detallesDelEvento of contenedorGlobal) {
            const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada)
            const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida)
            const tipoElemento = detallesDelEvento.tipoElemento
            if ((tipoElemento === "reserva" || tipoElemento === "eventoSincronizado")
                &&
                (
                    fechaInicioEvento_ISO < fechaFinRango_entradaReserva_objeto
                    &&
                    fechaFinRango_entradaReserva_objeto <= fechaFinEvento_ISO)) {
                contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
            }
            if (tipoElemento === "bloqueo") {
                const tipoBloqueo = detallesDelEvento.tipoBloqueo
                if ((tipoBloqueo === "rangoTemporal")
                    &&
                    (
                        fechaInicioEvento_ISO < fechaFinRango_entradaReserva_objeto
                        &&
                        fechaFinRango_entradaReserva_objeto <= fechaFinEvento_ISO
                    )) {
                    contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                } else if (tipoBloqueo === "permanente") {
                    contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                }
            }
        }
        if (contenedorDeEventosQueDejanSinRangoDisponible.length) {
            const ok = {
                ok: "noHayRangoPasado",
                limitePasado: fechaEntradaReserva_ISO,
                eventos: contenedorDeEventosQueDejanSinRangoDisponible
            }
            return ok
        }

        const contenedorQueDejanRangoDisponbile = []
        for (const detallesDelEvento of contenedorGlobal) {
            const fechaInicioEvento_ISO = detallesDelEvento.fechaEntrada
            const fechaFinEvento_ISO = detallesDelEvento.fechaSalida
            const tipoElemento = detallesDelEvento.tipoElemento
            if (tipoElemento === "reserva" || tipoElemento === "eventoSincronizado") {
                const eventoBloqueanteDeRango = await selectorRangoUniversal({
                    fechaInicio_rango_ISO: fechaSeleccionadaParaPasado_ISO,
                    fechaFin_rango_ISO: fechaEntradaReserva_ISO,
                    fechaInicio_elemento_ISO: fechaInicioEvento_ISO,
                    fechaFin_elemento_ISO: fechaFinEvento_ISO,
                    tipoLimite: "noIncluido"
                })
                if (eventoBloqueanteDeRango) {
                    contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
                }
            }
            if (tipoElemento === "bloqueo") {
                const tipoBloqueo = detallesDelEvento.tipoBloqueo
                if (tipoBloqueo === "rangoTemporal") {
                    const eventoBloqueanteDeRango = await selectorRangoUniversal({
                        fechaInicio_rango_ISO: fechaSeleccionadaParaPasado_ISO,
                        fechaFin_rango_ISO: fechaEntradaReserva_ISO,
                        fechaInicio_elemento_ISO: fechaInicioEvento_ISO,
                        fechaFin_elemento_ISO: fechaFinEvento_ISO,
                        tipoLimite: "incluido"
                    })
                    if (eventoBloqueanteDeRango) {
                        contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
                    }
                } else if (tipoBloqueo === "permanete") {
                    contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
                }
            }
        }
        if (contenedorQueDejanRangoDisponbile.length) {
            const eventosOrdenadorPorFechaDeSalida = contenedorQueDejanRangoDisponbile.sort((evento1, evento2) => {
                const fechaSalidaA = DateTime.fromISO(evento1.fechaSalida); // Convertir fecha de salida del evento 1 a objeto DateTime
                const fechaSalidaB = DateTime.fromISO(evento2.fechaSalida); // Convertir fecha de salida del evento 2 a objeto DateTime

                if (fechaSalidaA < fechaSalidaB) {
                    return 1; // Si la fecha de salida del evento 1 es menor, lo colocamos después en el array
                } else if (fechaSalidaA > fechaSalidaB) {
                    return -1; // Si la fecha de salida del evento 1 es mayor, lo colocamos antes en el array
                } else {
                    return 0; // Si las fechas de salida son iguales, no hay cambio en el orden
                }
            });

            let fechaMasCercana = eventosOrdenadorPorFechaDeSalida[0].fechaSalida
            let sePermiteElMismoDia = "si"
            for (const detallesDeLosEventosOrdenados of eventosOrdenadorPorFechaDeSalida) {
                const fechaPorBuscar = detallesDeLosEventosOrdenados.fechaSalida
                const tipoElemento = detallesDeLosEventosOrdenados.tipoElemento
                if (fechaMasCercana === fechaPorBuscar &&
                    tipoElemento === "bloqueo") {
                    sePermiteElMismoDia = "no"
                }
            }
            const ok = {
                ok: "rangoPasadoLimitado",
                limitePasado: fechaMasCercana,
                origen: eventosOrdenadorPorFechaDeSalida[0].tipoElemento,
                comportamiento: "No se ha restado un día porque es un bloqueo.",
                eventos: eventosOrdenadorPorFechaDeSalida
            }
            if (sePermiteElMismoDia === "si") {
                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                ok.limitePasado = DateTime.fromISO(fechaMasCercana, { zone: zonaHoraria }).minus({ days: 1 }).toISODate()
                ok.comportamiento = "Se ha restado un día porque es una reserva o un evento sincronizado."
            }
            return ok
        }
        const ok = {
            ok: "rangoPasadoLibre"
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}