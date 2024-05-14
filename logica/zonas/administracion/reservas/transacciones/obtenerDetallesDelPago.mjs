import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import Decimal from "decimal.js";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerPagoPorPagoUID } from "../../../../repositorio/reservas/transacciones/obtenerPagoPorPagoUID.mjs";
import { obtenerReembolsosPorPagoUID } from "../../../../repositorio/reservas/transacciones/obtenerReembolsosPorPagoUID.mjs";

export const obtenerDetallesDelPago = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El campo pagoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const detallesDelPago = await obtenerPagoPorPagoUID(pagoUID)
        // Determinar tipo de pago
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
        const reembolsosDelPago = await obtenerReembolsosPorPagoUID(pagoUID)
        if (reembolsosDelPago.length > 0) {
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

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}