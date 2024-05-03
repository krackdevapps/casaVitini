import Decimal from "decimal.js";
import { componentes } from "../../../../componentes.mjs";
import { obtenerTotalReembolsado } from "../../../../sistema/sistemaDePrecios/obtenerTotalReembolsado.mjs";
import { detallesReserva } from "../../../../sistema/sistemaDeReservas/detallesReserva.mjs";


export const obtenerPagosDeLaReserva = async (entrada, salida) => {
                    try {
                        const reservaUID = entrada.body.reservaUID;
                        const filtroCadena = /^[0-9]+$/;
                        if (!reservaUID || !filtroCadena.test(reservaUID)) {
                            const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        const detallesPagosReserva = await componentes.administracion.reservas.transacciones.pagosDeLaReserva(reservaUID);
                        const metadatos = {
                            reservaUID: Number(reservaUID),
                            solo: "informacionGlobal"
                        };
                        const resuelveDetallesReserva = await detallesReserva(metadatos);
                        const estadoPago = resuelveDetallesReserva.reserva.estadoPago;
                        const totalReembolsado = await obtenerTotalReembolsado(reservaUID);
                        const totalReserva = detallesPagosReserva.totalReserva;
                        const totalPagado = detallesPagosReserva.totalPagado;
                        let totalCobrado = 0;
                        const pagosDeLaReserva = detallesPagosReserva.pagos;
                        for (const detallesDelPago of pagosDeLaReserva) {
                            const cantidadDelPago = detallesDelPago.cantidad;
                            const suma = new Decimal(totalCobrado).plus(cantidadDelPago);
                            totalCobrado = suma;
                        }
                        let porcentajeReembolsado = "0.00";
                        if (totalPagado > 0) {
                            porcentajeReembolsado = new Decimal(totalReembolsado).dividedBy(totalCobrado).times(100).toFixed(2);
                        }
                        const porcentajePagado = new Decimal(totalPagado).dividedBy(totalReserva).times(100).toFixed(2);
                        const porcentajePagadoUI = porcentajePagado !== "Infinity" ? porcentajePagado + "%" : "0.00%";
                        const ok = {
                            ok: "Aqui tienes los pagos de esta reserva",
                            estadoPago: estadoPago,
                            totalReembolsado: totalReembolsado.toFixed(2),
                            porcentajeReembolsado: porcentajeReembolsado + "%",
                            porcentajePagado: porcentajePagadoUI
                        };
                        const okFusionado = { ...ok, ...detallesPagosReserva };
                        salida.json(okFusionado);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error);
                    }
                }