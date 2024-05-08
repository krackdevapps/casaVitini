import Decimal from "decimal.js";
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";
import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";

export const pagosDeLaReserva = async (reservaUID) => {
    try {
        const filtroCadena = /^[0-9]+$/;
        if (!reservaUID || !filtroCadena.test(reservaUID)) {
            const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
            throw new Error(error);
        }
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;

        /*
        promedioNetoPorNoche
        totalReservaNetoSinOfertas
        totalReservaNeto
        totalDescuentosAplicados
        totalImpuestos
        totalConImpuestos
        */
        const consultaTotales = `
            SELECT
                "totalConImpuestos"
            FROM 
                "reservaTotales"
            WHERE 
                reserva = $1;`;
        const resuelveConsultaTotales = await conexion.query(consultaTotales, [reservaUID]);
        if (resuelveConsultaTotales.rowCount === 0) {
            const error = `Esta reserva no tiene totales calculados`;
            // throw new Error(error)
        }
        const totalConImpuestos = resuelveConsultaTotales.rows[0]?.totalConImpuestos ?
            resuelveConsultaTotales.rows[0].totalConImpuestos : "0.00";
        const totalConImpuestosDecimal = new Decimal(totalConImpuestos);
        const ok = {
            totalReserva: totalConImpuestos,
            totalPagado: 0,
            faltantePorPagar: totalConImpuestos,
            pagos: []
        };
        const consultaListaPagos = `
                        SELECT
                            "pagoUID",
                            "plataformaDePago",
                            "tarjetaDigitos",
                            "pagoUIDPasarela",
                            "tarjetaDigitos",
                            to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPagoUTC_ISO", 
                            tarjeta,
                            "chequeUID",
                            cantidad
                        FROM 
                            "reservaPagos"
                        WHERE 
                            reserva = $1
                        ORDER BY
                            "pagoUID" DESC;`;
        const resuelveConsultaListaDePagos = await conexion.query(consultaListaPagos, [reservaUID]);
        if (resuelveConsultaListaDePagos.rowCount === 0) {
        }
        if (resuelveConsultaListaDePagos.rowCount > 0) {
            const pagosDeLaReserva = resuelveConsultaListaDePagos.rows;
            let pagoResultadoFinal = 0;
            for (const detallesDelPago of pagosDeLaReserva) {
                const pagoUID = detallesDelPago.pagoUID;
                const plataformaDePago = detallesDelPago.plataformaDePago;
                const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela;
                const fechaPagoUTC_ISO = detallesDelPago.fechaPagoUTC_ISO;
                const fechaPagoTZ_ISO = DateTime.fromISO(fechaPagoUTC_ISO, { zone: 'utc' })
                    .setZone(zonaHoraria)
                    .toISO();
                detallesDelPago.fechaPagoTZ_ISO = fechaPagoTZ_ISO;

                const cantidadDelPago = new Decimal(detallesDelPago.cantidad);
                const consultaReembolsos = `
                    SELECT
                        cantidad
                    FROM 
                        "reservaReembolsos"
                    WHERE 
                        "pagoUID" = $1;`;
                const resuelveConsultaReembolsos = await conexion.query(consultaReembolsos, [pagoUID]);
                if (resuelveConsultaReembolsos.rowCount === 0) {
                    ok.pagos.push(detallesDelPago);
                    pagoResultadoFinal = cantidadDelPago.plus(pagoResultadoFinal);
                }
                if (resuelveConsultaReembolsos.rowCount > 0) {
                    // if (plataformaDePago === "pasarela") {
                    //     const actualizarReembolsos = await componentes.administracion.reservas.transacciones.actualizarReembolsosDelPagoDesdeSquare(pagoUID, pagoUIDPasarela)
                    //     if (actualizarReembolsos?.error) {
                    //         ok.estadoPasarela = actualizarReembolsos.error
                    //     }
                    // }
                    const reembolsosDelPago = resuelveConsultaReembolsos.rows;
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