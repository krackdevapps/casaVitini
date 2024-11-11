import { DateTime } from "luxon"
import { obtenerBloqueosPorRangoPorApartamentoIDV } from "../../../infraestructure/repository/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs"
import { reservasPorRangoPorApartamentosArray } from "../../../infraestructure/repository/reservas/selectoresDeReservas/reservasPorRangoPorApartamentosArray.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "../../calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs"
import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs"

export const validadorFuturo = async (data) => {
    try {

        const anoCalendario = data.anoCalendario
        const mesCalendario = data.mesCalendario
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const reservaUID = data.reservaUID

        const apartamentosReservaActual = data.apartamentosReservaActual

        const anoReservaEntrada = fechaEntradaReserva_ISO.split("-")[0]
        const mesReservaEntrada = fechaEntradaReserva_ISO.split("-")[1]

        const fechaSeleccionadaParaFuturo_Objeto = DateTime.fromObject({
            year: anoCalendario,
            month: mesCalendario, day: 1
        })
            .plus({ months: 1 })
        const fechaSeleccionadaParaFuturo_ISO = fechaSeleccionadaParaFuturo_Objeto.toISODate().toString()
        if ((anoReservaEntrada > anoCalendario) || (mesReservaEntrada > mesCalendario && anoReservaEntrada === anoCalendario)) {
            const error = "El mes de salida seleccionado no puede ser inferior a al mes de la fecha de entrada de la reserva"
            throw new Error(error)
        }
        const configuracionBloqueos = {
            fechaInicioRango: fechaSalidaReserva_ISO,
            fechaFinRango: fechaSeleccionadaParaFuturo_ISO,
            apartamentosIDV_array: apartamentosReservaActual,
            zonaBloqueo_array: [
                "global",
                "privado"
            ],
        }
        const bloqueosSeleccionados = await obtenerBloqueosPorRangoPorApartamentoIDV(configuracionBloqueos)
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
        const configuracionReservas = {
            fechaInicioRango_ISO: fechaSalidaReserva_ISO,
            fechaFinRango_ISO: fechaSeleccionadaParaFuturo_ISO,
            reservaUID: reservaUID,
            apartamentosIDV_array: apartamentosReservaActual,
        }

        const reservasSeleccionadas = await reservasPorRangoPorApartamentosArray(configuracionReservas)
        for (const detallesReserva of reservasSeleccionadas) {
            const reserva = detallesReserva.reserva
            const fechaEntrada = detallesReserva.fechaEntrada
            const fechaSalida = detallesReserva.fechaSalida
            const apartamentos = detallesReserva.apartamentosIDV
            const estructura = {
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                uid: reserva,
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
                        fechaInicio_rango_ISO: fechaSalidaReserva_ISO,
                        fechaFin_rango_ISO: fechaSeleccionadaParaFuturo_ISO,
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
        const fechaInicioRango_salidaReserva_objeto = DateTime.fromISO(fechaSalidaReserva_ISO);
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
                (fechaInicioEvento_ISO < fechaInicioRango_salidaReserva_objeto &&
                    fechaInicioRango_salidaReserva_objeto <= fechaFinEvento_ISO)) {
                contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
            }
            if (tipoElemento === "bloqueo") {
                const tipoBloqueo = detallesDelEvento.tipoBloqueo
                if ((tipoBloqueo === "rangoTemporal")
                    &&
                    (fechaInicioEvento_ISO <= fechaInicioRango_salidaReserva_objeto &&
                        fechaInicioRango_salidaReserva_objeto <= fechaFinEvento_ISO)) {
                    contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                } else if (tipoBloqueo === "permanente") {
                    contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                }
            }
        }
        if (contenedorDeEventosQueDejanSinRangoDisponible.length) {
            const ok = {
                ok: "noHayRangoFuturo",
                limiteFuturo: fechaSalidaReserva_ISO,
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
                    fechaInicio_rango_ISO: fechaSalidaReserva_ISO,
                    fechaFin_rango_ISO: fechaSeleccionadaParaFuturo_ISO,
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
                        fechaInicio_rango_ISO: fechaSalidaReserva_ISO,
                        fechaFin_rango_ISO: fechaSeleccionadaParaFuturo_ISO,
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
            const eventosOrdenadorPorFechaDeEntrada = contenedorQueDejanRangoDisponbile.sort((evento1, evento2) => {
                const fechaEntradaA = DateTime.fromISO(evento1.fechaEntrada); // Convertir fecha de salida del evento 1 a objeto DateTime
                const fechaEntradaB = DateTime.fromISO(evento2.fechaEntrada); // Convertir fecha de salida del evento 2 a objeto DateTime

                if (fechaEntradaA > fechaEntradaB) {
                    return 1; // Si la fecha de salida del evento 1 es menor, lo colocamos después en el array
                } else if (fechaEntradaA < fechaEntradaB) {
                    return -1; // Si la fecha de salida del evento 1 es mayor, lo colocamos antes en el array
                } else {
                    return 0; // Si las fechas de salida son iguales, no hay cambio en el orden
                }
            });
            let fechaMasCercana = eventosOrdenadorPorFechaDeEntrada[0].fechaEntrada
            let sePermiteElMismoDia = "si"
            for (const detallesDeLosEventosOrdenados of eventosOrdenadorPorFechaDeEntrada) {
                const fechaPorBuscar = detallesDeLosEventosOrdenados.fechaEntrada
                const tipoElemento = detallesDeLosEventosOrdenados.tipoElemento
                if (fechaMasCercana === fechaPorBuscar &&
                    tipoElemento === "bloqueo") {
                    sePermiteElMismoDia = "no"
                }
            }
            const ok = {
                ok: "rangoFuturoLimitado",
                limiteFuturo: fechaMasCercana,
                origen: eventosOrdenadorPorFechaDeEntrada[0].tipoElemento,
                comportamiento: "No se ha sumado un día porque es un bloqueo.",
                eventos: eventosOrdenadorPorFechaDeEntrada
            }
            if (sePermiteElMismoDia === "si") {
                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                ok.limiteFuturo = DateTime.fromISO(fechaMasCercana, { zone: zonaHoraria }).plus({ days: 1 }).toISODate()
                ok.comportamiento = "Se ha sumado un día porque es una reserva o un evento sincronizado."
            }
            return ok
        }
        const ok = {
            ok: "rangoFuturoLibre"
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}