import { DateTime } from "luxon"
import { obtenerBloqueosPorRangoPorApartamentoIDV } from "../../../repositorio/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs"
import { reservasPorRangoPorApartamentosArray } from "../../../repositorio/reservas/selectoresDeReservas/reservasPorRangoPorApartamentosArray.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "../../calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs"
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs"
import { selectorRangoUniversal } from "../../selectoresCompartidos/selectorRangoUniversal.mjs"

export const validadorPasado = async (data) => {
    try {
        const anoCalendario = data.anoCalendario
        const mesCalendario = data.mesCalendario
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const apartamentosReservaActual = data.apartamentosReservaActual


        // cuidado con el primer rangoPasadoLibre, si no hay apartamentos en futuro tambien da rangoPasadolibre
        // if (resuelveConsultaAlojamientoReservaActual.rowCount === 0) {
        //     const ok = {
        //         ok: "rangoPasadoLibre"
        //     }
        //     return ok
        // }

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
        /// No se tiene en en cuenta los apartamentos, solo busca bloqueos a sacoa partir de la fecha
        const configuracionBloqueos = {
            fechaInicioRango_ISO: fechaSeleccionadaParaPasado_ISO,
            fechaFinRango_ISO: fechaEntradaReserva_ISO,
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
            fechaInicioRango_ISO: fechaSeleccionadaParaPasado_ISO,
            fechaFinRango_ISO: fechaEntradaReserva_ISO,
            reservaUID: reservaUID,
            apartamentosIDV_array: apartamentosReservaActual,
        }
        const reservasSeleccionadas = await reservasPorRangoPorApartamentosArray(configuracionReservas)

        for (const detallesReserva of reservasSeleccionadas) {
            const reservaUID = detallesReserva.reservaUID
            const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
            const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
            const apartamentos = detallesReserva.apartamentos
            const estructura = {
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                uid: reservaUID,
                tipoElemento: "reserva",
                apartamentos: apartamentos
            }
            contenedorReservaEncontradas.push(estructura)
        }
        // En base a los apartamentos de la reserva se impoirtan los calendarios que funcionan por apartmento
        const calendariosSincronizados = []
        for (const apartamentoIDV of apartamentosReservaActual) {
            const eventosCalendarioPorIDV = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV)
            calendariosSincronizados.push(eventosCalendarioPorIDV)
        }
        // Buscar solo los eventos del mismo mes
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
                        fechaInicio_rango_ISO: fechaSeleccionadaParaPasado_ISO,
                        fechaFin_rango_ISO: fechaEntradaReserva_ISO,
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
        const fechaFinRango_entradaReserva_objeto = DateTime.fromISO(fechaEntradaReserva_ISO);
        const contenedorGlobal = [
            ...contenedorBloqueosEncontrados,
            ...contenedorReservaEncontradas,
            ...contenedorEventosCalendariosSincronizados,
        ]
        const contenedorDeEventosQueDejanSinRangoDisponible = []
        // Ojo: lo que se es haciendo aqui en este loop no es ver cuales estan dentro del mes, eso ya esta hecho, aquí lo que se mira es si los eventos estan enganchados al a fecha de entrada de la reserva para ver en primera instancia si hay algun tipo de rango disponible
        for (const detallesDelEvento of contenedorGlobal) {
            const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
            const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
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
        // Aqui se mira si habiendo algo de rango disponible. Aqui entonces se mira cuanto rango disponbile hay en el mes solicitaado
        const contenedorQueDejanRangoDisponbile = []
        for (const detallesDelEvento of contenedorGlobal) {
            const fechaInicioEvento_ISO = detallesDelEvento.fechaEntrada_ISO
            const fechaFinEvento_ISO = detallesDelEvento.fechaSalida_ISO
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
                const fechaSalidaA = DateTime.fromISO(evento1.fechaSalida_ISO); // Convertir fecha de salida del evento 1 a objeto DateTime
                const fechaSalidaB = DateTime.fromISO(evento2.fechaSalida_ISO); // Convertir fecha de salida del evento 2 a objeto DateTime
                // Ordenar de manera descendente según la fecha de salida
                if (fechaSalidaA < fechaSalidaB) {
                    return 1; // Si la fecha de salida del evento 1 es menor, lo colocamos después en el array
                } else if (fechaSalidaA > fechaSalidaB) {
                    return -1; // Si la fecha de salida del evento 1 es mayor, lo colocamos antes en el array
                } else {
                    return 0; // Si las fechas de salida son iguales, no hay cambio en el orden
                }
            });
            // Hay mas de un evento con la fecha mas cercana?
            let fechaMasCercana = eventosOrdenadorPorFechaDeSalida[0].fechaSalida_ISO
            let sePermiteElMismoDia = "si"
            for (const detallesDeLosEventosOrdenados of eventosOrdenadorPorFechaDeSalida) {
                const fechaPorBuscar = detallesDeLosEventosOrdenados.fechaSalida_ISO
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
                comportamiento: "No se ha restado un dia por que es un bloqueo",
                eventos: eventosOrdenadorPorFechaDeSalida
            }
            if (sePermiteElMismoDia === "si") {
                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                ok.limitePasado = DateTime.fromISO(fechaMasCercana, { zone: zonaHoraria }).minus({ days: 1 }).toISODate()
                ok.comportamiento = "Se ha restado un dia por que es una reserva o un evento sincronizado"
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