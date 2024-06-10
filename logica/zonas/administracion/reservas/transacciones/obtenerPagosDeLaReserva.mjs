import Decimal from "decimal.js";
import { obtenerTotalReembolsado } from "../../../../sistema/precios/entidades/reserva/obtenerTotalReembolsado.mjs";
import { detallesReserva } from "../../../../sistema/reservas/detallesReserva.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { pagosDeLaReserva as pagosDeLaReserva_ } from "../../../../sistema/reservas/pagosDeLaReserva.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";



export const obtenerPagosDeLaReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
  
        const detallesPagosReserva = await pagosDeLaReserva_(reservaUID);
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
        throw errorCapturado
    }
}