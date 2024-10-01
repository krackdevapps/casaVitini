import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { utilidades } from "../../../shared/utilidades.mjs";
import { apartamentosOcupadosHoy_paraSitaucion } from "../../../shared/calendariosSincronizados/airbnb/apartamentosOcupadosHoyAirbnb_paraSitaucion.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { horasSalidaEntrada as horasSalidaEntrada_ } from "../../../shared/configuracion/horasSalidaEntrada.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerReservasQueRodeanUnaFecha } from "../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasQueRodeanUnaFecha.mjs";

export const obtenerSituacion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentosObjeto = {};
        const configuracionesDeAlojamiento = await obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc()
        if (configuracionesDeAlojamiento.length === 0) {
            const error = "No hay apartamentos configurados";
            throw new Error(error);
        }
        for (const configiguracionApartamento of configuracionesDeAlojamiento) {
            const apartamentoIDV = configiguracionApartamento.apartamentoIDV;
            const zonaIDV = configiguracionApartamento.zonaIDV;
            const estadoApartamento = configiguracionApartamento.estadoConfiguracionIDV;
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            });
            apartamentosObjeto[apartamentoIDV] = {
                apartamentoUI: apartamento.apartamentoUI,
                estadoApartamento: estadoApartamento,
                zonaIDV,
                reservas: [],
                estadoPernoctacion: "libre"
            };
        }
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualCompletaTZ = tiempoZH.toISO();
        const fechaActualTZ = tiempoZH.toISODate();
        const fechaActualUTC = DateTime.now().toUTC().toISODate();
        const diaHoyTZ = tiempoZH.day;
        const mesPresenteTZ = tiempoZH.month;
        const anoPresenteTZ = tiempoZH.year;
        const horaPresenteTZ = tiempoZH.hour;
        const minutoPresenteTZ = tiempoZH.minute;

        const reservasUIDHoy = await obtenerReservasQueRodeanUnaFecha({
            fechaReferencia: fechaActualTZ,
        })

        const ok = {};
        if (reservasUIDHoy.length === 0) {
            ok.ok = apartamentosObjeto;
        }
        if (reservasUIDHoy.length > 0) {
            const horasSalidaEntrada = await horasSalidaEntrada_();
            const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ;
            const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ;
            //ok.fechaUTC = fechaActualUTC;
            ok.fechaTZ = `${diaHoyTZ}/${mesPresenteTZ}/${anoPresenteTZ}`;
            ok.horaTZ = `${horaPresenteTZ}:${minutoPresenteTZ}`;
            ok.horaEntrada = horaEntradaTZ;
            ok.horaSalida = horaSalidaTZ;
            for (const reservaObjetoUID of reservasUIDHoy) {
                const reservaUID = reservaObjetoUID.reservaUID
                const reserva = await obtenerReservaPorReservaUID(reservaUID)
                // Fecha de la base de datos
                const fechaEntradaReservaISO = reserva.fechaEntrada;
                const fechaSalidaReservaISO = reserva.fechaSalida;
                // Formatos fecha
                const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
                const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();

                const apartamentosDeLaReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
                if (apartamentosDeLaReserva.length > 0) {
                    apartamentosDeLaReserva.forEach((apartamento) => {
                        if (apartamentosObjeto[apartamento.apartamentoIDV]) {
                            apartamentosObjeto[apartamento.apartamentoIDV].estadoPernoctacion = "ocupado";
                        }
                        const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                        const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH);
                        const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                        let porcentajeFinal = porcentajeTranscurrido;
                        if (porcentajeTranscurrido >= 100) {
                            porcentajeFinal = "100";
                        }
                        if (porcentajeTranscurrido <= 0) {
                            porcentajeFinal = "0";
                        }
                        const diaEntrada = utilidades.comparadorFechas_ISO(fechaEntradaReservaISO, fechaActualTZ);
                        const diaSalida = utilidades.comparadorFechas_ISO(fechaSalidaReservaISO, fechaActualTZ);
                        let identificadoDiaLimite = "diaInterno";
                        if (diaEntrada) {
                            identificadoDiaLimite = "diaDeEntrada";
                        }
                        if (diaSalida) {
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
                        const detalleReservaApartamento = {
                            reservaUID,
                            diaLimite: identificadoDiaLimite,
                            fechaEntrada: fechaEntradaReservaISO,
                            fechaSalida: fechaSalidaReservaISO,
                            porcentajeTranscurrido: porcentajeFinal + '%',
                            tiempoRestante: tiempoRestante,
                            numeroDiasReserva: numeroDiaReservaUI
                        };
                        if (apartamentosObjeto[apartamento.apartamentoIDV]) {
                            apartamentosObjeto[apartamento.apartamentoIDV].reservas.push(detalleReservaApartamento);
                        }
                    });
                }
            }
            ok.ok = apartamentosObjeto;
        }
        // buscar reservas en el dia actual
        const eventosCalendarios_airbnb = await apartamentosOcupadosHoy_paraSitaucion(fechaActualTZ);
        for (const calendariosSincronizadosAirbnb of eventosCalendarios_airbnb) {
            const apartamentoIDV_destino = calendariosSincronizadosAirbnb.apartamentoIDV;
            const eventosDelApartamento = calendariosSincronizadosAirbnb.eventos;
            ok.ok[apartamentoIDV_destino].calendariosSincronizados = {};
            ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb = {};
            ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb.eventos = eventosDelApartamento;
            if (eventosDelApartamento.length > 0) {
                ok.ok[apartamentoIDV_destino].estadoPernoctacion = "ocupado";
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}