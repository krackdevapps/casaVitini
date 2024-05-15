import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { eventosDelApartamento } from "../../../sistema/calendariosSincronizados/airbnb/eventosDelApartamento.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { horasSalidaEntrada as horasSalidaEntrada_ } from "../../../sistema/configuracion/horasSalidaEntrada.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { utilidades } from "../../../componentes/utilidades.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { reservasPorRango } from "../../../sistema/selectoresCompartidos/reservasPorRango.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerApartamentosDeLaReservaPorApartamentoIDV } from "../../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDV.mjs";
import { obtenerHabitacionesDelApartamento } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs";
import { obtenerNombreHabitacionUI } from "../../../repositorio/arquitectura/obtenerNombreHabitacionUI.mjs";
import { obtenerPernoctantesDeLaHabitacion } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctantesDeLaHabitacion.mjs";
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { obtenerClientePoolPorPernoctanteUID } from "../../../repositorio/clientes/obtenerClientePoolPorPernoctanteUID.mjs";

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
        await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
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

        const reservasUIDHoy = await reservasPorRango({
            fechaIncioRango_ISO: fechaActualTZ,
            fechaFinRango_ISO: fechaActualTZ
        })

        const apartamentosDeLaReserva = {}    
            console.log("1")

        for (const reservaEncontrada of reservasUIDHoy) {
            const reservaUID = reservaEncontrada.reservaUID;
            // Fecha de la base de datos
            const reserva = await obtenerReservaPorReservaUID(reservaUID)
            const fechaEntrada_ISO = reserva.fechaEntrada;
            const fechaSalida_ISO = reserva.fechaSalida;

            // Formatos fecha
            const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(
                `${fechaEntrada_ISO}T${horaEntradaTZ}`,
                { zone: zonaHoraria })
                .toISO();
            const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(
                `${fechaSalida_ISO}T${horaSalidaTZ}`,
                { zone: zonaHoraria })
                .toISO();
                console.log("2")

            const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorApartamentoIDV({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV
            })
            console.log("3", apartamentosDeLaReserva.componteUID)
            if (apartamentosDeLaReserva.componteUID) {
                const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaEntrada_ISO, fechaSalida_ISO);
                const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                let porcentajeFinal = porcentajeTranscurrido;
                if (porcentajeTranscurrido >= 100) {
                    porcentajeFinal = "100";
                }
                if (porcentajeTranscurrido <= 0) {
                    porcentajeFinal = "0";
                }
                const diaEntrada = utilidades.comparadorFechasStringDDMMAAAA(fechaEntrada_ISO, fechaActualTZ);
                const diaSalida = utilidades.comparadorFechasStringDDMMAAAA(fechaSalida_ISO, fechaActualTZ);
                let identificadoDiaLimite = "diaInterno";
                if (diaEntrada) {
                    identificadoDiaLimite = "diaDeEntrada";
                }
                if (diaSalida) {
                    identificadoDiaLimite = "diaDeSalida";
                }
                console.log("4")
                const estructuraReserva = {
                    reservaUID: reservaUID,
                    fechaEntrada: fechaEntrada_ISO,
                    fechaSalida: fechaSalida_ISO,
                    diaLimite: identificadoDiaLimite,
                    tiempoRestante: tiempoRestante,
                    cantidadDias: cantidadDias,
                    porcentajeTranscurrido: porcentajeFinal + '%',
                    habitaciones: []
                };
                objetoFinal.estadoPernoctacion = "ocupado";
                const apartamentoUID = apartamentosDeLaReserva.componenteUID;
                // Extraer las habitaciones
                const habitacionesDelApartamento = await obtenerHabitacionesDelApartamento({
                    reservaUID: reservaUID,
                    apartamentoUID: apartamentoUID
                })
                apartamentosDeLaReserva[apartamentoIDV] = habitacionesDelApartamento
                objetoFinal.reservas.push(estructuraReserva);
            }
        }
        console.log("aqui se lklega")

        for (const [apartamentoIDV, habitacionDelApartamento] of Object.entries(apartamentosDeLaReserva)) {
            const habitacionUID = habitacion.componenteUID;
            const habitacionIDV = habitacion.habitacionIDV;
            const habitacionUI = await obtenerNombreHabitacionUI(habitacionIDV)
            const detalleHabitacion = {
                habitacionIDV: habitacionIDV,
                habitacionUI: habitacionUI,
                pernoctantes: []
            };
            const pernoctantesDeLaHabitacion = await obtenerPernoctantesDeLaHabitacion({
                reservaUID: reservaUID,
                habitacionUID: habitacionUID
            })
            const pernoctantesObjetoTemporal = [];
            for (const pernoctante of pernoctantesDeLaHabitacion) {
                const clienteUID = pernoctante.clienteUID;
                const fechaCheckIn_ISO = pernoctante.fechaCheckIn;
                const fechaCheckOutAdelantado_ISO = pernoctante.fechaCheckOutAdelantado;
                if (clienteUID) {
                    const cliente = obtenerDetallesCliente(clienteUID)
                    const nombre = cliente.nombre;
                    const primerApellido = cliente.primerApellido || "";
                    const segundoApellido = cliente.segundoApellido || "";
                    const pasaporte = cliente.pasaporte;
                    const constructorNombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                    const clienteUID = cliente.clienteUID;
                    const detallesPernoctante = {
                        nombreCompleto: constructorNombreCompleto.trim(),
                        tipoPernoctante: "cliente",
                        pasaporte: pasaporte,
                        clienteUID: clienteUID
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
                    const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
                    const nombreCompleto = clientePool.nombreCompleto;
                    const clienteUID = clientePool.clienteUID;
                    const pasaporte = clientePool.pasaporte;
                    const detallesPernoctante = {
                        nombreCompleto: nombreCompleto,
                        tipoPernoctante: "clientePool",
                        pasaporte: pasaporte,
                        clienteUID: clienteUID
                    };
                    pernoctantesObjetoTemporal.push(detallesPernoctante);
                }
            }
            detalleHabitacion.pernoctantes = pernoctantesObjetoTemporal;

            estructuraReserva.habitaciones.push(detalleHabitacion);
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
    }
}