import { DateTime } from "luxon";
import { conexion } from "../../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { codigoZonaHoraria } from "../../../../sistema/codigoZonaHoraria.mjs";
import { utilidades } from "../../../../componentes/utilidades.mjs";
import { actualizarEstadoPago } from "../../../../sistema/sistemaDePrecios/actualizarEstadoPago.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { detallesDelPago as detallesDelPago_square} from "../../../../componentes/pasarelas/square/detallesDelPago.mjs";

export const crearPagoManual = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return
        
        const plataformaDePago = entrada.body.plataformaDePago;
        let cantidad = entrada.body.cantidad;
        const reservaUID = entrada.body.reservaUID;
        //let pagadorNombre = entrada.body.pagadorNombre
        //let pagadorPasaporte = entrada.body.pagadorPasaporte
        let chequeUID = entrada.body.chequeUID;
        let transferenciaUID = entrada.body.transferenciaUID;
        let pagoUIDPasarela = entrada.body.pagoUIDPasarela;
        let tarjetaUltimos = entrada.body.tarjetaUltimos;
        const filtroCadena = /^[a-zA-Z0-9\s]+$/;
        const filtroCadenaSinEspacios = /^[a-zA-Z0-9]+$/;
        const filtro4Numeros = /^\d{4}$/;
        const filtroNumeros = /^[0-9]+$/;
        const filtroDecimales = /^\d+\.\d{2}$/;
        if (!plataformaDePago || !filtroCadena.test(plataformaDePago)) {
            const error = "El campo plataformaDePago solo admite minúsculas y mayusculas";
            throw new Error(error);
        }
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const validadores = {
            cantidad: (cantidad) => {
                if (!cantidad || !filtroDecimales.test(cantidad)) {
                    const error = "El campo cantidad solo admite una cadena con un numero con dos decimales separados por punto";
                    throw new Error(error);
                }
                return cantidad;
            },
            pagadorNombre: (pagadorNombre) => {
                if (!pagadorNombre || !filtroCadena.test(pagadorNombre)) {
                    const error = "El campo pagadorNombre solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                    throw new Error(error);
                }
                pagadorNombre = pagadorNombre.toUpperCase();
                return pagadorNombre;
            },
            pagadorPasaporte: (pagadorPasaporte) => {
                if (!pagadorPasaporte || !filtroCadena.test(pagadorPasaporte)) {
                    const error = "El campo pagadorPasaporte solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                    throw new Error(error);
                }
                return pagadorPasaporte;
            },
            chequeUID: (chequeUID) => {
                if (!chequeUID || !filtroCadena.test(chequeUID)) {
                    const error = "El campo chequeUID solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                    throw new Error(error);
                }
                return chequeUID;
            },
            transferenciaUID: (transferenciaUID) => {
                if (!transferenciaUID || !filtroCadena.test(transferenciaUID)) {
                    const error = "El campo transferenciaUID solo admite una cadena con mayúsculas, minúsculas, numero y espacios";
                    throw new Error(error);
                }
                return transferenciaUID;
            },
            pagoUIDPasarela: (pagoUIDPasarela) => {
                if (!pagoUIDPasarela || !filtroCadenaSinEspacios.test(pagoUIDPasarela)) {
                    const error = "El campo pagoUIDPasarela solo admite una cadena con mayúsculas, minúsculas y numero";
                    throw new Error(error);
                }
                return pagoUIDPasarela;
            },
            tarjetaUltimos: (tarjetaUltimos) => {
                if (!tarjetaUltimos || !filtro4Numeros.test(tarjetaUltimos)) {
                    const error = "El campo tarjetaUltimos solo admite una cadena con cuatro numeros";
                    throw new Error(error);
                }
                return tarjetaUltimos;
            },
        };
        const fechaActual = DateTime.utc().toISO();
        const sql = {
            insertarPago: async (datosDelNuevoPago) => {
                try {
                    const asociarPago = `
                                        INSERT INTO
                                        "reservaPagos"
                                        (
                                        "plataformaDePago",
                                        tarjeta,
                                        "tarjetaDigitos",
                                        "pagoUIDPasarela",
                                        reserva,
                                        cantidad,
                                        "fechaPago",
                                        "chequeUID",
                                        "transferenciaUID"
                                        )
                                        VALUES 
                                        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                                        RETURNING
                                        "pagoUID",
                                        "plataformaDePago",
                                        "tarjetaDigitos",
                                        "pagoUIDPasarela",
                                        cantidad,
                                        to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "fechaPagoUTC_ISO", 
                                        "chequeUID",
                                        "transferenciaUID"
                                        `;
                    const datosPago = [
                        datosDelNuevoPago.plataformaDePago,
                        datosDelNuevoPago.tarjeta,
                        datosDelNuevoPago.tarjetaDigitos,
                        datosDelNuevoPago.pagoUIDPasarela,
                        datosDelNuevoPago.reservaUID,
                        datosDelNuevoPago.cantidadConPunto,
                        datosDelNuevoPago.fechaPago,
                        datosDelNuevoPago.chequeUID,
                        datosDelNuevoPago.transferenciaUID
                    ];
                    const consulta = await conexion.query(asociarPago, datosPago);
                    const detallesDelPagoNuevo = consulta.rows[0];
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                    const fechaPagoUTC_ISO = detallesDelPagoNuevo.fechaPagoUTC_ISO;
                    const fechaPagoTZ_ISO = DateTime.fromISO(fechaPagoUTC_ISO, { zone: 'utc' })
                        .setZone(zonaHoraria)
                        .toISO();
                    detallesDelPagoNuevo.fechaPagoTZ_ISO = fechaPagoTZ_ISO;

                    return detallesDelPagoNuevo;
                } catch (errorCapturado) {
                    throw errorCapturado;
                }
            }
        };
        const estructuraFinal = {};
        let nuevoPago;
        let pagoUID;
        switch (plataformaDePago) {
            case 'efectivo':
                cantidad = validadores.cantidad(cantidad);
                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                nuevoPago = {
                    plataformaDePago: plataformaDePago,
                    //tarjeta: tarjeta,
                    //tarjetaDigitos: tarjetaDigitos,
                    //pagoUIDPasarela: pagoUIDPasarela,
                    reservaUID: reservaUID,
                    cantidadConPunto: cantidad,
                    fechaPago: fechaActual,
                    //pagadorNombre: pagadorNombre,
                    //pagadorPasaporte: pagadorPasaporte
                };
                pagoUID = await sql.insertarPago(nuevoPago);
                estructuraFinal.ok = "Se ha insertado el nuevo pago en efectivo";
                estructuraFinal.detallesDelPago = pagoUID;
                break;
            case 'cheque':
                cantidad = validadores.cantidad(cantidad);
                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                chequeUID = validadores.chequeUID(chequeUID);
                nuevoPago = {
                    plataformaDePago: plataformaDePago,
                    //tarjeta: tarjeta,
                    //tarjetaDigitos: tarjetaDigitos,
                    //pagoUIDPasarela: pagoUIDPasarela,
                    reservaUID: reservaUID,
                    cantidadConPunto: cantidad,
                    fechaPago: fechaActual,
                    //pagadorNombre: pagadorNombre,
                    //pagadorPasaporte: pagadorPasaporte,
                    chequeUID: chequeUID
                };
                pagoUID = await sql.insertarPago(nuevoPago);
                estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque";
                estructuraFinal.detallesDelPago = pagoUID;
                break;
            case 'transferenciaBancaria':
                cantidad = validadores.cantidad(cantidad);
                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                transferenciaUID = validadores.transferenciaUID(transferenciaUID);
                nuevoPago = {
                    plataformaDePago: plataformaDePago,
                    //tarjeta: tarjeta,
                    //tarjetaDigitos: tarjetaDigitos,
                    //pagoUIDPasarela: pagoUIDPasarela,
                    reservaUID: reservaUID,
                    cantidadConPunto: cantidad,
                    fechaPago: fechaActual,
                    //pagadorNombre: pagadorNombre,
                    //pagadorPasaporte: pagadorPasaporte,
                    transferenciaUID: transferenciaUID
                };
                pagoUID = await sql.insertarPago(nuevoPago);
                estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque";
                estructuraFinal.detallesDelPago = pagoUID;
                break;
            case 'pasarela':
                const deshabilitado = "La opcion de asociar un pago a la pasarela esta temporalmente deshabilitada";
                throw new Error(deshabilitado);
                // Aqui solo se asocia el pago con el id de la pasarela, por que para lo otro estan los enlaces de pago
                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                pagoUIDPasarela = validadores.pagoUIDPasarela(pagoUIDPasarela);
                const consultaUIDUnico = `
                                    SELECT 
                                    "pagoUIDPasarela"
                                    FROM 
                                    "reservaPagos"
                                    WHERE "pagoUIDPasarela" = $1 AND reserva = $2;`;
                const resuelveConsultaUIDUnico = await conexion.query(consultaUIDUnico, [pagoUIDPasarela, reservaUID]);
                if (resuelveConsultaUIDUnico.rowCount > 0) {
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
                nuevoPago = {
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
                pagoUID = await sql.insertarPago(nuevoPago);
                estructuraFinal.ok = "Se ha insertado los datos importados de la pasarela";
                estructuraFinal.detallesDelPago = pagoUID;
                break;
            case 'tarjeta':
                cantidad = validadores.cantidad(cantidad);
                //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                tarjetaUltimos = validadores.tarjetaUltimos(tarjetaUltimos);
                nuevoPago = {
                    plataformaDePago: plataformaDePago,
                    //tarjeta: tarjeta,
                    //tarjetaDigitos: tarjetaDigitos,
                    //pagoUIDPasarela: pagoUIDPasarela,
                    reservaUID: reservaUID,
                    cantidadConPunto: cantidad,
                    fechaPago: fechaActual,
                    //pagadorNombre: pagadorNombre,
                    //pagadorPasaporte: pagadorPasaporte,
                    tarjetaDigitos: tarjetaUltimos
                };
                pagoUID = await sql.insertarPago(nuevoPago);
                estructuraFinal.ok = "Se ha insertado el nuevo pago hecho con tarjeta de manera externa como en un TPV";
                estructuraFinal.detallesDelPago = pagoUID;
                break;
            default:
                const error = "El campo plataformaDePago solo admite una cadena mayúsculas y minúsculas sin espacios. Las plataformas de pagos son tarjeta, efectivo, pasarela y tranferenciaBancaria";
                throw new Error(error);
        }
        await actualizarEstadoPago(reservaUID);
        salida.json(estructuraFinal);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}