import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';

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
        const fechaEntradaReserva_Objeto = DateTime.fromISO(fechaEntradaReserva_ISO)

        const fechaSalidaReserva_ISO = resuelveConsultaDatosReservaActual.rows[0].fechaSalida_ISO
        const fechaSalidaReserva_Objeto = DateTime.fromISO(fechaSalidaReserva_ISO)

        const mesReservaEntrada = fechaEntradaReserva_Objeto.month
        const anoReservaEntrada = fechaEntradaReserva_Objeto.year


        const mesReservaSalida = fechaSalidaReserva_Objeto.month
        const anoReservaSalida = fechaSalidaReserva_Objeto.year


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
            const error = "No se puede comprobar la elasticidad del rango de esta reserva por que hay apartamentos que no existen en la configuracion de alojamiento. Dicho de otra manera, esta reserva tiene apartamentos que ya no existen como configuracion de alojamiento. Puede que esta reserva que hiciera un unas configuraciones de alojamiento que ya no existe."
            throw new Error(error)
        }
        //falta validacion que la fecha de pasado no sea superior a la fecha de entrada y lo mismo para la otra
        //////////////////////////////////////////////////////////////




        if (sentidoRango === "pasado") {

            const fechaSeleccionadaParaPasado_Objeto = DateTime.fromObject({
                year: anoCalenddrio,
                month: mesCalendario, day: 1
            })
                .minus({ days: 1 })
            const fechaSeleccionadaParaPasado_ISO = fechaSeleccionadaParaPasado_Objeto.toISODate().toString()

            if (anoReservaSalida < anoCalenddrio || mesReservaSalida < mesCalendario && anoReservaSalida === anoCalenddrio) {
                const error = "El mes de entrada seleccionado no puede ser superior a al mes de fecha de salida de la reserva"
                throw new Error(error)
            }

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
            (salida > $2::DATE AND entrada < $1::DATE)
            AND 
            (zona = 'global' OR zona = 'privado')
            OR 
            ("tipoBloqueo" = 'permanente')
            ;`
            const resuelveBloqueos = await conexion.query(consultaBloqueos, [fechaEntradaReserva_ISO, fechaSeleccionadaParaPasado_ISO])

            const bloqueosEntradaEncontrados = []
            const bloqueosQueNoPermitenElasticidadDelRango = {}

            for (const detallesDelBloqueo of resuelveBloqueos.rows) {
                const fechaEntradaBloqueo_ISO = detallesDelBloqueo.fechaEntrada_ISO
                const fechaSalidaBloqueo_ISO = detallesDelBloqueo.fechaSalida_ISO
                const apartamento = detallesDelBloqueo.apartamento
                const bloqueoUID = detallesDelBloqueo.uid
                const motivo = detallesDelBloqueo.motivo

                const fechaEntradaBloqueo_Objeto = DateTime.fromISO(fechaEntradaBloqueo_ISO)
                const fechaSalidaBloqueo_Objeto = DateTime.fromISO(fechaSalidaBloqueo_ISO)

                const fechaEntradaReserva_Objeto = DateTime.fromISO(fechaEntradaReserva_ISO)

                // Si la fecha de fin del bloqueo es superior a la fecha de entrada de la reserva entonces:
                if (fechaEntradaReserva_Objeto < fechaSalidaBloqueo_Objeto) {
                    // Si la fecha de entrada del bloqueo es inferior a la fecha de entrada reserva entonces no hay rango pasado
                    if (fechaEntradaReserva_Objeto > fechaEntradaBloqueo_Objeto) {
                        const estructuraFinalBloqueo = {
                            bloqueoUID: bloqueoUID,
                            motivo: motivo || "(Sin motivo espeficado en el bloqueo)"
                        }
                        if (bloqueosQueNoPermitenElasticidadDelRango[apartamento]) {
                            (bloqueosQueNoPermitenElasticidadDelRango[apartamento]).push(estructuraFinalBloqueo)
                        } else {
                            bloqueosQueNoPermitenElasticidadDelRango[apartamento] = estructuraFinalBloqueo
                        }
                    }
                } else {
                    const bloqueosEstructura = {
                        fecha_ISO: fechaSalidaBloqueo_ISO,
                        origen: "bloqueo"

                    }
                    bloqueosEntradaEncontrados.push(bloqueosEstructura)

                }

            }
            if (Object.keys(bloqueosQueNoPermitenElasticidadDelRango).length > 0) {
                const ok = {
                    ok: "noHayRangoPasado",
                    limitePasado: fechaEntradaReserva_ISO,
                    motivo: "porBloqueos",
                    desgloseBloqueos: bloqueosQueNoPermitenElasticidadDelRango
                }
                return ok
            }

            // extraer las reservas dentro del rango
            const consultaReservas = `
                SELECT 
                reserva,
                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                to_char(salida, 'DD/MM/YYYY') as salida,
                to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"    
                FROM reservas 
                WHERE                     
                (salida >= $2::DATE AND entrada <= $1::DATE)
                AND reserva <> $3
                AND "estadoReserva" <> 'cancelada';`
            const resuelveConsultaReservas = await conexion.query(consultaReservas, [fechaEntradaReserva_ISO, fechaSeleccionadaParaPasado_ISO, reserva])
            if (resuelveConsultaReservas.rowCount === 0 && bloqueosEntradaEncontrados.length === 0) {
                const ok = {
                    ok: "rangoPasadoLibre"
                }
                return ok
            }

            // crrear un objeto, donde la llave sea el numero de reserva y dentro tenga la fecha deentrada salida y estado activo y ordenado por fecha
            const reservasEnElRangoPorAnalizar = resuelveConsultaReservas.rows
            const arrayUIDReservas = []
            reservasEnElRangoPorAnalizar.map((reservaObjeto) => {
                const reservaUID = reservaObjeto.reserva
                arrayUIDReservas.push(reservaUID)
            })


            // extraer los apartamentos de cada reserva y crear otro objeto con la misma extructura, una llave con el numero dela reserva y un array con apartamentos
            const consultaApartamentos = `
                SELECT reserva, apartamento
                FROM "reservaApartamentos" 
                WHERE ARRAY[reserva] && $1;`

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
            const contenedoresPorOrdenar = [...bloqueosEntradaEncontrados]

            for (const analisisReservaAlojamiento of reservasEnElRangoPorAnalizar) {
                const alojamentoAnalisis = analisisReservaAlojamiento.apartamentos
                const alojamientoReservaActual = reservaActual.apartamentos
                const coincidenciaApartamentoNoDisponible = alojamientoReservaActual.some(apartamento => alojamentoAnalisis.includes(apartamento));
                if (coincidenciaApartamentoNoDisponible) {
                    coincidenciaPorAlojamiento.push(analisisReservaAlojamiento)
                    const reservaEstructura = {
                        fecha_ISO: analisisReservaAlojamiento.fechaSalida_ISO,
                        origen: "reserva"

                    }
                    contenedoresPorOrdenar.push(reservaEstructura)
                }
            }

            if (contenedoresPorOrdenar.length > 0) {
                const fechasOrdenadas = contenedoresPorOrdenar.sort((contenedor1, contenedor2) => {
                    const fechaA = DateTime.fromISO(contenedor1.fecha_ISO);
                    const fechaB = DateTime.fromISO(contenedor2.fecha_ISO);
                    return fechaA - fechaB;
                });
                const contenedorFinal = fechasOrdenadas[fechasOrdenadas.length - 1]
                const fechaLimitePasado = DateTime.fromISO(contenedorFinal);
                const fechaEntradaReservaFormato = DateTime.fromISO(fechaEntradaReserva_ISO);
                const origen = contenedorFinal.origen

                if (origen === "reserva") {
                    const fechaEnContenedor = DateTime.fromISO(contenedorFinal.fecha_ISO).minus({ day: 1 }).toISODate()
                    contenedorFinal.fecha_ISO = fechaEnContenedor


                }

                if (fechaLimitePasado > fechaEntradaReservaFormato) {
                    const ok = {
                        ok: "noHayRangoPasado"
                    }
                    return ok
                } else {
                    const ok = {
                        ok: "rangoPasadoLimitado",
                        limitePasado: contenedorFinal.fecha_ISO,
                        origen: origen
                    }
                    return ok
                }
            }
            if (contenedoresPorOrdenar.length === 0) {
                const ok = {
                    ok: "rangoPasadoLibre"
                }
                return ok
            }


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
            (salida >= $2::DATE AND entrada <= $1::DATE)
            AND 
            (zona = 'global' OR zona = 'privado')
            OR 
            ("tipoBloqueo" = 'permanente');`
            const resuelveBloqueos = await conexion.query(consultaBloqueos, [fechaSeleccionadaParaFuturo_ISO, fechaSalidaReserva_ISO])

            const bloqueosSalidaEncontrados = []

            const bloqueosQueNoPermitenElasticidadDelRango = {}

            for (const detallesDelBloqueo of resuelveBloqueos.rows) {
                const fechaEntradaBloqueo_ISO = detallesDelBloqueo.fechaEntrada_ISO
                const fechaSalidaBloqueo_ISO = detallesDelBloqueo.fechaSalida_ISO
                const apartamento = detallesDelBloqueo.apartamento
                const bloqueoUID = detallesDelBloqueo.uid
                const motivo = detallesDelBloqueo.motivo

                const fechaEntradaBloqueo_Objeto = DateTime.fromISO(fechaEntradaBloqueo_ISO)
                const fechaSalidaBloqueo_Objeto = DateTime.fromISO(fechaSalidaBloqueo_ISO)

                const fechaSalidaReserva_Objeto = DateTime.fromISO(fechaSalidaReserva_ISO)
                // Si la fecha de inicio del bloqueo es inferior a la fecha de salida de la reserva entonces:


                if (fechaEntradaBloqueo_Objeto < fechaSalidaReserva_Objeto) {
                    // Si la fecha de fin del blqueo es superior a la fecha de salida de la reserva entonces no hay rango futuro
                    if (fechaSalidaReserva_Objeto < fechaSalidaBloqueo_Objeto) {
                        const estructuraFinalBloqueo = {
                            bloqueoUID: bloqueoUID,
                            motivo: motivo || "(Sin motivo espeficado en el bloqueo)"
                        }
                        if (bloqueosQueNoPermitenElasticidadDelRango[apartamento]) {
                            (bloqueosQueNoPermitenElasticidadDelRango[apartamento]).push(estructuraFinalBloqueo)
                        } else {
                            bloqueosQueNoPermitenElasticidadDelRango[apartamento] = estructuraFinalBloqueo
                        }
                    }
                } else {
                    const bloqueosEstructura = {
                        fecha_ISO: fechaEntradaBloqueo_ISO,
                        origen: "bloqueo"

                    }
                    bloqueosSalidaEncontrados.push(bloqueosEstructura)

                }
            }
            if (Object.keys(bloqueosQueNoPermitenElasticidadDelRango).length > 0) {
                const ok = {
                    ok: "noHayRangoFuturo",
                    limiteFuturo: fechaSalidaReserva_ISO,

                    motivo: "porBloqeuos",
                    desgloseBloqueos: bloqueosQueNoPermitenElasticidadDelRango
                }
                return ok


            }



            // extraer las reservas dentro del rango
            const consultaReservas = `
                SELECT 
                reserva,
                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                to_char(salida, 'DD/MM/YYYY') as salida,
                to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"     
                FROM reservas 
                WHERE 
                (salida >= $2::DATE AND entrada <= $1::DATE)
                AND reserva <> $3   
                AND "estadoReserva" <> 'cancelada';`

            const resuelveConsultaReservas = await conexion.query(consultaReservas, [fechaSeleccionadaParaFuturo_ISO, fechaSalidaReserva_ISO, reserva])
            if (resuelveConsultaReservas.rowCount === 0 && bloqueosSalidaEncontrados.length === 0) {
                const ok = {
                    ok: "rangoFuturoLibre"
                }
                return ok
            }

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
            }
        }
    } catch (error) {
        throw error;
    }
}


export {
    validarModificacionRangoFechaResereva
};