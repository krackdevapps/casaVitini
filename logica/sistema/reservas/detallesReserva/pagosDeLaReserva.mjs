import Decimal from "decimal.js";
import { DateTime } from "luxon";
import { obtenerTotalesGlobal } from "../../../repositorio/reservas/transacciones/totales/obtenerTotalesGlobal.mjs";
import { obtenerPagosPorReservaUIDConOrdenamiento } from "../../../repositorio/reservas/transacciones/pagos/obtenerPagosPorReservaUIDConOrdenamiento.mjs";
import { obtenerReembolsosPorPagoUID } from "../../../repositorio/reservas/transacciones/reembolsos/obtenerReembolsosPorPagoUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs";

export const pagosDeLaReserva = async (reservaUID) => {
    try {
        const filtroCadena = /^[0-9]+$/;
        if (!reservaUID || !filtroCadena.test(reservaUID)) {
            const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
            throw new Error(error);
        }
        await obtenerReservaPorReservaUID(reservaUID);
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;

        const contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
        const totalFinal = contenedorFinanciero?.desgloseFinanciero?.global?.totales?.totalFinal
        const totalConImpuestos = totalFinal || "0.00";
        const totalConImpuestosDecimal = new Decimal(totalConImpuestos);
        const ok = {
            totalReserva: totalConImpuestos,
            totalPagado: 0,
            faltantePorPagar: totalConImpuestos,
            pagos: []
        };

        const pagosDeLaReserva = await obtenerPagosPorReservaUIDConOrdenamiento(reservaUID)
        if (pagosDeLaReserva.length > 0) {

            let pagoResultadoFinal = 0;
            for (const detallesDelPago of pagosDeLaReserva) {
                const pagoUID = detallesDelPago.pagoUID;
                const plataformaDePagoIDV = detallesDelPago.plataformaDePagoIDV;
                const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela;

                const fechaPago = detallesDelPago.fechaPago;
                const fechaPagoTZ_ISO = DateTime.fromISO(fechaPago, { zone: 'utc' })
                    .setZone(zonaHoraria)
                    .toISO()
                detallesDelPago.fechaPagoTZ_ISO = fechaPagoTZ_ISO;
                const cantidadDelPago = new Decimal(detallesDelPago.cantidad);
                const reembolsosDelPago = await obtenerReembolsosPorPagoUID(pagoUID)
                if (reembolsosDelPago.length === 0) {
                    ok.pagos.push(detallesDelPago);
                    pagoResultadoFinal = cantidadDelPago.plus(pagoResultadoFinal);
                }
                if (reembolsosDelPago.length > 0) {
                    // if (plataformaDePago === "pasarela") {
                    //     const actualizarReembolsos = await componentes.administracion.reservas.transacciones.actualizarReembolsosDelPagoDesdeSquare(pagoUID, pagoUIDPasarela)
                    //     if (actualizarReembolsos?.error) {
                    //         ok.estadoPasarela = actualizarReembolsos.error
                    //     }
                    // }
                    let sumaDeLoReembolsado = 0;
                    for (const detallesDelReembolso of reembolsosDelPago) {
                        const cantidadDelReembolso = new Decimal(detallesDelReembolso.cantidad);
                        sumaDeLoReembolsado = cantidadDelReembolso.plus(sumaDeLoReembolsado);
                    }
                    let reembolsado;
                    if (Number(cantidadDelPago) === Number(sumaDeLoReembolsado)) {
                        reembolsado = "totalmente";
                    }
                    if (Number(cantidadDelPago) > Number(sumaDeLoReembolsado)) {
                        reembolsado = "parcialmente";
                    }
                    if (Number(cantidadDelPago) < Number(sumaDeLoReembolsado)) {
                        reembolsado = "superadamente";
                    }
                    detallesDelPago.sumaDeLoReembolsado = sumaDeLoReembolsado.toFixed(2);
                    detallesDelPago.reembolsado = reembolsado;
                    let diferenciaDelPago = cantidadDelPago.minus(sumaDeLoReembolsado);
                    diferenciaDelPago = new Decimal(diferenciaDelPago);
                    pagoResultadoFinal = diferenciaDelPago.plus(pagoResultadoFinal);
                    ok.pagos.push(detallesDelPago);
                }
                const faltantePorPagar = totalConImpuestosDecimal.minus(pagoResultadoFinal);
                ok.totalPagado = pagoResultadoFinal.toFixed(2);
                ok.faltantePorPagar = faltantePorPagar.toFixed(2);
            }
        }
        return ok;
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}