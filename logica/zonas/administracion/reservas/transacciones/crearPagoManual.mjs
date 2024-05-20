import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { utilidades } from "../../../../componentes/utilidades.mjs";
import { actualizarEstadoPago } from "../../../../sistema/precios/actualizarEstadoPago.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { detallesDelPago as detallesDelPago_square } from "../../../../componentes/pasarelas/square/detallesDelPago.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { insertarPago } from "../../../../repositorio/reservas/transacciones/insertarPago.mjs";
import { obtenerPagoPorPagoUIDPasaresa } from "../../../../repositorio/reservas/transacciones/obtenerPagoPorPagoUIDPasaresa.mjs";
import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const crearPagoManual = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const plataformaDePago = validadoresCompartidos.tipos.cadena({
            string: entrada.body.plataformaDePago,
            nombreCampo: "El nombre de plataformaDePago",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const cantidad = entrada.body.cantidad

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const cantidadValidada = (cantidad) => {
            const cv = validadoresCompartidos.tipos.cadena({
                string: cantidad,
                nombreCampo: "El campo cantidad",
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            return cv
        }

        await obtenerReservaPorReservaUID(reservaUID);

        const fechaActual = DateTime.utc().toISO();
        // const sql = {
        //     insertarPago: async (datosDelNuevoPago) => {
        //         try {
        //             const asociarPago = `
        //                                 INSERT INTO
        //                                 "reservaPagos"
        //                                 (
        //                                 "plataformaDePago",
        //                                 tarjeta,
        //                                 "tarjetaDigitos",
        //                                 "pagoUIDPasarela",
        //                                 reserva,
        //                                 cantidad,
        //                                 "fechaPago",
        //                                 "chequeUID",
        //                                 "transferenciaUID"
        //                                 )
        //                                 VALUES 
        //                                 ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        //                                 RETURNING
        //                                 "pagoUID",
        //                                 "plataformaDePago",
        //                                 "tarjetaDigitos",
        //                                 "pagoUIDPasarela",
        //                                 cantidad,
        //                                 to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPagoUTC_ISO", 
        //                                 "chequeUID",
        //                                 "transferenciaUID"
        //                                 `;
        //             const datosPago = [
        //                 datosDelNuevoPago.plataformaDePago,
        //                 datosDelNuevoPago.tarjeta,
        //                 datosDelNuevoPago.tarjetaDigitos,
        //                 datosDelNuevoPago.pagoUIDPasarela,
        //                 datosDelNuevoPago.reservaUID,
        //                 datosDelNuevoPago.cantidadConPunto,
        //                 datosDelNuevoPago.fechaPago,
        //                 datosDelNuevoPago.chequeUID,
        //                 datosDelNuevoPago.transferenciaUID
        //             ];
        //             const consulta = await conexion.query(asociarPago, datosPago);
        //             const detallesDelPagoNuevo = consulta.rows[0];
        //             const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        //             const fechaPagoUTC_ISO = detallesDelPagoNuevo.fechaPagoUTC_ISO;
        //             const fechaPagoTZ_ISO = DateTime.fromISO(fechaPagoUTC_ISO, { zone: 'utc' })
        //                 .setZone(zonaHoraria)
        //                 .toISO();
        //             detallesDelPagoNuevo.fechaPagoTZ_ISO = fechaPagoTZ_ISO;

        //             return detallesDelPagoNuevo;
        //         } catch (errorCapturado) {
        //             throw errorCapturado;
        //         }
        //     }
        // };


        const estructuraFinal = {};

        if (plataformaDePago === "efectivo") {
            const cantidad_ = cantidadValidada(cantidad)
            const nuevoPago = {
                plataformaDePago: plataformaDePago,
                reservaUID: reservaUID,
                cantidadConPunto: cantidad_,
                fechaPago: fechaActual,

            };
            const pagoUID = await insertarPago(nuevoPago)
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
                chequeUID: chequeUID
            };
            const pagoUID = await insertarPago(nuevoPago)
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
                transferenciaUID: transferenciaUID
            };
            const pagoUID = await insertarPago(nuevoPago)
            estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque";
            estructuraFinal.detallesDelPago = pagoUID;

        } else if (plataformaDePago === "pasarela") {
            const deshabilitado = "La opcion de asociar un pago a la pasarela esta temporalmente deshabilitada";
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
                reservaUID: reservaUID
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
                        error = "La pasarela informa de que el idenficador de pago que tratas de asocias con Casa Vitini no existe, por favor revisa el identificador de pago";
                        throw new Error(error);
                    default:
                        error = "La pasarela informa de un error generico";
                        throw new Error(error);
                }
            }
            // Detalles del pago
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
                //pagadorNombre: pagadorNombre,
                //pagadorPasaporte: pagadorPasaporte
            };
            const pagoUID = await sql.insertarPago(nuevoPago);
            estructuraFinal.ok = "Se ha insertado los datos importados de la pasarela";
            estructuraFinal.detallesDelPago = pagoUID;
        } else if (plataformaDePago === "tarjeta") {
            const cantidad_ = cantidadValidada(cantidad)

            const tarjetaUltimos = validadoresCompartidos.tipos.cadena({
                string: entrada.body.tarjetaUltimos,
                nombreCampo: "El campo tarjetaUltimos",
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                maximoDeLargo: 4
            })
            const nuevoPago = {
                plataformaDePago: plataformaDePago,
                reservaUID: reservaUID,
                cantidadConPunto: cantidad_,
                fechaPago: fechaActual,
                tarjetaDigitos: tarjetaUltimos
            };
            const pagoUID = await insertarPago(nuevoPago)
            estructuraFinal.ok = "Se ha insertado el nuevo pago hecho con tarjeta de manera externa como en un TPV";
            estructuraFinal.detallesDelPago = pagoUID;
        } else {
            const error = "El campo plataformaDePago solo admite una cadena mayúsculas y minúsculas sin espacios. Las plataformas de pagos son tarjeta, efectivo, pasarela y tranferenciaBancaria";
            throw new Error(error);
        }

        await actualizarEstadoPago(reservaUID);
        salida.json(estructuraFinal);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}