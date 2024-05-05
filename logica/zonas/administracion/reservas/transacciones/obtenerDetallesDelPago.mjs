import { DateTime } from "luxon";
import { conexion } from "../../../../componentes/db.mjs";
import { codigoZonaHoraria } from "../../../../sistema/codigoZonaHoraria.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import Decimal from "decimal.js";

export const obtenerDetallesDelPago = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return
        const pagoUID = entrada.body.pagoUID;
        const filtroCadena = /^[0-9]+$/;
        if (!pagoUID || !filtroCadena.test(pagoUID)) {
            const error = "el campo 'pagoUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
            throw new Error(error);
        }
        const validarPago = `
                            SELECT
                                "plataformaDePago",
                                "pagoUID",
                                "pagoUIDPasarela",
                                "tarjetaDigitos",
                                to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPagoUTC_ISO", 
                                tarjeta,
                                cantidad
                            FROM 
                                "reservaPagos"
                            WHERE 
                                "pagoUID" = $1;`;
        const reseulveValidarPago = await conexion.query(validarPago, [pagoUID]);

        if (reseulveValidarPago.rowCount === 0) {
            const error = "No existe ningún pago con ese pagoUID";
            throw new Error(error);
        }
        if (reseulveValidarPago.rowCount === 1) {
            // Determinar tipo de pago
            const detallesDelPago = reseulveValidarPago.rows[0];
            const plataformaDePagoControl = detallesDelPago.plataformaDePago;
            const cantidadDelPago = detallesDelPago.cantidad;
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const fechaPagoUTC_ISO = detallesDelPago.fechaPagoUTC_ISO;
            const fechaPagoTZ_ISO = DateTime.fromISO(fechaPagoUTC_ISO, { zone: 'utc' })
                .setZone(zonaHoraria)
                .toISO();
            detallesDelPago.fechaPagoTZ_ISO = fechaPagoTZ_ISO;


            const ok = {
                ok: "Aqui tienes los pagos de esta reserva",
                detallesDelPago: detallesDelPago,
                deglosePorReembolso: []
            };
            // if (plataformaDePagoControl === "pasarela") {
            //     const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela
            //     const actualizarReembolsos = await componentes.administracion.reservas.transacciones.actualizarReembolsosDelPagoDesdeSquare(pagoUID, pagoUIDPasarela)
            //     if (actualizarReembolsos?.error) {
            //         ok.estadoPasarela = actualizarReembolsos.error
            //     }
            // }
            const consultaReembolsos = `
                                    SELECT
                                        "reembolsoUID",
                                        cantidad,
                                        "plataformaDePago",
                                        "reembolsoUIDPasarela",
                                        estado,
                                        to_char("fechaCreacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaCreacionUTC_ISO", 
                                        to_char("fechaActualizacion", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaActualizacionUTC_ISO"
                                    FROM 
                                        "reservaReembolsos"
                                    WHERE 
                                        "pagoUID" = $1
                                    ORDER BY
                                        "reembolsoUID" DESC;`;
            const resuelveConsultaReembolsos = await conexion.query(consultaReembolsos, [pagoUID]);
            if (resuelveConsultaReembolsos.rowCount > 0) {
                const reembolsosDelPago = resuelveConsultaReembolsos.rows;
                let sumaDeLoReembolsado = 0;
                for (const detallesDelReembolso of reembolsosDelPago) {
                    const reembolsoUID = detallesDelReembolso.reembolsoUID;
                    const plataformaDePagoObtenida = detallesDelReembolso.plataformaDePago;
                    const cantidadDelReembolso = new Decimal(detallesDelReembolso.cantidad);
                    const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
                    const estado = detallesDelReembolso.estado;
                    sumaDeLoReembolsado = cantidadDelReembolso.plus(sumaDeLoReembolsado);

                    const fechaCreacionUTC_ISO = detallesDelReembolso.fechaCreacionUTC_ISO;
                    const fechaCreacionTZ_ISO = DateTime.fromISO(fechaCreacionUTC_ISO, { zone: 'utc' })
                        .setZone(zonaHoraria)
                        .toISO();
                    detallesDelReembolso.fechaCreacionTZ_ISO = fechaCreacionTZ_ISO;
                    const fechaActualizacionUTC_ISO = detallesDelReembolso.fechaActualizacionUTC_ISO;
                    const fechaActualizacionTZ_ISO = DateTime.fromISO(fechaActualizacionUTC_ISO, { zone: 'utc' })
                        .setZone(zonaHoraria)
                        .toISO();
                    detallesDelReembolso.fechaActualizacionTZ_ISO = fechaActualizacionTZ_ISO;
                    const estructuraReembolso = {
                        reembolsoUID: reembolsoUID,
                        plataformaDePago: plataformaDePagoObtenida,
                        cantidad: cantidadDelReembolso,
                        reembolsoUIDPasarela: reembolsoUIDPasarela,
                        estado: estado,
                        fechaCreacionUTC_ISO: fechaCreacionUTC_ISO,
                        fechaCreacionTZ_ISO: fechaCreacionTZ_ISO,
                        fechaActualizacionUTC_ISO: fechaActualizacionUTC_ISO,
                        fechaActualizacionTZ_ISO: fechaActualizacionTZ_ISO,
                    };
                    ok.deglosePorReembolso.push(estructuraReembolso);
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
                ok.detallesDelPago.sumaDeLoReembolsado = sumaDeLoReembolsado.toFixed(2);
                ok.detallesDelPago.reembolsado = reembolsado;
            }
            //ok.deglosePorReembolso.push(detallesDelPago)
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}