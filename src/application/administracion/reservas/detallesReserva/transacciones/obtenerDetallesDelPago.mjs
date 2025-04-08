import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";

import Decimal from "decimal.js";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerPagoPorPagoUID } from "../../../../../infraestructure/repository/reservas/transacciones/pagos/obtenerPagoPorPagoUID.mjs";
import { obtenerReembolsosPorPagoUID_ordenados } from "../../../../../infraestructure/repository/reservas/transacciones/reembolsos/obtenerReembolsosPorPagoUID_ordenados.mjs";

export const obtenerDetallesDelPago = async (entrada) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El campo pagoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const detallesDelPago = await obtenerPagoPorPagoUID(pagoUID)

        const cantidadDelPago = detallesDelPago.cantidad;
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaPago = detallesDelPago.fechaPago;
        const fechaPagoLocal = DateTime.fromISO(fechaPago, { zone: zonaHoraria });
        detallesDelPago.fechaPagoLocal = fechaPagoLocal;

        const ok = {
            ok: "Aquí tienes los pagos de esta reserva",
            detallesDelPago: detallesDelPago,
            deglosePorReembolso: []
        };
        const reembolsosDelPago = await obtenerReembolsosPorPagoUID_ordenados(pagoUID)
        if (reembolsosDelPago.length > 0) {
            let sumaDeLoReembolsado = 0;
            for (const detallesDelReembolso of reembolsosDelPago) {
                const reembolsoUID = detallesDelReembolso.reembolsoUID;
                const plataformaDePagoIDV = detallesDelReembolso.plataformaDePagoIDV;
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
                    plataformaDePagoIDV: plataformaDePagoIDV,
                    cantidad: cantidadDelReembolso.toFixed(2),
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

        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}