import { DateTime } from 'luxon';
import { obtenerBloqueoPorTipoIDVPorApartamentoIDV } from '../../repositorio/bloqueos/obtenerBloqueoPorTipoIDVPorApartamentoIDV.mjs';
import { obtenerCalendarioPorCalendarioUIDPublico } from '../../repositorio/calendario/obtenerCalendarioPorCalendarioUIDPublico.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { obtenerObtenerBloqueosPorRangoPorTipo } from '../../repositorio/bloqueos/obtenerObtenerBloqueosPorRangoPorTipo.mjs';
import { obtenerReservasPorRango } from '../../repositorio/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs';
import { exportarClendario } from './airbnb/exportarCalendario.mjs';
import { horaEntradaSalida } from '../horaEntradaSalida.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';

export const calendariosCompartidos = async (calendarioUIDPublico) => {
    try {
        const calendariosporUIDPublico = await obtenerCalendarioPorCalendarioUIDPublico(calendarioUIDPublico)
        const apartamentoIDV = calendariosporUIDPublico.apartamentoIDV;
        const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV);
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
        console.log("d")
        const arrayFechas = generarFechasEnRango(fechaInicio, fechaFin);
        const objetoFechas = {};
        for (const fecha of arrayFechas) {
            objetoFechas[fecha] = {};
        }
        // Primero buscamso si hay bloqueos permanentes
        // si no hay procedemos a buscar bloquoeos temporales y reservas
        const bloqueoPermanente = "permanente";
        const bloqueosPorTipoPorApartamentoIDV = await obtenerBloqueoPorTipoIDVPorApartamentoIDV({
            tipoBloqueoIDV: bloqueoPermanente,
            apartamentoIDV: apartamentoIDV
        })
        const eventos = [];
        if (bloqueosPorTipoPorApartamentoIDV.length > 0) {
            for (const detallesdelBloqueo of bloqueosPorTipoPorApartamentoIDV) {
                const bloqueoUID = detallesdelBloqueo.uid;
                const estructuraEVENTO = {
                    start: fechaInicio,
                    end: fechaFin,
                    summary: 'Bloqueo permanente en casavitini.com',
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
                const bloqueoUID = detalleDelBloqueo.uid;
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
                const fechaEntrada_ISO = reserva.fechaEntrada;
                const fechaSalida_ISO = reserva.fechaSalida;
                const fechaEntrada_objeto = (DateTime.fromObject({
                    year: fechaEntrada_ISO.split("-")[0],
                    month: fechaEntrada_ISO.split("-")[1],
                    day: fechaEntrada_ISO.split("-")[2],
                    hour: matrizHoraEntradaSalida.horaEntrada_objeto.hora,
                    minute: matrizHoraEntradaSalida.horaEntrada_objeto.minuto
                }, {
                    zone: zonaHoraria
                }));
                const fechaSalida_objeto = (DateTime.fromObject({
                    year: fechaSalida_ISO.split("-")[0],
                    month: fechaSalida_ISO.split("-")[1],
                    day: fechaSalida_ISO.split("-")[2],
                    hour: matrizHoraEntradaSalida.horaSalida_objeto.hora,
                    minute: matrizHoraEntradaSalida.horaSalida_objeto.minuto
                }, {
                    zone: zonaHoraria
                }))
                const apartamentoPorApartamentoIDVPorReservaUID = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
                    reservaUID: reservaUID,
                    apartamentoIDV: apartamentoIDV
                })

                const estructuraEVENTO = {
                    start: fechaEntrada_objeto.toISO(),
                    end: fechaSalida_objeto.toISO(),
                    summary: `${apartamentoUI} de la reserva ${reservaUID} en casavitini.com`,
                    description: "Detalles de la reserva: https://casavitini.com/administracion/reservas/" + reservaUID
                };
                eventos.push(estructuraEVENTO);

                if (apartamentoPorApartamentoIDVPorReservaUID) {
                    const evento = {
                        start: DateTime.fromISO(fechaEntrada_ISO),
                        end: DateTime.fromISO(fechaSalida_ISO),
                        sumario: "Reserva " + reservaUID,
                        descripcion: "Reserva en CasaVitini del " + apartamentoUI
                    };
                    // eventos.push(evento)
                }
            }
        }
        const calendario = await exportarClendario(eventos);
        return calendario
    } catch (errorCapturado) {
        throw errorCapturado
    }
}