import { DateTime } from "luxon"
import { obtenerBloqueosPorRangoPorApartamentoIDV } from "../../../repositorio/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs"
import { reservasPorRangoPorApartamentosArray } from "../../../repositorio/reservas/selectoresDeReservas/reservasPorRangoPorApartamentosArray.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "../../calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs"
import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs"

export const validadorFuturo = async (data) => {
    try {

        const anoCalendario = data.anoCalendario
        const mesCalendario = data.mesCalendario
        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const apartamentosReservaActual = data.apartamentosReservaActual


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
            fechaInicioRango_ISO: fechaSalidaReserva_ISO,
            fechaFinRango_ISO: fechaSeleccionadaParaFuturo_ISO,
            apartamentoIDV: apartamentosReservaActual,
            zonaBloqueo_array: [
                "global",
                "privado"
            ],
        }
        const bloqueosSeleccionados = await obtenerBloqueosPorRangoPorApartamentoIDV(configuracionBloqueos)

        const contenedorBloqueosEncontrados = []
        for (const detallesDelBloqueo of bloqueosSeleccionados) {
            const fechaEntradaBloqueo_ISO = detallesDelBloqueo.fechaEntrada_ISO
            const fechaSalidaBloqueo_ISO = detallesDelBloqueo.fechaSalida_ISO
            const apartamento = detallesDelBloqueo.apartamento
            const bloqueoUID = detallesDelBloqueo.uid
            const motivo = detallesDelBloqueo.motivo
            const tipoBloqueo = detallesDelBloqueo.tipoBloqueo
            const estructura = {
                fechaEntrada_ISO: fechaEntradaBloqueo_ISO,
                fechaSalida_ISO: fechaSalidaBloqueo_ISO,
                uid: bloqueoUID,
                tipoElemento: "bloqueo",
                apartamentoIDV: apartamento,
                tipoBloqueo: tipoBloqueo,
                motivo: motivo || "(Sin motivo espeficado en el bloqueo)"
            }
            contenedorBloqueosEncontrados.push(estructura)
        }
        const contenedorReservaEncontradas = []
        const configuracionReservas = {
            fechaInicioRango_ISO: fechaSalidaReserva_ISO,
            fechaFinRango_ISO: fechaSeleccionadaParaFuturo_ISO,
            reservaUID: reserva,
            apartamentosIDV_array: apartamentosReservaActual,
        }

        const reservasSeleccionadas = await reservasPorRangoPorApartamentosArray(configuracionReservas)
        for (const detallesReserva of reservasSeleccionadas) {
            const reserva = detallesReserva.reserva
            const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
            const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
            const apartamentos = detallesReserva.apartamentos
            const estructura = {
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                uid: reserva,
                tipoElemento: "reserva",
                apartamentos: apartamentos
            }
            contenedorReservaEncontradas.push(estructura)
        }
        // En base a los apartamentos de la reserva se importan los calendarios que funcionan por apartamento
        const calendariosSincronizados = []
        for (const apartamentoIDV of apartamentosReservaActual) {
            const eventosCalendarioPorIDV = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV)
            calendariosSincronizados.push(eventosCalendarioPorIDV)
        }
        const contenedorEventosCalendariosSincronizados = []
        // Iteramos el array con todos los grupos por apartamentoIDV
        for (const contenedorCalendariosPorIDV of calendariosSincronizados) {
            // Dentro de cada apartamentoIDV hay un grupo de calendarios
            const apartamentoIDV = contenedorCalendariosPorIDV.apartamentoIDV
            const calendariosPorApartamento = contenedorCalendariosPorIDV.calendariosPorApartamento
            // Obtenemos todos los eventos como objetos por calendario
            for (const eventosDelCalendario of calendariosPorApartamento) {
                const eventosCalendario = eventosDelCalendario.calendarioObjeto
                // Iteramos por cada evento
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
                            fechaEntrada_ISO: fechaInicio,
                            fechaSalida_ISO: fechaFinal,
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
            const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
            const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
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
        // Aqui se mira si habiendo algo de rango disponible. Aqui entonces se mira cuanto rango disponbile hay
        const contenedorQueDejanRangoDisponbile = []
        for (const detallesDelEvento of contenedorGlobal) {
            const fechaInicioEvento_ISO = detallesDelEvento.fechaEntrada_ISO
            const fechaFinEvento_ISO = detallesDelEvento.fechaSalida_ISO
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
                const fechaEntradaA = DateTime.fromISO(evento1.fechaEntrada_ISO); // Convertir fecha de salida del evento 1 a objeto DateTime
                const fechaEntradaB = DateTime.fromISO(evento2.fechaEntrada_ISO); // Convertir fecha de salida del evento 2 a objeto DateTime
                // Ordenar de manera descendente según la fecha de salida
                if (fechaEntradaA > fechaEntradaB) {
                    return 1; // Si la fecha de salida del evento 1 es menor, lo colocamos después en el array
                } else if (fechaEntradaA < fechaEntradaB) {
                    return -1; // Si la fecha de salida del evento 1 es mayor, lo colocamos antes en el array
                } else {
                    return 0; // Si las fechas de salida son iguales, no hay cambio en el orden
                }
            });
            let fechaMasCercana = eventosOrdenadorPorFechaDeEntrada[0].fechaEntrada_ISO
            let sePermiteElMismoDia = "si"
            for (const detallesDeLosEventosOrdenados of eventosOrdenadorPorFechaDeEntrada) {
                const fechaPorBuscar = detallesDeLosEventosOrdenados.fechaEntrada_ISO
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
                comportamiento: "No se ha sumado un dia por que es un bloqueo",
                eventos: eventosOrdenadorPorFechaDeEntrada
            }
            if (sePermiteElMismoDia === "si") {
                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                ok.limiteFuturo = DateTime.fromISO(fechaMasCercana, { zone: zonaHoraria }).plus({ days: 1 }).toISODate()
                ok.comportamiento = "Se ha sumado un dia por que es una reserva o un evento sincronizado"
            }
            return ok
        }
        const ok = {
            ok: "rangoFuturoLibre"
        }
        return ok

    } catch (error) {
        throw error
    }
}