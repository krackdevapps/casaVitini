import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { utilidades } from "../../../../componentes/utilidades.mjs";
import { actualizarEstadoPago } from "../../../../sistema/precios/entidades/reserva/actualizarEstadoPago.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { detallesDelPago as detallesDelPago_square } from "../../../../componentes/pasarelas/square/detallesDelPago.mjs";
import { insertarPago } from "../../../../repositorio/reservas/transacciones/pagos/insertarPago.mjs";
import { obtenerPagoPorPagoUIDPasaresa } from "../../../../repositorio/reservas/transacciones/pagos/obtenerPagoPorPagoUIDPasaresa.mjs";
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
        throw errorCapturado
    }
}