import Decimal from "decimal.js";
import { obtenerTotalReembolsado } from "../../contenedorFinanciero/entidades/reserva/obtenerTotalReembolsado.mjs";
import { pagosDeLaReserva } from "./pagosDeLaReserva.mjs";

export  const detallesPagos = async (reservaUID) => {
    try {

        const detallesPagosReserva = await pagosDeLaReserva(reservaUID);
        const totalReserva = detallesPagosReserva.totalReserva;
        const totalPagado = detallesPagosReserva.totalPagado;
        const listaPagosDeLaReserva = detallesPagosReserva.pagos;

        const totalReembolsado = await obtenerTotalReembolsado(reservaUID);

        let totalCobrado = 0;

        for (const detallesDelPago of listaPagosDeLaReserva) {
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
            totalReembolsado: totalReembolsado.toFixed(2),
            porcentajeReembolsado: porcentajeReembolsado + "%",
            porcentajePagado: porcentajePagadoUI,
            ...detallesPagosReserva
        }
        return ok

    } catch (error) {
        throw error
    }
}