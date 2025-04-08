import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { utilidades } from "../../../../../shared/utilidades.mjs";
import { actualizarEstadoPago } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizarEstadoPago.mjs";

import { detallesDelPago as detallesDelPago_square } from "../../../../../infraestructure/paymentGateway/square/detallesDelPago.mjs";
import { insertarPago } from "../../../../../infraestructure/repository/reservas/transacciones/pagos/insertarPago.mjs";
import { obtenerPagoPorPagoUIDPasaresa } from "../../../../../infraestructure/repository/reservas/transacciones/pagos/obtenerPagoPorPagoUIDPasaresa.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";

export const crearPagoManual = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })
        const plataformaDePago = validadoresCompartidos.tipos.cadena({
            string: entrada.body.plataformaDePago,
            nombreCampo: "El nombre de plataformaDePago",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const cantidad = entrada.body.cantidad

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const conceptoPago = validadoresCompartidos.tipos.cadena({
            string: entrada.body.conceptoPago,
            nombreCampo: "El campo de concepto de pago",
            filtro: "cadenaBase64",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",

        })

        const cantidadValidada = (cantidad) => {
            const cv = validadoresCompartidos.tipos.cadena({
                string: cantidad,
                nombreCampo: "El campo cantidad",
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                devuelveUnTipoNumber: "no",
                devuelveUnTipoBigInt: "no"
            })
            return cv
        }

        await obtenerReservaPorReservaUID(reservaUID);
        const fechaActual = DateTime.utc().toISO();
        const estructuraFinal = {};
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;

        if (plataformaDePago === "efectivo") {
            const cantidad_ = cantidadValidada(cantidad)
            const nuevoPago = {
                plataformaDePago: plataformaDePago,
                reservaUID: reservaUID,
                cantidadConPunto: cantidad_,
                fechaPago: fechaActual,
                conceptoPago: conceptoPago,

            };
            const pagoUID = await insertarPago(nuevoPago)
            const fechaPago = pagoUID.fechaPago;
            const fechaPagoLocal = DateTime.fromISO(fechaPago, { zone: zonaHoraria });
            pagoUID.fechaPagoLocal = fechaPagoLocal;

            estructuraFinal.ok = "Se ha insertado el nuevo pago en efectivo";
            estructuraFinal.detallesDelPago = pagoUID;
        } else if (plataformaDePago === "cheque") {
            const cantidad_ = cantidadValidada(cantidad)

            const chequeUID = validadoresCompartidos.tipos.cadena({
                string: entrada.body.chequeUID,
                nombreCampo: "El campo del chequeUID",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })

            const nuevoPago = {
                plataformaDePago: plataformaDePago,
                reservaUID: reservaUID,
                cantidadConPunto: cantidad_,
                fechaPago: fechaActual,
                chequeUID: chequeUID,
                conceptoPago: conceptoPago,
            };
            const pagoUID = await insertarPago(nuevoPago)
            const fechaPago = pagoUID.fechaPago;
            const fechaPagoLocal = DateTime.fromISO(fechaPago, { zone: zonaHoraria });
            pagoUID.fechaPagoLocal = fechaPagoLocal;
            estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque";

            estructuraFinal.detallesDelPago = pagoUID;
        } else if (plataformaDePago === "transferenciaBancaria") {
            const cantidad_ = cantidadValidada(cantidad)


            const transferenciaUID = validadoresCompartidos.tipos.cadena({
                string: entrada.body.transferenciaUID,
                nombreCampo: "El campo del transferenciaUID",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })


            const nuevoPago = {
                plataformaDePago: plataformaDePago,
                reservaUID: reservaUID,
                cantidadConPunto: cantidad_,
                fechaPago: fechaActual,
                transferenciaUID: transferenciaUID,
                conceptoPago: conceptoPago
            };
            const pagoUID = await insertarPago(nuevoPago)
            const fechaPago = pagoUID.fechaPago;
            const fechaPagoLocal = DateTime.fromISO(fechaPago, { zone: zonaHoraria });
            pagoUID.fechaPagoLocal = fechaPagoLocal;
            estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque";
            estructuraFinal.detallesDelPago = pagoUID;

        } else if (plataformaDePago === "pasarela") {
            const deshabilitado = "La opción de asociar un pago a la pasarela está temporalmente deshabilitada.";
            throw new Error(deshabilitado);

            const pagoUIDPasarela = validadoresCompartidos.tipos.cadena({
                string: entrada.body.pagoUIDPasarela,
                nombreCampo: "El nombre de pagoUIDPasarela",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })

            const dataPago = {
                pagoUIDPasarela: pagoUIDPasarela,
                reservaUID: reservaUID,
                conceptoPago: conceptoPago
            }
            const detallesDelPagoPasarela = await obtenerPagoPorPagoUIDPasaresa(dataPago)
            if (detallesDelPagoPasarela.length > 0) {
                const error = "Ya existe este id del pago asociado a esta reserva";
                throw new Error(error);
            }
            const detallesDelPago = await detallesDelPago_square(pagoUIDPasarela);
            if (detallesDelPago.error) {
                const errorUID = detallesDelPago.error.errors[0].code;
                let error;
                switch (errorUID) {
                    case "NOT_FOUND":
                        error = "La pasarela informa de que el identificador de pago que tratas de asociar con Casa Vitini no existe. Por favor, revisa el identificador de pago.";
                        throw new Error(error);
                    default:
                        error = "La pasarela informa de un error genérico";
                        throw new Error(error);
                }
            }

            const pagoUIDPasarelaVerificado = detallesDelPago.id;
            const cantidadVerificada = detallesDelPago.amountMoney.amount;
            const cantidadFormateada = utilidades.deFormatoSquareAFormatoSQL(cantidadVerificada);
            const tarjeta = detallesDelPago.cardDetails.card.cardBrand;
            const tarjetaDigitos = detallesDelPago.cardDetails.card.last4;
            const fechaPago = detallesDelPago.createdAt;
            const nuevoPago = {
                plataformaDePago: plataformaDePago,
                tarjeta: tarjeta,
                tarjetaDigitos: tarjetaDigitos,
                pagoUIDPasarela: pagoUIDPasarelaVerificado,
                reservaUID: reservaUID,
                cantidadConPunto: cantidadFormateada,
                fechaPago: fechaPago,


            };
            const pagoUID = await sql.insertarPago(nuevoPago);
            const fechaPagoLocal = DateTime.fromISO(fechaPago, { zone: zonaHoraria });
            pagoUID.fechaPagoLocal = fechaPagoLocal;

            estructuraFinal.ok = "Se han insertado los datos importados de la pasarela.";
            estructuraFinal.detallesDelPago = pagoUID;
        } else if (plataformaDePago === "tarjeta") {
            const cantidad_ = cantidadValidada(cantidad)

            const tarjetaUltimos = validadoresCompartidos.tipos.cadena({
                string: entrada.body.tarjetaUltimos,
                nombreCampo: "El campo tarjetaUltimos",
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                maximoDeLargo: 4,
                devuelveUnTipoNumber: "no"
            })
            const nuevoPago = {
                plataformaDePago: plataformaDePago,
                reservaUID: reservaUID,
                cantidadConPunto: cantidad_,
                fechaPago: fechaActual,
                tarjetaDigitos: tarjetaUltimos,
                conceptoPago: conceptoPago

            };
            const pagoUID = await insertarPago(nuevoPago)
            const fechaPago = pagoUID.fechaPago;
            const fechaPagoLocal = DateTime.fromISO(fechaPago, { zone: zonaHoraria });
            pagoUID.fechaPagoLocal = fechaPagoLocal;

            estructuraFinal.ok = "Se ha insertado el nuevo pago hecho con tarjeta de manera externa como en un TPV";
            estructuraFinal.detallesDelPago = pagoUID;
        } else {
            const error = "El campo plataformaDePago solo admite una cadena mayúsculas y minúsculas sin espacios. Las plataformas de pagos son tarjeta, efectivo, pasarela y tranferenciaBancaria";
            throw new Error(error);
        }

        await actualizarEstadoPago(reservaUID);
        return estructuraFinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}