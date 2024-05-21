import { obtenerNombreApartamentoUI } from '../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs';
import { obtenerBloqueoPorTipoIDVPorApartamentoIDV } from '../repositorio/bloqueos/obtenerBloqueoPorTipoIDVPorApartamentoIDV.mjs';
import { obtenerCalendariosPorCalendarioUIDPublico } from '../repositorio/calendario/obtenerCalendariosPorCalendarioUIDPublico.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from '../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs';

export const calendarios_compartidos = async (entrada, salida) => {
    try {
        const url = entrada.url.toLowerCase();
        const filtroUrl = /^[a-zA-Z0-9/_./]+$/;
        if (!filtroUrl.test(url)) {
            const error = "La url no es valida";
            throw new Error(error);
        }
        const urlArray = url.toLowerCase()
            .split("/")
            .filter(url => url.trim() !== "calendarios_compartidos")
            .filter(url => url.trim() !== "");
        const calendarioUIDPublico = urlArray[0];
        //Verificara que existe el calendarios
        // ENFOQUE ERRONEO ->> Hay que mostrar los eventos de CASAVITINI por apartmento durante un año a partir de hoy!!!!!! por que este calendario es para sincronizar con las otras plataformas

        const calendariosporUIDPublico = await obtenerCalendariosPorCalendarioUIDPublico(calendarioUIDPublico)
        if (calendariosporUIDPublico) {
            salida.status(404).end();
        }
        const apartamentoIDV = calendariosporUIDPublico.apartamentoIDV;
        const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
        calendariosporUIDPublico.apartamentoUI = apartamentoUI;
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

            const reservasPorRango = await reservasPorRango({
                fechaIncioRango_ISO: fechaActual_ISO,
                fechaFinRango_ISO: fechaLimite,
            })
            for (const detallesReserva of reservasPorRango) {
                const reservaUID = detallesReserva.reserva;
                const fechaEntrada_ISO = detallesReserva.entrada;
                const fechaSalida_ISO = detallesReserva.salida;
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

               // Ojo con esto
                for (const apartamentos of apartamentoPorApartamentoIDVPorReservaUID) {
                    if (apartamentos.apartamento === apartamentoIDV) {
                        const estructuraEVENTO = {
                            //start: DateTime.fromISO(fechaEntrada_ISO+"T000000Z").toISODate(),
                            start: fechaEntrada_objeto.toISO(),
                            end: fechaSalida_objeto.toISO(),
                            summary: `${apartamentoUI} de la reserva ${reservaUID} en casavitini.com`,
                            description: "Detalles de la reserva: https://casavitini.com/administracion/reservas/" + reservaUID
                        };
                        eventos.push(estructuraEVENTO);
                    }
                }
                if (apartamentoPorApartamentoIDVPorReservaUID) {
                    // Esto esta mal por que y no se añade con le push por que si hay uno se va a iterar el loop de arriba y luego esto.
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
        const exportarCalendario_ = await exportarClendario(eventos);
        const icalData = exportarCalendario_;
        salida.attachment('eventos.ics');
        salida.send(icalData);

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado);
        salida.json(errorFinal);
    }
};
