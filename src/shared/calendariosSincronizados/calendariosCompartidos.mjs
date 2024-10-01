import { DateTime } from 'luxon';
import { obtenerBloqueosPorTipoIDVPorApartamentoIDV } from '../../infraestructure/repository/bloqueos/obtenerBloqueosPorTipoIDVPorApartamentoIDV.mjs';
import { obtenerCalendarioPorCalendarioUIDPublico } from '../../infraestructure/repository/calendario/obtenerCalendarioPorCalendarioUIDPublico.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from '../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { obtenerObtenerBloqueosPorRangoPorTipo } from '../../infraestructure/repository/bloqueos/obtenerObtenerBloqueosPorRangoPorTipo.mjs';
import { obtenerReservasPorRango } from '../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs';
import { exportarClendario } from './airbnb/exportarCalendario.mjs';
import { horaEntradaSalida } from '../horaEntradaSalida.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';

export const calendariosCompartidos = async (data) => {
    try {
        const calendarioUIDPublico = data.calendarioUIDPublico
        const formato = data.formato

        const calendariosporUIDPublico = await obtenerCalendarioPorCalendarioUIDPublico({
            publicoUID: calendarioUIDPublico,
            errorSi: "noExiste"
        })
        const apartamentoIDV = calendariosporUIDPublico.apartamentoIDV;
        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual_ISO = tiempoZH.toISODate();
        const fechaLimite = tiempoZH.plus({ days: 360 }).toISODate();
        const fechaInicio = DateTime.fromISO(fechaActual_ISO);
        const fechaFin = DateTime.fromISO(fechaLimite);
        const matrizHoraEntradaSalida = await horaEntradaSalida();
        const generarFechasEnRango = (fechaInicio, fechaFin) => {
            const fechasEnRango = [];
            let fechaActual = fechaInicio;
            while (fechaActual <= fechaFin) {
                fechasEnRango.push(fechaActual.toISODate());
                fechaActual = fechaActual.plus({ days: 1 });
            }
            return fechasEnRango;
        };
        const arrayFechas = generarFechasEnRango(fechaInicio, fechaFin);
        const objetoFechas = {};
        for (const fecha of arrayFechas) {
            objetoFechas[fecha] = {};
        }
        // Primero buscamso si hay bloqueos permanentes
        // si no hay procedemos a buscar bloquoeos temporales y reservas
        const bloqueoPermanente = "permanente";
        const bloqueosPorTipoPorApartamentoIDV = await obtenerBloqueosPorTipoIDVPorApartamentoIDV({
            tipoBloqueoIDV: bloqueoPermanente,
            apartamentoIDV: apartamentoIDV
        })
        const eventos = [];
        if (bloqueosPorTipoPorApartamentoIDV.length > 0) {
            for (const detallesdelBloqueo of bloqueosPorTipoPorApartamentoIDV) {
                const bloqueoUID = detallesdelBloqueo.bloqueoUID;
                const estructuraEVENTO = {
                    start: fechaInicio,
                    end: fechaFin,
                    summary: 'Bloqueo permanente en casavitini.com',
                    uid: `bloqueo_${bloqueoUID}`,
                    description: `Detalles del bloqueo: https://casavitini.com/administracion/gestion_de_bloqueos_temporales/${apartamentoIDV}/${bloqueoUID}`
                };
                eventos.push(estructuraEVENTO);
            }
        } else {
            const bloqueoTemporal = "rangoTemporal";
            const bloqueosPorRangoPorTipo = await obtenerObtenerBloqueosPorRangoPorTipo({
                tipoBloqueoIDV: bloqueoTemporal,
                fechaInicio_ISO: fechaActual_ISO,
                fechaFinal_ISO: fechaLimite
            })

            for (const detalleDelBloqueo of bloqueosPorRangoPorTipo) {
                const fechaEntradaBloqueo_ISO = detalleDelBloqueo.fechaInicio;
                const fechaSalidaBloqueo_ISO = detalleDelBloqueo.fechaFin;
                const bloqueoUID = detalleDelBloqueo.bloqueoUID;
                // Aqui hay que hacer que no muestre la hora
                const fechaEntrada_objeto = (DateTime.fromObject({
                    year: fechaEntradaBloqueo_ISO.split("-")[0],
                    month: fechaEntradaBloqueo_ISO.split("-")[1],
                    day: fechaEntradaBloqueo_ISO.split("-")[2],
                    hour: "00",
                    minute: "00"
                }, {
                    zone: zonaHoraria
                }));
                const fechaSalida_objeto = (DateTime.fromObject({
                    year: fechaSalidaBloqueo_ISO.split("-")[0],
                    month: fechaSalidaBloqueo_ISO.split("-")[1],
                    day: fechaSalidaBloqueo_ISO.split("-")[2],
                    hour: "23",
                    minute: "59",
                    second: "59"
                }, {
                    zone: zonaHoraria
                }));
                const estructuraEVENTO = {
                    start: fechaEntrada_objeto.toISO(),
                    end: fechaSalida_objeto.toISO(),
                    summary: `Bloqueo temporal del ${apartamentoUI} en casavitini.com`,
                    uid: `bloqueo_${bloqueoUID}`,
                    description: `Detalles del bloqueo: https://casavitini.com/administracion/gestion_de_bloqueos_temporales/${apartamentoIDV}/${bloqueoUID}`
                };
                eventos.push(estructuraEVENTO);
            }

            const reservasPorRango = await obtenerReservasPorRango({
                fechaIncioRango_ISO: fechaActual_ISO,
                fechaFinRango_ISO: fechaLimite,
            })
            for (const reserva of reservasPorRango) {

                const reservaUID = reserva.reservaUID;
                const fechaEntrada = reserva.fechaEntrada;
                const fechaSalida = reserva.fechaSalida;
                const fechaEntrada_objeto = (DateTime.fromObject({
                    year: fechaEntrada.split("-")[0],
                    month: fechaEntrada.split("-")[1],
                    day: fechaEntrada.split("-")[2],
                    hour: matrizHoraEntradaSalida.horaEntrada_objeto.hora,
                    minute: matrizHoraEntradaSalida.horaEntrada_objeto.minuto
                }, {
                    zone: zonaHoraria
                }));
                const fechaSalida_objeto = (DateTime.fromObject({
                    year: fechaSalida.split("-")[0],
                    month: fechaSalida.split("-")[1],
                    day: fechaSalida.split("-")[2],
                    hour: matrizHoraEntradaSalida.horaSalida_objeto.hora,
                    minute: matrizHoraEntradaSalida.horaSalida_objeto.minuto
                }, {
                    zone: zonaHoraria
                }))
                const apartamentoPorApartamentoIDVPorReservaUID = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
                    reservaUID: reservaUID,
                    apartamentoIDV: apartamentoIDV
                })
                if (apartamentoPorApartamentoIDVPorReservaUID) {
                    const evento = {
                        start: fechaEntrada_objeto.toISO(),
                        end: fechaSalida_objeto.toISO(),
                        summary: `${apartamentoUI} de la reserva ${reservaUID} en casavitini.com`,
                        uid: `reserva_${reservaUID}`,
                        description: "Detalles de la reserva: https://casavitini.com/administracion/reservas/reserva:" + reservaUID
                    };
                    eventos.push(evento)
                }
            }
        }
        if (formato === "ics_v2") {
            const calendario = await exportarClendario(eventos);
            return calendario
        } else if (formato === "ics_v2_airbnb") {
            const contendorEventosFormateados = eventos.map(evento => {
                const start = evento.start
                const end = evento.end
                const summary = evento.summary
                const uid = evento.uid
                const description = evento.description

                const fechaInicioSinHora = DateTime.fromISO(start).toISODate()
                const fechaFinalSinHora = DateTime.fromISO(end).toISODate()

                const fechaInicioFormatoAirbnb = fechaInicioSinHora.replaceAll("-", "")
                const fechaFinalFormatoAirbnb = fechaFinalSinHora.replaceAll("-", "")
                // DESCRIPTION:${description}

                const constructorEvetno = `
                BEGIN:VEVENT
                DTEND;VALUE=DATE:${fechaFinalFormatoAirbnb}
                DTSTART;VALUE=DATE:${fechaInicioFormatoAirbnb}
                UID:${uid}
                SUMMARY:${summary}
                END:VEVENT`
                return constructorEvetno
            })

            const estructuraGlobal = `
            BEGIN:VCALENDAR
            PRODID;X-RICAL-TZSOURCE=TZINFO:-//CasaVitini//Vitini Calendar//EN
            CALSCALE:GREGORIAN
            VERSION:2.0
            ${contendorEventosFormateados.join("\n")}   
            END:VCALENDAR
            `
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');

            return estructuraGlobal
        } else {
            const m = "No se reconoce le tipo de formato, solo puede ser ics_v2 o ics_v2_airbnb"
            throw new Error(m)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}