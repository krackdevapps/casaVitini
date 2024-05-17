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
import { obtenerHabitacionesDelApartamento } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs";
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { obtenerClientePoolPorPernoctanteUID } from "../../../repositorio/clientes/obtenerClientePoolPorPernoctanteUID.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDV } from "../../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDV.mjs";
import { obtenerTodosLosPernoctantesDeLaReserva } from "../../../repositorio/reservas/pernoctantes/obtenerTodosLosPernoctantesDeLaReserva.mjs";

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
            horaSalidaTZ: horaSalidaTZ,
            horaEntradaTZ: horaEntradaTZ,
            estadoPernoctacion: "libre",
            reservas: {}
        };

        const reservasUIDHoy = await reservasPorRango({
            fechaIncioRango_ISO: fechaActualTZ,
            fechaFinRango_ISO: fechaActualTZ
        })
        const identificadoresReservasValidas = []
        for (const reservaEncontrada of reservasUIDHoy) {
            const reservaUID = reservaEncontrada.reservaUID;
            // Fecha de la base de datos
            const reserva = await obtenerReservaPorReservaUID(reservaUID)
            const fechaEntrada_ISO = reserva.fechaEntrada;
            const fechaSalida_ISO = reserva.fechaSalida;

            // Formatos fecha
            const fechaConHoraEntrada_ISO_ZH = DateTime.fromISO(
                `${fechaEntrada_ISO}T${horaEntradaTZ}`,
                { zone: zonaHoraria })
                .toISO();
            const fechaConHoraSalida_ISO_ZH = DateTime.fromISO(
                `${fechaSalida_ISO}T${horaSalidaTZ}`,
                { zone: zonaHoraria })
                .toISO();

            const apartamentoDeLaReserva = await obtenerApartamentoDeLaReservaPorApartamentoIDV({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV
            })
            if (apartamentoDeLaReserva.componenteUID) {
                identificadoresReservasValidas.push(reservaUID)
                const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalida_ISO_ZH, fechaActualCompletaTZ);
                const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaEntrada_ISO, fechaSalida_ISO);
                const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntrada_ISO_ZH, fechaConHoraSalida_ISO_ZH, fechaActualCompletaTZ);
                let porcentajeFinal = porcentajeTranscurrido;
                if (porcentajeTranscurrido >= 100) {
                    porcentajeFinal = "100";
                }
                if (porcentajeTranscurrido <= 0) {
                    porcentajeFinal = "0";
                }
                const diaEntrada = utilidades.comparadorFechas_ISO(fechaEntrada_ISO, fechaActualTZ);
                const diaSalida = utilidades.comparadorFechas_ISO(fechaSalida_ISO, fechaActualTZ);
                let identificadoDiaLimite = "diaInterno";
                if (diaEntrada) {
                    identificadoDiaLimite = "diaDeEntrada";
                }
                if (diaSalida) {
                    identificadoDiaLimite = "diaDeSalida";
                }
                const estructuraReserva = {
                    reservaUID: reservaUID,
                    fechaEntrada: fechaEntrada_ISO,
                    fechaSalida: fechaSalida_ISO,
                    diaLimite: identificadoDiaLimite,
                    tiempoRestante: tiempoRestante,
                    cantidadDias: cantidadDias,
                    porcentajeTranscurrido: porcentajeFinal + '%',
                    habitaciones: [],
                    pernoctantes: []
                };
                objetoFinal.estadoPernoctacion = "ocupado";
                const apartamentoUID = apartamentoDeLaReserva.componenteUID;
                // Extraer las habitaciones
                const habitacionesDelApartamento = await obtenerHabitacionesDelApartamento({
                    reservaUID: reservaUID,
                    apartamentoUID: apartamentoUID
                })
                estructuraReserva.habitaciones = habitacionesDelApartamento
                //  habitacionesDelApartamento[apartamentoIDV] = habitacionesDelApartamento
                objetoFinal.reservas[reservaUID] = estructuraReserva


            }
        }
        const pernoctantesContenedorTemporal = []
        for (const reservaUIDValido of identificadoresReservasValidas) {
            const pernoctantesDeLaReserva = await obtenerTodosLosPernoctantesDeLaReserva(reservaUIDValido)
            pernoctantesContenedorTemporal.push(...pernoctantesDeLaReserva)
        }
        for (const pernoctante of pernoctantesContenedorTemporal) {
            const clienteUID = pernoctante.clienteUID;
            const fechaCheckIn_ISO = pernoctante.fechaCheckIn;
            const fechaCheckOutAdelantado_ISO = pernoctante.fechaCheckOutAdelantado;
            const reservaUIDDelPernoctante = pernoctante.reservaUID
            const habitacionUID = pernoctante.habitacionUID
            console.log("habitacionUID", habitacionUID)

            if (clienteUID) {
                const cliente = await obtenerDetallesCliente(clienteUID)
                const nombre = cliente.nombre;
                const primerApellido = cliente.primerApellido || "";
                const segundoApellido = cliente.segundoApellido || "";
                const pasaporte = cliente.pasaporte;
                const constructorNombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                // const clienteUID = cliente.clienteUID;
                const detallesPernoctante = {
                    nombreCompleto: constructorNombreCompleto.trim(),
                    tipoPernoctante: "cliente",
                    pasaporte: pasaporte,
                    clienteUID: clienteUID,
                    habitacionUID: habitacionUID

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
                // pernoctantesObjetoTemporal.push(detallesPernoctante);
                objetoFinal.reservas[reservaUIDDelPernoctante].pernoctantes.push(detallesPernoctante)
            } else {
                const pernoctanteUID = pernoctante.pernoctanteUID;
                const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
                const nombreCompleto = clientePool.nombreCompleto;
                //const clienteUID = clientePool.clienteUID;
                const pasaporte = clientePool.pasaporte;
                const detallesPernoctante = {
                    nombreCompleto: nombreCompleto,
                    tipoPernoctante: "clientePool",
                    pasaporte: pasaporte,
                    clienteUID: clienteUID,
                    habitacionUID: habitacionUID
                }
                // pernoctantesObjetoTemporal.push(detallesPernoctante);
                objetoFinal.reservas[reservaUIDDelPernoctante].pernoctantes.push(detallesPernoctante)
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
    }
}