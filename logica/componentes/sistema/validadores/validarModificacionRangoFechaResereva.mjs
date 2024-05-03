import { DateTime } from 'luxon';
import { conexion } from '../../db.mjs';
import { sincronizarCalendariosAirbnbPorIDV } from '../calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs';
import { codigoZonaHoraria } from '../codigoZonaHoraria.mjs';
import { selectorRangoUniversal } from '../selectoresCompartidos/selectorRangoUniversal.mjs';
import { bloqueosPorRango_apartamentoIDV } from '../selectoresCompartidos/bloqueosPorRango_apartamentoIDV.mjs';
import { reservasPorRango_y_apartamentos } from '../selectoresCompartidos/reservasPorRango_y_apartamentos.mjs';
const validarModificacionRangoFechaResereva = async (metadatos) => {
    try {
        const reserva = metadatos.reserva
        const mesCalendario = metadatos.mesCalendario.padStart(2, '0');
        const anoCalendario = metadatos.anoCalendario.padStart(2, '0');
        const sentidoRango = metadatos.sentidoRango
        const regexMes = /^\d{2}$/;
        const regexAno = /^\d{4,}$/;
        if (!regexAno.test(anoCalendario)) {
            const error = "El año (anoCalenadrio) debe de ser una cadena de cuatro digitos. Por ejemplo el año uno se escribiria 0001"
            throw new Error(error)
        }
        if (!regexMes.test(mesCalendario)) {
            const error = "El mes (mesCalendario) debe de ser una cadena de dos digitos, por ejemplo el mes de enero se escribe 01"
            throw new Error(error)
        }
        const mesNumeroControl = parseInt(mesCalendario, 10);
        const anoNumeroControl = parseInt(anoCalendario, 10);
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
        if (sentidoRango === "pasado") {
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
            const bloqueosSeleccionados = await bloqueosPorRango_apartamentoIDV(configuracionBloqueos)
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
                reservaUID: reserva,
                apartamentosIDV_array: apartamentosReservaActual,
            }
            const reservasSeleccionadas = await reservasPorRango_y_apartamentos(configuracionReservas)

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
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
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
        }
        if (sentidoRango === "futuro") {
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
            const bloqueosSeleccionados = await bloqueosPorRango_apartamentoIDV(configuracionBloqueos)

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

            const reservasSeleccionadas = await reservasPorRango_y_apartamentos(configuracionReservas)
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
                const fechaInicioEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaEntrada_ISO)
                const fechaFinEvento_ISO = DateTime.fromISO(detallesDelEvento.fechaSalida_ISO)
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
        }
    } catch (error) {
        throw error;
    }
}
export {
    validarModificacionRangoFechaResereva
};