import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { eventosDelApartamento } from "../../../sistema/calendariosSincronizados/airbnb/eventosDelApartamento.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { horasSalidaEntrada as horasSalidaEntrada_ } from "../../../sistema/configuracion/horasSalidaEntrada.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { utilidades } from "../../../componentes/utilidades.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";


export const detallesSituacionApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        
        // Validar que existe el apartamento
        const validarApartamento = `
                        SELECT 
                        "apartamentoIDV",
                        "estadoConfiguracion"
                        FROM
                        "configuracionApartamento"
                        WHERE
                        "apartamentoIDV" = $1
                        `;
        const consultaValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
        if (consultaValidarApartamento.rowCount === 0) {
            const error = "No existe el apartamento";
            throw new Error(error);
        }
        const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
        // Ver las reservas que existen hoy
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualCompletaTZ = tiempoZH.toISO();
        const fechaActualTZ = tiempoZH.toISODate();
        const horasSalidaEntrada = await horasSalidaEntrada_();
        const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ;
        const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ;
        const objetoFinal = {
            apartamentoUI: apartamentoUI,
            apartamentoIDV: apartamentoIDV,
            zonaHoraria: zonaHoraria,
            horaEntradaTZ: horaEntradaTZ,
            horaSalidaTZ: horaSalidaTZ,
            estadoPernoctacion: "libre",
            reservas: []
        };
        const consultaReservasHoy = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "entradaISO", 
                        to_char(salida, 'YYYY-MM-DD') as "salidaISO",
                        to_char(entrada, 'DD/MM/YYYY') as "entradaHumano", 
                        to_char(salida, 'DD//MM/YYYY') as "salidaHumano",
                        reserva
                        FROM reservas
                        WHERE entrada <= $1::DATE AND salida >= $1::DATE; 
                        `;
        const resuelveConsultaReservasHoy = await conexion.query(consultaReservasHoy, [fechaActualTZ]);
        if (resuelveConsultaReservasHoy.rowCount > 0) {
            const reservasEncontradasHoy = resuelveConsultaReservasHoy.rows;
            for (const reserva of reservasEncontradasHoy) {
                const reservaUID = reserva.reserva;
                // Fecha de la base de datos
                const fechaEntradaReservaISO = reserva.entradaISO;
                const fechaSalidaReservaISO = reserva.salidaISO;
                const fechaEntradaReservaHumano = reserva.entradaHumano;
                const fechaSalidaReservaHumano = reserva.salidaHumano;
                // Formatos fecha
                const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
                const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();
                const consultaApartamentosReserva = `
                                SELECT 
                                uid
                                FROM "reservaApartamentos"
                                WHERE reserva = $1 AND apartamento = $2; 
                                `;
                const resuelveConsultaApartamentosReserva = await conexion.query(consultaApartamentosReserva, [reservaUID, apartamentoIDV]);
                if (resuelveConsultaApartamentosReserva.rowCount > 0) {
                    const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                    const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaEntradaReservaISO, fechaSalidaReservaISO);
                    const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                    let porcentajeFinal = porcentajeTranscurrido;
                    if (porcentajeTranscurrido >= 100) {
                        porcentajeFinal = "100";
                    }
                    if (porcentajeTranscurrido <= 0) {
                        porcentajeFinal = "0";
                    }
                    const diaEntrada = utilidades.comparadorFechasStringDDMMAAAA(fechaEntradaReservaISO, fechaActualTZ);
                    const diaSalida = utilidades.comparadorFechasStringDDMMAAAA(fechaSalidaReservaISO, fechaActualTZ);
                    let identificadoDiaLimite = "diaInterno";
                    if (diaEntrada) {
                        identificadoDiaLimite = "diaDeEntrada";
                    }
                    if (diaSalida) {
                        identificadoDiaLimite = "diaDeSalida";
                    }
                    const estructuraReserva = {
                        reservaUID: reservaUID,
                        fechaEntrada: fechaEntradaReservaHumano,
                        fechaSalida: fechaSalidaReservaHumano,
                        diaLimite: identificadoDiaLimite,
                        tiempoRestante: tiempoRestante,
                        cantidadDias: cantidadDias,
                        porcentajeTranscurrido: porcentajeFinal + '%',
                        habitaciones: []
                    };
                    objetoFinal.estadoPernoctacion = "ocupado";
                    const apartamentoUID = resuelveConsultaApartamentosReserva.rows[0].uid;
                    // Extraer las habitaciones
                    const consultaHabitaciones = `
                                    SELECT 
                                    uid, habitacion
                                    FROM "reservaHabitaciones"
                                    WHERE reserva = $1 AND apartamento = $2 ; 
                                    `;
                    const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [reservaUID, apartamentoUID]);
                    if (resuelveConsultaHabitaciones.rowCount > 0) {
                        const habitaciones = resuelveConsultaHabitaciones.rows;
                        for (const habitacion of habitaciones) {
                            const habitacionUID = habitacion.uid;
                            const habitacionIDV = habitacion.habitacion;
                            const resolverHabitacionUI = `
                                            SELECT 
                                            "habitacionUI"
                                            FROM habitaciones
                                            WHERE habitacion = $1; 
                                            `;
                            const resuelveResolverHabitacionUI = await conexion.query(resolverHabitacionUI, [habitacionIDV]);
                            const habitacionUI = resuelveResolverHabitacionUI.rows[0].habitacionUI;
                            const detalleHabitacion = {
                                habitacionIDV: habitacionIDV,
                                habitacionUI: habitacionUI,
                                pernoctantes: []
                            };
                            const consultaPernoctanesHabitacion = `
                                            SELECT 
                                            "clienteUID",
                                            "pernoctanteUID",
                                            to_char("fechaCheckIn", 'YYYY-MM-DD') as "fechaCheckIn_ISO", 
                                            to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') as "fechaCheckOutAdelantado_ISO"
                                            FROM "reservaPernoctantes"
                                            WHERE reserva = $1 AND habitacion = $2 ; 
                                            `;
                            const resuelveConsultaPernoctanesHabitacion = await conexion.query(consultaPernoctanesHabitacion, [reservaUID, habitacionUID]);
                            if (resuelveConsultaPernoctanesHabitacion.rowCount > 0) {
                                const pernoctantes = resuelveConsultaPernoctanesHabitacion.rows;
                                const pernoctantesObjetoTemporal = [];
                                for (const pernoctante of pernoctantes) {
                                    const clienteUID = pernoctante.clienteUID;
                                    const fechaCheckIn_ISO = pernoctante.fechaCheckIn_ISO;
                                    const fechaCheckOutAdelantado_ISO = pernoctante.fechaCheckOutAdelantado_ISO;
                                    if (clienteUID) {
                                        const resolverDatosPernoctante = `
                                                        SELECT 
                                                        nombre,
                                                        "primerApellido",
                                                        "segundoApellido",
                                                        uid,
                                                        pasaporte
                                                        FROM clientes
                                                        WHERE uid = $1 ; 
                                                        `;
                                        const resuelveResolverDatosPernoctante = await conexion.query(resolverDatosPernoctante, [clienteUID]);
                                        const datosCliente = resuelveResolverDatosPernoctante.rows[0];
                                        const nombre = datosCliente.nombre;
                                        const primerApellido = datosCliente.primerApellido || "";
                                        const segundoApellido = datosCliente.segundoApellido || "";
                                        const pasaporte = datosCliente.pasaporte;
                                        const constructorNombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                                        const uid = resuelveResolverDatosPernoctante.rows[0].uid;
                                        const detallesPernoctante = {
                                            nombreCompleto: constructorNombreCompleto.trim(),
                                            tipoPernoctante: "cliente",
                                            pasaporte: pasaporte,
                                            uidCliente: uid
                                        };
                                        if (fechaCheckIn_ISO) {
                                            const fechaCheckIn_array = fechaCheckIn_ISO.split("-");
                                            const fechaCheckIn_humano = `${fechaCheckIn_array[2]}/${fechaCheckIn_array[1]}/${fechaCheckIn_array[0]}`;
                                            detallesPernoctante.fechaCheckIn = fechaCheckIn_humano;
                                        }
                                        if (fechaCheckOutAdelantado_ISO) {
                                            const fechaCheckOutAdelantado_array = fechaCheckOutAdelantado_ISO.split("-");
                                            const fechaCheckOut_humano = `${fechaCheckOutAdelantado_array[2]}/${fechaCheckOutAdelantado_array[1]}/${fechaCheckOutAdelantado_array[0]}`;
                                            detallesPernoctante.fechaCheckOut = fechaCheckOut_humano;
                                        }
                                        pernoctantesObjetoTemporal.push(detallesPernoctante);
                                    } else {
                                        const pernoctanteUID = pernoctante.pernoctanteUID;
                                        const resolverDatosPernoctante = `
                                                        SELECT 
                                                        "nombreCompleto",
                                                        uid,
                                                        pasaporte
                                                        FROM "poolClientes"
                                                        WHERE "pernoctanteUID" = $1 ; 
                                                        `;
                                        const resuelveResolverDatosPernoctante = await conexion.query(resolverDatosPernoctante, [pernoctanteUID]);
                                        const nombreCompleto = resuelveResolverDatosPernoctante.rows[0].nombreCompleto;
                                        const uid = resuelveResolverDatosPernoctante.rows[0].uid;
                                        const pasaporte = resuelveResolverDatosPernoctante.rows[0].pasaporte;
                                        const detallesPernoctante = {
                                            nombreCompleto: nombreCompleto,
                                            tipoPernoctante: "clientePool",
                                            pasaporte: pasaporte,
                                            uidCliente: uid
                                        };
                                        pernoctantesObjetoTemporal.push(detallesPernoctante);
                                    }
                                }
                                detalleHabitacion.pernoctantes = pernoctantesObjetoTemporal;
                            }
                            estructuraReserva.habitaciones.push(detalleHabitacion);
                        }
                    }
                    objetoFinal.reservas.push(estructuraReserva);
                }
            }
        }
        // Calendarios sincronizados
        const datosAirbnb = {
            apartamentoIDV: apartamentoIDV,
            fechaHoy_ISO: fechaActualTZ
        };
        const eventosSincronizadosAirbnb = await eventosDelApartamento(datosAirbnb);
        objetoFinal.calendariosSincronizados = {};
        objetoFinal.calendariosSincronizados.airbnb = {
            eventos: eventosSincronizadosAirbnb.eventos
        };
        if (eventosSincronizadosAirbnb.eventos.length > 0) {
            objetoFinal.estadoPernoctacion = "ocupado";
        }
        const ok = {
            ok: objetoFinal
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}