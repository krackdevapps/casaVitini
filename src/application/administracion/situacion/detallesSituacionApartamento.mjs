import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { eventosDelApartamento } from "../../../shared/calendariosSincronizados/airbnb/eventosDelApartamento.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { horasSalidaEntrada as horasSalidaEntrada_ } from "../../../shared/configuracion/horasSalidaEntrada.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { utilidades } from "../../../shared/utilidades.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerHabitacionesDelApartamento } from "../../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs";
import { obtenerDetallesCliente } from "../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";
import { obtenerClientePoolPorPernoctanteUID } from "../../../infraestructure/repository/pool/obtenerClientePoolPorPernoctanteUID.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from "../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs";
import { obtenerTodosLosPernoctantesDeLaReserva } from "../../../infraestructure/repository/reservas/pernoctantes/obtenerTodosLosPernoctantesDeLaReserva.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerReservasQueRodeanUnaFecha } from "../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasQueRodeanUnaFecha.mjs";

export const detallesSituacionApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        });

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualCompletaTZ = tiempoZH.toISO();
        const fechaActualTZ = tiempoZH.toISODate();
        const horasSalidaEntrada = await horasSalidaEntrada_();
        const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ;
        const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ;
        const objetoFinal = {
            apartamentoUI: apartamento.apartamentoUI,
            zonaIDV: configuracionApartamento.zonaIDV,
            estadoApartamento: configuracionApartamento.estadoConfiguracionIDV,
            apartamentoIDV: apartamentoIDV,
            zonaHoraria: zonaHoraria,
            horaSalida: horaSalidaTZ,
            horaEntrada: horaEntradaTZ,
            estadoPernoctacion: "libre",
            reservas: {}
        };

        const reservasUIDHoy = await obtenerReservasQueRodeanUnaFecha({
            fechaReferencia: fechaActualTZ,
        })

        const identificadoresReservasValidas = []
        for (const reservaEncontrada of reservasUIDHoy) {
            const reservaUID = reservaEncontrada.reservaUID;

            const reserva = await obtenerReservaPorReservaUID(reservaUID)
            const fechaEntrada = reserva.fechaEntrada;
            const fechaSalida = reserva.fechaSalida;


            const fechaConHoraEntrada_ISO_ZH = DateTime.fromISO(
                `${fechaEntrada}T${horaEntradaTZ}`,
                { zone: zonaHoraria })
                .toISO();
            const fechaConHoraSalida_ISO_ZH = DateTime.fromISO(
                `${fechaSalida}T${horaSalidaTZ}`,
                { zone: zonaHoraria })
                .toISO();

            const apartamentoDeLaReserva = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV
            })



            if (apartamentoDeLaReserva?.componenteUID) {
                identificadoresReservasValidas.push(reservaUID)
                const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalida_ISO_ZH, fechaActualCompletaTZ);
                const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaConHoraEntrada_ISO_ZH, fechaConHoraSalida_ISO_ZH);
                const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntrada_ISO_ZH, fechaConHoraSalida_ISO_ZH, fechaActualCompletaTZ);
                let porcentajeFinal = porcentajeTranscurrido;
                if (porcentajeTranscurrido >= 100) {
                    porcentajeFinal = "100";
                }
                if (porcentajeTranscurrido <= 0) {
                    porcentajeFinal = "0";
                }
                const diaEntrada = utilidades.comparadorFechas_ISO(fechaEntrada, fechaActualTZ);
                const diaSalida = utilidades.comparadorFechas_ISO(fechaSalida, fechaActualTZ);

                let identificadoDiaLimite = "diaInterno";
                if (diaEntrada) {
                    identificadoDiaLimite = "diaDeEntrada";
                } else if (diaSalida) {
                    identificadoDiaLimite = "diaDeSalida";
                }

                let numeroDiaReservaUI;
                if (cantidadDias.diasDiferencia > 1) {
                    numeroDiaReservaUI = cantidadDias.diasDiferencia.toFixed(0) + " días";
                }
                if (cantidadDias.diasDiferencia === 1) {
                    numeroDiaReservaUI = cantidadDias.diasDiferencia.toFixed(0) + " día y " + cantidadDias.horasDiferencia.toFixed(0) + " horas";
                }
                if (cantidadDias.diasDiferencia === 0) {
                    if (cantidadDias.horasDiferencia > 1) {
                        numeroDiaReservaUI = cantidadDias.horasDiferencia.toFixed(0) + " horas";
                    }
                    if (cantidadDias.horasDiferencia === 1) {
                        numeroDiaReservaUI = cantidadDias.horasDiferencia.toFixed(0) + " hora";
                    }
                    if (cantidadDias.horasDiferencia === 0) {
                        numeroDiaReservaUI = "menos de una hora";
                    }
                }

                const estructuraReserva = {
                    reservaUID: reservaUID,
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    diaLimite: identificadoDiaLimite,
                    tiempoRestante: tiempoRestante,
                    cantidadDias: cantidadDias,
                    numeroDiasReserva: numeroDiaReservaUI,
                    porcentajeTranscurrido: porcentajeFinal + '%',
                    habitaciones: [],
                    pernoctantes: []
                };
                objetoFinal.estadoPernoctacion = "ocupado";
                const apartamentoUID = apartamentoDeLaReserva.componenteUID;

                const habitacionesDelApartamento = await obtenerHabitacionesDelApartamento({
                    reservaUID: reservaUID,
                    apartamentoUID: apartamentoUID
                })

                estructuraReserva.habitaciones = habitacionesDelApartamento

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

            if (clienteUID) {
                const cliente = await obtenerDetallesCliente(clienteUID)
                const nombre = cliente.nombre;
                const primerApellido = cliente.primerApellido || "";
                const segundoApellido = cliente.segundoApellido || "";
                const pasaporte = cliente.pasaporte;
                const constructorNombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;

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

                objetoFinal.reservas[reservaUIDDelPernoctante].pernoctantes.push(detallesPernoctante)
            } else {
                const pernoctanteUID = pernoctante.pernoctanteUID;
                const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
                const nombreCompleto = clientePool.nombreCompleto;

                const pasaporte = clientePool.pasaporte;
                const detallesPernoctante = {
                    nombreCompleto: nombreCompleto,
                    tipoPernoctante: "clientePool",
                    pasaporte: pasaporte,
                    clienteUID: clienteUID,
                    habitacionUID: habitacionUID
                }

                objetoFinal.reservas[reservaUIDDelPernoctante].pernoctantes.push(detallesPernoctante)
            }
        }

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
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}
