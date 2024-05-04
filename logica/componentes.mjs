import { conexion } from './componentes/db.mjs';
import { clienteSquare } from "./componentes/squareClient.mjs";
import { v4 as uuidv4 } from "uuid";
import { utilidades } from './componentes/utilidades.mjs';
import Decimal from 'decimal.js';                 
import { DateTime } from 'luxon';
import { actualizarEstadoPago } from './sistema/sistemaDePrecios/actualizarEstadoPago.mjs';
import { codigoZonaHoraria } from './sistema/codigoZonaHoraria.mjs';
import { validadoresCompartidos } from './sistema/validadores/validadoresCompartidos.mjs';

const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID
const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID
export const componentes = {
    dicionarios: {
        mensajes: {
            errorConexionRechazadaInternaBaseDeDatos: "Casa Vitini esta en modo mantenimiento. Ahora mismo el procesador de peticiones no acepta peticiones. En breve se reanudara el sistema. Disculpe las molestias."
        }
    },
    erroresGeneralesCentralizados: (mensajeError) => {
        const errorFinal = {};
        if (mensajeError.code === "ECONNREFUSED" ||
            mensajeError.code === "ENOTFOUND" ||
            mensajeError.message === "Connection terminated due to connection timeout") {
            errorFinal.codigo = "mantenimiento";
            errorFinal.error = componentes.dicionarios.mensajes.errorConexionRechazadaInternaBaseDeDatos;
        }
        return errorFinal;
    },
    pasarela: {
        contruyeSession: async () => {
            try {
                const locationResponse = await clienteSquare.locationsApi.retrieveLocation(SQUARE_LOCATION_ID);
                const currency = locationResponse.result.location.currency;
                const country = locationResponse.result.location.country;
                const idempotencyKey = uuidv4();
                const clienteMetadatos = {
                    squareApplicationId: SQUARE_APPLICATION_ID,
                    squareLocationId: SQUARE_LOCATION_ID,
                    squareAccountCountry: country,
                    squareAccountCurrency: currency,
                    idempotencyKey
                };
                return clienteMetadatos;
            } catch (errorCapturado) {
                throw errorCapturado;
            }
        },
        detallesDelPago: async (pagoUID) => {
            try {
                const { result: { payment } } = await clienteSquare.paymentsApi.getPayment(pagoUID);
                const result = JSON.stringify(payment, (key, value) => {
                    return typeof value === "bigint" ? parseInt(value) : value;
                }, 4);
                const detallesDelPagoOL = JSON.parse(result);
                return detallesDelPagoOL;
            } catch (errorCapturado) {
                throw errorCapturado;
            }
        },
        crearPago: async (pago) => {
            try {
                const { result: { payment } } = await clienteSquare.paymentsApi.createPayment(pago);
                const result = JSON.stringify(payment, (key, value) => {
                    return typeof value === "bigint" ? parseInt(value) : value;
                }, 4);
                const resultado = JSON.parse(result);
                return resultado;
            } catch (errorCapturado) {
                throw errorCapturado;
            }
        },
        detallesDelReembolso: async (reembolsoUID) => {
            try {
                const { result: { refund } } = await clienteSquare.refundsApi.getPaymentRefund(reembolsoUID);
                const resultReembolso = JSON.stringify(refund, (key, value) => {
                    return typeof value === "bigint" ? parseInt(value) : value;
                }, 4);
                const detallesDelReembolsoOL = JSON.parse(resultReembolso);
                return detallesDelReembolsoOL;
            } catch (errorCapturado) {
                throw errorCapturado;
            }
        },
        crearReenbolso: async (reembolso) => {
            try {
                const { result: { refund } } = await clienteSquare.refundsApi.refundPayment(reembolso);
                const result = JSON.stringify(refund, (key, value) => {
                    return typeof value === "bigint" ? parseInt(value) : value;
                }, 4);
                const reembolsoOL = JSON.parse(result);
                return reembolsoOL;
            } catch (errorCapturado) {
                throw errorCapturado;
            }
        }
    },
    control: {
        relojlUTC: () => {
            try {
                const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (zonaHoraria !== 'UTC') {
                    const error = "ALERTA!!!!!! El sistema no está configurado en UTC. !!!!!!";
                    //throw new Error(error)
                }
            } catch (errorCapturado) {
                throw errorCapturado;
            }
        }
    },
    administracion: {
        reservas: {
            transacciones: {
                actualizarReembolsosDelPagoDesdeSquare: async (pagoUID, pagoUIDPasarela) => {
                    try {
                        const plataformaDePago = "pasarela";
                        const detallesDelPagoSquare = await componentes.pasarela.detallesDelPago(pagoUIDPasarela);
                        if (detallesDelPagoSquare.error) {
                            const error = `La pasarela no ha respondido con los detalles del pago actualizados al requerir ${pagoUIDPasarela} a la pasarela, esto son datos de la copia no actualizada en casa vitini`;
                            throw new Error(error);
                        }
                        const identificadoresRembolsosDeEstaTransacion = detallesDelPagoSquare?.refundIds;
                        for (const reembolsoUID of identificadoresRembolsosDeEstaTransacion) {
                            const detallesDelReembolsoOL = await componentes.pasarela.detallesDelReembolso(reembolsoUID);
                            if (detallesDelReembolsoOL.error) {
                                const error = `La pasarela no ha respondido con los detalles del reembolso ${reembolsoUID} actualizados, esto son datos de la copia no actualizada en casa vitini`;
                                throw new Error(error);
                            }
                            const estadoReembolso = detallesDelReembolsoOL.status;
                            const cantidad = utilidades.deFormatoSquareAFormatoSQL(detallesDelReembolsoOL.amountMoney.amount);
                            const creacionUTC = detallesDelReembolsoOL.createdAt;
                            const actualizacionUTC = detallesDelReembolsoOL.updatedAt;
                            const validarExistenciaReembolsoPasarela = `
                                SELECT
                                    "reembolsoUID"
                                FROM 
                                    "reservaReembolsos"
                                WHERE 
                                    "pagoUID" = $1 AND "reembolsoUIDPasarela" = $2;`;
                            const resuelveValidarExistenciaReembolsoPasarela = await conexion.query(validarExistenciaReembolsoPasarela, [pagoUID, reembolsoUID]);
                            if (resuelveValidarExistenciaReembolsoPasarela.rowCount === 0) {
                                const insertarReembolso = `
                                    INSERT INTO
                                        "reservaReembolsos"
                                        (
                                        "pagoUID",
                                        cantidad,
                                        "plataformaDePago",
                                        "reembolsoUIDPasarela",
                                        estado,
                                        "fechaCreacion",
                                        "fechaActualizacion"
                                        )
                                    VALUES 
                                        ($1,$2,$3,$4,$5,$6,$7)
                                    `;
                                const datosNuevoReembolso = [
                                    pagoUID,
                                    cantidad,
                                    plataformaDePago,
                                    reembolsoUID,
                                    estadoReembolso,
                                    creacionUTC,
                                    actualizacionUTC,
                                ];
                                await conexion.query(insertarReembolso, datosNuevoReembolso);
                            }
                            if (resuelveValidarExistenciaReembolsoPasarela.rowCount === 1) {
                                const actualizarReembolsoPasarela = `
                                    UPDATE
                                        "reservaReembolsos"
                                    SET 
                                        cantidad = $1,
                                        "plataformaDePago" = $2,
                                        estado = $3,
                                        "fechaCreacion" = $4,
                                        "fechaActualizacion" =
                                    WHERE 
                                    "pagoUID" = $6 AND "reembolsoUIDPasarela" = $7;
                                    `;
                                const datosActualizarReembolso = [
                                    cantidad,
                                    plataformaDePago,
                                    estadoReembolso,
                                    creacionUTC,
                                    actualizacionUTC,
                                    pagoUID,
                                    reembolsoUID,
                                ];
                                await conexion.query(actualizarReembolsoPasarela, datosActualizarReembolso);
                            }
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return error;
                    }
                },
                actualizarSOLOreembolsoDesdeSquare: async (reembolsoUID) => {
                    try {
                        const validarReembolso = `
                        SELECT
                            "pagoUID",
                            cantidad,
                            "plataformaDePago",
                            "reembolsoUIDPasarela",
                            "estado",
                            "fechaCreacion"::text AS "fechaCreacion",
                            "fechaActualizacion"::text AS "fechaActualizacion"
                        FROM 
                            "reservaReembolsos"
                        WHERE 
                            "reembolsoUID" = $1;`;
                        const resuelveValidarReembolso = await conexion.query(validarReembolso, [reembolsoUID]);
                        if (resuelveValidarReembolso.rowCount === 0) {
                            const error = "No existe ningún reembolso con ese reembolsoUID";
                            throw new Error(error);
                        }
                        const detallesDelReembolso = resuelveValidarReembolso.rows[0];
                        const pagoUID = detallesDelReembolso.pagoUID;
                        const plataformaDePago = detallesDelReembolso.plataformaDePago;
                        if (plataformaDePago !== "pasarela") {
                            const error = "El reembolso no es de pasarela";
                            throw new Error(error);
                        }
                        const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
                        if (!reembolsoUIDPasarela) {
                            const error = "El reembolso de pasarela no tiene un idenfiticador de Square";
                            throw new Error(error);
                        }
                        const detallesDelReembolsoOL = await componentes.pasarela.detallesDelReembolso(reembolsoUIDPasarela);
                        if (detallesDelReembolsoOL.error) {
                            const error = `La pasarela no ha respondido con los detalles del reembolso ${reembolsoUIDPasarela} actualizados, esto son datos de la copia no actualizada en casa vitini`;
                            throw new Error(error);
                        }
                        const estadoReembolso = detallesDelReembolsoOL.status;
                        const cantidad = utilidades.deFormatoSquareAFormatoSQL(detallesDelReembolsoOL.amountMoney.amount);
                        const creacionUTC = detallesDelReembolsoOL.createdAt;
                        const actualizacionUTC = detallesDelReembolsoOL.updatedAt;
                        const actualizarReembolsoPasarela = `
                                    UPDATE
                                        "reservaReembolsos"
                                    SET 
                                        cantidad = $1,
                                        "plataformaDePago" = $2,
                                        estado = $3,
                                        "fechaCreacion" = $4,
                                        "fechaActualizacion" = $5
                                    WHERE 
                                    "reembolsoUID" = $6;
                                    `;
                        const datosActualizarReembolso = [
                            cantidad,
                            plataformaDePago,
                            estadoReembolso,
                            creacionUTC,
                            actualizacionUTC,
                            reembolsoUID,
                        ];
                        await conexion.query(actualizarReembolsoPasarela, datosActualizarReembolso);
                        const ok = {
                            ok: "Se ha actualziad correctamente los datos del reembolso en la pasarela"
                        };
                        return ok;
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return error;
                    }
                },
                estadoDelPago: async (reservaUID) => {
                    try {
                        await validadoresCompartidos.reservas.validarReserva(reservaUID);
                        await actualizarEstadoPago(reservaUID);
                    } catch (errorCapturado) {
                        throw errorCapturado;
                    }
                },
                pagosDeLaReserva: async (reservaUID) => {
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
                },
            },
            horasSalidaEntrada: async () => {
                try {
                    const consultasHorasSalidaYEntrada = `
                    SELECT 
                        valor,
                        "configuracionUID"
                    FROM 
                        "configuracionGlobal"
                    WHERE 
                        "configuracionUID" IN ($1, $2, $3);
                   `;
                    const configuracionUID = [
                        "horaEntradaTZ",
                        "horaSalidaTZ",
                        "zonaHoraria"
                    ];
                    const resuelveConfiguracionGlobal = await conexion.query(consultasHorasSalidaYEntrada, configuracionUID);
                    const detallesConfiguracion = resuelveConfiguracionGlobal.rows;
                    const estructuraFinal = {};
                    for (const parConfirmacion of detallesConfiguracion) {
                        const configuracionUID = parConfirmacion.configuracionUID;
                        const valor = parConfirmacion.valor;
                        estructuraFinal[configuracionUID] = valor;
                    }
                    return estructuraFinal;
                } catch (errorCapturado) {
                    throw errorCapturado;
                }
            },
        }
    },
    gestionEnlacesPDF: {
        crearEnlacePDF: async (reservaUID) => {
            try {
                await conexion.query('BEGIN'); // Inicio de la transacción
                await validadoresCompartidos.reservas.validarReserva(reservaUID);
                await componentes.gestionEnlacesPDF.controlCaducidad();
                const generarCadenaAleatoria = (longitud) => {
                    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                    let cadenaAleatoria = '';
                    for (let i = 0; i < longitud; i++) {
                        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                        cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                    }
                    return cadenaAleatoria;
                };
                const fechaActual = DateTime.utc();
                const fechaFutura = fechaActual.plus({ days: 2 });
                const fechaCaducidad = fechaFutura.toISO();
                // Ver si existe el enlace se borra
                const consultaCaducidadEnlaces = `
                DELETE FROM "enlacesPdf"
                WHERE "reservaUID" = $1;`;
                await conexion.query(consultaCaducidadEnlaces, [reservaUID]);
                const consultaCrearEnlace = `
                INSERT INTO
                "enlacesPdf"
                (
                "reservaUID",
                enlace,
                caducidad
                )
                VALUES 
                ($1, $2, $3)
                RETURNING
                enlace;`;
                const datosEnlace = [
                    reservaUID,
                    generarCadenaAleatoria(100),
                    fechaCaducidad
                ];
                const reseulveEnlaces = await conexion.query(consultaCrearEnlace, datosEnlace);
                const enlacePDF = reseulveEnlaces.rows[0].enlace;
                await conexion.query('COMMIT'); // Confirmar la transacción
                return enlacePDF;
            } catch (error) {
                await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                throw error;
            }
        },
        controlCaducidad: async () => {
            try {
                const fechaActual = DateTime.utc().toISO();
                const consultaCaducidadEnlaces = `
                DELETE FROM "enlacesPdf"
                WHERE caducidad < $1;`;
                await conexion.query(consultaCaducidadEnlaces, [fechaActual]);
            } catch (error) {
                throw error;
            }
        },
    },
    eliminarCuentasNoVerificadas: async () => {
        try {
            const fechaActual_ISO = DateTime.utc().toISO();
            const eliminarCuentasNoVefificadas = `
                DELETE FROM usuarios
                WHERE "fechaCaducidadCuentaNoVerificada" < $1 
                AND rol <> $2
                AND "cuentaVerificada" <> $3;
                `;
            await conexion.query(eliminarCuentasNoVefificadas, [fechaActual_ISO, "administrador", "si"]);
        } catch (error) {
            throw error;
        }
    },
    borrarCuentasCaducadas: async () => {
        try {
            // recuerda las cuentas de administracion no caducan
            // El resto a los seis meses desde el ultimo login
            const consultaCuentaAntiguas = `
            DELETE FROM usuarios
            WHERE "ultimoLogin" < NOW() - interval '6 months' AND rol <> $1;
            `;
            await conexion.query(consultaCuentaAntiguas, ["administrador"]);
        } catch (error) {
            throw error;
        }
    },
};
