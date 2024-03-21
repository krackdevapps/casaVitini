import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';
import { sincronizarCalendariosAirbnbPorIDV } from './calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs';
import ICAL from 'ical.js';
import { codigoZonaHoraria } from './codigoZonaHoraria.mjs';


const validarModificacionRangoFechaResereva = async (metadatos) => {
    try {

        const reserva = metadatos.reserva
        const mesCalendario = metadatos.mesCalendario.padStart(2, '0');
        const anoCalenddrio = metadatos.anoCalendario.padStart(2, '0');
        const sentidoRango = metadatos.sentidoRango

        const regexMes = /^\d{2}$/;
        const regexAno = /^\d{4,}$/;

        if (!regexAno.test(anoCalenddrio)) {
            const error = "El año (anoCalenadrio) debe de ser una cadena de cuatro digitos. Por ejemplo el año uno se escribiria 0001"
            throw new Error(error)
        }

        if (!regexMes.test(mesCalendario)) {
            const error = "El mes (mesCalendario) debe de ser una cadena de dos digitos, por ejemplo el mes de enero se escribe 01"
            throw new Error(error)
        }
        const mesNumeroControl = parseInt(mesCalendario, 10);
        const anoNumeroControl = parseInt(anoCalenddrio, 10);
        if (mesNumeroControl < 1 && mesNumeroControl > 12 && anoNumeroControl < 2000) {
            const error = "Revisa los datos de mes por que debe de ser un numero del 1 al 12"
            throw new Error(error)
        }
        if (anoNumeroControl < 2000 || anoNumeroControl > 5000) {
            const error = "El año no puede ser inferior a 2000 ni superior a 5000"
            throw new Error(error)
        }
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
            throw new Error(error)
        }
        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro"
            throw new Error(error)
        }
        // La fecha de entrada seleccionada no puede seer superior a la de la fecha de entrada de la reserva
        // extraer el rango y los apartamentos de la reserva actual
        const consultaDatosReservaActual = `
        SELECT 
        reserva,
        to_char(entrada, 'DD/MM/YYYY') as entrada, 
        to_char(salida, 'DD/MM/YYYY') as salida,
        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",  
        "estadoPago" 
        FROM reservas 
        WHERE reserva = $1;`
        const resuelveConsultaDatosReservaActual = await conexion.query(consultaDatosReservaActual, [reserva])
        if (resuelveConsultaDatosReservaActual.rowCount === 0) {
            const error = "No existe la reserva"
            throw new Error(error)
        }

        const estadoPago = resuelveConsultaDatosReservaActual.rows[0].estadoPago
        if (estadoPago === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada"
            throw new Error(error)
        }

        const fechaEntradaReserva_ISO = resuelveConsultaDatosReservaActual.rows[0].fechaEntrada_ISO
        const fechaSalidaReserva_ISO = resuelveConsultaDatosReservaActual.rows[0].fechaSalida_ISO

        const fechaEntradaReserva_Objeto = DateTime.fromISO(fechaEntradaReserva_ISO)
        const fechaSalidaReserva_Objeto = DateTime.fromISO(fechaSalidaReserva_ISO)

        const mesReservaEntrada = fechaEntradaReserva_ISO.split("-")[1]
        const anoReservaEntrada = fechaEntradaReserva_ISO.split("-")[0]

        const mesReservaSalida = fechaSalidaReserva_ISO.split("-")[1]
        const anoReservaSalida = fechaSalidaReserva_ISO.split("-")[0]

        const consultaAlojamientoReservaActual = `
        SELECT 
        apartamento
        FROM "reservaApartamentos" 
        WHERE reserva = $1;`
        const resuelveConsultaAlojamientoReservaActual = await conexion.query(consultaAlojamientoReservaActual, [reserva])
        if (resuelveConsultaAlojamientoReservaActual.rowCount === 0) {
            const ok = {
                ok: "rangoPasadoLibre"
            }
            return ok
        }
        const apartamentosReservaActual = resuelveConsultaAlojamientoReservaActual.rows.map((apartamento) => {
            return apartamento.apartamento
        })

        const reservaActual = {
            apartamentos: apartamentosReservaActual
        }

        const apartamentosConConfiguracionDisponible = []
        // consulta apartamentos NO diponibles en configuracion global
        const estadoNoDisponibleApartamento = "disponible"
        const consultaApartamentosNoDispopnbiles = `
            SELECT "apartamentoIDV" 
            FROM "configuracionApartamento" 
            WHERE "estadoConfiguracion" = $1
            `
        const resuelveConsultaApartamentosNoDisponibles = await conexion.query(consultaApartamentosNoDispopnbiles, [estadoNoDisponibleApartamento])

        resuelveConsultaApartamentosNoDisponibles.rows.map((apartamentoConConfiguracionDisponible) => {
            apartamentosConConfiguracionDisponible.push(apartamentoConConfiguracionDisponible.apartamentoIDV)
        })

        const controlConfiguracionAlojamiento = apartamentosReservaActual.every(apto => apartamentosConConfiguracionDisponible.includes(apto));
        if (!controlConfiguracionAlojamiento) {
            const error = "No se puede comprobar la elasticidad del rango de esta reserva por que hay apartamentos que no existen en la configuracion de alojamiento. Dicho de otra manera, esta reserva tiene apartamentos que ya no existen como configuracion de alojamiento. Puede que esta reserva se hiciera cuando existian unas configuraciones de alojamiento que ahora ya no existen."
            throw new Error(error)
        }
        const verificaRangoInternamente = (
            mesActual,
            anoActual,
            fechaInicio,
            fechaSalida
        ) => {
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaSalida);

            const inicioMesAno = new Date(inicio.getFullYear(), inicio.getMonth());
            const finMesAno = new Date(fin.getFullYear(), fin.getMonth());
            const fechaMesAno = new Date(anoActual, mesActual - 1);
            return fechaMesAno >= inicioMesAno && fechaMesAno <= finMesAno;
        };

        if (sentidoRango === "pasado") {
            const fechaSeleccionadaParaPasado_Objeto = DateTime.fromObject({
                year: anoCalenddrio,
                month: mesCalendario, day: 1
            })
                .minus({ days: 1 })

            const fechaSeleccionadaParaPasado_ISO = fechaSeleccionadaParaPasado_Objeto.toISODate().toString()

            if (anoReservaSalida < anoCalenddrio || mesReservaSalida < mesCalendario && anoReservaSalida === anoCalenddrio) {
                const error = "El mes de entrada seleccionado no puede ser igual o superior a al mes de fecha de salida de la reserva"
                throw new Error(error)
            }
            /// No se tiene en en cuenta los apartamentos, solo busca bloqueos a sacoa partir de la fecha
            const consultaBloqueos = `
            SELECT 
            uid,
            apartamento,
            "tipoBloqueo",
            "zona",
            to_char(entrada, 'DD/MM/YYYY') as entrada, 
            to_char(salida, 'DD/MM/YYYY') as salida,
            to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
            to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"  
            FROM "bloqueosApartamentos" 
            WHERE                     
            (
            apartamento = ANY($3)
            )
            AND
            (
            (salida > $2::DATE AND entrada < $1::DATE)
            AND 
            (zona = 'global' OR zona = 'privado')
            OR 
            ("tipoBloqueo" = 'permanente')
            )
            ;`
            const resuelveBloqueos = await conexion.query(consultaBloqueos, [fechaEntradaReserva_ISO, fechaSeleccionadaParaPasado_ISO, apartamentosReservaActual])

            const contenedorBloqueosEncontrados = []

            for (const detallesDelBloqueo of resuelveBloqueos.rows) {
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
            // extraer las reservas dentro del rango
            const consultaReservas = `
                SELECT 
                    r.reserva,
                    to_char(r.entrada, 'YYYY-MM-DD') AS "fechaEntrada_ISO", 
                    to_char(r.salida, 'YYYY-MM-DD') AS "fechaSalida_ISO",
                    ARRAY_AGG(ra.apartamento) AS apartamentos
                FROM reservas r
                JOIN "reservaApartamentos" ra ON r.reserva = ra.reserva
                WHERE                     
                    r.salida >= $2::DATE 
                    AND r.entrada <= $1::DATE 
                    AND r.reserva <> $3 
                    AND r."estadoReserva" <> 'cancelada'
                    AND r.reserva IN (
                        SELECT reserva
                        FROM "reservaApartamentos" 
                        WHERE apartamento = ANY($4)
                    )     
                GROUP BY
                    r.reserva, r.entrada, r.salida;
                                `
            const resuelveConsultaReservas = await conexion.query(consultaReservas, [fechaEntradaReserva_ISO, fechaSeleccionadaParaPasado_ISO, reserva, apartamentosReservaActual])
            for (const detallesReserva of resuelveConsultaReservas.rows) {
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
                        const uid = detallesDelEvento.uid
                        const nombreEvento = detallesDelEvento.nombreEvento
                        const descripcion = detallesDelEvento.descripcion

                        const rangoInterno = verificaRangoInternamente(mesCalendario, anoCalenddrio, fechaInicio, fechaFinal)

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

            const fechaInicioRango_objeto = fechaSeleccionadaParaPasado_Objeto
            const fechaFinRango_entradaReserva_objeto = DateTime.fromISO(fechaEntradaReserva_ISO);
            const contenedorEventosCalendariosSincronizados_enRango = contenedorEventosCalendariosSincronizados.filter((detallesDelEvento) => {
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
                return (fechaInicioEvento_ISO <= fechaFinRango_entradaReserva_objeto) && (fechaFinEvento_ISO >= fechaInicioRango_objeto)
            })

            const contenedorGlobal = [
                ...contenedorBloqueosEncontrados,
                ...contenedorReservaEncontradas,
                ...contenedorEventosCalendariosSincronizados_enRango,
            ]
            const contenedorDeEventosQueDejanSinRangoDisponible = []
            console.log("contenedorDeEventosQueDejanSinRangoDisponible", contenedorDeEventosQueDejanSinRangoDisponible)
            // Ojo: lo que se es haciendo aqui en este loop no es ver cuales estan dentro del mes, eso ya esta hecho, aquí lo que se mira es silos eventos estan enganchados al a fecha de entrad de la reserva para ver en primera instancia si hay algun tipo de rango disponbile
            for (const detallesDelEvento of contenedorGlobal) {
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
                const tipoElemento = detallesDelEvento.tipoElemento
                console.log("detallesDelEvento", detallesDelEvento)

                if ((tipoElemento === "reserva" || tipoElemento === "eventoSincronizado")
                    &&
                    (fechaInicioEvento_ISO < fechaFinRango_entradaReserva_objeto && fechaFinRango_entradaReserva_objeto <= fechaFinEvento_ISO)) {
                    contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                }
                if (tipoElemento === "bloqueo") {
                    const tipoBloqueo = detallesDelEvento.tipoBloqueo
                    if ((tipoBloqueo === "rangoTemporal")
                        &&
                        (fechaInicioEvento_ISO < fechaFinRango_entradaReserva_objeto && fechaFinRango_entradaReserva_objeto <= fechaFinEvento_ISO)) {
                        contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                    } else if (tipoBloqueo === "permanente") {
                        contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                    }
                }
            }

            if (contenedorDeEventosQueDejanSinRangoDisponible.length) {
                const ok = {
                    ok: "noHayRangoPasado",
                    eventos: contenedorDeEventosQueDejanSinRangoDisponible
                }
                return ok
            }

            // Aqui se mira si habiendo algo de rango disponible. Aqui entonces se mira cuanto rango disponbile hay
            const contenedorQueDejanRangoDisponbile = []
            for (const detallesDelEvento of contenedorGlobal) {
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
                const tipoElemento = detallesDelEvento.tipoElemento
                if ((tipoElemento === "reserva" || tipoElemento === "eventoSincronizado")
                    &&
                    (
                        (fechaInicioEvento_ISO <= fechaInicioRango_objeto)
                        ||
                        (fechaInicioEvento_ISO > fechaInicioRango_objeto)
                        && (fechaFinEvento_ISO <= fechaFinRango_entradaReserva_objeto)
                    )
                ) {
                    contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
                }
                if (tipoElemento === "bloqueo") {
                    const tipoBloqueo = detallesDelEvento.tipoBloqueo
                    if (tipoBloqueo === "rangoTemporal" && (
                        (fechaInicioEvento_ISO <= fechaInicioRango_objeto)
                        ||
                        (fechaInicioEvento_ISO > fechaInicioRango_objeto)
                        &&
                        (fechaFinEvento_ISO <= fechaFinRango_entradaReserva_objeto)
                    )) {
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
                    detallesDeLosEventosBloqueantes: eventosOrdenadorPorFechaDeSalida
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
        }

        if (sentidoRango === "futuro") {
            const fechaSeleccionadaParaFuturo_Objeto = DateTime.fromObject({
                year: anoCalenddrio,
                month: mesCalendario, day: 1
            })
                .plus({ months: 1 })
            const fechaSeleccionadaParaFuturo_ISO = fechaSeleccionadaParaFuturo_Objeto.toISODate().toString()

            if ((anoReservaEntrada > anoCalenddrio) || (mesReservaEntrada > mesCalendario && anoReservaEntrada === anoCalenddrio)) {
                const error = "El mes de salida seleccionado no puede ser inferior a al mes de la fecha de entrada de la reserva"
                throw new Error(error)
            }
            const consultaBloqueos = `
            SELECT 
            uid,
            apartamento,
            "tipoBloqueo",
            "zona",
            motivo,
            to_char(entrada, 'DD/MM/YYYY') as entrada, 
            to_char(salida, 'DD/MM/YYYY') as salida,
            to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
            to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"    
            FROM "bloqueosApartamentos" 
            WHERE       
            (
                apartamento = ANY($3)
            )
            AND
            (              
            (salida >= $2::DATE AND entrada <= $1::DATE)
            AND 
            (zona = 'global' OR zona = 'privado')
            OR 
            ("tipoBloqueo" = 'permanente')
            );`
            const resuelveBloqueos = await conexion.query(consultaBloqueos, [fechaSeleccionadaParaFuturo_ISO, fechaSalidaReserva_ISO, apartamentosReservaActual])


            const contenedorBloqueosEncontrados = []

            for (const detallesDelBloqueo of resuelveBloqueos.rows) {
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

            // extraer las reservas dentro del rango
            const consultaReservas = `
                SELECT 
                    r.reserva,
                    to_char(r.entrada, 'YYYY-MM-DD') AS "fechaEntrada_ISO", 
                    to_char(r.salida, 'YYYY-MM-DD') AS "fechaSalida_ISO",
                    ARRAY_AGG(ra.apartamento) AS apartamentos    
                FROM reservas r
                JOIN "reservaApartamentos" ra ON r.reserva = ra.reserva
                WHERE               
                r.salida >= $2::DATE 
                AND r.entrada <= $1::DATE 
                AND r.reserva <> $3 
                AND r."estadoReserva" <> 'cancelada'
                AND r.reserva IN (
                    SELECT reserva
                    FROM "reservaApartamentos" 
                    WHERE apartamento = ANY($4)
                )   
                GROUP BY
                r.reserva, r.entrada, r.salida;            
                ;`

            const resuelveConsultaReservas = await conexion.query(consultaReservas, [fechaSeleccionadaParaFuturo_ISO, fechaSalidaReserva_ISO, reserva, apartamentosReservaActual])

            for (const detallesReserva of resuelveConsultaReservas.rows) {
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

            // En base a los apartamentos de la reserva se impoirtan los calendarios que funcionan por apartmento
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
                        const uid = detallesDelEvento.uid
                        const nombreEvento = detallesDelEvento.nombreEvento
                        const descripcion = detallesDelEvento.descripcion


                        const rangoInterno = verificaRangoInternamente(mesCalendario, anoCalenddrio, fechaInicio, fechaFinal)
                        if (rangoInterno) {
                            const estructura = {
                                apartamentoIDV: apartamentoIDV,
                                fechaEntrada_ISO: fechaFinal,
                                fechaSalida_ISO: fechaInicio,
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
            const fechaFinRango_objeto = fechaSeleccionadaParaFuturo_ISO

            const contenedorEventosCalendariosSincronizados_enRango = contenedorEventosCalendariosSincronizados.filter((detallesDelEvento) => {
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
                return (fechaInicioEvento_ISO <= fechaFinRango_objeto) && (fechaFinEvento_ISO >= fechaInicioRango_salidaReserva_objeto)

            })

            const contenedorGlobal = [
                ...contenedorBloqueosEncontrados,
                ...contenedorReservaEncontradas,
                ...contenedorEventosCalendariosSincronizados_enRango,
            ]

            console.log("contenedorGlobal", contenedorGlobal)

            const contenedorDeEventosQueDejanSinRangoDisponible = []

            for (const detallesDelEvento of contenedorGlobal) {
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
                const tipoElemento = detallesDelEvento.tipoElemento
                if ((tipoElemento === "reserva" || tipoElemento === "eventoSincronizado")
                    &&
                    (fechaInicioEvento_ISO < fechaInicioRango_salidaReserva_objeto && fechaInicioRango_salidaReserva_objeto <= fechaFinEvento_ISO)) {
                    contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                }
                if (tipoElemento === "bloqueo") {
                    const tipoBloqueo = detallesDelEvento.tipoBloqueo
                    if ((tipoBloqueo === "rangoTemporal")
                        &&
                        (fechaInicioEvento_ISO < fechaInicioRango_salidaReserva_objeto && fechaInicioRango_salidaReserva_objeto <= fechaFinEvento_ISO)) {
                        contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                    } else if (tipoBloqueo === "permanente") {
                        contenedorDeEventosQueDejanSinRangoDisponible.push(detallesDelEvento)
                    }
                }
            }

            if (contenedorDeEventosQueDejanSinRangoDisponible.length) {
                const ok = {
                    ok: "noHayRangoFuturo",
                    eventos: contenedorDeEventosQueDejanSinRangoDisponible
                }
                return ok
            }


            // Aqui se mira si habiendo algo de rango disponible. Aqui entonces se mira cuanto rango disponbile hay
            const contenedorQueDejanRangoDisponbile = []
            for (const detallesDelEvento of contenedorGlobal) {
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
                const tipoElemento = detallesDelEvento.tipoElemento
                if ((tipoElemento === "reserva" || tipoElemento === "eventoSincronizado")
                    &&
                    (
                        (fechaInicioEvento_ISO >= fechaInicioRango_salidaReserva_objeto)
                        ||
                        (fechaInicioEvento_ISO < fechaInicioRango_salidaReserva_objeto)
                        && (fechaFinEvento_ISO >= fechaFinRango_objeto)
                    )
                ) {
                    contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
                }
                if (tipoElemento === "bloqueo") {
                    const tipoBloqueo = detallesDelEvento.tipoBloqueo
                    if (tipoBloqueo === "rangoTemporal" && (
                        (fechaInicioEvento_ISO >= fechaInicioRango_salidaReserva_objeto)
                        ||
                        (fechaInicioEvento_ISO < fechaInicioRango_salidaReserva_objeto)
                        &&
                        (fechaFinEvento_ISO >= fechaFinRango_objeto)
                    )) {
                        contenedorQueDejanRangoDisponbile.push(detallesDelEvento)
                    }
                }
            }
            console.log("contenedorQueDejanRangoDisponbile", contenedorQueDejanRangoDisponbile)

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
                    detallesDeLosEventosBloqueantes: eventosOrdenadorPorFechaDeEntrada
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


            /*
                        // crrear un objeto, donde la llave sea el numero de reserva y dentro tenga la fecha deentrada salida y estado activo y ordenado por fecha
                        const reservasEnElRangoPorAnalizar = resuelveConsultaReservas.rows
                        const arrayUIDReservas = reservasEnElRangoPorAnalizar.map((detallesReserva) => {
                            return detallesReserva.reserva
                        })
            
            
                        // extraer los apartamentos de cada reserva y crear otro objeto con la misma extructura, una llave con el numero dela reserva y un array con apartamentos
                        const consultaApartamentos = `
                            SELECT
                            reserva, 
                            apartamento
                            FROM 
                            "reservaApartamentos" 
                            WHERE
                            ARRAY[reserva] && $1;`
            
                        const resuelveConsultaApartamentos = await conexion.query(consultaApartamentos, [arrayUIDReservas])
                        const apartamentosProcesados = {}
            
                        resuelveConsultaApartamentos.rows.map((apartamentoPorProcesar) => {
                            const controlLlaveObjeto = apartamentosProcesados[apartamentoPorProcesar.reserva]
                            if (!controlLlaveObjeto) {
                                apartamentosProcesados[apartamentoPorProcesar.reserva] = []
                            }
                            apartamentosProcesados[apartamentoPorProcesar.reserva].push(apartamentoPorProcesar.apartamento)
                        })
            
            
                        for (const reservaPorProcesar of reservasEnElRangoPorAnalizar) {
                            const reservaUID = reservaPorProcesar.reserva
                            reservaPorProcesar["apartamentos"] = apartamentosProcesados[reservaUID]
                        }
            
                        const coincidenciaPorAlojamiento = []
                        const contenedoresPorOrdenar = [...bloqueosSalidaEncontrados]
            
                        for (const analisisReservaAlojamiento of reservasEnElRangoPorAnalizar) {
                            let alojamentoAnalisis = analisisReservaAlojamiento.apartamentos
                            let alojamientoReservaActual = reservaActual.apartamentos
                            const coincidenciaApartamentoNoDisponible = alojamientoReservaActual.some(apartamento => alojamentoAnalisis.includes(apartamento));
                            if (coincidenciaApartamentoNoDisponible) {
            
                                coincidenciaPorAlojamiento.push(analisisReservaAlojamiento)
                                const reservaEstructura = {
                                    fecha_ISO: analisisReservaAlojamiento.fechaEntrada_ISO,
                                    origen: "reserva"
                                }
                                contenedoresPorOrdenar.push(reservaEstructura)
                            }
                        }
            
                        if (contenedoresPorOrdenar.length > 0) {
                            const contenedoresOrdenados = contenedoresPorOrdenar.sort((contenedor1, contenedor2) => {
                                const fechaA = DateTime.fromISO(contenedor1.fecha_ISO);
                                const fechaB = DateTime.fromISO(contenedor2.fecha_ISO);
                                return fechaA - fechaB;
                            });
            
                            const contenedorFinal = contenedoresOrdenados[0]
                            const fechaLimiteFuturo = DateTime.fromISO(contenedorFinal);
                            const fechaSalidaReserva_Objeto = DateTime.fromISO(fechaSalidaReserva_ISO);
                            const origen = contenedorFinal.origen
            
                            if (origen === "reserva") {
                                const fechaEnContenedor = DateTime.fromISO(contenedorFinal.fecha_ISO).plus({ day: 1 }).toISODate()
                                contenedorFinal.fecha_ISO = fechaEnContenedor
                            }
            
                            if (fechaLimiteFuturo < fechaSalidaReserva_Objeto) {
                                const ok = {
                                    ok: "noHayRangoFuturo"
                                }
                                return ok
                            } else {
                                const ok = {
                                    ok: "rangoFuturoLimitado",
                                    limiteFuturo: contenedorFinal.fecha_ISO,
                                    origen: origen
                                }
                                return ok
            
                            }
                        }
                        if (contenedoresPorOrdenar.length === 0) {
                            const ok = {
                                ok: "rangoFuturoLibre"
                            }
                            return ok
                        }*/
        }
    } catch (error) {
        throw error;
    }
}


export {
    validarModificacionRangoFechaResereva
};