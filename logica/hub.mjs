import { conexion } from './componentes/db.mjs';
import fs from 'fs'
import { writeFile } from 'fs/promises';
import { Mutex, tryAcquire } from 'async-mutex';
import { clienteSquare } from "./componentes/squareClient.mjs";
import { v4 as uuidv4 } from "uuid";
import { validarObjetoReserva } from './componentes/transactoresCompartidos/validarObjetoReserva.mjs';
import { validarObjetoReservaSoloFormato } from './componentes/transactoresCompartidos/validarObjetoReservaSoloFormato.mjs';
import { cambiarVista } from './componentes/transactoresCompartidos/cambiarVista.mjs';
import { configuracionApartamento } from './componentes/transactoresCompartidos/configuracionApartamento.mjs';
import { precioReserva } from './componentes/transactoresCompartidos/precioReserva.mjs';
import { apartamentosDisponiblesPublico } from './componentes/transactoresCompartidos/apartamentosDisponiblesPublico.mjs';
import { insertarReserva } from './componentes/transactoresCompartidos/insertarReserva.mjs';
import { estadoHabitacionesApartamento } from './componentes/transactoresCompartidos/estadoHabitacionesApartamento.mjs'
import { validarModificacionRangoFechaResereva } from './componentes/transactoresCompartidos/validarModificacionRangoFechaResereva.mjs'
import { bloquearApartamentos } from './componentes/transactoresCompartidos/bloquearApartamentos.mjs'
import { apartamentosDisponiblesAdministracion } from './componentes/transactoresCompartidos/apartamentosDisponiblesAdministracion.mjs';
import { resolverMoneda } from './componentes/transactoresCompartidos/resolverMoneda.mjs';
import { precioBaseApartamento } from './componentes/transactoresCompartidos/precioBaseApartamento.mjs';
import { precioRangoApartamento } from './componentes/transactoresCompartidos/precioRangoApartamento.mjs';
import { insertarTotalesReserva } from './componentes/transactoresCompartidos/insertarTotalesReserva.mjs';
import { detallesReserva } from './componentes/transactoresCompartidos/detallesReserva.mjs';
import { resolverApartamentoUI } from './componentes/transactoresCompartidos/resolverApartamentoUI.mjs'
import { vitiniCrypto } from './componentes/transactoresCompartidos/vitiniCrypto.mjs';
import { administracionUI } from './componentes/administracion.mjs';
import { controlCaducidadEnlacesDePago } from './componentes/transactoresCompartidos/controlCaducidadEnlacesDePago.mjs';
import { zonasHorarias } from "./componentes/zonasHorarias.mjs"
import { utilidades } from './componentes/utilidades.mjs';
import Decimal from 'decimal.js';
import { insertarCliente } from './componentes/transactoresCompartidos/insertarCliente.mjs';
import { constants } from 'fs/promises';
import { codigoZonaHoraria } from './componentes/transactoresCompartidos/codigoZonaHoraria.mjs';
import { DateTime } from 'luxon';
import { generadorPDF3 } from './componentes/transactoresCompartidos/generadorPDF.mjs';
import { validadoresCompartidos } from './componentes/validadoresCompartidos.mjs';
import { actualizarEstadoPago } from './componentes/transactoresCompartidos/actualizarEstadoPago.mjs';
import { obtenerTotalReembolsado } from './componentes/transactoresCompartidos/obtenerTotalReembolsado.mjs';
import { enviarMail } from './componentes/transactoresCompartidos/enviarMail.mjs';
import { enviarEmailReservaConfirmaada } from './componentes/transactoresCompartidos/enviarEmailReservaConfirmada.mjs';
import { enviarEmailAlCrearCuentaNueva } from './componentes/transactoresCompartidos/enviarEmailAlCrearCuentaNueva.mjs';
import validator from 'validator';
import axios from 'axios';
const mutex = new Mutex();
import ICAL from 'ical.js';
import { apartamentosOcupadosHoy } from './componentes/transactoresCompartidos/calendariosSincronizados/airbnb/apartamentosOcupadosHoyAirbnb.mjs';
import { eventosDelApartamento } from './componentes/transactoresCompartidos/calendariosSincronizados/airbnb/eventosDelApartamento.mjs';
import { eventosCalendarioPorUID } from './componentes/transactoresCompartidos/calendariosSincronizados/airbnb/eventosCalendarioPorUID.mjs';
import { obtenerTodosLosCalendarios } from './componentes/transactoresCompartidos/calendariosSincronizados/airbnb/obtenerTodosLosCalendarios.mjs';
import { eventosReservas } from './componentes/transactoresCompartidos/calendarios/capas/eventosReservas.mjs';
import { eventosTodosLosApartamentos } from './componentes/transactoresCompartidos/calendarios/capas/eventosTodosLosApartamentos.mjs';
import { eventosTodosLosBloqueos } from './componentes/transactoresCompartidos/calendarios/capas/eventosTodosLosBloqueos.mjs';
import { eventosPorApartamneto } from './componentes/transactoresCompartidos/calendarios/capas/eventosPorApartamento.mjs';
import { eventosPorApartamentoAirbnb } from './componentes/transactoresCompartidos/calendarios/capas/calendariosSincronizados/airbnb/eventosPorApartamentoAirbnb.mjs';
import { exportarClendario } from './componentes/transactoresCompartidos/calendariosSincronizados/airbnb/exportarCalendario.mjs';
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID
const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID
const arranque = async (entrada, salida) => {
    salida.render('constructorV1', {
        'vistaGlobal': '../global/navegacion.ejs'
    });

}

const puerto = async (entrada, salida) => {
    const componentes = {
        dicionarios: {
            mensajes: {
                errorConexionRechazadaInternaBaseDeDatos: "Casa Vitini esta en modo mantenimiento. Ahora mismo el procesador de peticiones no acepta peticiones. En breve se reanudara el sistema. Disculpe las molestias."
            }
        },
        erroresGeneralesCentralizados: (mensajeError) => {
            const errorFinal = {}
            if (mensajeError.code === "ECONNREFUSED" ||
                mensajeError.code === "ENOTFOUND" ||
                mensajeError.message === "Connection terminated due to connection timeout") {
                errorFinal.codigo = "mantenimiento"
                errorFinal.error = componentes.dicionarios.mensajes.errorConexionRechazadaInternaBaseDeDatos
            }
            return errorFinal
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
                    }
                    return clienteMetadatos
                } catch (errorCapturado) {
                    throw errorCapturado
                }

            },
            detallesDelPago: async (pagoUID) => {
                try {
                    const { result: { payment } } = await clienteSquare.paymentsApi.getPayment(pagoUID);
                    const result = JSON.stringify(payment, (key, value) => {
                        return typeof value === "bigint" ? parseInt(value) : value;
                    }, 4);
                    const detallesDelPagoOL = JSON.parse(result)
                    return detallesDelPagoOL

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            },
            crearPago: async (pago) => {
                try {
                    const { result: { payment } } = await clienteSquare.paymentsApi.createPayment(pago);
                    const result = JSON.stringify(payment, (key, value) => {
                        return typeof value === "bigint" ? parseInt(value) : value;
                    }, 4);
                    const resultado = JSON.parse(result)
                    return resultado
                } catch (errorCapturado) {
                    throw errorCapturado
                }

            },
            detallesDelReembolso: async (reembolsoUID) => {
                try {
                    const { result: { refund } } = await clienteSquare.refundsApi.getPaymentRefund(reembolsoUID);
                    const resultReembolso = JSON.stringify(refund, (key, value) => {
                        return typeof value === "bigint" ? parseInt(value) : value;
                    }, 4);
                    const detallesDelReembolsoOL = JSON.parse(resultReembolso)
                    return detallesDelReembolsoOL
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            },
            crearReenbolso: async (reembolso) => {
                try {
                    const { result: { refund } } = await clienteSquare.refundsApi.refundPayment(reembolso);
                    const result = JSON.stringify(refund, (key, value) => {
                        return typeof value === "bigint" ? parseInt(value) : value;
                    }, 4);
                    const reembolsoOL = JSON.parse(result)
                    return reembolsoOL

                } catch (errorCapturado) {
                    throw errorCapturado

                }

            }
        },
        control: {
            relojlUTC: () => {
                try {
                    const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (zonaHoraria !== 'UTC') {
                        const error = "ALERTA!!!!!! El sistema no está configurado en UTC. !!!!!!"
                        //throw new Error(error)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            }
        },
        administracion: {
            reservas: {
                transacciones: {
                    actualizarReembolsosDelPagoDesdeSquare: async (pagoUID, pagoUIDPasarela) => {
                        try {
                            const plataformaDePago = "pasarela"
                            const detallesDelPagoSquare = await componentes.pasarela.detallesDelPago(pagoUIDPasarela)
                            if (detallesDelPagoSquare.error) {
                                const error = `La pasarela no ha respondido con los detalles del pago actualizados al requerir ${pagoUIDPasarela} a la pasarela, esto son datos de la copia no actualizada en casa vitini`
                                throw new Error(error)
                            }
                            const identificadoresRembolsosDeEstaTransacion = detallesDelPagoSquare?.refundIds

                            for (const reembolsoUID of identificadoresRembolsosDeEstaTransacion) {
                                const detallesDelReembolsoOL = await componentes.pasarela.detallesDelReembolso(reembolsoUID)
                                if (detallesDelReembolsoOL.error) {
                                    const error = `La pasarela no ha respondido con los detalles del reembolso ${reembolsoUID} actualizados, esto son datos de la copia no actualizada en casa vitini`
                                    throw new Error(error)
                                }
                                const estadoReembolso = detallesDelReembolsoOL.status
                                const cantidad = utilidades.deFormatoSquareAFormatoSQL(detallesDelReembolsoOL.amountMoney.amount)
                                const creacionUTC = detallesDelReembolsoOL.createdAt
                                const actualizacionUTC = detallesDelReembolsoOL.updatedAt

                                const validarExistenciaReembolsoPasarela = `
                                    SELECT
                                        "reembolsoUID"
                                    FROM 
                                        "reservaReembolsos"
                                    WHERE 
                                        "pagoUID" = $1 AND "reembolsoUIDPasarela" = $2;`
                                const resuelveValidarExistenciaReembolsoPasarela = await conexion.query(validarExistenciaReembolsoPasarela, [pagoUID, reembolsoUID])

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
                                        `


                                    const datosNuevoReembolso = [
                                        pagoUID,
                                        cantidad,
                                        plataformaDePago,
                                        reembolsoUID,
                                        estadoReembolso,
                                        creacionUTC,
                                        actualizacionUTC,
                                    ]
                                    await conexion.query(insertarReembolso, datosNuevoReembolso)

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
                                            "fechaActualizacion" = $5
                                        WHERE 
                                        "pagoUID" = $6 AND "reembolsoUIDPasarela" = $7;
                                        `

                                    const datosActualizarReembolso = [
                                        cantidad,
                                        plataformaDePago,
                                        estadoReembolso,
                                        creacionUTC,
                                        actualizacionUTC,

                                        pagoUID,
                                        reembolsoUID,
                                    ]
                                    await conexion.query(actualizarReembolsoPasarela, datosActualizarReembolso)
                                }

                            }


                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return error
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
                                "reembolsoUID" = $1;`
                            const resuelveValidarReembolso = await conexion.query(validarReembolso, [reembolsoUID])
                            if (resuelveValidarReembolso.rowCount === 0) {
                                const error = "No existe ningún reembolso con ese reembolsoUID"
                                throw new Error(error)
                            }
                            const detallesDelReembolso = resuelveValidarReembolso.rows[0]
                            const pagoUID = detallesDelReembolso.pagoUID
                            const plataformaDePago = detallesDelReembolso.plataformaDePago

                            if (plataformaDePago !== "pasarela") {
                                const error = "El reembolso no es de pasarela"
                                throw new Error(error)
                            }
                            const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela
                            if (!reembolsoUIDPasarela) {
                                const error = "El reembolso de pasarela no tiene un idenfiticador de Square"
                                throw new Error(error)
                            }

                            const detallesDelReembolsoOL = await componentes.pasarela.detallesDelReembolso(reembolsoUIDPasarela)
                            if (detallesDelReembolsoOL.error) {
                                const error = `La pasarela no ha respondido con los detalles del reembolso ${reembolsoUIDPasarela} actualizados, esto son datos de la copia no actualizada en casa vitini`
                                throw new Error(error)

                            }
                            const estadoReembolso = detallesDelReembolsoOL.status

                            const cantidad = utilidades.deFormatoSquareAFormatoSQL(detallesDelReembolsoOL.amountMoney.amount)
                            const creacionUTC = detallesDelReembolsoOL.createdAt
                            const actualizacionUTC = detallesDelReembolsoOL.updatedAt


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
                                        `

                            const datosActualizarReembolso = [
                                cantidad,
                                plataformaDePago,
                                estadoReembolso,
                                creacionUTC,
                                actualizacionUTC,

                                reembolsoUID,
                            ]
                            await conexion.query(actualizarReembolsoPasarela, datosActualizarReembolso)

                            const ok = {
                                ok: "Se ha actualziad correctamente los datos del reembolso en la pasarela"
                            }
                            return ok

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return error
                        }

                    },
                    estadoDelPago: async (reservaUID) => {

                        try {
                            await validadoresCompartidos.reservas.validarReserva(reservaUID)
                            await actualizarEstadoPago(reservaUID)

                        } catch (errorCapturado) {
                            throw errorCapturado
                        }
                    },
                    pagosDeLaReserva: async (reservaUID) => {
                        try {
                            const filtroCadena = /^[0-9]+$/;
                            if (!reservaUID || !filtroCadena.test(reservaUID)) {
                                const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }
                            await validadoresCompartidos.reservas.validarReserva(reservaUID)
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
                                    reserva = $1;`
                            const resuelveConsultaTotales = await conexion.query(consultaTotales, [reservaUID])
                            if (resuelveConsultaTotales.rowCount === 0) {
                                const error = `Esta reserva no tiene totales calculados`
                                // throw new Error(error)
                            }


                            const totalConImpuestos = resuelveConsultaTotales.rows[0]?.totalConImpuestos ?
                                resuelveConsultaTotales.rows[0].totalConImpuestos : "0.00"
                            const totalConImpuestosDecimal = new Decimal(totalConImpuestos)
                            const ok = {
                                totalReserva: totalConImpuestos,
                                totalPagado: 0,
                                faltantePorPagar: totalConImpuestos,
                                pagos: []
                            }
                            const consultaListaPagos = `
                                            SELECT
                                                "pagoUID",
                                                "plataformaDePago",
                                                "tarjetaDigitos",
                                                "pagoUIDPasarela",
                                                "tarjetaDigitos",
                                                to_char("fechaPago", 'DD/MM/YYYY') as "fechaPago", 
                                                tarjeta,
                                                "chequeUID",
                                                cantidad
                                            FROM 
                                                "reservaPagos"
                                            WHERE 
                                                reserva = $1
                                            ORDER BY
                                                "pagoUID" DESC;`
                            const resuelveConsultaListaDePagos = await conexion.query(consultaListaPagos, [reservaUID])
                            if (resuelveConsultaListaDePagos.rowCount === 0) {

                            }
                            if (resuelveConsultaListaDePagos.rowCount > 0) {

                                const pagosDeLaReserva = resuelveConsultaListaDePagos.rows
                                let pagoResultadoFinal = 0.00
                                for (const detallesDelPago of pagosDeLaReserva) {
                                    const pagoUID = detallesDelPago.pagoUID
                                    const plataformaDePago = detallesDelPago.plataformaDePago
                                    const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela
                                    const cantidadDelPago = new Decimal(detallesDelPago.cantidad)

                                    const consultaReembolsos = `
                                        SELECT
                                            cantidad
                                        FROM 
                                            "reservaReembolsos"
                                        WHERE 
                                            "pagoUID" = $1;`


                                    const resuelveConsultaReembolsos = await conexion.query(consultaReembolsos, [pagoUID])
                                    if (resuelveConsultaReembolsos.rowCount === 0) {
                                        ok.pagos.push(detallesDelPago)
                                        pagoResultadoFinal = cantidadDelPago.plus(pagoResultadoFinal)
                                    }

                                    if (resuelveConsultaReembolsos.rowCount > 0) {
                                        if (plataformaDePago === "pasarela") {
                                            const actualizarReembolsos = await componentes.administracion.reservas.transacciones.actualizarReembolsosDelPagoDesdeSquare(pagoUID, pagoUIDPasarela)
                                            if (actualizarReembolsos?.error) {
                                                ok.estadoPasarela = actualizarReembolsos.error
                                            }
                                        }

                                        const reembolsosDelPago = resuelveConsultaReembolsos.rows
                                        let sumaDeLoReembolsado = 0
                                        for (const detallesDelReembolso of reembolsosDelPago) {
                                            const cantidadDelReembolso = new Decimal(detallesDelReembolso.cantidad)
                                            sumaDeLoReembolsado = cantidadDelReembolso.plus(sumaDeLoReembolsado)
                                        }
                                        let reembolsado
                                        if (Number(cantidadDelPago) === Number(sumaDeLoReembolsado)) {
                                            reembolsado = "totalmente"
                                        }
                                        if (Number(cantidadDelPago) > Number(sumaDeLoReembolsado)) {
                                            reembolsado = "parcialmente"
                                        }
                                        if (Number(cantidadDelPago) < Number(sumaDeLoReembolsado)) {
                                            reembolsado = "superadamente"
                                        }


                                        detallesDelPago.sumaDeLoReembolsado = sumaDeLoReembolsado.toFixed(2)
                                        detallesDelPago.reembolsado = reembolsado

                                        let diferenciaDelPago = cantidadDelPago.minus(sumaDeLoReembolsado)
                                        diferenciaDelPago = new Decimal(diferenciaDelPago)
                                        pagoResultadoFinal = diferenciaDelPago.plus(pagoResultadoFinal)
                                        ok.pagos.push(detallesDelPago)

                                    }
                                    const faltantePorPagar = totalConImpuestosDecimal.minus(pagoResultadoFinal)
                                    ok.totalPagado = pagoResultadoFinal.toFixed(2)
                                    ok.faltantePorPagar = faltantePorPagar.toFixed(2)


                                }



                            }
                            return ok


                        } catch (errorCapturado) {
                            throw errorCapturado
                        }

                    },

                },
                horasSalidaEntrada: async () => {
                    try {
                        const consultasHorasSalidaYEntrada = `
                        SELECT 
                        "zonaHoraria", 
                        "horaEntradaTZ", 
                        "horaSalidaTZ"
                        FROM "configuracionGlobal"
                        WHERE "configuracionUID" = $1; 
                        `
                        const configuracionUID = [
                            "zonaHoraria"
                        ]
                        const resuelveConfiguracionGlobal = await conexion.query(consultasHorasSalidaYEntrada, configuracionUID)
                        const detallesConfiguracion = resuelveConfiguracionGlobal.rows[0]

                        const estructuraFinal = {
                            zonaHoraria: detallesConfiguracion.zonaHoraria,
                            horaEntradaTZ: detallesConfiguracion.horaEntradaTZ,
                            horaSalidaTZ: detallesConfiguracion.horaSalidaTZ
                        }
                        return estructuraFinal

                    } catch (errorCapturado) {
                        throw errorCapturado
                    }





                },
            }

        },
        gestionEnlacesPDF: {
            crearEnlacePDF: async (reservaUID) => {
                try {
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    await validadoresCompartidos.reservas.validarReserva(reservaUID)
                    await componentes.gestionEnlacesPDF.controlCaducidad()
                    const generarCadenaAleatoria = (longitud) => {
                        const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                        let cadenaAleatoria = '';
                        for (let i = 0; i < longitud; i++) {
                            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                            cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                        }
                        return cadenaAleatoria;
                    }
                    const fechaActual = DateTime.utc();
                    const fechaFutura = fechaActual.plus({ days: 2 });
                    const fechaCaducidad = fechaFutura.toISO();

                    // Ver si existe el enlace se borra
                    const consultaCaducidadEnlaces = `
                    DELETE FROM "enlacesPdf"
                    WHERE "reservaUID" = $1;`
                    await conexion.query(consultaCaducidadEnlaces, [reservaUID])

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
                    enlace;`
                    const datosEnlace = [
                        reservaUID,
                        generarCadenaAleatoria(100),
                        fechaCaducidad
                    ]
                    const reseulveEnlaces = await conexion.query(consultaCrearEnlace, datosEnlace)
                    const enlacePDF = reseulveEnlaces.rows[0].enlace

                    await conexion.query('COMMIT'); // Confirmar la transacción
                    return enlacePDF

                } catch (error) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    throw error
                }
            },
            controlCaducidad: async () => {
                try {
                    const fechaActual = DateTime.utc().toISO();
                    const consultaCaducidadEnlaces = `
                    DELETE FROM "enlacesPdf"
                    WHERE caducidad < $1;`
                    await conexion.query(consultaCaducidadEnlaces, [fechaActual])

                } catch (error) {
                    throw error
                }
            },
        },
        eliminarCuentasNoVerificadas: async () => {
            try {
                const fechaActual_ISO = DateTime.utc().toISO();
                const eliminarCuentasNoVefificadas = `
                    DELETE FROM usuarios
                    WHERE "fechaCaducidadCuentaNoVerificada" < $1;
                    `
                await conexion.query(eliminarCuentasNoVefificadas, [fechaActual_ISO])
            } catch (error) {
                throw error
            }
        },
        borrarCuentasCaducadas: async () => {
            try {
                // recuerda las cuentas de administracion no caducan
                const consultaCuentaAntiguas = `
                DELETE FROM usuarios
                WHERE "ultimoLogin" <= NOW() - interval '6 months' AND rol <> $1;
                `
                await conexion.query(consultaCuentaAntiguas, ["administrador"])
            } catch (error) {
                throw error
            }
        },


    }
    const casaVitini = {
        IDX: async () => {
            try {
                const IDX = entrada.body.IDX
                if (!IDX) {
                    const error = "Falta espeficiar la 'accion'"
                    throw new Error(error)
                }
                await componentes.eliminarCuentasNoVerificadas()
                await componentes.borrarCuentasCaducadas()
                if (IDX === "conectar") {
                    const usuario = entrada.body.usuario
                    const filtroIDX = /^[a-z0-9_\-\.]+$/;
                    if (!usuario || !filtroIDX.test(usuario)) {
                        const error = "El campo usuarios solo admite minúsculas, numeros, guion medio, guion bajo y punto"
                        throw new Error(error)
                    }
                    const clave = entrada.body.clave
                    if (!clave) {
                        const error = "Falta especificar la contrasena"
                        throw new Error(error)
                    }
                    const intentosMaximos = 10
                    const controladorIntentos = {
                        suma: async (numeroIntentosActuales, IDX_) => {
                            try {
                                const intento = numeroIntentosActuales + 1

                                const actualizarIntentos = `
                                UPDATE 
                                    usuarios
                                SET     
                                    intentos = $1
                                WHERE 
                                    usuario = $2
                                RETURNING
                                    intentos;`
                                const resuelveIntento = await conexion.query(actualizarIntentos, [intento, IDX_])

                                return resuelveIntento.rows[0].intentos

                            } catch (error) {
                                throw error
                            }
                        },
                        restablece: async (IDX_) => {
                            try {
                                const intento = 0
                                const actualizarIntentos = `
                                UPDATE 
                                    usuarios
                                SET     
                                    intentos = $1
                                WHERE 
                                    usuario = $2;`
                                await conexion.query(actualizarIntentos, [intento, IDX_])
                            } catch (error) {
                                throw error
                            }
                        }
                    }

                    // Se valida si existe el usuario
                    const consultaControlIDX = `
                    SELECT
                    usuario,
                    rol,
                    sal,
                    clave,
                    "estadoCuenta",
                    "cuentaVerificada",
                    intentos
                    FROM 
                    usuarios 
                    WHERE 
                    usuario = $1
                    `
                    const resuelveControlIDX = await conexion.query(consultaControlIDX, [usuario])

                    if (resuelveControlIDX.rowCount === 0) {
                        const error = "Datos de identificacíon incorrectos"
                        throw new Error(error)
                    }
                    // Se recupera el hash y la sal

                    const IDX_ = resuelveControlIDX.rows[0].usuario
                    const rol = resuelveControlIDX.rows[0].rol
                    const sal = resuelveControlIDX.rows[0].sal
                    const claveHash = resuelveControlIDX.rows[0].clave
                    const estadoCuenta = resuelveControlIDX.rows[0].estadoCuenta
                    const cuentaVerificada = resuelveControlIDX.rows[0].cuentaVerificada
                    const intentos = resuelveControlIDX.rows[0].intentos || 0
                    const ip = entrada.socket.remoteAddress;
                    const userAgent = entrada.get('User-Agent');

                    if (intentos >= intentosMaximos) {
                        const error = "1Cuenta bloqueada tras 10 intentos. Recupera tu cuenta con tu correo."
                        throw new Error(error)
                    }

                    const metadatos = {
                        sentido: "comparar",
                        clavePlana: clave,
                        sal: sal,
                        claveHash: claveHash
                    }
                    const controlClave = vitiniCrypto(metadatos)

                    if (!controlClave) {
                        const intentoActual = await controladorIntentos.suma(intentos, IDX_)
                        if (intentoActual >= intentosMaximos) {
                            const error = "Cuenta bloqueada tras 10 intentos. Recupera tu cuenta con tu correo."
                            throw new Error(error)
                        } else {
                            const error = "Datos de identificacíon incorrectos"
                            throw new Error(error)
                        }
                    }
                    await controladorIntentos.restablece(IDX_)
                    if (estadoCuenta === "desactivado") {
                        const error = "Esta cuenta esta desactivada"
                        throw new Error(error)
                    }
                    const fechaActualISO = DateTime.utc().toISO();

                    const actualizarUltimoLogin = `
                    UPDATE usuarios
                    SET 
                        "ultimoLogin" = $1
                    WHERE 
                        usuario = $2;
                    `
                    await conexion.query(actualizarUltimoLogin, [fechaActualISO, usuario])

                    entrada.session.usuario = IDX_;
                    entrada.session.IDX = IDX_;
                    entrada.session.rol = rol
                    entrada.session.ip = ip
                    entrada.session.userAgent = userAgent

                    const ok = {
                        ok: IDX_,
                        rol: rol,
                        //controlEstado: "Objeto en IF IDX",
                    }
                    salida.json(ok)
                }

                if (IDX === "desconectar") {
                    entrada.session.destroy();
                    salida.clearCookie("VitiniID");
                    const respuesta = {
                        IDX: "desconectado"
                    }
                    salida.json(respuesta);
                }
                if (IDX === "estado") {


                    const usuario = entrada.session?.usuario;
                    const rol = entrada.session?.rol
                    const respuesta = {}
                    if (usuario) {
                        respuesta.estado = "conectado"
                        respuesta.usuario = usuario
                        respuesta.rol = rol
                        respuesta.cuentaVerificada = "no"
                        const consultaEstadoVerificado = `
                        SELECT
                        "cuentaVerificada"
                        FROM 
                        usuarios 
                        WHERE 
                        usuario = $1
                        `
                        const resuelveEstadoVerificado = await conexion.query(consultaEstadoVerificado, [usuario])
                        const estadoCuenta = resuelveEstadoVerificado.rows[0].cuentaVerificada
                        if (estadoCuenta === "si") {
                            respuesta.cuentaVerificada = "si"
                        }
                    } else {
                        respuesta.estado = "desconectado"
                    }
                    salida.json(respuesta)
                }
            } catch (errorCapturado) {
                const error = {
                    error: errorCapturado.message
                }
                salida.json(error)
            }
        },
        componentes: {
            cambiarVista: async () => {
                try {
                    let vista = entrada.body.vista
                    if (!vista) {
                        const error = "Tienes que definir 'Vista' con el nombre de la vista"
                        throw new Error(error)

                    }
                    vista = vista.replace(/[^A-Za-z0-9_\-/=:]/g, '');
                    const transaccion = {
                        vista: vista,
                        usuario: entrada.session?.usuario,
                        rol: entrada.session?.rol
                    }
                    const transaccionInterna = await cambiarVista(transaccion)
                    salida.json(transaccionInterna)
                } catch (errorCapturado) {
                    const error = {}
                    if (errorCapturado.message === "noExisteLaVista") {
                        error.error = "noExisteLaVista"
                    } else {
                        error.error = "noExisteLaVista"
                    }

                    salida.json(error)
                }
            },
            calendario: async () => {
                try {
                    let tipo = entrada.body.tipo

                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                    const tiempoZH = DateTime.now().setZone(zonaHoraria);

                    const fechaActualCompletaTZ = tiempoZH.toISO()
                    const fechaActualTZ = tiempoZH.toISODate()

                    const diaHoyTZ = tiempoZH.day
                    const mesPresenteTZ = tiempoZH.month
                    const anoPresenteTZ = tiempoZH.year

                    const horaPresenteTZ = tiempoZH.hour
                    const minutoPresenteTZ = tiempoZH.minute

                    if (tipo === "actual") {

                        const anoActual = anoPresenteTZ;
                        const mesActual = mesPresenteTZ;
                        const diaActual = diaHoyTZ;

                        const posicionDia1 = tiempoZH.set({ day: 1 }).weekday
                        const numeroDeDiasPorMes = tiempoZH.daysInMonth;

                        const respuesta = {
                            calendario: "ok",
                            ano: anoActual,
                            mes: mesActual,
                            dia: diaActual,
                            tiempo: "presente",
                            posicionDia1: posicionDia1,
                            numeroDiasPorMes: numeroDeDiasPorMes
                        }
                        salida.json(respuesta)
                    }
                    if (tipo === "personalizado") {
                        const ano = entrada.body.ano
                        const mes = entrada.body.mes
                        const calendario = {}
                        if (typeof ano !== 'number' || typeof mes !== 'number') {
                            const error = "H el 'Mes' y el 'Ano' tienen que ser numeros y no cadenas, es decir numeros a saco sin comillas"
                            throw new Error(error)
                        }

                        if (mes < 1 || mes > 12) {
                            const error = "El mes solo puede ser un campo entre 1 y 12"
                            throw new Error(error)
                        }

                        if (ano < 1 || ano > 9999) {
                            const error = "El ano solo puede ser un numero entre 1 y 9999"
                            throw new Error(error)
                        }
                        // Limite del presente
                        const anoActual = anoPresenteTZ;
                        const mesActual = mesPresenteTZ

                        if (anoActual > ano) {
                            calendario.tiempo = "pasado"
                            calendario.detalleTemporal = "pasadoPorAno"
                        }

                        if (anoActual === ano && mesActual > mes) {
                            calendario.tiempo = "pasado"
                            calendario.detalleTemporal = "pasadoPorMes"

                        }
                        let tiempoConfig

                        if (anoActual === ano && mesActual === mes) {
                            tiempoConfig = "presente"
                            calendario.tiempo = "presente"


                        }
                        if (anoActual < ano) {
                            tiempoConfig = "futuroPorAno"
                            calendario.tiempo = "futuro"
                            calendario.detalleTemporal = "futuroPorAno"

                        }
                        if (anoActual === ano && mesActual < mes) {
                            calendario.tiempo = "futuro"
                            calendario.detalleTemporal = "futuroPorMes"

                        }

                        if (tiempoConfig === "presente") {
                            const diaActual = diaHoyTZ
                            calendario.dia = diaActual
                        }

                        const fecha = DateTime.fromObject({ year: ano, month: mes, day: 1 });
                        const numeroDeDiasPorMes = fecha.daysInMonth;
                        const posicionDiaComienzoMes = fecha.weekday

                        calendario.calendario = "ok"
                        calendario.ano = ano
                        calendario.mes = mes
                        // Calendario["Tiempo"] = Tiempo
                        calendario.numeroDiasPorMes = numeroDeDiasPorMes
                        calendario.posicionDia1 = posicionDiaComienzoMes

                        salida.json(calendario)

                    }
                    if (tipo === "diaMinimoDeEntrada") {

                        const fechaMinimaDeEntrada  = tiempoZH.plus({ days: 365 })



                        


                        
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    }
                    salida.json(error)
                }
            },
            precioReserva: async () => {
                try {
                    const tipoProcesadorPrecio = entrada.body.tipoProcesadorPrecio
                    const reserva = entrada.body.reserva
                    const rolActual = entrada.session.rol

                    if (tipoProcesadorPrecio !== "objeto" && tipoProcesadorPrecio !== "uid") {
                        const error = "El campo 'tipoProcesadorPrecio' solo puede ser objeto o uid"
                        throw new Error(error)
                    }
                    if (tipoProcesadorPrecio !== "objeto" && rolActual !== "administrador") {

                        const error = "El componente precioReserva solo ofrece informacion de reserva por UID a cuentas con rol administrativo"
                        throw new Error(error)
                    }
                    if (tipoProcesadorPrecio === "objeto") {
                        await validarObjetoReservaSoloFormato(reserva)
                    }
                    const transaccion = {
                        tipoProcesadorPrecio: tipoProcesadorPrecio,
                        reserva: reserva
                    }


                    const transaccionInterna = await precioReserva(transaccion)

                    salida.json(transaccionInterna)
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    }

                    salida.json(error)
                } finally {

                }

            },
            pasarela: {
                squareConstruyeCliente: async () => {
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
                        }
                        salida.json(clienteMetadatos)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                bluesnap: {
                    generarToken: async () => {

                        const entornoApi = process.env.BLUESNAP_ENTORNO
                        const blueSnapUser = process.env.BLUESNAP_USER
                        const blueSnapPass = process.env.BLUESNAP_PASS
                        const authBase64 = Buffer.from(`${blueSnapUser}:${blueSnapPass}`).toString('base64');

                        let url
                        if (entornoApi === "sandbox") {
                            url = 'https://sandbox.bluesnap.com/services/2/payment-fields-tokens';

                        }
                        if (entornoApi === "pro") {
                            url = 'https://ws.bluesnap.com/services/2/payment-fields-tokens';

                        }
                        const headers = {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Basic ${authBase64}`,
                            'Host': 'sandbox.bluesnap.com'
                        };
                        const data = {
                            // Tu payload JSON aquí
                        };

                        try {
                            const response = await axios.post(url, data, { headers });
                            const location = response.headers.location

                            const locationUrlArray = location.split("/")
                            const tokenFronURL = locationUrlArray[locationUrlArray.length - 1]
                            const token = tokenFronURL

                            const ok = {
                                token: token
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }



                }

            },
            pdf: async () => {
                try {

                    const nombreEnlace = entrada.body.enlace
                    const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;

                    if (!filtroTextoSimple.test(nombreEnlace)) {
                        const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                        throw new Error(error)
                    }
                    await componentes.gestionEnlacesPDF.controlCaducidad()
                    const consultaValidarEnlace = `
                    SELECT
                    "reservaUID"
                    FROM 
                    "enlacesPdf" 
                    WHERE 
                    enlace = $1
                    `
                    const resuelveValidarEnlace = await conexion.query(consultaValidarEnlace, [nombreEnlace])


                    if (resuelveValidarEnlace.rowCount === 0) {
                        const error = "No existe el enlace para generar el PDF"
                        throw new Error(error)
                    }


                    const reservaUID = resuelveValidarEnlace.rows[0].reservaUID
                    const datosDetallesReserva = {
                        reservaUID: reservaUID
                    }
                    const reserva = await detallesReserva(datosDetallesReserva)
                    const pdf = await generadorPDF3(reserva)
                    salida.setHeader('Content-Type', 'application/pdf');
                    salida.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
                    salida.send(pdf);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    }

                    salida.json(error)
                }
            },
            diasOcupadosTotalmentePorMes: async () => {

                try {
                    const mes = entrada.body.mes
                    const ano = entrada.body.ano
                    if (typeof mes !== "number" || !Number.isInteger(mes) || mes < 0 || mes > 12) {
                        const error = "El campo 'mes' solo puede ser un numero entero y positivo entre el 1 y el 12"
                        throw new Error(error)
                    }

                    if (typeof ano !== "number" || !Number.isInteger(ano) || ano < 0) {
                        const error = "El campo 'ano' solo puede ser un numero entero y positivo y superior a 0"
                        throw new Error(error)
                    }

                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                    const tiempoZH = DateTime.now().setZone(zonaHoraria);

                    const anoActual = tiempoZH.year
                    const mesActual = tiempoZH.month

                    const contructorMes = DateTime.fromObject({ year: ano, month: mes, day: 1 });
                    // Obtén el último día del mes
                    const ultimoDiaDelMes = contructorMes.endOf("month");
                    // Extrae el número del último día del mes
                    const numeroUltimoDia = ultimoDiaDelMes.day;


                    const rol = entrada.session.rol
                    const rolAdministrador = "administrador"
                    const rolEmpleado = "empleado"

                    if (anoActual > ano) {
                        if (rol !== rolAdministrador && rol !== rolEmpleado) {
                            const error = "Este componete solo proporciona informacion de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado"
                            throw new Error(error)
                        }

                    } else if (anoActual === ano && mesActual > mes) {
                        if (rol !== rolAdministrador && rol !== rolEmpleado) {
                            const error = "Este componete solo proporciona informacion de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado"
                            throw new Error(error)
                        }
                    }

                    const estadoReservaCancelada = "cancelada"
                    const reservarEnEseMes = `
                    SELECT 
                    reserva,
                    to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                    to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                    FROM 
                    reservas
                    WHERE
                    (
                        DATE_PART('YEAR', entrada) < $2
                        OR (
                            DATE_PART('YEAR', entrada) = $2
                            AND DATE_PART('MONTH', entrada) <= $1
                        )
                    )
                    AND (
                        DATE_PART('YEAR', salida) > $2
                        OR (
                            DATE_PART('YEAR', salida) = $2
                            AND DATE_PART('MONTH', salida) >= $1
                        )
                    )
                    AND "estadoReserva" <> $3
                   `
                    const resuelveReservarEnEseMes = await conexion.query(reservarEnEseMes, [mes, ano, estadoReservaCancelada])
                    const reservasCoincidentes = resuelveReservarEnEseMes.rows

                    // Cuantos apartamentos disponibles existen
                    const consultaApartamentosDisponibles = `
                    SELECT 
                    "apartamentoIDV"
                    FROM 
                    "configuracionApartamento"
                    WHERE 
                    "estadoConfiguracion" = $1;          
                   `
                    const estadoConfiguracionDisponible = "disponible"
                    const resuelveConsultaApartamentosDisponibles = await conexion.query(consultaApartamentosDisponibles, [estadoConfiguracionDisponible])
                    if (resuelveConsultaApartamentosDisponibles.rowCount === 0) {
                        const error = "No hay ningun apartamento disponible"
                        throw new Error(error)
                    }
                    const apartamentosDisponiblesPorFormatear = resuelveConsultaApartamentosDisponibles.rows

                    const apartamentosDisponbiles = []
                    const apartamentosConfiguradosDisponibles = []
                    apartamentosDisponiblesPorFormatear.map((apartamento) => {
                        apartamentosConfiguradosDisponibles.push(apartamento.apartamentoIDV)
                    })

                    const consultaApartamentosBloqueados = ` 
                    SELECT 
                    apartamento,
                    "tipoBloqueo",
                    to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                    to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                    FROM "bloqueosApartamentos"
                    WHERE
                    (
                        "tipoBloqueo" = $4 AND
                        (
                        DATE_PART('YEAR', entrada) < $2
                        OR (
                            DATE_PART('YEAR', entrada) = $2
                            AND DATE_PART('MONTH', entrada) <= $1
                        )
                    )
                    AND (
                        DATE_PART('YEAR', salida) > $2
                        OR (
                            DATE_PART('YEAR', salida) = $2
                            AND DATE_PART('MONTH', salida) >= $1
                        )
                    )) 
                    OR
                    "tipoBloqueo" = $3;
                    `
                    const bloqueoTemporal = "rangoTemporal"
                    const bloqueoPermanente = "permanente"
                    const resuelveApartamentosBloqueados = await conexion.query(consultaApartamentosBloqueados, [mes, ano, bloqueoPermanente, bloqueoTemporal])
                    const bloqueosCoincidentes = resuelveApartamentosBloqueados.rows


                    // Seleccionar apartamentos bloqueados
                    const obtenerFechasInternas = (fechaEntrada_ISO, fechaSalida_ISO) => {

                        const fechasInternas = [];
                        let fechaActual = DateTime.fromISO(fechaEntrada_ISO)
                        const fechaFin = DateTime.fromISO(fechaSalida_ISO)

                        while (fechaActual <= fechaFin) {
                            const diaInterno = fechaActual.day;
                            const mesInterno = fechaActual.month;
                            const anoInterno = fechaActual.year;


                            const diaFinal = diaInterno.toString()
                            if (mes === mesInterno && ano === anoInterno) {
                                fechasInternas.push(diaInterno);
                            }

                            // Incrementa la fecha actual en un día
                            fechaActual = fechaActual.plus({ days: 1 });
                        }

                        return fechasInternas;
                    }
                    const objetoFechasInternas = {}
                    for (const reservaCoincidente of reservasCoincidentes) {
                        const reservaUID = reservaCoincidente.reserva
                        const consultaApartamentosPorReserva = `
                        SELECT 
                        apartamento
                        FROM "reservaApartamentos"
                        WHERE reserva = $1;          
                        `
                        const resuelveConsultaApartamentosPorReserva = await conexion.query(consultaApartamentosPorReserva, [reservaUID])
                        if (resuelveConsultaApartamentosPorReserva.rowCount > 0) {

                            const apartamentosPorReservaObjetoCompleto = resuelveConsultaApartamentosPorReserva.rows
                            const apartamentosPorReservaArray = []
                            apartamentosPorReservaObjetoCompleto.map((apartamento) => {
                                apartamentosPorReservaArray.push(apartamento.apartamento)
                            })

                            const fechaEntrada_ISO = reservaCoincidente.fechaEntrada_ISO
                            const fechaSalida_ISO = reservaCoincidente.fechaSalida_ISO


                            const fechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO);

                            fechasInternas.map((fechaInterna) => {
                                if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                                    const detalleDia = {
                                        fecha: `${fechaInterna}/${mes}/${ano}`,
                                        apartamentos: apartamentosPorReservaArray,
                                        estadoDia: "porVer"
                                    }
                                    objetoFechasInternas[fechaInterna] = detalleDia
                                } else {

                                    let arrayExistente = objetoFechasInternas[fechaInterna].apartamentos
                                    const arrayFusion = Array.from(new Set(arrayExistente.concat(apartamentosPorReservaArray)));
                                    objetoFechasInternas[fechaInterna].apartamentos = arrayFusion
                                }

                            })
                        }
                    }

                    for (const bloqueoCoincidente of bloqueosCoincidentes) {
                        const bloqueoUID = bloqueoCoincidente.uid
                        const apartamentoIDV = bloqueoCoincidente.apartamento
                        const fechaEntrada_ISO = bloqueoCoincidente.fechaEntrada_ISO
                        const fechaSalida_ISO = bloqueoCoincidente.fechaSalida_ISO
                        const tipoBloqueo = bloqueoCoincidente.tipoBloqueo
                        if (tipoBloqueo === "rangoTemporal") {
                            const fechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO);


                            fechasInternas.map((fechaInterna) => {

                                if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                                    const detalleDia = {
                                        fecha: `${fechaInterna}/${mes}/${ano}`,
                                        apartamentos: Array(apartamentoIDV),
                                        estadoDia: "porVer"
                                    }
                                    objetoFechasInternas[fechaInterna] = detalleDia
                                } else {
                                    const arrayExistente = objetoFechasInternas[fechaInterna].apartamentos
                                    if (!arrayExistente.includes(apartamentoIDV)) {
                                        arrayExistente.push(apartamentoIDV);
                                    }
                                    //objetoFechasInternas[fechaInterna].apartamentos = arrayExistente
                                }

                            })
                        }
                        if (tipoBloqueo === "permanente") {
                            // EL error esta en que anoActual es el ano del presetne y no del año que se le solicita
                            const fechaInicioDelMes_ISO = `${ano}-${String(mes).padStart(2, "0")}-01`
                            const fechaFinDelMes_ISO = `${ano}-${String(mes).padStart(2, "0")}-${String(numeroUltimoDia).padStart(2, "0")}`


                            const fechasInternas = obtenerFechasInternas(fechaInicioDelMes_ISO, fechaFinDelMes_ISO);


                            fechasInternas.map((fechaInterna) => {
                                if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                                    const detalleDia = {
                                        fecha: `${fechaInterna}/${mes}/${ano}`,
                                        apartamentos: Array(apartamentoIDV),
                                        estadoDia: "porVer"
                                    }
                                    objetoFechasInternas[fechaInterna] = detalleDia
                                } else {
                                    const arrayExistente = objetoFechasInternas[fechaInterna].apartamentos
                                    if (!arrayExistente.includes(apartamentoIDV)) {
                                        arrayExistente.push(apartamentoIDV);
                                    }
                                    //objetoFechasInternas[fechaInterna].apartamentos = arrayExistente
                                }

                            })

                        }




                    }

                    // Sacar todos los uid de los calendarios
                    const calendariosSincronizadosAirbnb = (await obtenerTodosLosCalendarios()).calendariosSincronizados
                    for (const detallesDelCalendario of calendariosSincronizadosAirbnb) {
                        const apartamentoIDV = detallesDelCalendario.apartamentoIDV
                        const nombreCalendario = detallesDelCalendario.nombreCalendario
                        const calendarioObjeto = detallesDelCalendario.calendarioObjeto

                        for (const detallesDelEvento of calendarioObjeto) {
                            const fechaInicioEvento_ISO = detallesDelEvento.fechaInicio
                            const fechaFinalEvento_ISO = detallesDelEvento.fechaFinal
                            const apartamentosPorReservaArray = [apartamentoIDV]
                            const fechasInternas = obtenerFechasInternas(fechaInicioEvento_ISO, fechaFinalEvento_ISO);

                            fechasInternas.map((fechaInterna) => {
                                if (!objetoFechasInternas[fechaInterna]?.apartamentos) {
                                    const detalleDia = {
                                        fecha: `${fechaInterna}/${mes}/${ano}`,
                                        apartamentos: apartamentosPorReservaArray,
                                        estadoDia: "porVer"
                                    }
                                    objetoFechasInternas[fechaInterna] = detalleDia
                                } else {

                                    let arrayExistente = objetoFechasInternas[fechaInterna].apartamentos
                                    const arrayFusion = Array.from(new Set(arrayExistente.concat(apartamentosPorReservaArray)));
                                    objetoFechasInternas[fechaInterna].apartamentos = arrayFusion
                                }

                            })
                        }
                    }


                    // Y  por calendario, procesar los eventos
                    // Obtener los objetos de los dias de los calendarios sincronizados
                    // Pasarlo por fechas intenras e agregar con el sistema que impide duplicados


                    const controlEstadoDia = (apartamentosConfiguradosDisponibles, apartamentosEncontradosNoDisponibles) => {
                        apartamentosConfiguradosDisponibles.sort();
                        apartamentosEncontradosNoDisponibles.sort()
                        if (apartamentosConfiguradosDisponibles.length === 0) {
                            return "diaCompleto"
                        }
                        else if (apartamentosEncontradosNoDisponibles.length === 0) {
                            return "libre"
                        }
                        else if (apartamentosConfiguradosDisponibles.some(apartamento => !apartamentosEncontradosNoDisponibles.includes(apartamento))) {
                            return "diaParcial"; // Los arrays tienen longitudes diferentes, no pueden ser iguales
                        } else if (apartamentosConfiguradosDisponibles.every(apartamento => apartamentosEncontradosNoDisponibles.includes(apartamento))) {
                            return "diaCompleto"
                        }
                    }


                    for (const [fechaDia, detallesDia] of Object.entries(objetoFechasInternas)) {
                        const apartamentosEncontradosNoDisponibles = detallesDia.apartamentos
                        detallesDia.estadoDia = controlEstadoDia(apartamentosConfiguradosDisponibles, apartamentosEncontradosNoDisponibles)
                    }

                    const respuestaFinal = {
                        mes: mes,
                        dias: objetoFechasInternas

                    }
                    const objetofinal = {
                        ok: respuestaFinal
                    }

                    salida.json(objetofinal)

                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    }

                    salida.json(error)

                } finally {

                }
            },
            fechaLocal: async () => {

                try {
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                    const tiempoZH = DateTime.now().setZone(zonaHoraria);
                    const fechaActualTZ = tiempoZH.toISODate()
                    const dia = tiempoZH.day
                    const mes = tiempoZH.month
                    const ano = tiempoZH.year
                    const hora = tiempoZH.hour
                    const minuto = tiempoZH.minute

                    const estructura = {
                        zonaHoraria: zonaHoraria,
                        dia: dia,
                        mes: mes,
                        ano: ano,
                        hora: hora,
                        minuto: minuto,
                        fechaISO: fechaActualTZ
                    }
                    salida.json(estructura)
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    }
                    salida.json(error)
                }

            },
            imagenDelApartamento: async () => {

                try {
                    const apartamentoIDV = entrada.body.apartamentoIDV
                    const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                    if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                        const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres"
                        throw new Error(error)
                    }

                    const consultaApartamento = `
                    SELECT imagen
                    FROM "configuracionApartamento" 
                    WHERE "apartamentoIDV" = $1;`
                    const resuelveApartamento = await conexion.query(consultaApartamento, [apartamentoIDV])
                    if (resuelveApartamento.rowCount === 0) {
                        const error = "No existe ningun apartamento con ese identificador visua, revisa el apartamentoIDV"
                        throw new Error(error)
                    }

                    const ok = {
                        ok: "Imagen de apartamento PNG en base64",
                        imagen: resuelveApartamento.rows[0].imagen
                    }


                    salida.json(ok)
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    }

                    salida.json(error)
                }

            },



        },
        plaza: {
            reservas: {
                confirmarReserva: async () => {
                    await mutex.acquire();

                    try {
                        const reserva = entrada.body.reserva
                        await conexion.query('BEGIN');
                        const resuelveValidacionObjetoReserva = await validarObjetoReserva(reserva);
                        if (!resuelveValidacionObjetoReserva.ok) {
                            const error = "Ha ocurrido un error desconocido en la validacion del objeto"
                            throw new Error(error)
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()
                        const metadatos = {
                            tipoProcesadorPrecio: "objeto",
                            reserva: reserva
                        }

                        const resuelvePrecioReserva = await precioReserva(metadatos);
                        const totalConImpuestos = resuelvePrecioReserva.ok.desgloseFinanciero.totales.totalConImpuestos


                        if (!totalConImpuestos) {
                            const error = "Debido a un error inesperado no se ha podido obtener el precio final"
                            throw new Error(error)
                        }
                        const precioBrutoFinal = totalConImpuestos.replaceAll(".", "")
                        const token = entrada.body.token;
                        const idempotencyKey = entrada.body.idempotencyKey;

                        const moduloPagoEstado = "activado"
                        if (!token || !idempotencyKey) {
                            const error = "Falta el token o el idempotencyKey por lo tanto se cancela el proceso de pago"
                            if (moduloPagoEstado === "desactivado") {
                                throw new Error(error)
                            }
                        }
                        const locationResponse = await clienteSquare.locationsApi.retrieveLocation(SQUARE_LOCATION_ID);
                        const currency = locationResponse.result.location.currency;

                        const pago = {
                            idempotencyKey,
                            verificationToken: entrada.body.verificationToken,
                            sourceId: token,
                            amountMoney: {
                                amount: Number(precioBrutoFinal), // $1.00 charge = 100
                                currency
                            }
                        };



                        const resolverPago = await componentes.pasarela.crearPago(pago)

                        const resolvertInsertarReserva = await insertarReserva(reserva)


                        const reservaUID = resolvertInsertarReserva.reservaUID

                        const tarjeta = resolverPago.cardDetails.card.cardBrand
                        const tarjetaDigitos = resolverPago.cardDetails.card.last4
                        const cantidadSinPunto = resolverPago.amountMoney.amount
                        const cantidadConPunto = utilidades.deFormatoSquareAFormatoSQL(cantidadSinPunto)
                        const fechaDePago = resolverPago.createdAt
                        const pagoUIDPasarela = resolverPago.id
                        const plataformaDePago = "pasarela"

                        const asociarPago =
                            `
                            INSERT INTO
                            "reservaPagos"
                            (
                            "plataformaDePago",
                            tarjeta,
                            "tarjetaDigitos",
                            "pagoUIDPasarela",
                            reserva,
                            cantidad,
                            "fechaPago"
                            )
                            VALUES 
                            ($1, $2, $3, $4, $5, $6, $7);
                            `
                        const datosPago = [
                            plataformaDePago,
                            tarjeta,
                            tarjetaDigitos,
                            pagoUIDPasarela,
                            reservaUID,
                            cantidadConPunto,
                            fechaDePago
                        ]
                        await conexion.query(asociarPago, datosPago)
                        await actualizarEstadoPago(reservaUID)

                        if (resolvertInsertarReserva.ok) {
                            const metadatos = {
                                reservaUID: reservaUID,
                                solo: "globalYFinanciera"
                            }

                            const resolverDetallesReserva = await detallesReserva(metadatos)
                            const enlacePDF = await componentes.gestionEnlacesPDF.crearEnlacePDF(reservaUID)
                            resolverDetallesReserva.enlacePDF = enlacePDF

                            const ok = {
                                ok: "Reserva confirmada y pagada",
                                x: "casaVitini.ui.vistas.reservasNuevo.reservaConfirmada.sustitutorObjetos",
                                detalles: resolverDetallesReserva

                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT');
                        // Si hay un error en el envio del email, este no escala, se queda local.

                        enviarEmailReservaConfirmaada(reservaUID)

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK');
                        const errorFinal = {};
                        if (errorCapturado.message && !errorCapturado.errors) {
                            errorFinal.error = errorCapturado.message


                        }
                        if (errorCapturado.errors) {
                            errorFinal.error = errorCapturado.errors[0].detail
                        }
                        salida.json(errorFinal)
                    } finally {
                        mutex.release();
                    }
                },
                apartamentosDisponiblesPublico: async () => {
                    try {
                        const fechaEntrada = entrada.body.entrada
                        const fechaSalida = entrada.body.salida

                        if (!fechaEntrada) {
                            const error = "falta definir el campo 'entrada'"
                            throw new Error(error)
                        }

                        if (!fechaSalida) {
                            const error = "falta definir el campo 'salida'"
                            throw new Error(error)
                        }

                        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO
                        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO
                        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                        const tiempoZH = DateTime.now().setZone(zonaHoraria);
                        const fechaActual_ISO = tiempoZH.toISODate()

                        const fechaEntrad_objeto = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
                        if (fechaEntrad_objeto < tiempoZH.startOf('day')) {
                            const error = "La fecha de entrada no puede ser inferior a la fecha actual. Solo se pueden hacer reservas a partir de hoy"
                            throw new Error(error)
                        }

                        const fecha = {
                            fechaEntrada_ISO: fechaEntrada_ISO,
                            fechaSalida_ISO: fechaSalida_ISO
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()
                        const resuelveADP = await apartamentosDisponiblesPublico(fecha)
                        const apartamentosDisponiblesEntonctrados = resuelveADP.apartamentosDisponibles

                        const resuelveCA = await configuracionApartamento(apartamentosDisponiblesEntonctrados)
                        const estructuraFinal = {}
                        estructuraFinal.apartamentosDisponibles = resuelveCA.configuracionApartamento
                        // Aqui se deberia mostra la media del precio en relacion con las fechas
                        const metadatos = {
                            fechaEntrada_ISO: fechaEntrada_ISO,
                            fechaSalida_ISO: fechaSalida_ISO,
                            apartamentosIDVArreglo: apartamentosDisponiblesEntonctrados
                        }

                        const resolverPrecioApartamento = await precioRangoApartamento(metadatos)

                        // Aquí se borra metadatos, pero ojo cuidado por que en precioReserva se necesita. Así que solo se borra de aquí
                        delete resolverPrecioApartamento.metadatos
                        estructuraFinal.desgloseFinanciero = resolverPrecioApartamento
                        const ok = {
                            ok: estructuraFinal
                        }
                        salida.json(ok)


                    } catch (errorCapturado) {

                        const error = {
                            error: errorCapturado.message
                        }


                        salida.json(error)
                    }

                },

            },
            enlaceDePago: {
                obtenerPago: async () => {
                    try {
                        const pagoUID = entrada.body.pagoUID
                        const filtroCadena = /^[a-z0-9]+$/;

                        if (!pagoUID || !filtroCadena.test(pagoUID)) {
                            const error = "el codigo de un enlace de pago solo puede ser una cadena de minuscuals y numeros y ya esta"
                            throw new Error(error)
                        }

                        const consultaDetallesEnlace = `
                        SELECT
                        "nombreEnlace", 
                        codigo, 
                        reserva,
                        cantidad,
                        descripcion,
                        caducidad,
                        "estadoPago"
                        FROM "enlacesDePago"
                        WHERE codigo = $1;`
                        const resuelveConsultaDetallesEnlace = await conexion.query(consultaDetallesEnlace, [pagoUID])

                        if (resuelveConsultaDetallesEnlace.rowCount === 0) {
                            const error = "No existe ningún pago con este identificador de pago, por favro revisa que el identificador de pago sea correcto y no halla caducado"
                            throw new Error(error)
                        }

                        if (resuelveConsultaDetallesEnlace.rowCount === 1) {





                            const detallesEnlace = resuelveConsultaDetallesEnlace.rows[0]


                            const estadoPago = detallesEnlace.estadoPago
                            if (estadoPago === "pagado") {
                                const error = "Este enlace de pago esta pagado"
                                throw new Error(error)

                            }

                            const codigo = detallesEnlace.codigo
                            const reserva = detallesEnlace.reserva
                            const cantidadPagoParcial = detallesEnlace.cantidad

                            const consultaEstadoPago = `
                            SELECT
                            "estadoPago",
                            "estadoReserva"
                            FROM reservas
                            WHERE reserva = $1;`

                            const resuelveConsultaEstadoPago = await conexion.query(consultaEstadoPago, [reserva])
                            const estadoReserva = resuelveConsultaEstadoPago.rows[0].estadoReserva

                            if (estadoReserva === "cancelada") {
                                const error = "La reserva esta cancelada"
                                throw new Error(error)
                            }
                            // Hay que cambiar esto para hacer un pago en base a la cantidad especifica del enlace de pago y no del total de la reserva
                            /*
                            promedioNetoPorNoche
                            totalReservaNetoSinOfertas
                            totalReservaNeto
                            totalDescuentosAplicados
                            totalImpuestos
                            totalConImpuestos
                            */
                            const consultaTotalesReserva = `
                            SELECT
                            "promedioNetoPorNoche",
                            "totalReservaNetoSinOfertas",
                            "totalReservaNeto",
                            "totalDescuentos",
                            "totalImpuestos",
                            "totalConImpuestos"
                            FROM "reservaTotales"
                            WHERE reserva = $1;`
                            const resuelveConsultaTotalesReserva = await conexion.query(consultaTotalesReserva, [reserva])
                            if (resuelveConsultaTotalesReserva.rowCount === 0) {
                                const error = "Esta reserva no tiene totales"
                                throw new Error(error)
                            }
                            const estructuraTotales = resuelveConsultaTotalesReserva.rows[0]

                            const sumaImpuestos = new Decimal(estructuraTotales.totalImpuestos)
                            const totalNeto = new Decimal(estructuraTotales.totalReservaNeto)
                            const proporcion = new Decimal(cantidadPagoParcial).times(100).dividedBy(totalNeto).times(sumaImpuestos.dividedBy(100));


                            const calcularProporcionNetoImpuestosPagoParcial = (precioNetoReserva, impuestosReserva, cantidadPago) => {
                                // Convierte los valores a objetos Decimal para mayor precisión
                                const precioNetoDecimal = new Decimal(precioNetoReserva);
                                const impuestosDecimal = new Decimal(impuestosReserva);
                                const cantidadPagoDecimal = new Decimal(cantidadPago);

                                // Calcula el precio bruto sumando el precio neto y los impuestos
                                const precioBruto = precioNetoDecimal.plus(impuestosDecimal);

                                // Calcula la proporción que representa la cantidad del pago con respecto al precio bruto
                                const proporcionPago = cantidadPagoDecimal.div(precioBruto);

                                // Calcula el precio neto correspondiente a la cantidad del pago
                                const precioNetoPago = precioNetoDecimal.times(proporcionPago);

                                // Calcula los impuestos correspondientes a la cantidad del pago
                                const impuestosPago = impuestosDecimal.times(proporcionPago);

                                // Devuelve los resultados como objetos Decimal
                                // Redondea los resultados a dos decimales
                                const precioNetoRedondeado = precioNetoPago.toDecimalPlaces(2);
                                const impuestosRedondeados = impuestosPago.toDecimalPlaces(2);

                                // Devuelve los resultados redondeados como strings
                                return {
                                    precioNetoPago: precioNetoRedondeado.toString(),
                                    impuestosPago: impuestosRedondeados.toString(),
                                };
                            }



                            // Ejemplo de uso
                            const precioNetoReserva = 122;
                            const impuestosReserva = 18; // Por ejemplo
                            const cantidadPago = 50;

                            const resultadoCalculado = calcularProporcionNetoImpuestosPagoParcial(estructuraTotales.totalReservaNeto, estructuraTotales.totalImpuestos, cantidadPagoParcial);


                            const estructuraEnlace = {
                                codigo: codigo,
                                reserva: reserva,
                                totales: estructuraTotales,
                                pagoParcial: {
                                    netoParcial: resultadoCalculado.precioNetoPago,
                                    impuestosParciales: resultadoCalculado.impuestosPago,
                                    cantidadParcial: cantidadPagoParcial,
                                }
                            }
                            const ok = {
                                ok: estructuraEnlace
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                realizarPago: async () => {
                    await mutex.acquire();

                    try {

                        const enlaceUID = entrada.body.enlaceUID
                        const filtroCadena = /^[a-z0-9]+$/;

                        if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                            const error = "el codigo de un enlace de pago solo puede ser una cadena de minuscuals y numeros y ya esta"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const consultaDetallesEnlace = `
                        SELECT
                        reserva,
                        cantidad,
                        "estadoPago"
                        FROM "enlacesDePago"
                        WHERE codigo = $1;`
                        const resuelveConsultaDetallesEnlace = await conexion.query(consultaDetallesEnlace, [enlaceUID])
                        if (resuelveConsultaDetallesEnlace.rowCount === 0) {
                            const error = "No existe ningún pago con este identificador de pago, por favro revisa que el identificador de pago sea correcto y no halla caducado"
                            throw new Error(error)
                        }

                        if (resuelveConsultaDetallesEnlace.rowCount === 1) {
                            const detallesEnlace = resuelveConsultaDetallesEnlace.rows[0]
                            const reserva = detallesEnlace.reserva
                            const totalPago = detallesEnlace.cantidad
                            const estadoPagoObtenido = detallesEnlace.estadoPago
                            if (estadoPagoObtenido === "pagado") {
                                const error = "Este enlace de pago ya esta pagado"
                                throw new Error(error)
                            }

                            const consultaEstadoPago = `
                            SELECT
                            "estadoPago",
                            "estadoReserva"
                            FROM reservas
                            WHERE reserva = $1;`

                            const resuelveConsultaEstadoPago = await conexion.query(consultaEstadoPago, [reserva])
                            const estadoReserva = resuelveConsultaEstadoPago.rows[0].estadoReserva

                            if (estadoReserva === "cancelada") {
                                const error = "La reserva esta cancelada"
                                throw new Error(error)

                            }
                            const totalConImpuestosIDV = "totalConImpuestos"
                            const consultaTotalesReserva = `
                            SELECT
                            "totalConImpuestos"
                            FROM "reservaTotales"
                            WHERE reserva = $1;`
                            const resuelveConsultaTotalesReserva = await conexion.query(consultaTotalesReserva, [reserva])
                            if (resuelveConsultaTotalesReserva.rowCount === 0) {
                                const error = "Esta reserva no tiene totales"
                                throw new Error(error)
                            }

                            const totalConImpuestosFormatoFinal = Number(totalPago.replaceAll(".", ""))
                            const token = entrada.body.token;
                            const idempotencyKey = entrada.body.idempotencyKey;
                            const locationResponse = await clienteSquare.locationsApi.retrieveLocation(SQUARE_LOCATION_ID);
                            const currency = locationResponse.result.location.currency;

                            // Charge the customer's card
                            const pago = {
                                idempotencyKey,
                                sourceId: token,
                                //buyer_email_address: "test@test.com",
                                amountMoney: {
                                    amount: totalConImpuestosFormatoFinal, // $1.00 charge
                                    currency
                                }
                            };

                            const detallesDelPago = await componentes.pasarela.crearPago(pago)

                            const tarjeta = detallesDelPago.cardDetails.card.cardBrand
                            const tarjetaDigitos = detallesDelPago.cardDetails.card.last4
                            const pagoUIDPasarela = detallesDelPago.id
                            const cantidadSinPunto = detallesDelPago.amountMoney.amount
                            const cantidadConPunto = utilidades.deFormatoSquareAFormatoSQL(cantidadSinPunto)
                            const fechaDePago = detallesDelPago.createdAt
                            const plataformaDePago = "pasarela"

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
                                "fechaPago"
                            )
                            VALUES 
                            ($1, $2, $3, $4, $5, $6, $7)
                            RETURNING
                            "pagoUID"
                            `
                            const datosPago = [
                                plataformaDePago,
                                tarjeta,
                                tarjetaDigitos,
                                pagoUIDPasarela,
                                reserva,
                                cantidadConPunto,
                                fechaDePago
                            ]
                            const resolverPago = await conexion.query(asociarPago, datosPago)
                            const pagoUID = resolverPago.rows[0].pagoUID
                            const actualizarEstadoPagoEnlaces = `
                            UPDATE "enlacesDePago"
                            SET 
                                "estadoPago" = $1
                            WHERE 
                                codigo = $2;
                            `
                            const estadoPagado = "pagado"
                            const actualizarDatos = [
                                estadoPagado,
                                enlaceUID
                            ]

                            await conexion.query(actualizarEstadoPagoEnlaces, actualizarDatos)
                            await actualizarEstadoPago(reserva)


                            const detalles = {
                                pagoUID: pagoUID,
                                mensaje: "Pago realizado correctamente"
                            }

                            const ok = {
                                ok: "Pago realizado correctamente",
                                x: "casaVitini.ui.vistas.pagos.pagoConfirmado",
                                detalles: detalles
                            }
                            salida.json(ok)
                            await conexion.query('COMMIT'); // Confirmar la transacción
                        }
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        let errorFinal;
                        if (errorCapturado.message) {
                            const error = {
                                error: errorCapturado.message
                            }

                            errorFinal = error
                        }
                        if (errorCapturado.errors) {
                            errorFinal.error = errorCapturado.errors[0].detail
                        }
                        salida.json(errorFinal)
                    } finally {
                        mutex.release();

                    }
                }

            }
        },
        miCasa: {
            obtenerSessionesActivasDesdeMiCasa: {
                IDX: {},
                X: async () => {
                    try {


                        const session = entrada.session
                        const usuarioIDX = entrada.session.usuario
                        if (!session || !usuarioIDX) {
                            const error = "Tienes que identificarte para ver las sessiones activas de tu cuenta"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        // validar rol
                        const consultaSessionesActivas = `
                        SELECT 
                        sid AS "sessionIDX",
                        to_char(expire, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "caducidadUTC",
                        sess->> 'ip' AS ip,
                        sess->> 'userAgent' AS "userAgent"
                        FROM sessiones
                        WHERE sess->> 'usuario' = $1;
                        `
                        const resuelveConsultaSessionesActivas = await conexion.query(consultaSessionesActivas, [usuarioIDX])
                        if (resuelveConsultaSessionesActivas.rowCount === 0) {
                            const error = "No existe ninguna session activa para este usuario"
                            throw new Error(error)
                        }










                        const calcularTiempoRestante = (fechaObjetivo) => {
                            const ahora = DateTime.utc(); // Fecha actual en UTC
                            const caducidad = DateTime.fromISO(fechaObjetivo, { zone: 'utc' });


                            if (caducidad <= ahora) {
                                return "Esta session esta caducada y si no se hace una nueva peticion en la proxima hora con el id de session de esta se destruira";
                            }

                            const diferencia = caducidad.diff(ahora);

                            if (diferencia.as('days') >= 2) {
                                return `Quedan ${Math.floor(diferencia.as('days'))} días`;
                            } else if (diferencia.as('hours') >= 1) {
                                return `Quedan ${Math.floor(diferencia.as('hours'))} horas y ${Math.floor(diferencia.as('minutes') % 60)} minutos`;
                            } else {
                                return `Quedan ${Math.floor(diferencia.as('minutes'))} minutos`;
                            }
                        };


                        const sessionesActivas = resuelveConsultaSessionesActivas.rows
                        sessionesActivas.map((detallesSession) => {
                            const fechaUTC_ISO = detallesSession.caducidadUTC
                            const fechaObjeto = DateTime.fromISO(detallesSession.caducidadUTC, { zone: 'utc' });
                            const fechaFormateada = fechaObjeto.toFormat('dd/MM/yyyy HH:mm:ss');
                            detallesSession.caducidadUTC = fechaFormateada
                            detallesSession.tiempoRestante = calcularTiempoRestante(fechaUTC_ISO);
                            const ipFormateada = detallesSession.ip.split(":")[detallesSession.ip.split(":").length - 1]
                            detallesSession.ip = ipFormateada

                        })

                        const ok = {
                            ok: "Sessiones activas",
                            sessionIDX: entrada.sessionID,
                            sessionesActivas: sessionesActivas
                        }
                        salida.json(ok)

                        await conexion.query('COMMIT');
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK');

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                }
            },
            cerrarSessionSelectivamenteDesdeMiCasa: {
                IDX: {},
                X: async () => {
                    try {
                        const usuarioIDX = entrada.session.usuario
                        if (!usuarioIDX) {
                            const error = "Tienes que identificarte para poder cerrar sessiones"
                            //  throw new Error(error)
                        }
                        //  await conexion.query('BEGIN'); // Inicio de la transacción
                        const tipoOperacion = entrada.body.tipoOperacion
                        if (tipoOperacion !== "cerrarUna" && tipoOperacion !== "todasMenosActual") {
                            const error = "El campo tipoOperacion necesita especificar si es cerrarUna o todasMenosUna"
                            throw new Error(error)
                        }

                        if (tipoOperacion === "cerrarUna") {
                            const sessionIDX = entrada.body.sessionIDX
                            const filtroSessionIDX = /^[a-zA-Z0-9_-]+$/
                            if (!sessionIDX || !filtroSessionIDX.test(sessionIDX)) {
                                const error = "El campo sessionIDX solo admite minúsculas, mayúsculas, numeros y nada mas"
                                throw new Error(error)
                            }

                            const cerrarSessionSelectivamente = `
                            DELETE FROM sessiones
                            WHERE sid = $1 AND sess->> 'usuario' = $2;
                            `
                            const resuelveCerrarSessionSelectivamente = await conexion.query(cerrarSessionSelectivamente, [sessionIDX, usuarioIDX])
                            if (resuelveCerrarSessionSelectivamente.rowCount === 0) {
                                const error = "No existe la session que intentas cerrar"
                                throw new Error(error)
                            }
                            if (resuelveCerrarSessionSelectivamente.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha cerrado correctament la session",
                                    sessionAtual: entrada.sessionID
                                }
                                salida.json(ok)
                            }
                        }


                        if (tipoOperacion === "todasMenosActual") {
                            const sessionIDXActual = entrada.sessionID
                            const cerrarSessionTodasMenosActual = `
                            DELETE FROM sessiones
                            WHERE sid != $1 AND sess->> 'usuario' = $2;
                            `
                            const resuelveCerrarSessionTodasMenosActual = await conexion.query(cerrarSessionTodasMenosActual, [sessionIDXActual, usuarioIDX])
                            if (resuelveCerrarSessionTodasMenosActual.rowCount === 0) {
                                const error = "No se ha encontrado ninguna sesión a parte de esta que cerrar "
                                throw new Error(error)
                            }
                            if (resuelveCerrarSessionTodasMenosActual.rowCount > 0) {
                                const ok = {
                                    ok: "Se ha cerrado correctament el resto de sessiones",
                                    sessionAtual: entrada.sessionID
                                }
                                salida.json(ok)
                            }




                        }




                        // await conexion.query('COMMIT');
                    } catch (errorCapturado) {
                        // await conexion.query('ROLLBACK');

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                }
            },
            actualizarClaveUsuarioDesdeMicasa: {
                IDX: {},
                X: async () => {
                    try {
                        const usuarioIDX = entrada.session.usuario

                        const claveActual = entrada.body.claveActual
                        const claveNueva = entrada.body.claveNueva
                        const claveConfirmada = entrada.body.claveConfirmada

                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;

                        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                            const error = "El campo usuarioIDX solo admite minúsculas y numeros"
                            throw new Error(error)
                        }
                        if (!claveActual) {
                            const error = "No has escrito tu contrasena actual en el campo correspondiente"
                            throw new Error(error)
                        }
                        if (!claveNueva) {
                            const error = "Escribe la nueva contrasena en el campo correspondiente"
                            throw new Error(error)
                        } else {
                            validadoresCompartidos.claves.minimoRequisitos(claveNueva)
                        }
                        if (!claveConfirmada) {
                            const error = "Confirma la nueva contrasena antes de cambiarla"
                            throw new Error(error)
                        }

                        if (claveNueva !== claveConfirmada) {
                            const error = "No has escrito dos veces la misma nueva contrasena, revisa las claves que has escrito y cerciorate que ambas claves nueva son iguales"
                            throw new Error(error)
                        }

                        if (claveNueva === claveActual) {
                            const error = "Has escrito una clave nueva que es la misma que la actual. Por favor revisa lo campos."
                            throw new Error(error)
                        }

                        //Obtener claveActual guardada, el hash
                        const obtenerClaveActualHASH = `
                        SELECT 
                        clave,
                        sal
                        FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveObtenerClaveActualHASH = await conexion.query(obtenerClaveActualHASH, [usuarioIDX])
                        if (resuelveObtenerClaveActualHASH.rowCount === 0) {
                            const error = "No existe el usuarios"
                            throw new Error(error)
                        }

                        const claveActualHASH = resuelveObtenerClaveActualHASH.rows[0].clave
                        const sal = resuelveObtenerClaveActualHASH.rows[0].sal

                        const metadatos = {
                            sentido: "comparar",
                            clavePlana: claveActual,
                            sal: sal,
                            claveHash: claveActualHASH
                        }
                        const controlClave = vitiniCrypto(metadatos)
                        if (!controlClave) {
                            const error = "Revisa la contrasena actual que has escrito por que no es correcta por lo tanto no se puede cambiar la contrasena"
                            throw new Error(error)
                        }

                        const cryptoData = {
                            sentido: "cifrar",
                            clavePlana: claveNueva
                        }

                        const retorno = vitiniCrypto(cryptoData)
                        const nuevaSal = retorno.nuevaSal
                        const hashCreado = retorno.hashCreado


                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarClave = `
                        UPDATE usuarios
                        SET 
                            clave = $1,
                            sal = $2
                        WHERE 
                            usuario = $3
                        `
                        const datos = [
                            hashCreado,
                            nuevaSal,
                            usuarioIDX
                        ]
                        const resuelveActualizarClave = await conexion.query(actualizarClave, datos)
                        if (resuelveActualizarClave.rowCount === 1) {
                            const ok = {
                                "ok": "Se ha actualizado la nueva contrasena."
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                }
            },
            eliminarCuentaDesdeMiCasa: {
                IDX: {},
                X: async () => {
                    try {
                        const usuarioIDX = entrada.session.usuario
                        const clave = entrada.body.clave

                        if (!usuarioIDX) {
                            const error = "Tienes que estar identificado"
                            throw new Error(error)
                        }
                        if (!clave) {
                            const error = "No has escrito tu contrasena. Es necesaria para eliminar tu cuenta"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const obtenerClaveActualHASH = `
                        SELECT 
                        clave,
                        sal, 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveObtenerClaveActualHASH = await conexion.query(obtenerClaveActualHASH, [usuarioIDX])
                        if (resuelveObtenerClaveActualHASH.rowCount === 0) {
                            const error = "No existe el usuario"
                            throw new Error(error)
                        }


                        const claveActualHASH = resuelveObtenerClaveActualHASH.rows[0].clave
                        const sal = resuelveObtenerClaveActualHASH.rows[0].sal

                        const metadatos = {
                            sentido: "comparar",
                            clavePlana: clave,
                            sal: sal,
                            claveHash: claveActualHASH
                        }
                        const controlClave = vitiniCrypto(metadatos)
                        if (!controlClave) {
                            const error = "Revisa la contrasena actual que has escrito por que no es correcta por lo tanto no se puede eliminar tu cuenta"
                            throw new Error(error)
                        }

                        // Validar si es un usuario administrador
                        const rol = resuelveObtenerClaveActualHASH.rows[0].rol
                        const rolAdministrador = "administrador"

                        if (rol === rolAdministrador) {
                            const validarUltimoAdministrador = `
                            SELECT 
                            rol
                            FROM usuarios
                            WHERE rol = $1;
                            `
                            const resuelValidarUltimoAdministrador = await conexion.query(validarUltimoAdministrador, [rolAdministrador])
                            if (resuelValidarUltimoAdministrador.rowCount === 1) {
                                const error = "No se puede eliminar esta cuenta por que es la unica cuenta adminsitradora existente. Si quieres eliminar esta cuenta tienes que crear otra cuenta administradora. Por que en el sistema debe de existir al menos una cuenta adminitrador"
                                throw new Error(error)
                            }
                        }









                        const eliminarCuenta = `
                        DELETE FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveEliminarCuenta = await conexion.query(eliminarCuenta, [usuarioIDX])
                        if (resuelveEliminarCuenta.rowCount === 1) {
                            const cerrarSessiones = `
                            DELETE FROM sessiones
                            WHERE sess->> 'usuario' = $1;
                            `
                            await conexion.query(cerrarSessiones, [usuarioIDX])
                            const ok = {
                                ok: "Se ha eliminado correctamente la cuenta"
                            };
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                }
            },
            crearCuentaDesdeMiCasa: async () => {
                try {
                    const usuarioIDX = entrada.body.usuarioIDX
                    let email = entrada.body.email
                    const claveNueva = entrada.body.claveNueva
                    const claveConfirmada = entrada.body.claveConfirmada

                    const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                    if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                        const error = "El campo usuarioIDX solo admite minúsculas y numeros y nada mas"
                        throw new Error(error)
                    }
                    const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                    email = email
                        .toLowerCase()
                        .trim()
                    if (!email || !filtroCorreoElectronico.test(email)) {
                        const error = "el campo de correo electronico no cumple con el formato esperado"
                        throw new Error(error)
                    }

                    if (!claveNueva) {
                        const error = "Escribe tu contrasena, no has escrito tu contrasena"
                        throw new Error(error)
                    } else {
                        validadoresCompartidos.claves.minimoRequisitos(claveNueva)
                    }

                    if (!claveConfirmada) {
                        const error = "Vuelve a escribir tu contrasena de nuevo"
                        throw new Error(error)
                    }






                    if (claveNueva !== claveConfirmada) {
                        const error = "La contrasenas no coinciden, revisa la contrasenas escritas"
                        throw new Error(error)
                    }
                    if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
                        const error = "El nombre de usuario no esta disponbile, escoge otro"
                        throw new Error(error)
                    }
                    if (claveNueva === usuarioIDX) {
                        const error = "El nombre de usuario y la contrasena no pueden ser iguales"
                        throw new Error(error)
                    }
                    await componentes.eliminarCuentasNoVerificadas()

                    await conexion.query('BEGIN'); // Inicio de la transacción
                    const validarNuevoUsuario = `
                        SELECT 
                        usuario
                        FROM usuarios
                        WHERE usuario = $1
                        `
                    const resuelveValidarNuevoUsaurio = await conexion.query(validarNuevoUsuario, [usuarioIDX])
                    if (resuelveValidarNuevoUsaurio.rowCount > 0) {
                        const error = "El nombre de usuario no esta disponbile, escoge otro"
                        throw new Error(error)
                    }
                    const validarEmail = `
                    SELECT 
                    email
                    FROM "datosDeUsuario"
                    WHERE email = $1
                    `
                    const resuelveValidarEmail = await conexion.query(validarEmail, [email])
                    if (resuelveValidarEmail.rowCount > 0) {
                        const error = "El correo electronico ya existe, recupera tu cuenta de usuarios o escoge otro correo electronico"
                        throw new Error(error)
                    }

                    const cryptoData = {
                        sentido: "cifrar",
                        clavePlana: claveNueva
                    }

                    const retorno = vitiniCrypto(cryptoData)
                    const nuevaSal = retorno.nuevaSal
                    const hashCreado = retorno.hashCreado


                    const generarCadenaAleatoria = (longitud) => {
                        const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                        let cadenaAleatoria = '';

                        for (let i = 0; i < longitud; i++) {
                            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                            cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                        }
                        return cadenaAleatoria;
                    }

                    const validarCodigo = async (codigoAleatorio) => {
                        const validarCodigoAleatorio = `
                        SELECT
                        "codigoVerificacion"
                        FROM usuarios
                        WHERE "codigoVerificacion" = $1;`
                        const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio])
                        if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                            return true
                        }
                    }

                    const controlCodigo = async () => {
                        const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                        let codigoGenerado;
                        let codigoExiste;
                        do {
                            codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                            codigoExiste = await validarCodigo(codigoGenerado);
                        } while (codigoExiste);

                        // En este punto, tenemos un código único que no existe en la base de datos
                        return codigoGenerado;
                    }
                    const codigoAleatorioUnico = await controlCodigo();
                    const fechaActualUTC = DateTime.utc();
                    const fechaCaducidadCuentaNoVerifucada = fechaActualUTC.plus({ hours: 1 });

                    const estadoCuenta = "activado"
                    const cuentaVerificada = "no"
                    const rol = "cliente"
                    const crearNuevoUsuario = `
                        INSERT INTO usuarios
                        (
                        usuario,
                        rol,
                        "estadoCuenta",
                        "cuentaVerificada",
                        "codigoVerificacion",
                        "fechaCaducidadCuentaNoVerificada",
                        sal,
                        clave
                        )
                        VALUES 
                        ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING
                        usuario
                        `
                    const datosNuevoUsuario = [
                        usuarioIDX,
                        rol,
                        estadoCuenta,
                        cuentaVerificada,
                        codigoAleatorioUnico,
                        fechaCaducidadCuentaNoVerifucada,
                        nuevaSal,
                        hashCreado
                    ]
                    const resuelveCrearNuevoUsuario = await conexion.query(crearNuevoUsuario, datosNuevoUsuario)
                    if (resuelveCrearNuevoUsuario.rowCount === 0) {
                        const error = "No se ha insertado el nuevo usuario en la base de datos"
                        throw new Error(error)
                    }

                    const crearNuevosDatosUsuario = `
                        INSERT INTO "datosDeUsuario"
                        (
                        "usuarioIDX",
                        email
                        )
                        VALUES 
                        ($1, $2)
                        `
                    const resuelveCrearNuevosDatosUsuario = await conexion.query(crearNuevosDatosUsuario, [usuarioIDX, email])
                    if (resuelveCrearNuevosDatosUsuario.rowCount === 0) {
                        const error = "No se ha insertado los datos del nuevo usuario"
                        throw new Error(error)
                    }
                    const ok = {
                        ok: "Se ha creado el nuevo usuario",
                        usuarioIDX: resuelveCrearNuevoUsuario.rows[0].usuario
                    }
                    salida.json(ok)
                    await conexion.query('COMMIT');

                    const datosVerificacion = {
                        email: email,
                        codigoVerificacion: codigoAleatorioUnico
                    }

                    enviarEmailAlCrearCuentaNueva(datosVerificacion)






                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK');

                    const error = {
                        error: errorCapturado.message
                    }
                    salida.json(error)
                } finally {

                }
            },
            datosPersonalesDesdeMiCasa: {
                IDX: {},
                X: async () => {
                    try {
                        const usuarioIDX = entrada.session.usuario
                        if (!usuarioIDX) {
                            const error = "Necesitar identifcarte para ver tus datos personales"
                            throw new Error(error)
                        }

                        const consultaDetallesUsuario = `
                        SELECT 
                        ddu."usuarioIDX", 
                        ddu.nombre,
                        ddu."primerApellido",
                        ddu."segundoApellido",
                        ddu.pasaporte,
                        ddu.telefono,
                        ddu.email,
                        u.rol,
                        u."estadoCuenta"
                        FROM 
                        "datosDeUsuario" ddu
                        JOIN usuarios u ON ddu."usuarioIDX" = u.usuario
                        WHERE 
                        ddu."usuarioIDX" = $1;`

                        const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX])
                        if (resolverConsultaDetallesUsuario.rowCount === 0) {
                            const error = "No existe ningun usuario con ese IDX"
                            throw new Error(error)
                        }

                        const detallesCliente = resolverConsultaDetallesUsuario.rows[0]
                        const ok = {
                            ok: detallesCliente
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                }
            },
            actualizarDatosUsuarioDesdeMiCasa: {
                IDX: {},
                X: async () => {
                    try {
                        const usuarioIDX = entrada.session.usuario
                        let nombre = entrada.body.nombre
                        let primerApellido = entrada.body.primerApellido
                        let segundoApellido = entrada.body.segundoApellido
                        let pasaporte = entrada.body.pasaporte
                        let telefono = entrada.body.telefono
                        let email = entrada.body.email

                        const filtro_minúsculas_Mayusculas_numeros_espacios = /^[a-zA-Z0-9\s]+$/;
                        const filtroNumeros = /^[0-9]+$/;
                        const filtroCadena = /^[a-zA-Z0-9\s]+$/;

                        if (!usuarioIDX) {
                            const error = "Identificate para actualizar los datos personales de tu cuenta"
                            throw new Error(error)
                        }
                        if (nombre?.length > 0) {
                            nombre = nombre.trim();
                            nombre = nombre.replace(/\s+/g, ' ');
                            nombre = nombre.toUpperCase();
                            if (!filtroCadena.test(nombre)) {
                                const error = "el campo 'nombre' solo puede ser letras minúsculas, masculas."
                                throw new Error(error)
                            }
                        }
                        if (primerApellido?.length > 0) {
                            primerApellido = primerApellido.trim();
                            primerApellido = primerApellido.replace(/\s+/g, ' ');
                            primerApellido = primerApellido.toUpperCase();
                            if (!filtroCadena.test(primerApellido)) {
                                const error = "el campo 'primerApellido' solo puede ser letras minúsculas, masculas."
                                throw new Error(error)
                            }
                        }
                        if (segundoApellido?.length > 0) {
                            segundoApellido = segundoApellido.trim();
                            segundoApellido = segundoApellido.replace(/\s+/g, ' ');
                            segundoApellido = segundoApellido.toUpperCase();
                            if (!filtroCadena.test(segundoApellido)) {
                                const error = "el campo 'segundoApellido' solo puede ser letras minúsculas, masculas."
                                throw new Error(error)
                            }
                        }
                        if (pasaporte?.length > 0) {
                            pasaporte = pasaporte.trim();
                            pasaporte = pasaporte.replace(/\s+/g, ' ');
                            pasaporte = pasaporte.toUpperCase();
                            const filtroPasaporte = /^[a-zA-Z0-9]+$/;
                            if (!filtroPasaporte.test(pasaporte)) {
                                const error = "el campo 'pasaporte' solo puede ser letras minúsculas, masculas y numeros."
                                throw new Error(error)
                            }
                        }

                        if (telefono) {
                            telefono = telefono.trim();
                            telefono = telefono.replace(/\s+/g, '');
                            const filtroTelefono = /^\d+$/
                            if (!filtroTelefono.test(telefono)) {
                                const error = "el campo 'telefono' solo puede una cadena con un numero, entero y positivo. Si estas escribiendo un numero internacional, sustituya el signo mas del incio por dos ceros"
                                throw new Error(error)
                            }
                        }

                        if (email) {
                            email = email.toLowerCase()
                            email = email.replace(/\s+/g, '');
                            email = email.trim();
                            const filtroEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                            if (!filtroEmail.test(email)) {
                                const error = "El campo email no tiene le formato correcto, por ejemplo usuario@servidor.zona"
                                throw new Error(error)
                            }
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const controlCorreo = `
                        SELECT 
                            email
                        FROM 
                            "datosDeUsuario" 
                        WHERE 
                            email = $1 AND "usuarioIDX" <> $2`
                        const resolverObtenerDatosUsuario = await conexion.query(controlCorreo, [email, usuarioIDX])
                        if (resolverObtenerDatosUsuario.rowCount > 0) {
                            const error = "Ya existe una cuenta con ese correo electroníco. Escoge otro correo. Si ese es tu unico correo puedes recuperar tu cuenta de usuario con ese correo."
                            throw new Error(error)
                        }
                        const controlNuevoCorreoPorVerifical = `
                        SELECT 
                            email
                        FROM 
                            "datosDeUsuario" 
                        WHERE 
                            "usuarioIDX" = $1 
                            AND
                            email = $2`
                        const resuelveNuevoCorreoPorVerifical = await conexion.query(controlNuevoCorreoPorVerifical, [usuarioIDX, email])


                        const actualizarDatosUsuario = `
                        UPDATE "datosDeUsuario"
                        SET 
                          "nombre" = COALESCE(NULLIF($1, ''), "nombre"),
                          "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
                          "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
                          "pasaporte" = COALESCE(NULLIF($4, ''), "pasaporte"),
                          "telefono" = COALESCE(NULLIF($5, ''), "telefono"),
                          "email" = COALESCE(NULLIF($6, ''), "email")
                        WHERE "usuarioIDX" = $7
                        RETURNING 
                          "nombre",
                          "primerApellido",
                          "segundoApellido",
                          "pasaporte",
                          "telefono",
                          "email";            
                        `
                        const datos = [
                            nombre,
                            primerApellido,
                            segundoApellido,
                            pasaporte,
                            telefono,
                            email,
                            usuarioIDX,
                        ]
                        const resuelveActualizarDatosUsuario = await conexion.query(actualizarDatosUsuario, datos)



                        if (resuelveNuevoCorreoPorVerifical.rowCount === 0 && email.length > 0) {

                            const volverAVerificarCuenta = `
                            UPDATE 
                                usuarios
                            SET 
                                "cuentaVerificada" = $1
                            WHERE 
                                usuario = $2;`
                            await conexion.query(volverAVerificarCuenta, ["no", usuarioIDX])
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        if (resuelveActualizarDatosUsuario.rowCount === 1) {
                            const ok = {
                                ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
                                datosActualizados: resuelveActualizarDatosUsuario.rows
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                }
            },
            actualizarIDX: {
                IDX: {},
                X: async () => {
                    try {
                        const usuarioIDX = entrada.session.usuario
                        let nuevoIDX = entrada.body.nuevoIDX

                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                        nuevoIDX = nuevoIDX.toLowerCase();
                        if (!nuevoIDX || !filtro_minúsculas_numeros.test(nuevoIDX)) {
                            const error = "El nuevo VitiniID solo admite minúsculas y numeros"
                            throw new Error(error)
                        }
                        await componentes.eliminarCuentasNoVerificadas()
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarIDX = `
                        UPDATE usuarios
                        SET 
                            usuario = $2
                        WHERE 
                            usuario = $1
                        RETURNING 
                            usuario           
                        `
                        const datos = [
                            usuarioIDX,
                            nuevoIDX
                        ]
                        nuevoIDX = `"${nuevoIDX}"`
                        const resuelveActualizarIDX = await conexion.query(actualizarIDX, datos)
                        if (resuelveActualizarIDX.rowCount === 0) {
                            const error = "No existe el nombre de usuario"
                            throw new Error(error)

                        }

                        if (resuelveActualizarIDX.rowCount === 1) {

                            const actualizarSessionesActivas = `
                            UPDATE sessiones
                            SET sess = jsonb_set(sess::jsonb, '{usuario}', $1::jsonb)::json
                            WHERE sess->>'usuario' = $2;
                                                   
                            `
                            await conexion.query(actualizarSessionesActivas, [nuevoIDX, usuarioIDX])
                            const IDXEstablecido = resuelveActualizarIDX.rows[0].usuario
                            const ok = {
                                "ok": "Se ha actualizado el IDX correctamente",
                                usuarioIDX: IDXEstablecido
                            }
                            salida.json(ok)

                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                }
            },
            misReservas: {
                IDX: {},
                listarMisReservas: async () => {
                    try {
                        const IDX = entrada.session.IDX
                        let paginaActual = entrada.body.pagina
                        // const numeroDeReservasPorPagina = entrada.body.numeroDeReservasPorPagina
                        let nombreColumna = entrada.body.nombreColumna
                        let sentidoColumna = entrada.body.sentidoColumna
                        const filtroNumerosEnteros = /^[0-9]+$/;

                        if (typeof paginaActual !== "number" || !Number.isInteger(paginaActual) || paginaActual <= 0) {
                            const error = "Debe de especificarse la clave 'paginaActual' y su valor debe de ser numerico, entero, positivo y mayor a cero."
                            throw new Error(error)
                        }

                        // if (!numeroDeReservasPorPagina || !filtroNumerosEnteros.test(numeroDeReservasPorPagina)) {
                        //     const error = "El campo de numeroDeReservasPorPagina solo admite una cadena con numeros enteros y positivos"
                        //     throw new Error(error)
                        // }
                        const paginaActualSQL = Number((paginaActual - 1) + "0");
                        const numeroPorPagina = 10

                        // Comprobar si la cuenta tiene un email
                        const obtenerDatosUsuario = `
                        SELECT 
                            email,
                            "estadoCorreo"
                        FROM 
                            "datosDeUsuario" 
                        WHERE 
                            "usuarioIDX" = $1`
                        const resolverObtenerDatosUsuario = await conexion.query(obtenerDatosUsuario, [IDX])
                        const email = resolverObtenerDatosUsuario.rows[0].email
                        const estadoCorreo = resolverObtenerDatosUsuario.rows[0].estadoCorreo
                        if (!email) {
                            const error = "Se necesita que definas tu dirección de correo elecroníco en Mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo eletroníco que usastes para confirmar la reserva. Es decir debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de correo electronico y confirmarlo con el correo de confirmacion que te enviaremos. Una vez hecho eso podras ver tus reservas"
                            throw new Error(error)
                        }
                        // Comporbar si el email esta verificado
                        const comprobarMailVerificado = `
                        SELECT 
                            "cuentaVerificada"
                        FROM 
                            usuarios 
                        WHERE 
                            usuario = $1`
                        const resolverMailVerificado = await conexion.query(comprobarMailVerificado, [IDX])
                        const estadoCuentaVerificada = resolverMailVerificado.rows[0].cuentaVerificada
                        if (estadoCuentaVerificada !== "si") {
                            const error = "Tienes que verificar tu dirección de correo electronico para poder acceder a la reservas asociadas a tu direcíon de correo electroníco. Para ello pulsa en verificar tu correo electronico."
                            throw new Error(error)
                        }

                        const uidClientesArray = []
                        const reservaPorTitularPool = []
                        // Buscar el email verificado, en titulares poll y titulares vitini
                        const consultaClientes = `
                            SELECT 
                                uid
                            FROM
                                clientes
                            WHERE
                                email = $1`
                        // Ojo por que puede que se deba pasar el numero en number y no en cadena
                        const clientesSeleccionados = await conexion.query(consultaClientes, [email])
                        clientesSeleccionados.rows.map((cliente) => {
                            uidClientesArray.push(cliente.uid);
                        })


                        const consultaClientesPool = `                       
                        SELECT 
                            reserva
                        FROM
                            "poolTitularesReserva"
                        WHERE
                            "emailTitular" = $1`
                        // Ojo por que puede que se deba pasar el numero en number y no en cadena
                        const clientesPoolSeleccionados = await conexion.query(consultaClientesPool, [email])

                        clientesPoolSeleccionados.rows.map((titularPool) => {
                            reservaPorTitularPool.push(titularPool.reserva);
                        })

                        const validadores = {
                            nombreColumna: async (nombreColumna) => {
                                const filtronombreColumna = /^[a-zA-Z]+$/;
                                if (!filtronombreColumna.test(nombreColumna)) {
                                    const error = "el campo 'nombreColumna' solo puede ser letras minúsculas y mayúsculas."
                                    throw new Error(error)
                                }
                                const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'reservas' AND column_name = $1;
                                `
                                const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna])
                                if (resuelveNombreColumna.rowCount === 0) {
                                    const miArray = [
                                        'nombreCompleto',
                                        'pasaporteTitular',
                                        'emailTitular'
                                    ];

                                    if (!miArray.includes(nombreColumna)) {
                                        const error = "No existe el nombre de la columna que quieres ordenar"
                                        throw new Error(error)
                                    }

                                }

                            },
                            sentidoColumna: (sentidoColumna) => {
                                let sentidoColumnaSQL
                                const sentidoColumnaPreVal = sentidoColumna
                                if (sentidoColumnaPreVal !== "descendente" && sentidoColumnaPreVal !== "ascendente") {
                                    const error = "El sentido del ordenamiento de la columna es ascendente o descendente"
                                    throw new Error(error)
                                }
                                if (sentidoColumnaPreVal === "ascendente") {
                                    sentidoColumnaSQL = "ASC"
                                }

                                if (sentidoColumnaPreVal === "descendente") {
                                    sentidoColumnaSQL = "DESC"
                                }
                                const estructuraFinal = {
                                    sentidoColumna: sentidoColumnaPreVal,
                                    sentidoColumnaSQL: sentidoColumnaSQL
                                }
                                return estructuraFinal
                            }
                        }
                        let sentidoColumnaSQL
                        if (nombreColumna) {
                            await validadores.nombreColumna(nombreColumna)
                            sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL
                            sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna
                        }

                        let ordenColumnaSQL = ""
                        if (nombreColumna) {
                            ordenColumnaSQL = `
                                ORDER BY 
                                "${nombreColumna}" ${sentidoColumnaSQL} 
                                `
                        }

                        // extraer las reservasa asociadas a esos titulares
                        const obtenerDetallesReserva = `
                        SELECT 
                                reserva,
                                to_char(entrada, 'DD/MM/YYYY') as entrada,
                                to_char(salida, 'DD/MM/YYYY') as salida,
                                "estadoReserva", 
                                "estadoPago", 
                                to_char(creacion, 'DD/MM/YYYY') as creacion,
                                COUNT(*) OVER() as total_filas
                        FROM
                                reservas
                        WHERE
                            ($1::int[] IS NOT NULL AND titular = ANY($1::int[])) 
                            OR
                            ($2::int[] IS NOT NULL AND reserva = ANY($2::int[]))
                        ${ordenColumnaSQL}
                        LIMIT
                            $3
                        OFFSET
                            $4;`;
                        // Ojo por que puede que se deba pasar el numero en number y no en cadena

                        const datosListaReservas = [
                            uidClientesArray,
                            reservaPorTitularPool,
                            numeroPorPagina,
                            paginaActualSQL

                        ]
                        const resolverObtenerReservas = await conexion.query(obtenerDetallesReserva, datosListaReservas)
                        const consultaConteoTotalFilas = resolverObtenerReservas?.rows[0]?.total_filas ? resolverObtenerReservas.rows[0].total_filas : 0
                        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);

                        if (resolverObtenerReservas.rowCount === 0) {
                            const error = `No hay ninguna reserva realizada y confirmada con la dirección de correo electronico ${email}`
                            throw new Error(error)
                        }
                        if (resolverObtenerReservas.rowCount > 0) {

                            for (const detallesFila of resolverObtenerReservas.rows) {
                                delete detallesFila.total_filas
                            }

                            const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                            const reservasEncontradas = resolverObtenerReservas.rows

                            const ok = {
                                ok: "Aqui tienes tus reservas",
                                pagina: Number(paginaActual),
                                paginasTotales: totalPaginas,
                                totalReservas: Number(consultaConteoTotalFilas),

                            }

                            if (nombreColumna) {
                                ok.nombreColumna = nombreColumna
                                ok.sentidoColumna = sentidoColumna
                            }
                            ok.reservas = reservasEncontradas
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                cancelarReserva: async () => {

                    try {
                        const IDX = entrada.session.IDX
                        const reservaUID = entrada.body.reservaUID

                        const filtroNumerosEnteros = /^[0-9]+$/;
                        if (!reservaUID || !filtroNumerosEnteros.test(reservaUID)) {
                            const error = "El campo de reservaUID solo admite una cadena con numeros enteros y positivos"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const obtenerDatosUsuario = `
                        SELECT 
                            email
                        FROM 
                            "datosDeUsuario" 
                        WHERE 
                            "usuarioIDX" = $1`
                        const resolverObtenerDatosUsuario = await conexion.query(obtenerDatosUsuario, [IDX])
                        const email = resolverObtenerDatosUsuario.rows[0].email

                        const validarExistenciaReserva = `
                        SELECT
                        reserva
                        "estadoReserva"
                        FROM 
                        reservas
                        WHERE
                        reserva = $1 AND email =$2`
                        const resuelveValidarExistenciaReserva = await conexion.query(validarExistenciaReserva, [reservaUID, email])
                        if (resuelveValidarExistenciaReserva.rowCount === 0) {
                            const error = "No existe la reserva que quieres cancelar"
                            throw new Error(error)
                        }
                        if (resuelveValidarExistenciaReserva.rowCount === 1) {
                            const detallesReserva = resuelveValidarExistenciaReserva.rows[0]
                            const estadoReserva = detallesReserva.estadoReserva

                            if (estadoReserva === "cancelada") {
                                const error = "Esta reserva ya esta cancelada"
                                throw new Error(error)
                            }
                            const estadoCancelada = "cancelada"
                            const cancelarReserva = `
                            UPDATE 
                                reservas
                            SET 
                                "estadoReserva" = $1
                            WHERE
                                reserva = $2 AND email = $3
                            `
                            await conexion.query(cancelarReserva, [estadoCancelada, reservaUID, email])

                            const plataformaDePagoPasarela = "pasarela"
                            const obtenerPagosSinPasarela = `
                            SELECT
                                "pagoUID",
                                "plataformaDePago"
                            FROM 
                                "reservaPagos"
                            WHERE
                                reserva = $1 AND "plataformaDePago" != $2;
                            `
                            const resuelveObtenerPagosSinPasarela = await conexion.query(obtenerPagosSinPasarela, [reservaUID, plataformaDePagoPasarela])
                            const ok = {
                                ok: "Se ha cancelado la reserva correctamente"
                            }
                            if (resuelveObtenerPagosSinPasarela.rowCount > 0) {
                                const pagosAReembolsar = resuelveObtenerPagosSinPasarela.rows
                                for (const detallesReembolso of pagosAReembolsar) {
                                    const pagoUID = detallesReembolso.pagoUID
                                    const plataformaDePago = detallesReembolso.plataformaDePago
                                    const notificacionIDV = `pagoPendienteDeReembolsoPorCancelacion`
                                    const objetoNotificacion = {
                                        reservaUID: reservaUID,
                                        pagoUID: pagoUID,
                                        plataformaDePago: plataformaDePago
                                    }

                                    const creaNotificacionDeReembolso = `
                                    INSERT INTO notificaciones
                                    (
                                    "notificacionIDV",
                                    objeto,
                                    "IDX"
                                    )
                                    VALUES ($1, $2::jsonb, $3) 
                                    `
                                    const datosNotificacion = [
                                        notificacionIDV,
                                        objetoNotificacion,
                                        IDX
                                    ]
                                    await conexion.query(creaNotificacionDeReembolso, datosNotificacion)

                                }
                                ok.reembolsoManual = "Se ha notificado de los reembolso de esta reserva para que se procesa con ellos"

                            }
                            const obtenerPagosPasarelaReserva = `
                            SELECT
                                "pagoUIDPasarela",
                                cantidad
                            FROM 
                                "reservaPagos"
                            WHERE
                                reserva = $1 AND "plataformaDePago" = $2;
                            `
                            const resuelveObtenerPagosPasarelaReserva = await conexion.query(obtenerPagosPasarelaReserva, [reservaUID, plataformaDePagoPasarela])
                            if (resuelveObtenerPagosPasarelaReserva.rowCount > 0) {
                                // Obtener pagos de pasalera y procesar reembolsos
                                const pagosAReembolsar = resuelveObtenerPagosPasarelaReserva.rows
                                const infoReembolsosPasarela = null
                                for (const detallesReembolso of pagosAReembolsar) {
                                    const pagoUIDPasarela = detallesReembolso.pagoUIDPasarela
                                    let cantidad = detallesReembolso.cantidad
                                    const moneda = "USD"



                                    const detallesDelPago = await componentes.pasarela.detallesDelPago(pagoUIDPasarela)
                                    if (detallesDelPago.error) {
                                        const errorUID = detallesDelPago.error.errors[0].code
                                        let error
                                        switch (errorUID) {
                                            case "NOT_FOUND":
                                                error = "La pasarela informa de que el idenficador de pago que tratas de asocias con Casa Vitini no existe, por favor revisa el identificador de pago"
                                                throw new Error(error);
                                            default:
                                                error = "La pasarela informa de un error generico"
                                                throw new Error(error);
                                        }
                                    }
                                    const cantidadPagoPasarela = detallesDelPago.amountMoney.amount
                                    const reembolsadoYa = detallesDelPago?.refundedMoney?.amount
                                    let totalAReembolsar = cantidadPagoPasarela
                                    if (reembolsadoYa) {
                                        const restantePorReesmbolar = cantidadPagoPasarela - reembolsadoYa

                                        if (restantePorReesmbolar > 0) {


                                            const reembolsoDetalles = {
                                                idempotencyKey: uuidv4(),
                                                amountMoney: {
                                                    amount: totalAReembolsar,
                                                    currency: moneda
                                                },
                                                paymentId: pagoUIDPasarela
                                            }
                                            const procesadorReembolso = await componentes.pasarela.crearReenbolso(reembolsoDetalles)
                                            if (procesadorReembolso.error) {
                                                const errorUID = procesadorReembolso.error?.errors[0]?.code



                                                let error
                                                switch (errorUID) {
                                                    case "REFUND_AMOUNT_INVALID":
                                                        error = "La pasarela informa que el reembolso es superior a la cantidad del pago que se quiere reembolsar"
                                                        throw new Error(error);
                                                    case "CURRENCY_MISMATCH":
                                                        error = "Revisa el codigo de la moneda introducido. Solo se aceptan dolares. Coodigo: USD"
                                                        throw new Error(error);
                                                    case "NOT_FOUND":
                                                        error = "La pasarela informa de que el idenficador del reembolso no existe en la pasarela"
                                                        throw new Error(error);
                                                    default:
                                                        error = "La pasarela informa de un error generico"
                                                        throw new Error(error);
                                                }
                                            }
                                            infoReembolsosPasarela = "rembolsado"

                                        }

                                        totalAReembolsar = restantePorReesmbolar
                                    }


                                }
                                if (infoReembolsosPasarela === "reembolsado") {
                                    ok.reembolsoPasarela = "Se ha reembolsado todos los pagos asociados a esta reserva hechos desde la pasarela"
                                }

                            }

                            salida.json(ok)
                        }

                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                detallesReserva: async () => {
                    try {
                        const IDX = entrada.session.IDX
                        const reservaUID = entrada.body.reservaUID
                        if (!reservaUID) {
                            const error = "Se necesita un id de 'reserva'"
                            throw new Error(error)
                        }

                        if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
                            let error = "Se ha definico correctamente  la clave 'reserva' pero el valor de esta debe de ser un numero positivo, si has escrito un numero positivo, revisa que en el objeto no este numero no este envuelvo entre comillas"
                            throw new Error(error)
                        }
                        const obtenerDatosUsuario = `
                        SELECT 
                            email,
                            "estadoCorreo"
                        FROM 
                            "datosDeUsuario" 
                        WHERE 
                            "usuarioIDX" = $1`
                        const resolverObtenerDatosUsuario = await conexion.query(obtenerDatosUsuario, [IDX])
                        const email = resolverObtenerDatosUsuario.rows[0].email
                        const estadoCorreo = resolverObtenerDatosUsuario.rows[0].estadoCorreo
                        if (!email) {
                            const error = "Se necesita que definas tu dirección de correo elecroníco en Mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo eletroníco que usastes para confirmar la reserva. Es decir debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de correo electronico y confirmarlo con el correo de confirmacion que te enviaremos. Una vez hecho eso podras ver tus reservas"
                            throw new Error(error)
                        }
                        // Comporbar si el email esta verificado
                        const comprobarMailVerificado = `
                        SELECT 
                            "cuentaVerificada"
                        FROM 
                            usuarios 
                        WHERE 
                            usuario = $1`
                        const resolverMailVerificado = await conexion.query(comprobarMailVerificado, [IDX])
                        const estadoCuentaVerificada = resolverMailVerificado.rows[0].cuentaVerificada
                        if (estadoCuentaVerificada !== "si") {
                            const error = "Tienes que verificar tu dirección de correo electronico para poder acceder a la reservas asociadas a tu direcíon de correo electroníco. Para ello pulsa en verificar tu correo electronico."
                            throw new Error(error)
                        }
                        const validarExistenciaReserva = `
                        SELECT
                            reserva,
                            entrada,
                            salida,
                            "estadoReserva",
                            "estadoPago",
                            origen,
                            creacion,
                            titular
                        FROM 
                            reservas
                        WHERE
                            reserva = $1`
                        const resuelveValidarExistenciaReserva = await conexion.query(validarExistenciaReserva, [reservaUID])
                        if (resuelveValidarExistenciaReserva.rowCount === 0) {
                            const error = "No existe la reserva que quieres cancelar"
                            throw new Error(error)
                        }

                        if (resuelveValidarExistenciaReserva.rowCount === 1) {
                            const titularPool = resuelveValidarExistenciaReserva.rows[0].titularPool
                            const titular = resuelveValidarExistenciaReserva.rows[0].titular

                            if (titular) {
                                const consultaTitular = `
                                SELECT
                                    email
                                FROM 
                                    clientes
                                WHERE
                                    uid = $1`
                                const resuelveValidarExistenciaReserva = await conexion.query(consultaTitular, [titular])
                                const mailTitular = resuelveValidarExistenciaReserva.rows[0].email
                                if (mailTitular !== email) {
                                    const error = "No tienes acceso a esta reserva"
                                    throw new Error(error)
                                }
                            }

                            if (titularPool) {
                                const consultaTitular = `
                                SELECT
                                    "emailTitular"
                                FROM 
                                    "poolTitularesReserva"
                                WHERE
                                    uid = $1`
                                const resuelveValidarExistenciaReserva = await conexion.query(consultaTitular, [titularPool])
                                const mailTitular = resuelveValidarExistenciaReserva.rows[0].emailTitular
                                if (mailTitular !== email) {
                                    const error = "No tienes acceso a esta reserva"
                                    throw new Error(error)
                                }
                            }

                            const metadatos = {
                                reservaUID: reservaUID,
                                // solo: solo
                            }
                            const resuelveDetallesReserva = await detallesReserva(metadatos)
                            delete resuelveDetallesReserva.reserva.origen
                            salida.json(resuelveDetallesReserva)

                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },

            },
            recuperarCuenta: {
                enviarCorreo: async () => {
                    try {
                        let email = entrada.body.email
                        const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                        email = email
                            .toLowerCase()
                            .trim()
                        if (!email || !filtroCorreoElectronico.test(email)) {
                            const error = "El campo de correo electrónico no cumple con el formato esperado, por favor revisalo."
                            throw new Error(error)
                        }

                        const generarCadenaAleatoria = (longitud) => {
                            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                            let cadenaAleatoria = '';

                            for (let i = 0; i < longitud; i++) {
                                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                            }
                            return cadenaAleatoria;
                        }
                        const validarCodigo = async (codigoAleatorio) => {
                            const validarCodigoAleatorio = `
                            SELECT
                            codigo
                            FROM "enlaceDeRecuperacionCuenta"
                            WHERE codigo = $1;`
                            const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio])

                            if (resuelveValidarCodigoAleatorio.rowCount > 0) {
                                return true
                            }
                        }

                        const controlCodigo = async () => {
                            const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                            let codigoGenerado;
                            let codigoExiste;
                            do {
                                codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                                codigoExiste = await validarCodigo(codigoGenerado);
                            } while (codigoExiste);
                            // En este punto, tenemos un código único que no existe en la base de datos
                            return codigoGenerado;
                        }
                        const codigoGenerado = await controlCodigo()
                        const fechaActualUTC = DateTime.utc();
                        const fechaCaducidadUTC = fechaActualUTC.plus({ hours: 1 });
                        const hostActual = process.env.HOST

                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const consultaRecuperarCuenta =
                            `
                            SELECT "usuarioIDX"
                            FROM "datosDeUsuario"
                            WHERE "email" = $1;
                            `
                        const resuelveActualizarIDX = await conexion.query(consultaRecuperarCuenta, [email])
                        if (resuelveActualizarIDX.rowCount === 0) {
                            const error = "La dirección de correo electrònico no consta en nínguna cuenta de usuario. Registrate y crea tu VitiniID si lo neceistas."
                            throw new Error(error)

                        }
                        const usuarioIDX = resuelveActualizarIDX.rows[0].usuarioIDX

                        // Comporbar si es una recuperacion de contraseña o una verificacion de email
                        const consultaEstadoVerificacionCuenta =
                            `
                        SELECT 
                        "cuentaVerificada",
                        usuario
                        FROM
                        usuarios
                        WHERE
                        usuario = $1;
                        `
                        const resuelveEstadoVerificacion = await conexion.query(consultaEstadoVerificacionCuenta, [usuarioIDX])
                        if (resuelveEstadoVerificacion.rowCount === 0) {
                            const error = "No existe esta cuenta de usuario"
                            throw new Error(error)
                        }
                        const estadoVerificacion = resuelveEstadoVerificacion.rows[0].cuentaVerificada
                        const usuario = resuelveEstadoVerificacion.rows[0].usuario

                        if (estadoVerificacion !== "si") {
                            const actualizarCodigoVerificacion = `
                            UPDATE 
                            usuarios
                            SET
                            "codigoVerificacion" = $1,
                            "fechaCaducidadCuentaNoVerificada" = $2
                            WHERE
                            usuario = $3;
                            `
                            const datosRestablecimiento = [
                                codigoGenerado,
                                fechaActualUTC,
                                usuario
                            ]
                            await conexion.query(actualizarCodigoVerificacion, datosRestablecimiento)

                            // Contruimos el mensaje
                            const origen = process.env.CORREO_DIRRECION_DE_ORIGEN_RECUPERACION
                            const destino = email
                            const asunto = "Verifica tu VitiniID"
                            const mensaje = `<html>Aquí tíenes el enlace de verificación. Los enlaces de verificación tienen una validez de una hora desde que se generan.
                             <a href="https://casavitini.com/micasa/verificar_cuenta/${codigoGenerado}">Verificar mi VtiniID</a></html>`

                            const composicionDelMensaje = {
                                origen: origen,
                                destino: destino,
                                asunto: asunto,
                                mensaje: mensaje,
                            }
                            // Enviamos el mensaje
                            const resultadoEnvio = await enviarMail(composicionDelMensaje)
                            const ok = {
                                ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para verificar tu VitiniID",
                            }
                            salida.json(ok)
                        } else {
                            if (resuelveActualizarIDX.rowCount === 1) {
                                const borrarEnlacesAntiguos = `
                                DELETE FROM "enlaceDeRecuperacionCuenta"
                                WHERE usuario = $1;`
                                await conexion.query(borrarEnlacesAntiguos, [usuarioIDX])

                                const consultaCrearEnlace = `
                                INSERT INTO "enlaceDeRecuperacionCuenta"
                                (
                                usuario,
                                codigo,
                                "fechaCaducidad"
                                )
                                VALUES
                                ($1, $2, $3)
                                RETURNING
                                codigo
                                `
                                await conexion.query(consultaCrearEnlace, [usuarioIDX, codigoGenerado, fechaCaducidadUTC])

                                // Contruimos el mensaje
                                const origen = "admin@macos.local"
                                const destino = email
                                const asunto = "Recuperar tu VitiniID"
                                const mensaje = `<html>Aquí tíenes el enlace para recupera tu cuenta. Este enlace tiene una duracion de 30 minutos. <a href="https://${hostActual}/micasa/recuperar_cuenta/${codigoGenerado}">Recuperar mi cuenta</a></html>`

                                const composicionDelMensaje = {
                                    origen: origen,
                                    destino: destino,
                                    asunto: asunto,
                                    mensaje: mensaje,
                                }

                                // Enviamos el mensaje
                                const resultadoEnvio = await enviarMail(composicionDelMensaje)
                                const ok = {
                                    ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para recuperar tu cuenta",
                                }
                                salida.json(ok)
                            }
                        }

                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        console.info(errorCapturado.message)
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                validarCodigo: async () => {
                    try {
                        const codigo = entrada.body.codigo
                        const filtroCadena = /^[a-z0-9]+$/;

                        if (!codigo || !filtroCadena.test(codigo)) {
                            const error = "Los codigo de recuperacion de cuentas solo pueden contener minuscular y numeros"
                            throw new Error(error)
                        }
                        const fechaActual_ISO = DateTime.utc().toISO();
                        const eliminarEnlacesCaducados = `
                        DELETE FROM "enlaceDeRecuperacionCuenta"
                        WHERE "fechaCaducidad" < $1;
                        `
                        await conexion.query(eliminarEnlacesCaducados, [fechaActual_ISO])
                        await conexion.query('BEGIN'); // Inicio de la transacción   
                        const consultaValidarCodigo =
                            `
                            SELECT 
                            usuario
                            FROM "enlaceDeRecuperacionCuenta"
                            WHERE codigo = $1;
                            `
                        const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [codigo])
                        if (resuelveValidarCodigo.rowCount === 0) {
                            const error = "El codigo que has introducido no existe. Si estas intentando recuperar tu cuenta, recuerda que los codigos con de un solo uso y duran una hora. Si has generado varios codigos, solo es valido el mas nuevo. Si generas por ejemplo tres codigo. Solo es valido el codigo mas nuevo."
                            throw new Error(error)
                        }

                        if (resuelveValidarCodigo.rowCount === 1) {
                            const usuario = resuelveValidarCodigo.rows[0].usuario
                            const ok = {
                                ok: "El enlace temporal sigue vigente",
                                usuario: usuario
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        console.info(errorCapturado.message)
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                restablecerClave: async () => {
                    try {
                        const codigo = entrada.body.codigo
                        const clave = entrada.body.clave
                        const claveConfirmada = entrada.body.claveConfirmada
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!codigo || !filtroCadena.test(codigo)) {
                            const error = "Los codigo de recuperacion de cuentas solo pueden contener minuscular y numeros"
                            throw new Error(error)
                        }

                        if (!clave || (clave !== claveConfirmada)) {
                            const error = "Las claves no coinciden. Por favor escribe tu nueva clave dos veces."
                            throw new Error(error)
                        }

                        const fechaActual_ISO = DateTime.utc().toISO();
                        const eliminarEnlacesCaducados = `
                        DELETE FROM "enlaceDeRecuperacionCuenta"
                        WHERE "fechaCaducidad" < $1;
                        `
                        await conexion.query(eliminarEnlacesCaducados, [fechaActual_ISO])
                        await conexion.query('BEGIN'); // Inicio de la transacción   
                        const consultaValidarCodigo =
                            `
                            SELECT 
                            usuario
                            FROM "enlaceDeRecuperacionCuenta"
                            WHERE codigo = $1;
                            `
                        const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [codigo])
                        if (resuelveValidarCodigo.rowCount === 0) {
                            const error = "El codigo que has introducido no existe. Si estas intentando recuperar tu cuenta, recuerda que los codigos con de un solo uso y duran una hora. Si has generado varios codigos, solo es valido el mas nuevo. Si generas por ejemplo tres codigo. Solo es valido el codigo mas nuevo."
                            throw new Error(error)
                        }

                        if (resuelveValidarCodigo.rowCount === 1) {
                            const usuario = resuelveValidarCodigo.rows[0].usuario

                            const cryptoData = {
                                sentido: "cifrar",
                                clavePlana: clave
                            }

                            const retorno = vitiniCrypto(cryptoData)
                            const nuevaSal = retorno.nuevaSal
                            const hashCreado = retorno.hashCreado

                            const restablecerClave = `
                            UPDATE 
                            usuarios
                            SET
                            sal = $1,
                            clave = $2
                            WHERE
                            usuario = $3;
                            `
                            const datosRestablecimiento = [
                                nuevaSal,
                                hashCreado,
                                usuario
                            ]
                            await conexion.query(restablecerClave, datosRestablecimiento)
                            const eliminarEnlaceUsado = `
                            DELETE FROM "enlaceDeRecuperacionCuenta"
                            WHERE usuario = $1;
                            `
                            await conexion.query(eliminarEnlaceUsado, [usuario])
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "El enlace temporal sigue vigente",
                                usuario: usuario
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        console.info(errorCapturado.message)
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
            },
            verificarCuenta: async () => {
                try {
                    const codigo = entrada.body.codigo
                    const filtroCadena = /^[a-z0-9]+$/;

                    if (!codigo || !filtroCadena.test(codigo)) {
                        const error = "Los codigo de verificacion de cuentas solo pueden contener minuscular y numeros"
                        throw new Error(error)
                    }
                    await componentes.eliminarCuentasNoVerificadas()

                    await conexion.query('BEGIN'); // Inicio de la transacción   
                    const estadoVerificado = "si"
                    const consultaValidarCodigo =
                        `
                    UPDATE 
                    usuarios
                    SET
                    "cuentaVerificada" = $1,
                    "codigoVerificacion" = NULL,
                    "fechaCaducidadCuentaNoVerificada" = NULL
                    WHERE
                    "codigoVerificacion" = $2
                    RETURNING
                    usuario
                    `
                    const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [estadoVerificado, codigo])
                    if (resuelveValidarCodigo.rowCount === 0) {
                        const error = "El codigo que has introducino no existe"
                        throw new Error(error)
                    }

                    if (resuelveValidarCodigo.rowCount === 1) {
                        const usuario = resuelveValidarCodigo.rows[0].usuario
                        const ok = {
                            ok: "Cuenta verificada",
                            usuario: usuario
                        }
                        salida.json(ok)
                    }
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    console.info(errorCapturado.message)
                    const error = {
                        error: errorCapturado.message
                    }

                    salida.json(error)
                } finally {

                }
            },



        },
        administracion: {
            IDX: {
                ROL: [
                    "administrador",
                    "empleado"
                ]
            },
            reservas: {
                listarReservas: async () => {
                    try {
                        let pagina = entrada.body.pagina
                        let nombreColumna = entrada.body.nombreColumna
                        let sentidoColumna = entrada.body.sentidoColumna

                        const validadores = {
                            nombreColumna: async (nombreColumna) => {
                                const filtronombreColumna = /^[a-zA-Z]+$/;
                                if (!filtronombreColumna.test(nombreColumna)) {
                                    const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas."
                                    throw new Error(error)
                                }
                                const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'reservas' AND column_name = $1;
                                `
                                const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna])
                                if (resuelveNombreColumna.rowCount === 0) {
                                    const miArray = [
                                        'nombreCompleto',
                                        'pasaporteTitular',
                                        'emailTitular'
                                    ];

                                    if (!miArray.includes(nombreColumna)) {
                                        const error = "No existe el nombre de la columna que quieres ordenar"
                                        throw new Error(error)
                                    }


                                }

                            },
                            sentidoColumna: (sentidoColumna) => {
                                let sentidoColumnaSQL
                                const sentidoColumnaPreVal = sentidoColumna
                                if (sentidoColumnaPreVal !== "descendente" && sentidoColumnaPreVal !== "ascendente") {
                                    const error = "El sentido del ordenamiento de la columna es ascendente o descendente"
                                    throw new Error(error)
                                }
                                if (sentidoColumnaPreVal === "ascendente") {
                                    sentidoColumnaSQL = "ASC"
                                }

                                if (sentidoColumnaPreVal === "descendente") {
                                    sentidoColumnaSQL = "DESC"
                                }
                                const estructuraFinal = {
                                    sentidoColumna: sentidoColumnaPreVal,
                                    sentidoColumnaSQL: sentidoColumnaSQL
                                }
                                return estructuraFinal
                            },
                            validarFechaEntrada: (fecha) => {
                                const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;

                                if (!filtroFecha.test(fecha)) {
                                    const error = "La fecha de entrada no cumple el criterio de formato"
                                    throw new Error(error)
                                }
                            },
                            validarFechaSalida: (fecha) => {
                                const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;

                                if (!filtroFecha.test(fecha)) {
                                    const error = "La fecha de salida no cumple el criterio de formato"
                                    throw new Error(error)
                                }
                            }
                        }

                        if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
                            const error = "Debe de especificarse la clave 'pagina' y su valor debe de ser numerico, entero, positivo y mayor a cero."
                            throw new Error(error)
                        }

                        const tipoConsulta = entrada.body.tipoConsulta
                        let numeroPagina = Number((pagina - 1) + "0");

                        let numeroPorPagina = 10
                        if (tipoConsulta !== "hoy" && tipoConsulta !== "rango" && tipoConsulta !== "porTerminos") {
                            const error = "Hay que especificar el tipo de consulta, si es hoy, rango o porTerminos, revisa los parametros de tu busqueda"
                            throw new Error(error)
                        }

                        if (tipoConsulta === "hoy") {
                            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                            const tiempoZH = DateTime.now().setZone(zonaHoraria);
                            const fechaActualTZ = tiempoZH.toISODate()

                            const dia = tiempoZH.day
                            const mes = tiempoZH.month
                            const ano = tiempoZH.year

                            //const numeroPagina = pagina - 1
                            const numeroPorPagina = 10
                            const fechaFormato_Humano = dia + "/" + mes + "/" + ano

                            const consultaHoy = `
                            SELECT 
                                r.reserva,
                                to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                                to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                                r."estadoReserva",
                                COALESCE(
                                    CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido"),
                                    CONCAT_WS(' ', ptr."nombreTitular")
                                ) AS "nombreCompleto",
                                c.pasaporte AS "pasaporteTitular",
                                ptr."pasaporteTitular" AS "pasaporteTitular",
                                c.email AS "emailTitular",
                                ptr."emailTitular" AS "emailTitular",
                                ptr."nombreTitular" AS "nombreCompleto",
                                to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                                COUNT(*) OVER() as total_filas,
                            CASE
                                WHEN ptr.uid IS NOT NULL THEN CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                                END AS "nombreCompleto"
                            FROM 
                                reservas r
                            LEFT JOIN 
                                clientes c ON r.titular = c.uid
                            LEFT JOIN
                                "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                            WHERE 
                                entrada = $1
                            ORDER BY 
                                "entrada" ASC
                            LIMIT $2
                            OFFSET $3;
                            `
                            const consultaReservasHoy = await conexion.query(consultaHoy, [fechaActualTZ, numeroPorPagina, numeroPagina])

                            const consultaConteoTotalFilas = consultaReservasHoy?.rows[0]?.total_filas ? consultaReservasHoy.rows[0].total_filas : 0
                            const reservasEncontradas = consultaReservasHoy.rows

                            for (const detallesFila of reservasEncontradas) {
                                delete detallesFila.total_filas
                            }
                            const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                            const corretorNumeroPagina = String(numeroPagina).replace("0", "")

                            const Respuesta = {

                                tipoConsulta: "rango",
                                tipoCoincidencia: "porFechaDeEntrada",
                                pagina: Number(1),
                                fechaEntrada: fechaFormato_Humano,
                                paginasTotales: totalPaginas,
                                totalReservas: Number(consultaConteoTotalFilas),
                                nombreColumna: "entrada",
                                sentidoColumna: "ascendente",
                                reservas: reservasEncontradas

                            }
                            salida.json(Respuesta)
                        }
                        if (tipoConsulta === "rango") {
                            let fechaEntrada = entrada.body.fechaEntrada
                            let fechaSalida = entrada.body.fechaSalida
                            let tipoCoincidencia = entrada.body.tipoCoincidencia;
                            if (tipoCoincidencia !== "cualquieraQueCoincida" &&
                                tipoCoincidencia !== "soloDentroDelRango" &&
                                tipoCoincidencia !== "porFechaDeEntrada" &&
                                tipoCoincidencia !== "porFechaDeSalida") {
                                const error = "Falta especificar el 'tipoCoincidencia', esta solo puede ser cualquieraQueCoincida, soloDentroDelRango, porFechaDeEntrada o porFechaDeSalida"
                                throw new Error(error)
                            }

                            let sentidoColumnaSQL

                            if (nombreColumna) {
                                await validadores.nombreColumna(nombreColumna)
                                sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL
                                sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna
                            }

                            let ordenColumnaSQL = ""
                            if (nombreColumna) {
                                ordenColumnaSQL = `
                                    ORDER BY 
                                    "${nombreColumna}" ${sentidoColumnaSQL} 
                                    `
                            }

                            if (tipoCoincidencia === "cualquieraQueCoincida") {
                                if (!fechaEntrada) {
                                    const error = "Falta determinar la 'fechaEntrada'"
                                    throw new Error(error)
                                }
                                if (!fechaSalida) {
                                    const error = "Falta determinar la 'fechaSalida'"
                                    throw new Error(error)
                                }
                                validadores.validarFechaEntrada(fechaEntrada)
                                validadores.validarFechaSalida(fechaSalida)
                                const convertirFechaISO8601 = (fechaStr) => {
                                    const [dia, mes, anio] = fechaStr.split('/');
                                    const fechaISO8601 = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                                    return fechaISO8601;
                                };

                                const fechaEntradaReservaControl = new Date(convertirFechaISO8601(fechaEntrada));
                                const fechaSalidaReservaControl = new Date(convertirFechaISO8601(fechaSalida));
                                if (fechaSalidaReservaControl <= fechaEntradaReservaControl) {
                                    const error = "La fecha de entrada seleccionada es igual o superior a la fecha de salida de la reserva"
                                    throw new Error(error)
                                }


                                const consultaConstructor = `
                                    SELECT
                                    r.reserva,
                                    to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                                    to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                                    r."estadoReserva",
                                    CASE 
                                        WHEN c.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                                        WHEN ptr.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                                    END AS "nombreCompleto",
                                    
                                    CASE 
                                        WHEN c.uid IS NOT NULL THEN 
                                            c.pasaporte
                                        WHEN ptr.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
                                    END AS "pasaporteTitular",
                                    
                                    CASE 
                                        WHEN c.uid IS NOT NULL THEN 
                                            c.email
                                        WHEN ptr.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', ptr."emailTitular", '(pool)')
                                    END AS "emailTitular",
    
                                    to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                                    COUNT(*) OVER() as total_filas
                                    FROM 
                                    reservas r
                                    LEFT JOIN 
                                    clientes c ON r.titular = c.uid
                                    LEFT JOIN
                                    "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                                    WHERE 
                                    entrada <= $2::DATE AND salida >= $1::DATE
                                    ${ordenColumnaSQL}
                                    LIMIT $3 
                                    OFFSET $4    
                                    ;`
                                const consultaReservas = await conexion.query(consultaConstructor, [fechaEntradaReservaControl, fechaSalidaReservaControl, numeroPorPagina, numeroPagina])
                                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0
                                const reservasEncontradas = consultaReservas.rows

                                for (const detallesFila of reservasEncontradas) {
                                    delete detallesFila.total_filas

                                }
                                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                                const corretorNumeroPagina = String(numeroPagina).replace("0", "")
                                const ok = {

                                    tipoCoincidencia: "cualquieraQueCoincida",
                                    totalReservas: Number(consultaConteoTotalFilas),
                                    paginasTotales: totalPaginas,
                                    tipoConsulta: "rango",
                                    fechaEntrada: fechaEntrada,
                                    fechaSalida: fechaSalida,
                                    pagina: Number(corretorNumeroPagina) + 1,
                                    nombreColumna: nombreColumna,
                                    sentidoColumna: sentidoColumna,
                                    reservas: reservasEncontradas

                                }
                                salida.json(ok)
                            }
                            if (tipoCoincidencia === "soloDentroDelRango") {


                                if (!fechaEntrada) {
                                    const error = "Falta determinar la 'fechaEntrada'"
                                    throw new Error(error)
                                }
                                if (!fechaSalida) {
                                    const error = "Falta determinar la 'fechaSalida'"
                                    throw new Error(error)
                                }
                                validadores.validarFechaEntrada(fechaEntrada)
                                validadores.validarFechaSalida(fechaSalida)
                                const convertirFechaISO8601 = (fechaStr) => {
                                    const [dia, mes, anio] = fechaStr.split('/');
                                    const fechaISO8601 = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                                    return fechaISO8601;
                                };

                                const fechaEntradaReservaControl = new Date(convertirFechaISO8601(fechaEntrada));
                                const fechaSalidaReservaControl = new Date(convertirFechaISO8601(fechaSalida));
                                if (fechaSalidaReservaControl <= fechaEntradaReservaControl) {

                                    const error = "La fecha de entrada seleccionada es igual o superior a la fecha de salida de la reserva"
                                    throw new Error(error)
                                }

                                const consultaConstructor = `
                                    SELECT
                                        r.reserva,
                                        to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                                        to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                                        r."estadoReserva",
                                        CASE 
                                            WHEN c.uid IS NOT NULL THEN 
                                                    CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                                            WHEN ptr.uid IS NOT NULL THEN 
                                                CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                                        END AS "nombreCompleto",

                                        CASE 
                                            WHEN c.uid IS NOT NULL THEN 
                                                c.pasaporte
                                            WHEN ptr.uid IS NOT NULL THEN 
                                                CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
                                        END AS "pasaporteTitular",
                                    
                                        CASE 
                                            WHEN c.uid IS NOT NULL THEN 
                                                c.email
                                            WHEN ptr.uid IS NOT NULL THEN 
                                                CONCAT_WS(' ', ptr."emailTitular", '(pool)')
                                        END AS "emailTitular",
                                
                                        to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                                        COUNT(*) OVER() as total_filas
                                    FROM 
                                        reservas r
                                    LEFT JOIN 
                                        clientes c ON r.titular = c.uid
                                    LEFT JOIN
                                        "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                                    WHERE 
                                        entrada >= $1::DATE AND salida <= $2::DATE
                                    ${ordenColumnaSQL}
                                    LIMIT $3
                                    OFFSET $4    
                                    ;`
                                const consultaReservas = await conexion.query(consultaConstructor, [fechaEntrada, fechaSalida, numeroPorPagina, numeroPagina])
                                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0
                                const reservasEncontradas = consultaReservas.rows
                                for (const detallesFila of reservasEncontradas) {
                                    delete detallesFila.total_filas

                                }
                                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                                const corretorNumeroPagina = String(numeroPagina).replace("0", "")
                                const ok = {

                                    tipoCoincidencia: "soloDentroDelRango",
                                    totalReservas: Number(consultaConteoTotalFilas),
                                    paginasTotales: totalPaginas,
                                    tipoConsulta: "rango",
                                    fechaEntrada: fechaEntrada,
                                    fechaSalida: fechaSalida,
                                    pagina: Number(corretorNumeroPagina) + 1,
                                    nombreColumna: nombreColumna,
                                    sentidoColumna: sentidoColumna,
                                    reservas: reservasEncontradas

                                }
                                salida.json(ok)
                            }
                            if (tipoCoincidencia === "porFechaDeEntrada") {
                                if (!fechaEntrada) {
                                    const error = "Falta determinar la 'fechaEntrada'"
                                    throw new Error(error)
                                }
                                validadores.validarFechaEntrada(fechaEntrada)
                                const consultaConstructor = `
                                SELECT
                                    r.reserva,
                                    to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                                    to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                                    r."estadoReserva",
                                    CASE 
                                        WHEN c.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                                        WHEN ptr.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                                    END AS "nombreCompleto",
                                
                                    CASE 
                                        WHEN c.uid IS NOT NULL THEN 
                                            c.pasaporte
                                        WHEN ptr.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
                                    END AS "pasaporteTitular",
                                
                                    CASE 
                                        WHEN c.uid IS NOT NULL THEN 
                                            c.email
                                        WHEN ptr.uid IS NOT NULL THEN 
                                            CONCAT_WS(' ', ptr."emailTitular", '(pool)')
                                    END AS "emailTitular",

                                    to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                                    COUNT(*) OVER() as total_filas
                                        FROM 
                                            reservas r
                                        LEFT JOIN 
                                            clientes c ON r.titular = c.uid
                                        LEFT JOIN
                                        "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                                        WHERE
                                            entrada = $1::DATE
                                    ${ordenColumnaSQL}
                                    LIMIT $2
                                    OFFSET $3; `
                                const consultaReservas = await conexion.query(consultaConstructor, [fechaEntrada, numeroPorPagina, numeroPagina])
                                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0
                                const reservasEncontradas = consultaReservas.rows
                                for (const detallesFila of reservasEncontradas) {
                                    delete detallesFila.total_filas

                                }
                                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                                const corretorNumeroPagina = String(numeroPagina).replace("0", "")
                                const ok = {
                                    tipoCoincidencia: "porFechaDeEntrada",
                                    totalReservas: Number(consultaConteoTotalFilas),
                                    paginasTotales: totalPaginas,
                                    tipoConsulta: "rango",
                                    fechaEntrada: fechaEntrada,
                                    fechaSalida: fechaSalida,
                                    pagina: Number(corretorNumeroPagina) + 1,
                                    nombreColumna: nombreColumna,
                                    sentidoColumna: sentidoColumna,
                                    reservas: reservasEncontradas

                                }
                                salida.json(ok)
                            }
                            if (tipoCoincidencia === "porFechaDeSalida") {
                                if (!fechaSalida) {
                                    const error = "Falta determinar la 'fechaSalida'"
                                    throw new Error(error)
                                }

                                validadores.validarFechaSalida(fechaSalida)

                                const consultaConstructor = `
                                    SELECT
                                        r.reserva,
                                        to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                                        to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                                        r."estadoReserva",
                                        CASE 
                                            WHEN c.uid IS NOT NULL THEN 
                                                CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                                            WHEN ptr.uid IS NOT NULL THEN 
                                                CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                                        END AS "nombreCompleto",

                                        CASE 
                                            WHEN c.uid IS NOT NULL THEN 
                                                c.pasaporte
                                            WHEN ptr.uid IS NOT NULL THEN 
                                                CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
                                        END AS "pasaporteTitular",

                                        CASE 
                                            WHEN c.uid IS NOT NULL THEN 
                                                c.email
                                            WHEN ptr.uid IS NOT NULL THEN 
                                                CONCAT_WS(' ', ptr."emailTitular", '(pool)')
                                        END AS "emailTitular",
                                
                                        to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                                    COUNT(*) OVER() as total_filas
                                    FROM 
                                        reservas r
                                    LEFT JOIN 
                                        clientes c ON r.titular = c.uid
                                    LEFT JOIN
                                    "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                                    WHERE
                                        salida = $1::DATE
                                    ${ordenColumnaSQL}
                                    LIMIT $2
                                    OFFSET $3`
                                const consultaReservas = await conexion.query(consultaConstructor, [fechaSalida, numeroPorPagina, numeroPagina])
                                const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0
                                const reservasEncontradas = consultaReservas.rows
                                for (const detallesFila of reservasEncontradas) {
                                    delete detallesFila.total_filas
                                }
                                const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                                const corretorNumeroPagina = String(numeroPagina).replace("0", "")
                                const ok = {

                                    tipoCoincidencia: "porFechaDeSalida",
                                    totalReservas: Number(consultaConteoTotalFilas),
                                    paginasTotales: totalPaginas,
                                    tipoConsulta: "rango",
                                    fechaEntrada: fechaEntrada,
                                    fechaSalida: fechaSalida,
                                    pagina: Number(corretorNumeroPagina) + 1,
                                    nombreColumna: nombreColumna,
                                    sentidoColumna: sentidoColumna,
                                    reservas: reservasEncontradas

                                }
                                salida.json(ok)
                            }
                        }
                        if (tipoConsulta === "porTerminos") {
                            let termino = entrada.body.termino
                            if (!termino) {
                                const error = "Nada que buscar, escribe un termino de busqueda"
                                throw new Error(error)
                            }
                            const filtroCadena = /^[a-zA-Z0-9@.\-_/^\s&?!]*$/;
                            if (!filtroCadena.test(termino)) {
                                const error = "Los terminos de busqueda solo aceptan letras, numeros y espacios y caracteres de uso comun como por ejemplo arroba y otros. Lo que se no se aceptan "
                                throw new Error(error)
                            }
                            termino = termino.trim()
                            termino = termino.toLowerCase()
                            const arrayTerminmos = termino.split(" ")
                            const terminosFormateados = []
                            arrayTerminmos.map((terminoDelArray) => {
                                const terminoFinal = "%" + terminoDelArray + "%"
                                terminosFormateados.push(terminoFinal)
                            })
                            const estructuraFinal = {
                                tipoConsulta: "porTerminos"
                            }
                            const ordenamientoPorRelevancia = `
                            (
                                CASE
                                WHEN
                                (
                                    (LOWER(COALESCE(CAST(r.reserva AS TEXT), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(to_char(r.entrada, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(to_char(r.salida, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(to_char(r.creacion, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(ptr."nombreTitular", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(ptr."pasaporteTitular", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(ptr."emailTitular", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.nombre, '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c."primerApellido", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c."segundoApellido", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.telefono, '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.email, '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.pasaporte, '')) ILIKE ANY($1))::int
                                ) = 1 THEN 1
                                WHEN (
                                    (LOWER(COALESCE(CAST(r.reserva AS TEXT), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(to_char(r.entrada, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(to_char(r.salida, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(to_char(r.creacion, 'DD/MM/YYYY'), '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(ptr."nombreTitular", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(ptr."pasaporteTitular", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(ptr."emailTitular", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.nombre, '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c."primerApellido", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c."segundoApellido", '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.telefono, '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.email, '')) ILIKE ANY($1))::int + 
                                    (LOWER(COALESCE(c.pasaporte, '')) ILIKE ANY($1))::int
                                ) = 3 THEN 3              
                                    ELSE 2
                                END                              
                             )
                            `

                            let ordenamientoFinal

                            if (nombreColumna || sentidoColumna) {
                                await validadores.nombreColumna(nombreColumna)
                                const sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL
                                sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna
                                ordenamientoFinal = `"${nombreColumna}" ${sentidoColumnaSQL}`
                                estructuraFinal.nombreColumna = nombreColumna
                                estructuraFinal.sentidoColumna = sentidoColumna
                            } else {
                                ordenamientoFinal = ordenamientoPorRelevancia
                            }



                            const consultaConstructorV2 = `                         
                            SELECT 
                                r.reserva,
                                to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                                to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                                r."estadoReserva",
                                CASE 
                                    WHEN c.uid IS NOT NULL THEN 
                                        CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido")
                                    WHEN ptr.uid IS NOT NULL THEN 
                                        CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                                END AS "nombreCompleto",
                                
                                CASE 
                                    WHEN c.uid IS NOT NULL THEN 
                                        c.pasaporte
                                    WHEN ptr.uid IS NOT NULL THEN 
                                        CONCAT_WS(' ', ptr."pasaporteTitular", '(pool)')
                                END AS "pasaporteTitular",
                                
                                CASE 
                                    WHEN c.uid IS NOT NULL THEN 
                                        c.email
                                    WHEN ptr.uid IS NOT NULL THEN 
                                        CONCAT_WS(' ', ptr."emailTitular", '(pool)')
                                END AS "emailTitular",

                                to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                                COUNT(*) OVER() as total_filas
                            FROM 
                                reservas r
                            LEFT JOIN 
                                clientes c ON r.titular = c.uid
                            LEFT JOIN
                                "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                            WHERE
                                (
                                LOWER(COALESCE(CAST(r.reserva AS TEXT), '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(to_char(r.entrada, 'DD/MM/YYYY'), '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(to_char(r.salida, 'DD/MM/YYYY'), '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(to_char(r.creacion, 'DD/MM/YYYY'), '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(c.nombre, '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(c."primerApellido", '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(c."segundoApellido", '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(c.telefono, '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(c.email, '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(c.pasaporte, '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(ptr."nombreTitular", '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(ptr."pasaporteTitular", '')) ILIKE ANY($1)
                                OR LOWER(COALESCE(ptr."emailTitular", '')) ILIKE ANY($1)
                                )
                            ORDER BY 
                                ${ordenamientoFinal}
                            LIMIT $2
                            OFFSET $3;                     
                            `
                            const consultaReservas = await conexion.query(consultaConstructorV2, [terminosFormateados, numeroPorPagina, numeroPagina])

                            const consultaConteoTotalFilas = consultaReservas?.rows[0]?.total_filas ? consultaReservas.rows[0].total_filas : 0
                            const reservasEncontradas = consultaReservas.rows
                            for (const detallesFila of reservasEncontradas) {
                                delete detallesFila.total_filas

                            }

                            const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                            const corretorNumeroPagina = String(numeroPagina).replace("0", "")

                            estructuraFinal.pagina = 1
                            estructuraFinal.totalReservas = Number(consultaConteoTotalFilas)
                            estructuraFinal.paginasTotales = totalPaginas
                            estructuraFinal.pagina = Number(corretorNumeroPagina) + 1
                            estructuraFinal.reservas = reservasEncontradas
                            estructuraFinal.termino = termino

                            salida.json(estructuraFinal)
                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }


                },
                detallesReserva: async () => {
                    try {
                        const reservaUID = entrada.body.reserva
                        const solo = entrada.body.solo

                        if (!reservaUID) {
                            const error = "Se necesita un id de 'reserva'"
                            throw new Error(error)
                        }
                        if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
                            const error = "Se ha definico correctamente  la clave 'reserva' pero el valor de esta debe de ser un numero positivo, si has escrito un numero positivo, revisa que en el objeto no este numero no este envuelvo entre comillas"
                            throw new Error(error)
                        }
                        if (solo) {

                            if (solo !== "detallesAlojamiento" &&
                                solo !== "desgloseTotal" &&
                                solo !== "informacionGlobal" &&
                                solo !== "globalYFinanciera" &&
                                solo !== "pernoctantes") {
                                const error = "el campo 'zona' solo puede ser detallesAlojamiento, desgloseTotal, informacionGlobal o pernoctantes."
                                throw new Error(error)
                            }
                        }

                        const metadatos = {
                            reservaUID: reservaUID,
                            solo: solo
                        }
                        const resuelveDetallesReserva = await detallesReserva(metadatos)
                        salida.json(resuelveDetallesReserva)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                cambiarTipoCliente: async () => {
                    const mutex = new Mutex();
                    const bloqueoCambiarTipoClienteEnReserva = await mutex.acquire();
                    try {
                        const reservaUID = entrada.body.reservaUID
                        const pernoctanteUID = entrada.body.pernoctanteUID
                        const clienteUID = entrada.body.clienteUID


                        const reserva = await validadoresCompartidos.reservas.validarReserva(reservaUID)
                        if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                            const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
                            const error = "El campo 'clienteUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }



                        if (reserva.estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        // validar cliente
                        const validacionCliente = `
                          SELECT 
                          uid,
                          nombre,
                          "primerApellido",
                          "segundoApellido",
                          pasaporte
                          FROM 
                          clientes
                          WHERE 
                          uid = $1;
                          `
                        const resuelveValidacionCliente = await conexion.query(validacionCliente, [clienteUID])
                        if (resuelveValidacionCliente.rowCount === 0) {
                            const error = "No existe el cliente"
                            throw new Error(error)
                        }

                        const nombre = resuelveValidacionCliente.rows[0].nombre
                        const primerApellido = resuelveValidacionCliente.rows[0].primerApellido || ""
                        const segundoApellido = resuelveValidacionCliente.rows[0].segundoApellido || ""
                        const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`
                        const pasaporte = resuelveValidacionCliente.rows[0].segundoApellido



                        // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
                        const validacionUnicidadPernoctante = `
                          SELECT 
                          "pernoctanteUID"
                          FROM "reservaPernoctantes"
                          WHERE "clienteUID" = $1 AND reserva = $2
                          `
                        const resuelveValidacionUnicidadPernoctante = await conexion.query(validacionUnicidadPernoctante, [clienteUID, reservaUID])
                        if (resuelveValidacionUnicidadPernoctante.rowCount === 1) {
                            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion"
                            throw new Error(error)
                        }



                        const consultaFechaFeserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM reservas 
                        WHERE reserva = $1;`
                        const resuelveFechas = await conexion.query(consultaFechaFeserva, [reservaUID])

                        const fechaEntrada_ISO = resuelveFechas.rows[0].fechaEntrada_ISO
                        const fechaSalida_ISO = resuelveFechas.rows[0].fechaSalida_ISO

                        const estadoReservaCancelado = "cancelada"
                        const consultaReservasRangoInteracion = `
                        SELECT reserva 
                        FROM reservas 
                        WHERE entrada <= $1::DATE AND salida >= $2::DATE AND "estadoReserva" <> $3;`
                        const resuelveConsultaReservasRangoInteracion = await conexion.query(consultaReservasRangoInteracion, [fechaEntrada_ISO, fechaSalida_ISO, estadoReservaCancelado])
                        let interruptorClienteEncontrado;
                        if (resuelveConsultaReservasRangoInteracion.rowCount > 0) {
                            const reservas = resuelveConsultaReservasRangoInteracion.rows
                            for (const reserva of reservas) {
                                const reservaUID = reserva.reserva
                                const buscarClienteEnOtrasReservas = `
                                SELECT "clienteUID" 
                                FROM "reservaPernoctantes" 
                                WHERE "clienteUID" = $1 AND reserva = $2;`
                                const resuelveBuscarClienteEnOtrasReservas = await conexion.query(buscarClienteEnOtrasReservas, [clienteUID, reservaUID])
                                if (resuelveBuscarClienteEnOtrasReservas.rowCount === 1) {
                                    interruptorClienteEncontrado = "encontrado"
                                    break
                                }
                            }
                        }


                        if (interruptorClienteEncontrado === "encontrado") {
                            const error = "Este cliente no se puede anadir a esta reserva por que esta en otra reserva cuyo rango de fecha coincide con esta, dicho de otra manera, si se anadiese este cliente en esta reserva, puede que en un dia o en mas de un dia este cliente estaria asignado a un apartmento distingo en fechas coincidentes"
                            throw new Error(error)
                        }




                        const cambiarClientePoolPorCliente = `
                        UPDATE "reservaPernoctantes"
                        SET "clienteUID" = $1
                        WHERE 
                        "pernoctanteUID" = $2 AND
                        reserva = $3
                        RETURNING
                        habitacion;`
                        const clientePoolResuelto = await conexion.query(cambiarClientePoolPorCliente, [clienteUID, pernoctanteUID, reservaUID])
                        if (clientePoolResuelto.rowCount === 0) {
                            const error = "revisa los parametros que introduces por que aunque estan escritos en el formato correcto pero no son correctos"
                            throw new Error(error)
                        }


                        const eliminarClientePool = `
                        DELETE FROM "poolClientes"
                        WHERE "pernoctanteUID" = $1;`
                        await conexion.query(eliminarClientePool, [pernoctanteUID])

                        await conexion.query('COMMIT'); // Confirmar la transacción

                        const ok = {
                            ok: "Se ha acualizado el pernoctante correctamente",
                            pernoctanteUID: pernoctanteUID,
                            habitacionUID: clientePoolResuelto.rows[0].habitacion,
                            nombreCompleto: nombreCompleto,
                            pasaporte: pasaporte
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                        bloqueoCambiarTipoClienteEnReserva();
                    }

                },
                cambiarPernoctanteDeHabitacion: async () => {
                    const mutex = new Mutex();
                    const bloqueoCambiarPernoctanteHabitacion = await mutex.acquire();
                    try {
                        const reserva = entrada.body.reserva
                        const habitacionDestino = entrada.body.habitacionDestino
                        const pernoctanteUID = entrada.body.pernoctanteUID

                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }

                        if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
                            const error = "La reserva no se puede modificar por que esta pagada"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
                            const error = "La reserva no se puede modificar por que esta reembolsada"
                            throw new Error(error)
                        }

                        const consultaExistenciaCliente = `
                        SELECT 
                        "pernoctanteUID" 
                        FROM
                         "reservaPernoctantes" 
                        WHERE
                        reserva = $1 AND "pernoctanteUID" = $2;`
                        const controlExistencia = await conexion.query(consultaExistenciaCliente, [reserva, pernoctanteUID])
                        if (controlExistencia.rowCount === 0) {
                            const error = "No existe el pernoctante, por lo tanto no se puede mover de habitacion"
                            throw new Error(error)
                        }
                        const consultaControlUnicoCliente = `
                            SELECT 
                            "pernoctanteUID" 
                            FROM
                            "reservaPernoctantes" 
                            WHERE
                            reserva = $1 AND habitacion = $2 AND "pernoctanteUID" = $3;
                            `
                        const seleccionaClienteOrigen = await conexion.query(consultaControlUnicoCliente, [reserva, habitacionDestino, pernoctanteUID])
                        if (seleccionaClienteOrigen.rowCount > 0) {
                            const error = "Ya existe el cliente en esta habitacion"
                            throw new Error(error)
                        }
                        const actualizaNuevaPosicionClientePool = `
                            UPDATE 
                            "reservaPernoctantes"
                            SET
                            habitacion = $1
                            WHERE
                            reserva = $2 AND "pernoctanteUID" = $3;
                            `
                        const actualizaClientePoolDestino = await conexion.query(actualizaNuevaPosicionClientePool, [habitacionDestino, reserva, pernoctanteUID])
                        if (actualizaClientePoolDestino.rowCount === 0) {
                            const error = "Ha ocurrido un error al intentar actualiza el cliente pool en el destino"
                            throw new Error(error)

                        }

                        if (actualizaClientePoolDestino.rowCount === 1) {
                            const ok = {
                                ok: "Se ha cambiado correctamente al pernoctante de alojamiento dentro de la reserva "
                            }
                            salida.json(ok)
                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoCambiarPernoctanteHabitacion()
                    }


                },
                cambiarCamaHabitacion: async () => {
                    const mutex = new Mutex();
                    const bloqueoCambiarCamaHabitacion = await mutex.acquire();

                    try {
                        const reserva = entrada.body.reserva
                        const habitacion = entrada.body.habitacion
                        const nuevaCama = entrada.body.nuevaCama
                        if (typeof reserva !== 'number' || !Number.isInteger(reserva) || reserva <= 0) {
                            let error = "Se necesita un id de 'reserva' que sea un numero, positio y mayor a cero"
                            throw new Error(error)
                        }
                        if (typeof habitacion !== 'number' || !Number.isInteger(habitacion) || habitacion <= 0) {
                            let error = "Se necesita un id de 'habitacion' que sea un número entero, positivo y mayor a cero"
                            throw new Error(error)
                        }
                        const filtroCadena = /^[A-Za-z\s]+$/;
                        if (!nuevaCama || !filtroCadena.test(nuevaCama)) {
                            let error = "Se necesita un 'nuevaCama' que sea un string con letras y espacios, nada mas"
                            throw new Error(error)
                        }
                        // Valida reserva
                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }

                        if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
                            const error = "La reserva no se puede modificar por que esta pagada"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
                            const error = "La reserva no se puede modificar por que esta reembolsada"
                            throw new Error(error)
                        }
                        // valida que la habitacion exista dentro de la reserva
                        const consultaValidacionHabitacion = `
                        SELECT uid 
                        FROM "reservaHabitaciones" 
                        WHERE reserva = $1 AND uid = $2;`
                        const resuelveconsultaValidacionHabitacion = await conexion.query(consultaValidacionHabitacion, [reserva, habitacion])
                        if (resuelveconsultaValidacionHabitacion?.rowCount === 0) {
                            const error = "No existe la habitacion dentro de la reserva"
                            throw new Error(error)
                        }
                        // valida camaIDV que entra
                        const consultaValidacionCamaIDV = `
                        SELECT "camaUI" 
                        FROM camas 
                        WHERE cama = $1;`
                        const resuelveConsultaValidacionCamaIDV = await conexion.query(consultaValidacionCamaIDV, [nuevaCama])
                        if (resuelveConsultaValidacionCamaIDV?.rowCount === 0) {
                            const error = "No exist el camaIDV introducido en el campo nuevaCama"
                            throw new Error(error)
                        }
                        // Valida que la cama existe dentro de la reserva

                        const resolucionNombreCama = await conexion.query(`SELECT "camaUI" FROM camas WHERE cama = $1`, [nuevaCama])
                        if (resolucionNombreCama.rowCount === 0) {
                            const error = "No existe el identificador de la camaIDV"
                            throw new Error(error)
                        }
                        const camaUI = resolucionNombreCama.rows[0].camaUI

                        const consultaExistenciaCama = `
                        SELECT uid 
                        FROM "reservaCamas" 
                        WHERE reserva = $1 AND habitacion = $2;`
                        const resuelveconsultaExistenciaCama = await conexion.query(consultaExistenciaCama, [reserva, habitacion])
                        if (resuelveconsultaExistenciaCama.rowCount === 1) {
                            const consultaActualizaCama = `
                            UPDATE "reservaCamas"
                            SET
                            cama = $3,
                            "camaUI" = $4
                            WHERE reserva = $1 AND habitacion = $2;`
                            const resueleConsultaActualizaCama = await conexion.query(consultaActualizaCama, [reserva, habitacion, nuevaCama, camaUI])
                            if (resueleConsultaActualizaCama?.rowCount === 1) {
                                const ok = {
                                    "ok": "Se ha actualizado correctamten la cama"
                                }
                                salida.json(ok)
                            }
                        }
                        if (resuelveconsultaExistenciaCama.rowCount === 0) {
                            const insertaNuevaCama = `
                            INSERT INTO "reservaCamas"
                            (
                            reserva,
                            habitacion,
                            cama,
                            "camaUI"
                            )
                            VALUES ($1, $2, $3, $4) RETURNING uid
                            `
                            const resuelveInsertaNuevaCama = await conexion.query(insertaNuevaCama, [reserva, habitacion, nuevaCama, camaUI])
                            if (resuelveInsertaNuevaCama.rowCount === 1) {
                                const ok = {
                                    "ok": "Se ha anadido correctamente la nueva a la habitacion",
                                    "nuevoUID": resuelveInsertaNuevaCama.rows[0].uid
                                }
                                salida.json(ok)
                            }
                        }
                        salida.end()
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoCambiarCamaHabitacion()
                    }
                },
                listarTipoCamasHabitacion: async () => {

                    try {
                        const apartamento = entrada.body.apartamento
                        const habitacion = entrada.body.habitacion

                        const filtroCadena = /^[A-Za-z\s\d]+$/;
                        if (!apartamento || !filtroCadena.test(apartamento)) {
                            const error = "Se necesita un 'apartamento' que sea un string con letras y espacios, nada mas"
                            throw new Error(error)
                        }
                        if (!habitacion || !filtroCadena.test(habitacion)) {
                            const error = "Se necesita un 'habitacion' que sea un string con letras y espacios, nada mas"
                            throw new Error(error)
                        }

                        const consultaControlApartamento = `
                        SELECT uid 
                        FROM "configuracionHabitacionesDelApartamento" 
                        WHERE apartamento = $1 AND habitacion = $2;`
                        const controlConfiguracionApartamento = await conexion.query(consultaControlApartamento, [apartamento, habitacion])
                        if (controlConfiguracionApartamento.rowCount === 0) {
                            const error = "No exista el apartamento o la habitacion en el"
                            throw new Error(error)
                        }
                        if (controlConfiguracionApartamento.rowCount === 1) {
                            const configuracionApartamento = controlConfiguracionApartamento.rows[0]["uid"]
                            const consultaControlApartamento = `
                            SELECT cama
                            FROM "configuracionCamasEnHabitacion" 
                            WHERE habitacion = $1;`
                            const configuracionCamasHabitacion = await conexion.query(consultaControlApartamento, [configuracionApartamento])
                            if (configuracionCamasHabitacion.rowCount === 0) {
                                const error = "No existe ningun tipo de camas configuradas para esta habitacion"
                                throw new Error(error)
                            }
                            const camasResueltas = []
                            for (const camaPorResolver of configuracionCamasHabitacion.rows) {
                                const camaIDV = camaPorResolver.cama

                                const consultaResolucionNombresCamas = `
                                SELECT "camaUI", cama
                                FROM camas 
                                WHERE cama = $1;`
                                const resolucionNombresCamas = await conexion.query(consultaResolucionNombresCamas, [camaIDV])
                                const nombresCamas = resolucionNombresCamas.rows[0]

                                const camaResuelta = {
                                    cama: nombresCamas.cama,
                                    camaUI: nombresCamas.camaUI

                                }
                                camasResueltas.push(camaResuelta)

                            }
                            const ok = {
                                camasDisponibles: camasResueltas,
                            }
                            salida.json(ok);
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error);
                    } finally {

                    }

                },
                apartamentosDisponiblesAdministracion: async () => {
                    try {
                        const fechaEntrada = entrada.body.entrada
                        const fechaSalida = entrada.body.salida

                        if (!fechaEntrada) {
                            const error = "falta definir el campo 'entrada'"
                            throw new Error(error)
                        }

                        if (!fechaSalida) {
                            const error = "falta definir el campo 'salida'"
                            throw new Error(error)
                        }
                        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                        if (!filtroFecha.test(fechaEntrada)) {
                            const error = "el formato fecha de entrada no esta correctametne formateado"
                            throw new Error(error)
                        }

                        if (!filtroFecha.test(fechaSalida)) {
                            const error = "el formato fecha de salida no esta correctametne formateado"
                            throw new Error(error)

                        }

                        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO
                        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO

                        const fecha = {
                            fechaEntrada_ISO: fechaEntrada_ISO,
                            fechaSalida_ISO: fechaSalida_ISO
                        }

                        const transactor = await apartamentosDisponiblesAdministracion(fecha)
                        if (transactor) {
                            const ok = {
                                ok: transactor
                            }
                            salida.json(ok)

                        }
                        salida.end()
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                configuracionApartamento: async () => {
                    try {
                        let apartamentos = entrada.body.apartamentos
                        const transactor = await configuracionApartamento(apartamentos)
                        salida.json(transactor)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                insertarDatosFinancierosReservaExistente: async () => {
                    try {
                        const reserva = entrada.body.reserva
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo1"
                            throw new Error(error)
                        }
                        const transaccionPrecioReserva = {
                            tipoProcesadorPrecio: "uid",
                            reservaUID: reserva
                        }
                        const resuelvePrecioReserva = await insertarTotalesReserva(transaccionPrecioReserva)
                        const metadatosDetallesReserva = {
                            reservaUID: reserva
                        }
                        const reseuvleDetallesReserva = await detallesReserva(metadatosDetallesReserva)
                        const respuesta = {
                            "ok": resuelvePrecioReserva,
                            "desgloseFinanciero": reseuvleDetallesReserva.desgloseFinanciero
                        }
                        salida.json(respuesta)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                estadoHabitacionesApartamento: async () => {
                    try {
                        let apartamento = entrada.body.apartamento
                        let reserva = entrada.body.reserva
                        if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                            const error = "El campo 'apartamento' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        let transaccionInterna = {
                            "apartamento": apartamento,
                            "reserva": reserva
                        }
                        let resuelveHabitaciones = await estadoHabitacionesApartamento(transaccionInterna)
                        let habitacionesResuelvas = resuelveHabitaciones.ok
                        if (habitacionesResuelvas.length === 0) {
                            let ok = {
                                "ok": []
                            }
                            salida.json(ok)
                        }
                        if (habitacionesResuelvas.length > 0) {
                            let habitacionesProcesdas = []
                            for (const habitacionPreProcesada of habitacionesResuelvas) {
                                const consultaHabitacion = `
                                SELECT habitacion, "habitacionUI"
                                FROM habitaciones
                                WHERE habitacion = $1
                                `
                                let resuelveHabitacion = await conexion.query(consultaHabitacion, [habitacionPreProcesada])
                                let habitacionIDV = resuelveHabitacion.rows[0].habitacion
                                let habitaconUI = resuelveHabitacion.rows[0].habitacionUI
                                let habitacionResuelta = {
                                    "habitacionIDV": habitacionIDV,
                                    "habitacionUI": habitaconUI
                                }
                                habitacionesProcesdas.push(habitacionResuelta)
                            }
                            let ok = {
                                "ok": habitacionesProcesdas
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message

                        }
                        salida.json(error)
                    } finally {

                    }
                },
                anadirHabitacionAlApartamentoEnReserva: async () => {
                    const mutex = new Mutex();
                    const bloqueoaAnadirHabitacionAlApartamentoEnReserva = await mutex.acquire();
                    try {
                        let apartamento = entrada.body.apartamento
                        const reserva = entrada.body.reserva
                        const habitacion = entrada.body.habitacion
                        if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                            const error = "El campo 'apartamento' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!filtroCadena.test(habitacion)) {
                            const error = "el campo 'habitacion' solo puede ser letras minúsculas y numeros."
                            throw new Error(error)
                        }
                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }



                        // Mira las habitaciones diponbiles para anadira este apartamento
                        const transaccionInterna = {
                            "apartamento": apartamento,
                            "reserva": reserva
                        }
                        const resuelveHabitaciones = await estadoHabitacionesApartamento(transaccionInterna)
                        const habitacionesResuelvas = resuelveHabitaciones.ok
                        if (habitacionesResuelvas.length === 0) {
                            const error = `El apartamento no tiene disponibles mas habitaciones para ser anadidas en base a su configuracion glboal`
                            throw new Error(error)
                        }
                        if (habitacionesResuelvas.length > 0) {
                            for (const habitacionResuelta of habitacionesResuelvas) {
                                if (habitacion === habitacionResuelta) {

                                    const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacion])
                                    if (resolucionNombreHabitacion.rowCount === 0) {
                                        const error = "No existe el identificador de la habitacionIDV"
                                        throw new Error(error)
                                    }
                                    const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI


                                    const consultaInsertaHabitacion = `
                                    INSERT INTO "reservaHabitaciones"
                                    (
                                    apartamento,
                                    habitacion,
                                    "habitacionUI",
                                    reserva
                                    )
                                    VALUES ($1, $2, $3, $4) RETURNING uid
                                    `
                                    const resuelveInsercionHabitacion = await conexion.query(consultaInsertaHabitacion, [apartamento, habitacion, habitacionUI, reserva])
                                    if (resuelveInsercionHabitacion.rowCount === 1) {
                                        const ok = {
                                            "ok": `Se ha anadido la ${habitacionUI} al apartamento`,
                                            "nuevoUID": resuelveInsercionHabitacion.rows[0].uid
                                        }
                                        return salida.json(ok)
                                    }

                                }
                            }
                            let error = {
                                "error": `No se puede anadir esta habitacion, revisa que este bien escrito los datos y que el apartamento tenga habitaciones disponibles`
                            }
                            salida.json(error)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoaAnadirHabitacionAlApartamentoEnReserva()
                    }

                },
                anadirApartamentoReserva: async () => {
                    const mutex = new Mutex();
                    const bloqueoAnadirApartamentoReserva = await mutex.acquire();
                    try {
                        const reserva = entrada.body.reserva
                        const apartamento = entrada.body.apartamento
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }

                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!filtroCadena.test(apartamento) || typeof apartamento !== "string") {
                            const error = "el campo 'apartamento' solo puede ser una cadena de letras minúsculas y numeros."
                            throw new Error(error)
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()
                        // Validar que le nombre del apartamento existe como tal
                        const validacionNombreApartamento = `
                        SELECT *
                        FROM "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `
                        const resuelveValidacionNombreApartamento = await conexion.query(validacionNombreApartamento, [apartamento])
                        if (resuelveValidacionNombreApartamento.rowCount === 0) {
                            const error = "No existe el nombre del apartamento, revisa el nombre escrito"
                            throw new Error(error)
                        }

                        // valida reserva y obten fechas
                        const validacionReserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva", 
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }



                        const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO
                        const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO
                        // ACABAR ESTA SENTENCIA DE ABAJO--
                        // validar que el apartamento no este ya en la reserva
                        const validacionHabitacionYaExisteneEnReserva = `
                        SELECT 
                        apartamento
                        FROM "reservaApartamentos"
                        WHERE reserva = $1 AND apartamento = $2
                        `
                        const resuelvevalidacionHabitacionYaExisteneEnReserva = await conexion.query(validacionHabitacionYaExisteneEnReserva, [reserva, apartamento])
                        if (resuelvevalidacionHabitacionYaExisteneEnReserva.rowCount === 1) {
                            const error = "El apartamento ya existe en la reserva"
                            throw new Error(error)
                        }

                        // Validar que el apartamento esta diponbiles en el modo normal, sacando las fechas de la reserva
                        const transacion = {
                            fechaEntrada_ISO: fechaEntrada_ISO,
                            fechaSalida_ISO: fechaSalida_ISO

                        }
                        const resuelveApartamentosDisponibles = await apartamentosDisponiblesAdministracion(transacion)

                        const apartamentosDisponiblesResueltos = resuelveApartamentosDisponibles.apartamentosDisponibles
                        if (apartamentosDisponiblesResueltos.length === 0) {
                            const error = "No hay ningun apartamento disponbile para las fechas de la reserva"
                            throw new Error(error)
                        }
                        if (apartamentosDisponiblesResueltos.length > 0) {
                            let resultadoValidacion = null
                            for (const apartamentosDisponible of apartamentosDisponiblesResueltos) {
                                if (apartamento === apartamentosDisponible) {
                                    resultadoValidacion = apartamento
                                }
                            }
                            const apartamentoUI = await resolverApartamentoUI(apartamento)
                            const insertarApartamento = `
                                INSERT INTO "reservaApartamentos"
                                (
                                reserva,
                                apartamento,
                                "apartamentoUI"
                                )
                                VALUES ($1, $2, $3) RETURNING uid
                                `
                            const resuelveInsertarApartamento = await conexion.query(insertarApartamento, [reserva, apartamento, apartamentoUI])
                            if (resuelveInsertarApartamento.rowCount === 1) {

                                const transaccionPrecioReserva = {
                                    tipoProcesadorPrecio: "uid",
                                    reservaUID: reserva
                                }
                                await insertarTotalesReserva(transaccionPrecioReserva)


                                const ok = {
                                    ok: "apartamento anadido correctamente",
                                    apartamentoIDV: apartamento,
                                    apartamentoUI: apartamentoUI,
                                    nuevoUID: resuelveInsertarApartamento.rows[0].uid,
                                }
                                salida.json(ok)
                            }


                        }
                        // En el modo forzoso el apartamento entra igual
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoAnadirApartamentoReserva()
                    }
                },
                eliminarApartamentoReserva: async () => {
                    const mutex = new Mutex();
                    const bloqueoEliminarApartamentoReserva = await mutex.acquire();
                    try {

                        const reserva = entrada.body.reserva
                        // apartamentoUID
                        const apartamento = entrada.body.apartamento
                        const tipoBloqueo = entrada.body.tipoBloqueo
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                            const error = "el campo 'apartamento' solo puede un numero, entero y positivo"
                            throw new Error(error)
                        }

                        if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "sinBloqueo") {
                            const error = "El campo 'tipoBloqueo' solo puede ser 'permanente', 'rangoTemporal', 'sinBloquo'"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        // Comprobar que la reserva exisste
                        const validacionReserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva",
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }
                        // Comprobar si existen totales en esta reserva
                        const validarExistenciaTotales = `
                        SELECT 
                        *
                        FROM "reservaTotales"
                        WHERE reserva = $1
                        `
                        const resuelveValidarExistenciaTotales = await conexion.query(validarExistenciaTotales, [reserva])
                        let estadoInfomracionFinanciera = "actualizar"


                        const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO
                        const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO

                        const metadatos = {
                            reserva: reserva,
                            apartamentoUID: apartamento,
                            tipoBloqueo: tipoBloqueo,
                            fechaEntrada_ISO: fechaEntrada_ISO,
                            fechaSalida_ISO: fechaSalida_ISO
                        }
                        await bloquearApartamentos(metadatos)

                        const eliminaApartamentoReserva = `
                        DELETE 
                        FROM 
                            "reservaApartamentos"
                        WHERE 
                            uid = $1 
                        AND 
                            reserva = $2;
                        `
                        const resuelveEliminaApartamentoReserva = await conexion.query(eliminaApartamentoReserva, [apartamento, reserva])

                        if (resuelveEliminaApartamentoReserva.rowCount === 1) {

                            const consultaNumeroDeApartamentos = `
                            SELECT 
                            *
                            FROM "reservaApartamentos"
                            WHERE reserva = $1
                            `
                            const resuelveNumeroDeApartamentosRestantesEnReserva = await conexion.query(consultaNumeroDeApartamentos, [reserva])
                            if (resuelveNumeroDeApartamentosRestantesEnReserva.rowCount === 0) {
                                const eliminaApartamentoReservaQueries = [
                                    'DELETE FROM "reservaImpuestos" WHERE reserva = $1;',
                                    'DELETE FROM "reservaOfertas" WHERE reserva = $1;',
                                    'DELETE FROM "reservaTotales" WHERE reserva = $1;',
                                    'DELETE FROM "reservaTotalesPorApartamento" WHERE reserva = $1;',
                                    'DELETE FROM "reservaTotalesPorNoche" WHERE reserva = $1;'
                                ];

                                for (const query of eliminaApartamentoReservaQueries) {
                                    await conexion.query(query, [reserva]);
                                }
                            }
                            if (resuelveNumeroDeApartamentosRestantesEnReserva.rowCount > 0) {
                                const transaccionPrecioReserva = {
                                    tipoProcesadorPrecio: "uid",
                                    reservaUID: reserva
                                }
                                await insertarTotalesReserva(transaccionPrecioReserva)
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción

                            const ok = {};
                            ok.estadoDesgloseFinanciero = estadoInfomracionFinanciera
                            if (tipoBloqueo === "rangoTemporal") {
                                ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo temporal"
                            }
                            if (tipoBloqueo === "permanente") {
                                ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo permanente"
                            }
                            if (tipoBloqueo === "sinBloqueo") {
                                ok.ok = "Se ha eliminado el apartamento de la reserva y se ha liberado"
                            }
                            salida.json(ok)
                        }

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoEliminarApartamentoReserva()
                    }




                },
                eliminarHabitacionReserva: async () => {
                    const mutex = new Mutex();
                    const bloqueoEliminarHabitacionReserva = await mutex.acquire();
                    try {

                        let reserva = entrada.body.reserva
                        // apartamentoUID
                        let habitacion = entrada.body.habitacion
                        let pernoctantes = entrada.body.pernoctantes
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof habitacion !== "number" || !Number.isInteger(habitacion) || habitacion <= 0) {
                            const error = "el campo 'habitacion' solo puede un numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (pernoctantes !== "conservar" && pernoctantes !== "eliminar") {
                            const error = "El campo 'pernoctantes' solo puede ser 'conservar', 'mantener'"
                            throw new Error(error)
                        }
                        // Comprobar que la reserva exisste
                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        let resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }

                        if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
                            const error = "La reserva no se puede modificar por que esta pagada"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
                            const error = "La reserva no se puede modificar por que esta reembolsada"
                            throw new Error(error)
                        }
                        // validar habitacion
                        const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `
                        let resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacion])
                        if (resuelveValidacionHabitacion.rowCount === 0) {
                            const error = "No existe la habitacion dentro de la reserva"
                            throw new Error(error)
                        }
                        let ok;
                        if (pernoctantes === "eliminar") {
                            let eliminarPernoctantes = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE habitacion = $1 AND reserva = $2;
                            `
                            let resuelveEliminarPernoctantes = await conexion.query(eliminarPernoctantes, [habitacion, reserva])
                            ok = {
                                "ok": "Se ha eliminado al habitacion correctamente y los pernoctanes que contenia"
                            }
                        }
                        let eliminaHabitacionReserva = `
                        DELETE FROM "reservaHabitaciones"
                        WHERE uid = $1 AND reserva = $2;
                        `
                        let resuelveEliminaHabitacionReserva = await conexion.query(eliminaHabitacionReserva, [habitacion, reserva])
                        if (pernoctantes === "conservar") {
                            let desasignaPernoctanteDeHabitacion = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND habitacion = $2;
                            `
                            await conexion.query(desasignaPernoctanteDeHabitacion, [reserva, habitacion])

                            ok = {
                                "ok": "Se ha eliminado al habitacion correctamente pero los pernoctantes que contenia siguen asignados a la reserva"
                            }
                        }
                        salida.json(ok)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoEliminarHabitacionReserva()
                    }
                },
                anadirPernoctanteHabitacion: async () => {
                    const mutex = new Mutex();
                    const bloqueoAnadirPernoctanteHabitacion = await mutex.acquire();
                    try {
                        const reserva = entrada.body.reserva
                        const habitacionUID = entrada.body.habitacionUID
                        const clienteUID = entrada.body.clienteUID
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof habitacionUID !== "number" || !Number.isInteger(habitacionUID) || habitacionUID <= 0) {
                            const error = "el campo 'habitacionUID' solo puede un numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
                            const error = "el campo 'clienteUID' solo puede un numero, entero y positivo"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        // Comprobar que la reserva exisste
                        const validacionReserva = `
                        SELECT 
                        reserva,
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva",
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }

                        // validar habitacion
                        const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `
                        const resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacionUID])
                        if (resuelveValidacionHabitacion.rowCount === 0) {
                            const error = "No existe la habitacion dentro de esta reserva"
                            throw new Error(error)
                        }
                        // validar cliente
                        const validacionCliente = `
                        SELECT 
                        uid
                        FROM clientes
                        WHERE uid = $1
                        `
                        const resuelveValidacionCliente = await conexion.query(validacionCliente, [clienteUID])
                        if (resuelveValidacionCliente.rowCount === 0) {
                            const error = "No existe el cliente"
                            throw new Error(error)
                        }

                        // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
                        const validacionUnicidadPernoctante = `
                        SELECT 
                        "pernoctanteUID"
                        FROM "reservaPernoctantes"
                        WHERE "clienteUID" = $1 AND reserva = $2
                        `
                        const resuelveValidacionUnicidadPernoctante = await conexion.query(validacionUnicidadPernoctante, [clienteUID, reserva])
                        if (resuelveValidacionUnicidadPernoctante.rowCount === 1) {
                            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion"
                            throw new Error(error)
                        }
                        const insertarClienteExistenteEnReserva = `
                        INSERT INTO "reservaPernoctantes"
                        (
                        reserva,
                        habitacion,
                        "clienteUID"
                        )
                        VALUES ($1, $2,$3) RETURNING "pernoctanteUID"
                        `
                        const resuelveInsertarClienteExistenteEnReserva = await conexion.query(insertarClienteExistenteEnReserva, [reserva, habitacionUID, clienteUID])
                        if (resuelveInsertarClienteExistenteEnReserva.rowCount === 1) {
                            const ok = {
                                ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
                                nuevoUID: resuelveInsertarClienteExistenteEnReserva.rows[0].pernoctanteUID
                            }
                            salida.json(ok)
                        }
                        if (resuelveInsertarClienteExistenteEnReserva.rowCount === 0) {
                            const error = "Ha ocurrido un error al final del proceso y no se ha anadido el cliente"
                            throw new Error(error)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoAnadirPernoctanteHabitacion()
                    }
                },
                crearClienteDesdeReservaYAnadirloAreserva: async () => {
                    const mutex = new Mutex();
                    const bloqueoCrearClienteDesdeReservaYAnadirloAreserva = await mutex.acquire();
                    try {
                        let reserva = entrada.body.reserva
                        let habitacionUID = entrada.body.habitacionUID
                        let nombre = entrada.body.nombre
                        let primerApellido = entrada.body.primerApellido
                        let segundoApellido = entrada.body.segundoApellido
                        let pasaporte = entrada.body.pasaporte
                        let telefono = entrada.body.telefono
                        let correoElectronico = entrada.body.correoElectronico
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }

                        if (typeof habitacionUID !== "number" || !Number.isInteger(habitacionUID) || habitacionUID <= 0) {
                            const error = "el campo 'habitacionUID' solo puede un numero, entero y positivo"
                            throw new Error(error)
                        }

                        // Comprobar que la reserva exisste
                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }

                        // validar habitacion
                        const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `
                        let resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacionUID])
                        if (resuelveValidacionHabitacion.rowCount === 0) {
                            const error = "No existe la habitacion dentro de esta reserva"
                            throw new Error(error)
                        }


                        const datosNuevoCliente = {
                            nombre: nombre,
                            primerApellido: primerApellido,
                            segundoApellido: segundoApellido,
                            pasaporte: pasaporte,
                            telefono: telefono,
                            correoElectronico: correoElectronico
                        }

                        const nuevoCliente = await insertarCliente(datosNuevoCliente)
                        const nuevoUIDCliente = nuevoCliente.uid


                        const insertarPernoctante = `
                        INSERT INTO 
                        "reservaPernoctantes"
                        (
                        reserva,
                        habitacion,
                        "clienteUID"
                        )
                        VALUES ($1,$2,$3)
                        RETURNING
                        "pernoctanteUID"
                        `
                        const resuelveInsertarPernoctante = await conexion.query(insertarPernoctante, [reserva, habitacionUID, nuevoUIDCliente])
                        if (resuelveInsertarPernoctante.rowCount === 0) {
                            const error = "No se ha insertardo el pernoctante en al reserva"
                            throw new Error(error)
                        }
                        if (resuelveInsertarPernoctante.rowCount === 1) {
                            const ok = {
                                ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
                                nuevoUIDPernoctante: resuelveInsertarPernoctante.rows[0].pernoctanteUID,
                                nuevoUIDCliente: nuevoUIDCliente
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoCrearClienteDesdeReservaYAnadirloAreserva()
                    }
                },
                guardarNuevoClienteYSustituirloPorElClientePoolActual: async () => {
                    const mutex = new Mutex();
                    const bloqueoGuardarNuevoClienteYSustituirloPorElClientePoolActual = await mutex.acquire();
                    try {
                        const reserva = entrada.body.reserva
                        const pernoctanteUID = entrada.body.pernoctanteUID
                        let nombre = entrada.body.nombre
                        let primerApellido = entrada.body.primerApellido
                        let segundoApellido = entrada.body.segundoApellido
                        let pasaporte = entrada.body.pasaporte
                        let telefono = entrada.body.telefono
                        let correoElectronico = entrada.body.correoElectronico
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                            const error = "el campo 'pernoctanteUID' solo puede un numero, entero y positivo"
                            throw new Error(error)
                        }

                        const nuevoClienteParaValidar = {
                            nombre: nombre,
                            primerApellido: primerApellido,
                            segundoApellido: segundoApellido,
                            pasaporte: pasaporte,
                            telefono: telefono,
                            correoElectronico: correoElectronico,
                            //notas: notas,
                        }

                        const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoClienteParaValidar)
                        nombre = datosValidados.nombre
                        primerApellido = datosValidados.primerApellido
                        segundoApellido = datosValidados.segundoApellido
                        pasaporte = datosValidados.pasaporte
                        telefono = datosValidados.telefono
                        correoElectronico = datosValidados.correoElectronico

                        // Comprobar que la reserva exisste
                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }

                        // validar pernoctante y extraer el UID del clientePool
                        const validacionPernoctante = `
                        SELECT 
                        "clienteUID"
                        FROM 
                        "reservaPernoctantes"
                        WHERE 
                        reserva = $1 AND "pernoctanteUID" = $2
                        `
                        const resuelveValidacionPernoctante = await conexion.query(validacionPernoctante, [reserva, pernoctanteUID])
                        if (resuelveValidacionPernoctante.rowCount === 0) {
                            const error = "No existe el pernoctanteUID dentro de esta reserva"
                            throw new Error(error)
                        }
                        const clienteUID = resuelveValidacionPernoctante.rows[0].clienteUID
                        if (clienteUID) {
                            const error = "El pernoctnte ya es un cliente y un clientePool"
                            throw new Error(error)
                        }
                        const ok = {}

                        const datosNuevoCliente = {
                            nombre: nombre,
                            primerApellido: primerApellido,
                            segundoApellido: segundoApellido,
                            pasaporte: pasaporte,
                            telefono: telefono,
                            correoElectronico: correoElectronico,
                            notas: null
                        }
                        const nuevoCliente = await insertarCliente(datosNuevoCliente)
                        const nuevoUIDCliente = nuevoCliente.uid

                        // Borrar clientePool
                        const eliminarClientePool = `
                        DELETE FROM "poolClientes"
                        WHERE "pernoctanteUID" = $1;`
                        const resuelveEliminarClientePool = await conexion.query(eliminarClientePool, [pernoctanteUID])
                        if (resuelveEliminarClientePool.rowCount === 0) {
                            ok.informacion = "No se ha encontrado un clientePool asociado al pernoctante"
                        }
                        const actualizaPernoctanteReserva =
                            `
                            UPDATE "reservaPernoctantes"
                            SET "clienteUID" = $3
                            WHERE reserva = $1 AND "pernoctanteUID" = $2
                            RETURNING
                            habitacion;
                            `
                        const resuelveActualizaPernoctanteReserva = await conexion.query(actualizaPernoctanteReserva, [reserva, pernoctanteUID, nuevoUIDCliente])
                        if (resuelveActualizaPernoctanteReserva.rowCount === 0) {
                            const error = "No se ha podido actualizar al pernoctante dentro de la reserva"
                            throw new Error(error)
                        }
                        if (resuelveActualizaPernoctanteReserva.rowCount === 1) {
                            const habitacionUID = resuelveActualizaPernoctanteReserva.rows[0].habitacion
                            primerApellido = primerApellido ? primerApellido : ""
                            segundoApellido = segundoApellido ? segundoApellido : ""
                            ok.ok = "Se ha guardado al nuevo cliente y sustituido por el clientePool, tambien se ha eliminado al clientePool de la base de datos"
                            ok.nuevoClienteUID = nuevoUIDCliente
                            ok.nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`
                            ok.pasaporte = pasaporte
                            ok.habitacionUID = habitacionUID
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                        bloqueoGuardarNuevoClienteYSustituirloPorElClientePoolActual()
                    }
                },
                eliminarPernoctanteReserva: async () => {

                    const mutex = new Mutex();
                    const bloqueoEliminarPernoctanteReserva = await mutex.acquire();
                    try {
                        const reserva = entrada.body.reserva
                        const pernoctanteUID = entrada.body.pernoctanteUID
                        const tipoElinacion = entrada.body.tipoEliminacion
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                            const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (typeof tipoElinacion !== "string" || (tipoElinacion !== "habitacion" && tipoElinacion !== "reserva")) {
                            const error = "El campo 'tipoElinacion' solo puede ser 'habitacion' o 'reserva'"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        // Comprobar que la reserva exisste
                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }
                        // validar habitacion
                        const validarCliente = `
                            SELECT 
                            "pernoctanteUID"
                            FROM
                            "reservaPernoctantes"
                            WHERE
                            reserva = $1 AND "pernoctanteUID" = $2
                            `
                        const resuelveValidarCliente = await conexion.query(validarCliente, [reserva, pernoctanteUID])
                        if (resuelveValidarCliente.rowCount === 0) {
                            const error = "No existe el pernoctante en la reserva"
                            throw new Error(error)
                        }
                        const eliminaClientePool = `
                            DELETE FROM "poolClientes"
                            WHERE "pernoctanteUID" = $1;
                            `
                        await conexion.query(eliminaClientePool, [pernoctanteUID])

                        let sentenciaDinamica;
                        if (tipoElinacion === "habitacion") {
                            sentenciaDinamica = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND "pernoctanteUID" = $2 ;
                            `
                        }
                        if (tipoElinacion === "reserva") {
                            sentenciaDinamica = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE reserva = $1 AND "pernoctanteUID" = $2;
                            `
                        }
                        const actualicarPernoctante = await conexion.query(sentenciaDinamica, [reserva, pernoctanteUID])
                        if (actualicarPernoctante.rowCount === 0) {
                            const error = "No existe el pernoctante en la reserva, por lo tanto no se puede actualizar"
                            throw new Error(error)
                        }
                        if (actualicarPernoctante.rowCount === 1) {
                            let ok
                            if (tipoElinacion === "habitacion") {
                                ok = {
                                    "ok": "Se ha eliminado al pernoctante de la habitacion"
                                }
                            }
                            if (tipoElinacion === "reserva") {
                                ok = {
                                    "ok": "Se ha eliminar al pernoctante de la reserva"
                                }
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoEliminarPernoctanteReserva()
                    }
                },
                obtenerElasticidadDelRango: async () => {
                    const mutex = new Mutex();
                    const bloqueoModificarFechaReserva = await mutex.acquire();
                    try {
                        const reserva = entrada.body.reserva
                        const sentidoRango = entrada.body.sentidoRango
                        const mesCalendario = entrada.body.mesCalendario.padStart(2, '0');
                        const anoCalendario = entrada.body.anoCalendario.padStart(2, '0');
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
                            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro"
                            throw new Error(error)
                        }
                        const regexMes = /^\d{2}$/;
                        const regexAno = /^\d{4,}$/;

                        if (!regexAno.test(anoCalendario)) {
                            const error = "El año (anoCalenadrio) debe de ser una cadena de cuatro digitos. Por ejemplo el año uno se escribiria 0001"
                            throw new Error(error)
                        }

                        if (!regexMes.test(mesCalendario)) {
                            const error = "El mes (mesCalendario) debe de ser una cadena de dos digitos, por ejemplo el mes de enero se escribe 01"
                            throw new Error(error)
                        }

                        const mesNumeroControl = parseInt(mesCalendario, 10);
                        const anoNumeroControl = parseInt(anoCalendario, 10);
                        if (mesNumeroControl < 1 && mesNumeroControl > 12 && anoNumeroControl < 2000) {
                            const error = "Revisa los datos de mes por que debe de ser un numero del 1 al 12"
                            throw new Error(error)
                        }

                        if (anoNumeroControl < 2000 || anoNumeroControl > 5000) {
                            const error = "El año no puede ser inferior a 2000 ni superior a 5000"
                            throw new Error(error)

                        }

                        const metadatos = {
                            reserva: reserva,
                            sentidoRango: sentidoRango,
                            anoCalendario: anoCalendario,
                            mesCalendario: mesCalendario
                        }
                        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }

                        const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos)
                        const ok = {
                            ok: transaccionInterna
                        }
                        salida.json(transaccionInterna)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoModificarFechaReserva()
                    }
                },
                estadoReserva: async () => {
                    try {
                        let reserva = entrada.body.reserva
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        const consultaEstadoReservas = `
                        SELECT 
                        reserva,
                        "estadoPago",
                        "estadoReserva"
                        FROM reservas 
                        WHERE reserva = $1;`
                        const resuelveConsultaEstadoReservas = await conexion.query(consultaEstadoReservas, [reserva])
                        if (resuelveConsultaEstadoReservas.rowCount === 0) {
                            const error = "No existe al reserva"
                            throw new Error(error)
                        }
                        if (resuelveConsultaEstadoReservas.rowCount === 1) {
                            const ok = {
                                "estadoReserva": resuelveConsultaEstadoReservas.rows[0].estadoReserva,
                                "estadoPago": resuelveConsultaEstadoReservas.rows[0].estadoPago
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                confirmarModificarFechaReserva: async () => {
                    const mutex = new Mutex();
                    const bloqueoConfirmarModificarFechaReserva = await mutex.acquire();
                    try {
                        const reserva = entrada.body.reserva
                        const sentidoRango = entrada.body.sentidoRango
                        const fecha = entrada.body.fecha


                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
                            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro"
                            throw new Error(error)
                        }
                        const filtroFecha = /^\d{2}\/\d{2}\/\d{4}$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "El campo 'fecha' debe de tener este formado 00/00/0000"
                            throw new Error(error)
                        }

                        // Crea un objeto DateTime y verifica si la fecha es válida
                        const fechaArray = fecha.split("/")
                        const fecha_ISO = `${fechaArray[2]}-${fechaArray[1]}-${fechaArray[0]}`
                        const fecha_Objeto = DateTime.fromISO(fecha_ISO);

                        if (!fecha_Objeto.isValid) {
                            const error = "La fecha aunque cumple el formato esperado, representa una fecha no validad"
                            throw new Error(error)
                        }

                        await conexion.query('BEGIN'); // Inicio de la transacción

                        const fechaSeleccionadaArray = fecha.split("/")
                        const fechaSeleccionada_ISO = `${fechaSeleccionadaArray[2]}-${fechaSeleccionadaArray[1]}-${fechaSeleccionadaArray[0]}`
                        const mesSeleccionado = fechaSeleccionadaArray[1]
                        const anoSeleccionado = fechaSeleccionadaArray[2]
                        const validacionReserva = `
                        SELECT 
                        reserva,
                        "estadoReserva", 
                        "estadoPago",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM
                        reservas
                        WHERE
                        reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                            const error = "La reserva no se puede modificar por que esta cancelada"
                            throw new Error(error)
                        }
                        const detallesReserva = resuelveValidacionReserva.rows[0]

                        const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
                        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO)

                        const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
                        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO)


                        const metadatos = {
                            reserva: reserva,
                            mesCalendario: mesSeleccionado,
                            anoCalendario: anoSeleccionado,
                            sentidoRango: sentidoRango
                        }
                        const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos)
                        const codigoFinal = transaccionInterna.ok
                        const transaccionPrecioReserva = {
                            tipoProcesadorPrecio: "uid",
                            reservaUID: reserva
                        }
                        if (sentidoRango === "pasado") {
                            if (fecha_Objeto >= fechaSalida_Objeto) {
                                const error = "La fecha de entrada introducida no puede ser igual o superior a la fecha de salida actual de la reserva"
                                throw new Error(error)
                            }
                            if (fecha_Objeto > fechaEntrada_Objeto) {
                                if (codigoFinal === "rangoPasadoLibre") {
                                }
                                if (codigoFinal === "noHayRangoPasado") {
                                    const ok = {
                                        ...transaccionInterna,
                                        mensaje: "No se ha confirmado el cambio de fecha de entrada de esta reserva por que no hay disponible elasticidad en el rango. No hay rango disponible para la nueva fecha de entrada que estas soliciando para esta reserva."
                                    }
                                    salida.json(ok)
                                }
                                if (codigoFinal === "rangoPasadoLimitado") {
                                    const detallesDelLimite = transaccionInterna.limitePasado
                                    const fechaLimitePasado_ISO = detallesDelLimite.fecha_ISO
                                    const origenLimite = detallesDelLimite.origen
                                    const fechaLimitePasado_Objeto = DateTime.fromISO(fechaLimitePasado_ISO);
                                    const fechaSeleccionada_Objeto = DateTime.fromISO(fechaSeleccionada_ISO);



                                    const ok = {
                                        ...transaccionInterna,
                                        mensaje: "No se ha confirmado el cambio de fecha de entrada de esta reserva por que no hay disponible elasticidad en el rango. No hay rango disponible para la nueva fecha de entrada que estas soliciando para esta reserva."
                                    }

                                    if (origenLimite === "reserva") {
                                        if (fechaLimitePasado_Objeto > fechaSeleccionada_Objeto) {
                                            salida.json(ok)

                                        }
                                    }
                                    if (origenLimite === "bloqueo") {
                                        if (fechaLimitePasado_Objeto >= fechaSeleccionada_Objeto) {
                                            salida.json(ok)
                                        }
                                    }


                                }

                            }
                            const actualizarModificacionFechaEntradaReserva = `
                            UPDATE reservas
                            SET entrada = $1
                            WHERE reserva = $2
                            RETURNING
                            to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO";
                            `
                            const resuelveActualizarModificacionFechaEntradaReserva = await conexion.query(actualizarModificacionFechaEntradaReserva, [fechaSeleccionada_ISO, reserva])
                            if (resuelveActualizarModificacionFechaEntradaReserva.rowCount === 1) {

                                const nuevaFechaEntrada = resuelveActualizarModificacionFechaEntradaReserva.rows[0].fechaEntrada_ISO
                                await insertarTotalesReserva(transaccionPrecioReserva)

                                const ok = {
                                    ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                                    sentidoRango: "pasado",
                                    fecha_ISO: nuevaFechaEntrada
                                }
                                salida.json(ok)
                            }
                        }
                        if (sentidoRango === "futuro") {
                            if (fecha_Objeto <= fechaEntrada_Objeto) {
                                const error = "La fecha de salida introducida no puede ser igual o inferior a la fecha de entrada actual de la reserva"
                                throw new Error(error)
                            }

                            if (fecha_Objeto < fechaSalida_Objeto) {
                                if (codigoFinal === "rangoFuturoLibre") {
                                }
                                if (codigoFinal === "noHayRangoFuturo") {
                                    const ok = {
                                        ...transaccionInterna,
                                        mensaje: "No se puede seleccionar esa fecha de salida. Con los apartamentos existentes en esta reserva no se puede seleccionar una fecha superior a la fecha de salida por que no estan disponibles"
                                    }
                                    salida.json(ok)

                                }
                                if (codigoFinal === "rangoFuturoLimitado") {
                                    const detallesDelLimite = transaccionInterna.limiteFuturo
                                    const origenLimite = detallesDelLimite.origen
                                    const fechaLimiteFuturo_ISO = detallesDelLimite.fecha_ISO
                                    const fechaLimiteFuturo_Objeto = DateTime.fromISO(fechaLimiteFuturo_ISO);
                                    const fechaSeleccionada_Objeto = DateTime.fromISO(fechaSeleccionada_ISO);

                                    const ok = {
                                        ...transaccionInterna,
                                        mensaje: "No se puede seleccionar esa fecha de salida. Con los apartamentos existentes en esta reserva no se puede seleccionar una fecha superior a la fecha de salida por que no estan disponibles"
                                    }

                                    if (origenLimite === "reserva") {
                                        if (fechaLimiteFuturo_Objeto < fechaSeleccionada_Objeto) {
                                            salida.json(ok)
                                        }
                                    }
                                    if (origenLimite === "bloqueo") {
                                        if (fechaLimiteFuturo_Objeto <= fechaSeleccionada_Objeto) {
                                            salida.json(ok)
                                        }
                                    }

                                }
                            }

                            const actualizarModificacionFechaEntradaReserva = `
                            UPDATE reservas
                            SET salida = $1
                            WHERE reserva = $2
                            RETURNING
                            to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO";`
                            const resuelveConfirmarFecha = await conexion.query(actualizarModificacionFechaEntradaReserva, [fechaSeleccionada_ISO, reserva])
                            if (resuelveConfirmarFecha.rowCount === 1) {
                                const nuevaFechaSalida = resuelveConfirmarFecha.rows[0].fechaSalida_ISO
                                await insertarTotalesReserva(transaccionPrecioReserva)

                                const ok = {
                                    ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                                    sentidoRango: "futuro",
                                    fecha_ISO: nuevaFechaSalida
                                }
                                salida.json(ok)
                            }
                        }

                        await conexion.query('COMMIT'); // Confirmar la transacción

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoConfirmarModificarFechaReserva()
                    }
                },
                cancelarReserva: async () => {
                    try {
                        const reserva = entrada.body.reserva
                        const tipoBloqueo = entrada.body.tipoBloqueo
                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "permanente" && tipoBloqueo !== "sinBloqueo") {
                            const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo"
                            throw new Error(error)
                        }
                        const validacionReserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        const eliminarEnlacesDePago = `
                        DELETE FROM "enlacesDePago"
                        WHERE reserva = $1;
                        `
                        await conexion.query(eliminarEnlacesDePago, [reserva])
                        const fechaCancelacion = new Date()

                        const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO
                        const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO
                        // extraer todos los apartamentos de la reserva
                        const seleccionarApartamentosReserva = `
                        SELECT 
                        uid
                        FROM "reservaApartamentos"
                        WHERE reserva = $1
                        `
                        const resuelveSeleccionarApartamentosReserva = await conexion.query(seleccionarApartamentosReserva, [reserva])
                        const estadoReserva = "cancelada"
                        if (resuelveSeleccionarApartamentosReserva.rowCount === 0) {
                            const actualizarEstadoReserva = `
                            UPDATE 
                            reservas
                            SET 
                            "estadoReserva" = $1,
                            "fechaCancelacion" = $2
                            WHERE 
                            reserva = $3;`
                            const resuelveActualizarEstadoReserva = await conexion.query(actualizarEstadoReserva, [estadoReserva, fechaCancelacion, reserva])
                            if (resuelveActualizarEstadoReserva.rowCount === 1) {
                                const ok = {
                                    ok: "La reserva se ha cancelado"
                                }
                                salida.json(ok)
                            }
                        }
                        if (resuelveSeleccionarApartamentosReserva.rowCount > 0) {
                            const apartamentosReserva = resuelveSeleccionarApartamentosReserva.rows
                            for (const apartamento of apartamentosReserva) {
                                const metadatos = {
                                    reserva: reserva,
                                    apartamentoUID: apartamento.uid,
                                    tipoBloqueo: tipoBloqueo,
                                    fechaEntrada_ISO: fechaEntrada_ISO,
                                    fechaSalida_ISO: fechaSalida_ISO
                                }
                                await bloquearApartamentos(metadatos)
                            }
                            const actualizarEstadoReserva = `
                            UPDATE 
                            reservas
                            SET 
                            "estadoReserva" = $1,
                            "fechaCancelacion" = $2
                            WHERE 
                            reserva = $3;`
                            const resuelveActualizarEstadoReserva = await conexion.query(actualizarEstadoReserva, [estadoReserva, fechaCancelacion, reserva])
                            if (resuelveActualizarEstadoReserva.rowCount === 1) {
                                const ok = {
                                    ok: "La reserva se ha cancelado"
                                }
                                salida.json(ok)
                            }
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    } finally {

                    }
                },
                eliminarIrreversiblementeReserva: async () => {
                    await mutex.acquire();

                    try {
                        const reserva = entrada.body.reserva
                        const clave = entrada.body.clave

                        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        if (!clave) {
                            const error = "No has enviado la clave de tu usuario para confirmar la operacion"
                            throw new Error(error)
                        }

                        const usuarioIDX = entrada.session.usuario
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        const obtenerClaveActualHASH = `
                        SELECT 
                        clave,
                        sal, 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveVitniID = await conexion.query(obtenerClaveActualHASH, [usuarioIDX])
                        if (resuelveVitniID.rowCount === 0) {
                            const error = "No existe el usuario"
                            throw new Error(error)
                        }
                        const claveActualHASH = resuelveVitniID.rows[0].clave
                        const sal = resuelveVitniID.rows[0].sal


                        const metadatos = {
                            sentido: "comparar",
                            clavePlana: clave,
                            sal: sal,
                            claveHash: claveActualHASH
                        }
                        const controlClave = vitiniCrypto(metadatos)
                        if (!controlClave) {
                            const error = "Revisa la contrasena actual que has escrito por que no es correcta por lo tanto no se puede eliminar tu cuenta"
                            throw new Error(error)
                        }
                        // Validar si es un usuario administrador
                        const rol = resuelveVitniID.rows[0].rol
                        const rolAdministrador = "administrador"
                        if (rol !== rolAdministrador) {
                            const error = "Tu cuenta no esta autorizada para eliminar reservas. Puedes cancelar reservas pero no eliminarlas."
                            throw new Error(error)
                        }
                        const validacionReserva = `
                        SELECT 
                        reserva
                        FROM reservas
                        WHERE reserva = $1
                        `
                        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva])
                        if (resuelveValidacionReserva.rowCount === 0) {
                            const error = "No existe la reserva, revisa el identificador de la reserva por que el que has enviado no existe"
                            throw new Error(error)
                        }


                        const consultaElimianrReserva = `
                        DELETE FROM reservas
                        WHERE reserva = $1;
                        `
                        const resuelveEliminarReserva = await conexion.query(consultaElimianrReserva, [reserva])
                        if (resuelveEliminarReserva.rowCount === 0) {
                            const error = "No se encuentra la reserva"
                            throw new Error(error)
                        }
                        if (resuelveEliminarReserva.rowCount === 1) {
                            const ok = {
                                ok: "Se ha eliminado la reserva y su informacion asociada de forma irreversible"
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    } finally {
                        mutex.release()
                    }
                },
                crearReservaSimpleAdministrativa: async () => {
                    await mutex.acquire();
                    try {
                        const fechaEntrada = entrada.body.fechaEntrada
                        const fechaSalida = entrada.body.fechaSalida
                        const apartamentos = entrada.body.apartamentos


                        // Control validez fecha
                        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO
                        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO

                        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria

                        if (!Array.isArray(apartamentos)) {
                            const error = "el campo 'apartamentos' debe de ser un array"
                            throw new Error(error)
                        }

                        const fechaControl_Entrada = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria }).isValid;
                        if (!fechaControl_Entrada) {
                            const error = "LA fecha de entrada no es valida"
                            throw new Error(error)
                        }

                        const fechaControl_Salida = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria }).isValid;
                        if (!fechaControl_Salida) {
                            const error = "LA fecha de salida no es valida"
                            throw new Error(error)
                        }
                        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()
                        // validar que en el array hay un maximo de posiciones no superior al numero de filas que existen en los apartementos
                        const estadoDisonibleApartamento = "disponible"
                        const validarNumeroApartamentosMaximoArrayEntrante = `
                        SELECT
                        "apartamentoIDV"
                        FROM "configuracionApartamento"
                        WHERE "estadoConfiguracion" = $1`
                        const resuelveValidarNumeroApartamentosMaximoArrayEntrante = await conexion.query(validarNumeroApartamentosMaximoArrayEntrante, [estadoDisonibleApartamento])
                        if (resuelveValidarNumeroApartamentosMaximoArrayEntrante.rowCount === 0) {
                            const error = "No hay ningun apartamento disponible ahora mismo"
                            throw new Error(error)
                        }
                        if (apartamentos.length > resuelveValidarNumeroApartamentosMaximoArrayEntrante.rowCount) {
                            const error = "El tamano de posiciones del array de apartamentos es demasiado grande"
                            throw new Error(error)
                        }

                        // Formateo fecha mucho ojo que los anglosajones tiene el formato mes/dia/ano y queremos usar dia/mes/ano y el objeto date de javascript por cojones usa ese formato
                        const fechaEntradaEnArreglo = fechaEntrada.split("/")
                        const fechaSalidaEnArreglo = fechaSalida.split("/")
                        const constructorFechaEntradaFormatoMDA = `${fechaEntradaEnArreglo[1]}/${fechaEntradaEnArreglo[0]}/${fechaEntradaEnArreglo[2]}`
                        const constructorFechaSalidaFormatoMDA = `${fechaSalidaEnArreglo[1]}/${fechaSalidaEnArreglo[0]}/${fechaSalidaEnArreglo[2]}`
                        const controlFechaEntrada = new Date(constructorFechaEntradaFormatoMDA); // El formato es día/mes/ano
                        const controlFechaSalida = new Date(constructorFechaSalidaFormatoMDA);

                        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
                        if (controlFechaEntrada >= controlFechaSalida) {
                            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
                            throw new Error(error)
                        }

                        const filtroApartamentoIDV = /^[a-z0-9]+$/;
                        for (const apartamento of apartamentos) {

                            if (!filtroApartamentoIDV.test(apartamento)) {
                                const error = "Hay un apartamentoIDV dentro del array que no cumple los requisitos."
                                throw new Error(error)
                            }
                        }
                        // validar que los apartamentos que se existen estan disponbiles para las fechas
                        const transacion = {
                            fechaEntrada_ISO: fechaEntrada_ISO,
                            fechaSalida_ISO: fechaSalida_ISO
                        }
                        const resuelveApartamentosDisponibles = await apartamentosDisponiblesAdministracion(transacion)
                        const apartamentosDisponibles = resuelveApartamentosDisponibles.apartamentosDisponibles
                        if (apartamentosDisponibles.length === 0) {
                            const error = "No hay ningun apartamento disponible para estas fechas"
                            throw new Error(error)
                        }
                        if (apartamentosDisponibles.length > 0) {
                            const validarApartamentosDisonbiles = (apartamentosSolicitados, apartamentosDisponibles) => {
                                return apartamentosSolicitados.every(apartamento => apartamentosDisponibles.includes(apartamento));
                            }

                            const controlApartamentosDisponibles = validarApartamentosDisonbiles(apartamentos, apartamentosDisponibles);
                            if (!controlApartamentosDisponibles) {
                                const error = "Los apartamentos solicitados para este rango de fechas no estan disponbiles."
                                throw new Error(error)
                            }

                            const formatoFechaEntradaDMA = `${fechaEntradaEnArreglo[0]}/${fechaEntradaEnArreglo[1]}/${fechaEntradaEnArreglo[2]}`
                            const formatoFechaSalidaDMA = `${fechaSalidaEnArreglo[0]}/${fechaSalidaEnArreglo[1]}/${fechaSalidaEnArreglo[2]}`


                            const formatearFechaDesdeISO8601 = (cadenaISO8601) => {
                                // Importantisimo
                                // Esto se usa para poner un cero si el numero de dia o de mes es 9 o menor para evitar la interpretacion de JS que resta 1 al numero en la interpretacion de fechas
                                const fecha = new Date(cadenaISO8601);
                                const year = fecha.getFullYear();
                                const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 porque los meses van de 0 a 11
                                const day = fecha.getDate().toString().padStart(2, '0');
                                return `${year}-${month}-${day}`;
                            };

                            const fechaEntradaReservaISO8610 = new Date(formatearFechaDesdeISO8601(`${fechaEntradaEnArreglo[2]}-${fechaEntradaEnArreglo[1]}-${fechaEntradaEnArreglo[0]}`)).toISOString().split('T')[0];
                            const fechaSalidaReservaISO8610 = new Date(formatearFechaDesdeISO8601(`${fechaSalidaEnArreglo[2]}-${fechaSalidaEnArreglo[1]}-${fechaSalidaEnArreglo[0]}`)).toISOString().split('T')[0];

                            // insertar fila reserva y en la tabla reservarAartametnos insertar las correspondientes filas
                            const estadoReserva = "confirmada";
                            const origen = "administracion";
                            const creacionFechaReserva = new Date().toISOString();
                            const estadoPago = "noPagado"
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const insertarReserva = `
                            INSERT INTO
                            reservas 
                            (
                            entrada,
                            salida,
                            "estadoReserva",
                            origen,
                            creacion,
                            "estadoPago")
                            VALUES
                            ($1,$2,$3,$4,$5,$6)
                            RETURNING 
                            reserva `
                            const resuelveInsertarReserva = await conexion.query(insertarReserva, [fechaEntradaReservaISO8610, fechaSalidaReservaISO8610, estadoReserva, origen, creacionFechaReserva, estadoPago])
                            const reservaUIDNuevo = resuelveInsertarReserva.rows[0].reserva;
                            for (const apartamento of apartamentos) {
                                const apartamentoUI = await resolverApartamentoUI(apartamento)

                                const InsertarApartamento = `
                                INSERT INTO
                                "reservaApartamentos"
                                (
                                reserva,
                                apartamento, 
                                "apartamentoUI"
                                )
                                VALUES ($1, $2, $3)
                                `
                                const resuelveInsertarApartamento = await conexion.query(InsertarApartamento, [reservaUIDNuevo, apartamento, apartamentoUI])
                                if (resuelveInsertarApartamento.rowCount === 0) {
                                    const error = "Ha ocurrido un error insertando el apartamento " + apartamento + " se detiene y se deshache todo el proceso"
                                    throw new Error(error)
                                }
                            }
                            const transaccionPrecioReserva = {
                                tipoProcesadorPrecio: "uid",
                                reservaUID: Number(reservaUIDNuevo)
                            }
                            await insertarTotalesReserva(transaccionPrecioReserva)



                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha anadido al reserva vacia",
                                reservaUID: reservaUIDNuevo
                            }
                            salida.json(ok)

                        }

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                        mutex.release();
                    }
                },
                transacciones: {
                    IDX: {
                        ROL: ["administrador", "empleado"]
                    },
                    obtenerPagosDeLaReserva: async () => {
                        try {
                            const reservaUID = entrada.body.reservaUID
                            const filtroCadena = /^[0-9]+$/;
                            if (!reservaUID || !filtroCadena.test(reservaUID)) {
                                const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }

                            const detallesPagosReserva = await componentes.administracion.reservas.transacciones.pagosDeLaReserva(reservaUID)
                            const metadatos = {
                                reservaUID: Number(reservaUID),
                                solo: "informacionGlobal"
                            }
                            const resuelveDetallesReserva = await detallesReserva(metadatos)
                            const estadoPago = resuelveDetallesReserva.reserva.estadoPago
                            const totalReembolsado = await obtenerTotalReembolsado(reservaUID)
                            const totalReserva = detallesPagosReserva.totalReserva
                            const totalPagado = detallesPagosReserva.totalPagado

                            let porcentajeReembolsado = "0.00"
                            if (totalPagado > 0) {
                                porcentajeReembolsado = new Decimal(totalReembolsado).dividedBy(totalPagado).times(100).toFixed(2);
                            }
                            const porcentajePagado = new Decimal(totalPagado).dividedBy(totalReserva).times(100).toFixed(2);
                            const porcentajePagadoUI = porcentajePagado !== "Infinity" ? porcentajePagado + "%" : "0.00%"
                            const ok = {
                                ok: "Aqui tienes los pagos de esta reserva",
                                estadoPago: estadoPago,
                                totalReembolsado: totalReembolsado.toFixed(2),
                                porcentajeReembolsado: porcentajeReembolsado + "%",
                                porcentajePagado: porcentajePagadoUI

                            }
                            const okFusionado = { ...ok, ...detallesPagosReserva };




                            salida.json(okFusionado)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)

                        }
                    },
                    obtenerDetallesDelPago: async () => {
                        try {
                            const pagoUID = entrada.body.pagoUID
                            const filtroCadena = /^[0-9]+$/;
                            if (!pagoUID || !filtroCadena.test(pagoUID)) {
                                const error = "el campo 'pagoUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }
                            const validarPago = `
                            SELECT
                                "plataformaDePago",
                                "pagoUID",
                                "pagoUIDPasarela",
                                "tarjetaDigitos",
                                "fechaPago"::text AS "fechaPago",
                                tarjeta,
                                cantidad
                            FROM 
                                "reservaPagos"
                            WHERE 
                                "pagoUID" = $1;`
                            const reseulveValidarPago = await conexion.query(validarPago, [pagoUID])
                            if (reseulveValidarPago.rowCount === 0) {
                                const error = "No existe ningún pago con ese pagoUID"
                                throw new Error(error)
                            }

                            if (reseulveValidarPago.rowCount === 1) {
                                // Determinar tipo de pago
                                const detallesDelPago = reseulveValidarPago.rows[0]
                                const plataformaDePagoControl = detallesDelPago.plataformaDePago
                                const cantidadDelPago = detallesDelPago.cantidad
                                const ok = {
                                    ok: "Aqui tienes los pagos de esta reserva",
                                    detallesDelPago: detallesDelPago,
                                    deglosePorReembolso: []
                                }

                                if (plataformaDePagoControl === "pasarela") {
                                    const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela

                                    const actualizarReembolsos = await componentes.administracion.reservas.transacciones.actualizarReembolsosDelPagoDesdeSquare(pagoUID, pagoUIDPasarela)
                                    if (actualizarReembolsos?.error) {
                                        ok.estadoPasarela = actualizarReembolsos.error
                                    }
                                }

                                const consultaReembolsos = `
                                    SELECT
                                        "reembolsoUID",
                                        cantidad,
                                        "plataformaDePago",
                                        "reembolsoUIDPasarela",
                                        estado,
                                        "fechaCreacion"::text AS "fechaCreacion",
                                        "fechaActualizacion"::text AS "fechaActualizacion"
                                    FROM 
                                        "reservaReembolsos"
                                    WHERE 
                                        "pagoUID" = $1
                                    ORDER BY
                                        "reembolsoUID" DESC;`
                                const resuelveConsultaReembolsos = await conexion.query(consultaReembolsos, [pagoUID])


                                if (resuelveConsultaReembolsos.rowCount > 0) {
                                    const reembolsosDelPago = resuelveConsultaReembolsos.rows
                                    let sumaDeLoReembolsado = 0
                                    for (const detallesDelReembolso of reembolsosDelPago) {

                                        const reembolsoUID = detallesDelReembolso.reembolsoUID
                                        const plataformaDePagoObtenida = detallesDelReembolso.plataformaDePago
                                        const cantidadDelReembolso = new Decimal(detallesDelReembolso.cantidad)
                                        const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela
                                        const Estado = detallesDelReembolso.Estado
                                        const fechaCreacion = detallesDelReembolso.fechaCreacion
                                        const fechaActualizacion = detallesDelReembolso.fechaActualizacion

                                        const fechaCreacionUTC = utilidades.convertirFechaHaciaISO8601(fechaCreacion)
                                        const creacionESP = utilidades.deUTCaZonaHoraria(fechaCreacionUTC, "Europe/Madrid")
                                        const creacionNIC = utilidades.deUTCaZonaHoraria(fechaCreacionUTC, "America/Managua")


                                        // Revisa esto por que se deben de pasr como cadena
                                        sumaDeLoReembolsado = cantidadDelReembolso.plus(sumaDeLoReembolsado)
                                        const estructuraReembolso = {
                                            reembolsoUID: reembolsoUID,
                                            plataformaDePago: plataformaDePagoObtenida,
                                            cantidad: cantidadDelReembolso,
                                            reembolsoUIDPasarela: reembolsoUIDPasarela,
                                            Estado: Estado,
                                            fechaCreacionUTC: fechaCreacion,
                                            fechaCreacionMadrid: creacionESP,
                                            fechaCreacionNicaragua: creacionNIC
                                        }

                                        if (fechaActualizacion) {
                                            const fechaActualizacionUTC = utilidades.convertirFechaHaciaISO8601(fechaActualizacion)
                                            const actualizacionESP = utilidades.deUTCaZonaHoraria(fechaActualizacionUTC, "Europe/Madrid")
                                            const actualizacionNIC = utilidades.deUTCaZonaHoraria(fechaActualizacionUTC, "America/Managua")

                                            estructuraReembolso.fechaActualizacionUTC = fechaActualizacion
                                            estructuraReembolso.fechaActualizacionMadrid = actualizacionESP
                                            estructuraReembolso.fechaActualizacionNicaragua = actualizacionNIC

                                        }


                                        ok.deglosePorReembolso.push(estructuraReembolso)
                                    }
                                    let reembolsado
                                    if (Number(cantidadDelPago) === Number(sumaDeLoReembolsado)) {
                                        reembolsado = "totalmente"
                                    }
                                    if (Number(cantidadDelPago) > Number(sumaDeLoReembolsado)) {
                                        reembolsado = "parcialmente"
                                    }
                                    if (Number(cantidadDelPago) < Number(sumaDeLoReembolsado)) {
                                        reembolsado = "superadamente"
                                    }
                                    ok.detallesDelPago.sumaDeLoReembolsado = sumaDeLoReembolsado.toFixed(2)
                                    ok.detallesDelPago.reembolsado = reembolsado
                                }

                                //ok.deglosePorReembolso.push(detallesDelPago)

                                salida.json(ok)
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)

                        }
                    },
                    detallesDelReembolso: async () => {
                        try {
                            const reembolsoUID = entrada.body.reembolsoUID
                            const filtroCadena = /^[0-9]+$/;
                            if (!reembolsoUID || !filtroCadena.test(reembolsoUID)) {
                                const error = "el campo 'reembolsoUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }

                            const actualizarReembolso = await componentes.administracion.reservas.transacciones.actualizarSOLOreembolsoDesdeSquare(reembolsoUID)

                            if (actualizarReembolso.error) {
                                throw new Error(actualizarReembolso.error)
                            }

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
                                "reembolsoUID" = $1;`
                            const reseulveValidarReembolso = await conexion.query(validarReembolso, [reembolsoUID])
                            if (reseulveValidarReembolso.rowCount === 0) {
                                const error = "No existe ningún reembolso con ese reembolsoUID"
                                throw new Error(error)
                            }

                            if (reseulveValidarReembolso.rowCount === 1) {
                                const detallesDelReembolso = reseulveValidarReembolso.rows[0]

                                const pagoUID = detallesDelReembolso.pagoUID
                                const cantidad = detallesDelReembolso.cantidad
                                const plataformaDePag = detallesDelReembolso.plataformaDePag
                                const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela
                                const estado = detallesDelReembolso.estado
                                const fechaCreacion = detallesDelReembolso.fechaCreacion
                                const fechaActualizacion = detallesDelReembolso.fechaActualizacion
                                const ok = {
                                    ok: "Aqui tienes los detalles del reembolso",
                                    pagoUID: pagoUID,
                                    cantidad: cantidad,
                                    plataformaDePag: plataformaDePag,
                                    reembolsoUIDPasarela: reembolsoUIDPasarela,
                                    estado: estado,
                                    fechaCreacion: fechaCreacion,
                                    fechaActualizacion: fechaActualizacion,
                                }
                                salida.json(ok)
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)

                        }
                    },
                    realizarReembolso: async () => {
                        try {
                            const reservaUID = entrada.body.reservaUID
                            let cantidad = entrada.body.cantidad
                            const pagoUID = entrada.body.pagoUID
                            const palabra = entrada.body.palabra
                            let tipoReembolso = entrada.body.tipoReembolso
                            let plataformaDePagoEntrada = entrada.body.plataformaDePagoEntrada
                            plataformaDePagoEntrada.toLowerCase()

                            if (palabra !== "reembolso") {
                                const error = "Escriba la palabra reembolso en le campo de confirmacion"
                                throw new Error(error)
                            }

                            const filtroTotal = /^\d+\.\d{2}$/;
                            const filtroNumerosEnteros = /^[0-9]+$/;
                            const filtroDecimales = /^\d+\.\d{2}$/;

                            if (!reservaUID || !filtroNumerosEnteros.test(reservaUID)) {
                                const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }
                            if (!pagoUID || !filtroNumerosEnteros.test(pagoUID)) {
                                const error = "el campo 'pagoUID' solo puede ser una cadena de numeros."
                                throw new Error(error)
                            }
                            if (tipoReembolso !== "porPorcentaje" && tipoReembolso !== "porCantidad") {
                                const error = "el campo 'tipoReembolso' solo puede ser porPorcentaje o porCantidad."
                                // throw new Error(error)
                            }

                            if (!cantidad || !filtroDecimales.test(cantidad)) {
                                const error = "LA cantida del reembolso solo puede ser una cadena con un numero don dos decimales separados por punto"
                                throw new Error(error)
                            }
                            const tipoDeReembolso = ["efectivo", "pasarela", "cheque", "tarjeta"];
                            if (!tipoDeReembolso.some(palabra => plataformaDePagoEntrada.includes(palabra))) {
                                const error = "Selecciona eltipo de plataforma en la que se va ha hacer el reembolso, por ejemplo pasarela, tarjeta, efectivo o cheque"
                                throw new Error(error)
                            }


                            const detallesReserva = await validadoresCompartidos.reservas.validarReserva(reservaUID)
                            const estadoReserva = detallesReserva.estadoReserva
                            const estadoPago = detallesReserva.estadoPago
                            if (estadoPago === "noPagado") {
                                // const error = "No se puede hacer un reembolso de un pago asociado a una resera no pagada"
                                // throw new Error(error)
                            }

                            const validarPago = `
                            SELECT
                            "pagoUID",
                            "plataformaDePago",
                            cantidad,
                            "pagoUIDPasarela"
                            FROM "reservaPagos"
                            WHERE reserva = $1 AND "pagoUID" = $2`
                            const resuelveValidarPago = await conexion.query(validarPago, [reservaUID, pagoUID])
                            if (resuelveValidarPago.rowCount === 0) {
                                const error = "No existe el pago dentro de la reserva"
                                throw new Error(error)
                            }
                            if (resuelveValidarPago.rowCount === 1) {
                                const detallesDelPago = resuelveValidarPago.rows[0]
                                const plataformaDePago = detallesDelPago.plataformaDePago
                                const pagoUID = detallesDelPago.pagoUID
                                const pagoUIDPasarela = detallesDelPago.pagoUIDPasarela
                                const controlTotalPago = detallesDelPago.cantidad
                                let reembolsoUIPasarela
                                let estadoReembolso
                                let fechaCreacion
                                let fechaActualizacion

                                const moneda = "USD"
                                if (Number(controlTotalPago) < Number(cantidad)) {
                                    const error = `El valor del reembolso ${cantidad} supera el valor total del pago ${controlTotalPago} que se quiere reembolsar.`
                                    throw new Error(error)
                                }

                                // controlar que el reembolso no sea superior al maximo  reembolsable teniendo en cuenta todos los reembolsos ya realizados de cualquuier tipo
                                const consultaReembolsosDelPago = `
                                SELECT
                                cantidad
                                FROM "reservaReembolsos"
                                WHERE "pagoUID" = $1`
                                const reembolsosDelPago = await conexion.query(consultaReembolsosDelPago, [pagoUID])
                                if (reembolsosDelPago.rowCount > 0) {

                                    let totalReembolsado = 0
                                    const reembolsos = reembolsosDelPago.rows

                                    reembolsos.map((detallesDelReembolso) => {
                                        const cantidadDelReembolso = detallesDelReembolso.cantidad



                                        totalReembolsado = new Decimal(totalReembolsado).plus(cantidadDelReembolso)
                                    })


                                    const totalReembolsable = new Decimal(controlTotalPago).minus(totalReembolsado)



                                    if (Number(cantidad) >= Number(totalReembolsable)) {
                                        const error = `El valor del reembolso ${cantidad} supera el valor total reembolsable de este pago (${totalReembolsable}). Recuerda que no puedes realizar un reembolso que supere la cantidad reembolsable del pago. Ten encuenta el resto de reembolsos a la hora de hacer un reembolso mas de este pago`
                                        throw new Error(error)
                                    }
                                }

                                if (plataformaDePagoEntrada === "pasarela" && plataformaDePago !== "pasarela") {
                                    const error = `No se puede enviar este reembolso a la pasarela por que este pago no se hizo por la pasarela. Para realizar un reembolso a atraves de la pasarela el pago del cual forma parte el reembolso tiene que haberse producidop por la pasarea.`
                                    throw new Error(error)
                                }

                                if (plataformaDePago === "pasarela" && plataformaDePagoEntrada === "pasarela") {
                                    const totalFormatoSquare = Number(cantidad.replace(".", ""))

                                    const reembolsoDetalles = {
                                        idempotencyKey: uuidv4(),
                                        amountMoney: {
                                            amount: totalFormatoSquare,
                                            currency: moneda
                                        },
                                        paymentId: pagoUIDPasarela
                                    }
                                    const procesadorReembolso = await componentes.pasarela.crearReenbolso(reembolsoDetalles)
                                    if (procesadorReembolso.error) {
                                        const errorUID = procesadorReembolso.error?.errors[0]?.code
                                        let error
                                        switch (errorUID) {
                                            case "REFUND_AMOUNT_INVALID":
                                                error = "La pasarela informa que el reembolso es superior a la cantidad del pago que se quiere reembolsar"
                                                throw new Error(error);
                                            case "CURRENCY_MISMATCH":
                                                error = "Revisa el codigo de la moneda introducido. Solo se aceptan dolares. Coodigo: USD"
                                                throw new Error(error);
                                            case "NOT_FOUND":
                                                error = "La pasarela informa de que el idenficador del reembolso no existe en la pasarela"
                                                throw new Error(error);
                                            default:
                                                error = "La pasarela informa de un error generico"
                                                throw new Error(error);
                                        }
                                    }
                                    reembolsoUIPasarela = procesadorReembolso.id
                                    cantidad = utilidades.deFormatoSquareAFormatoSQL(procesadorReembolso.amountMoney.amount)
                                    estadoReembolso = procesadorReembolso.status
                                    fechaCreacion = procesadorReembolso.createdAt
                                    fechaActualizacion = procesadorReembolso.updatedAt
                                }

                                if (plataformaDePagoEntrada !== "pasarela") {
                                    fechaCreacion = new Date()
                                }
                                // Si es pago es de pasarela, enviar el reembolso a la pasarelaa y luego proseguir norma

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
                                RETURNING
                                    "reembolsoUID"
                                `
                                const datosNuevoReembolso = [
                                    pagoUID,
                                    cantidad,
                                    plataformaDePagoEntrada,
                                    reembolsoUIPasarela,
                                    estadoReembolso,
                                    fechaCreacion,
                                    fechaActualizacion,
                                ]
                                const resuelveInsertarReembolso = await conexion.query(insertarReembolso, datosNuevoReembolso)
                                const reembolsoUID = resuelveInsertarReembolso.rows[0].reembolsoUID

                                const ok = {
                                    reembolsoUID: reembolsoUID
                                }

                                if (plataformaDePagoEntrada === "pasarela") {
                                    ok.ok = "Se ha guardado el reembolso en la base de datos y enviado con exito a la pasarela. El dinero del reembolso se esta reembolsando a traves de la pasarela"
                                } else {
                                    ok.ok = "Se ha guardado el reembolso en la base de datos verifique que el reembolso sea entrago al cliente"
                                }
                                salida.json(ok)
                            }
                        } catch (errorCapturado) {
                            let errorFinal
                            if (errorCapturado?.result?.errors[0]?.code) {
                                errorFinal = errorCapturado.result.errors[0].code
                            } else {
                                errorFinal = errorCapturado.message
                            }
                            const error = {
                                error: errorFinal
                            }

                            salida.json(error)
                        }
                    },
                    crearPagoManual: async () => {
                        try {
                            const plataformaDePago = entrada.body.plataformaDePago
                            let cantidad = entrada.body.cantidad
                            const reservaUID = entrada.body.reservaUID
                            //let pagadorNombre = entrada.body.pagadorNombre
                            //let pagadorPasaporte = entrada.body.pagadorPasaporte
                            let chequeUID = entrada.body.chequeUID
                            let pagoUIDPasarela = entrada.body.pagoUIDPasarela
                            let tarjetaUltimos = entrada.body.tarjetaUltimos

                            const filtroCadena = /^[a-zA-Z0-9\s]+$/;
                            const filtroCadenaSinEspacios = /^[a-zA-Z0-9]+$/;
                            const filtro4Numeros = /^\d{4}$/;

                            const filtroNumeros = /^[0-9]+$/;
                            const filtroDecimales = /^\d+\.\d{2}$/;

                            if (!plataformaDePago || !filtroCadena.test(plataformaDePago)) {
                                const error = "El campo plataformaDePago solo admite minúsculas y mayuscuas"
                                throw new Error(error)
                            }

                            await validadoresCompartidos.reservas.validarReserva(reservaUID)

                            const validadores = {
                                cantidad: (cantidad) => {
                                    if (!cantidad || !filtroDecimales.test(cantidad)) {
                                        const error = "El campo cantidad solo admite una cadena con un numero con dos decimales separados por punto"
                                        throw new Error(error)
                                    }
                                    return cantidad
                                },
                                pagadorNombre: (pagadorNombre) => {
                                    if (!pagadorNombre || !filtroCadena.test(pagadorNombre)) {
                                        const error = "El campo pagadorNombre solo admite una cadena con mayúsculas, minúsculas, numero y espacios"
                                        throw new Error(error)
                                    }
                                    pagadorNombre = pagadorNombre.toUpperCase()
                                    return pagadorNombre
                                },
                                pagadorPasaporte: (pagadorPasaporte) => {
                                    if (!pagadorPasaporte || !filtroCadena.test(pagadorPasaporte)) {
                                        const error = "El campo pagadorPasaporte solo admite una cadena con mayúsculas, minúsculas, numero y espacios"
                                        throw new Error(error)
                                    }
                                    return pagadorPasaporte
                                },
                                chequeUID: (chequeUID) => {
                                    if (!chequeUID || !filtroCadena.test(chequeUID)) {
                                        const error = "El campo chequeUID solo admite una cadena con mayúsculas, minúsculas, numero y espacios"
                                        throw new Error(error)
                                    }
                                    return chequeUID
                                },
                                pagoUIDPasarela: (pagoUIDPasarela) => {
                                    if (!pagoUIDPasarela || !filtroCadenaSinEspacios.test(pagoUIDPasarela)) {
                                        const error = "El campo pagoUIDPasarela solo admite una cadena con mayúsculas, minúsculas y numero"
                                        throw new Error(error)
                                    }
                                    return pagoUIDPasarela
                                },
                                tarjetaUltimos: (tarjetaUltimos) => {
                                    if (!tarjetaUltimos || !filtro4Numeros.test(tarjetaUltimos)) {
                                        const error = "El campo tarjetaUltimos solo admite una cadena con cuatro numeros"
                                        throw new Error(error)
                                    }
                                    return tarjetaUltimos
                                },

                            }


                            const fechaActual = new Date()

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
                                        "chequeUID"
                                        )
                                        VALUES 
                                        ($1, $2, $3, $4, $5, $6, $7, $8)
                                        RETURNING
                                        "pagoUID",
                                        "plataformaDePago",
                                        "tarjetaDigitos",
                                        "pagoUIDPasarela",
                                        cantidad,
                                        "fechaPago"::TEXT AS "fechaPago",
                                        "chequeUID"
                                        `
                                        const datosPago = [
                                            datosDelNuevoPago.plataformaDePago,
                                            datosDelNuevoPago.tarjeta,
                                            datosDelNuevoPago.tarjetaDigitos,
                                            datosDelNuevoPago.pagoUIDPasarela,
                                            datosDelNuevoPago.reservaUID,
                                            datosDelNuevoPago.cantidadConPunto,
                                            datosDelNuevoPago.fechaPago,
                                            datosDelNuevoPago.chequeUID
                                        ]
                                        const consulta = await conexion.query(asociarPago, datosPago)
                                        return consulta.rows[0]
                                    } catch (errorCapturado) {
                                        throw errorCapturado
                                    }

                                }
                            }
                            const estructuraFinal = {}
                            let nuevoPago
                            let pagoUID

                            switch (plataformaDePago) {
                                case 'efectivo':
                                    cantidad = validadores.cantidad(cantidad)
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
                                    }
                                    pagoUID = await sql.insertarPago(nuevoPago)

                                    estructuraFinal.ok = "Se ha insertado el nuevo pago en efectivo"
                                    estructuraFinal.detallesDelPago = pagoUID

                                    break;
                                case 'cheque':

                                    cantidad = validadores.cantidad(cantidad)
                                    //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                    //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                                    chequeUID = validadores.chequeUID(chequeUID)

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
                                    }
                                    pagoUID = await sql.insertarPago(nuevoPago)

                                    estructuraFinal.ok = "Se ha insertado el nuevo pago en cheque"
                                    estructuraFinal.detallesDelPago = pagoUID



                                    break;
                                case 'pasarela':
                                    // Aqui solo se asocia el pago con el id de la pasarela, por que para lo otro estan los enlaces de pago
                                    //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                    //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)

                                    pagoUIDPasarela = validadores.pagoUIDPasarela(pagoUIDPasarela)

                                    const consultaUIDUnico = `
                                    SELECT 
                                    "pagoUIDPasarela"
                                    FROM 
                                    "reservaPagos"
                                    WHERE "pagoUIDPasarela" = $1 AND reserva = $2;`
                                    const resuelveConsultaUIDUnico = await conexion.query(consultaUIDUnico, [pagoUIDPasarela, reservaUID])
                                    if (resuelveConsultaUIDUnico.rowCount > 0) {
                                        const error = "Ya existe este id del pago asociado a esta reserva"
                                        throw new Error(error)
                                    }

                                    const detallesDelPago = await componentes.pasarela.detallesDelPago(pagoUIDPasarela)
                                    if (detallesDelPago.error) {
                                        const errorUID = detallesDelPago.error.errors[0].code
                                        let error
                                        switch (errorUID) {
                                            case "NOT_FOUND":
                                                error = "La pasarela informa de que el idenficador de pago que tratas de asocias con Casa Vitini no existe, por favor revisa el identificador de pago"
                                                throw new Error(error);
                                            default:
                                                error = "La pasarela informa de un error generico"
                                                throw new Error(error);
                                        }
                                    }
                                    // Detalles del pago
                                    const pagoUIDPasarelaVerificado = detallesDelPago.id
                                    const cantidadVerificada = detallesDelPago.amountMoney.amount
                                    const cantidadFormateada = utilidades.deFormatoSquareAFormatoSQL(cantidadVerificada)
                                    const tarjeta = detallesDelPago.cardDetails.card.cardBrand
                                    const tarjetaDigitos = detallesDelPago.cardDetails.card.last4
                                    const fechaPago = detallesDelPago.createdAt

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
                                    }

                                    pagoUID = await sql.insertarPago(nuevoPago)

                                    estructuraFinal.ok = "Se ha insertado los datos importados de la pasarela"
                                    estructuraFinal.detallesDelPago = pagoUID
                                    break;
                                case 'tarjeta':


                                    cantidad = validadores.cantidad(cantidad)
                                    //pagadorNombre = validadores.pagadorNombre(pagadorNombre)
                                    //pagadorPasaporte = validadores.pagadorPasaporte(pagadorPasaporte)
                                    tarjetaUltimos = validadores.tarjetaUltimos(tarjetaUltimos)

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
                                    }
                                    pagoUID = await sql.insertarPago(nuevoPago)

                                    estructuraFinal.ok = "Se ha insertado el nuevo pago hecho con tarjeta de manera externa como en un TPV"
                                    estructuraFinal.detallesDelPago = pagoUID
                                    break;
                                default:
                                    const error = "El campo plataformaDePago solo admite una cadena mayúsculas y minúsculas sin espacios. Las plataformas de pagos son tarjeta, efectivo, pasarela,"
                                    throw new Error(error)

                            }
                            await actualizarEstadoPago(reservaUID)
                            salida.json(estructuraFinal)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    eliminarPagoManual: async () => {
                        try {
                            const palabra = entrada.body.palabra
                            const pagoUID = entrada.body.pagoUID
                            const reservaUID = entrada.body.reservaUID
                            if (palabra !== "eliminar") {
                                const error = "Necesario escribir la la palabra eliminar para confirmar"
                                throw new Error(error)
                            }
                            const filtroPagoUID = /^\d+$/
                            if (!filtroPagoUID.test(pagoUID)) {
                                const error = "El pagoUID debe de ser una cadena con numeros"
                                throw new Error(error)
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            await validadoresCompartidos.reservas.validarReserva(reservaUID)
                            const consultaEliminarPago = `
                            DELETE FROM "reservaPagos"
                            WHERE "pagoUID" = $1 AND reserva = $2;
                            `
                            await conexion.query(consultaEliminarPago, [pagoUID, reservaUID])

                            // Importante esto al afinal
                            await actualizarEstadoPago(reservaUID)
                            await conexion.query('COMMIT'); // Confirmar la transacción
                            const ok = {
                                ok: "Se ha eliminado irreversiblemente el pago",
                                pagoUID: pagoUID
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    eliminarReembolsoManual: async () => {
                        try {
                            const palabra = entrada.body.palabra
                            const reembolsoUID = entrada.body.reembolsoUID
                            if (palabra !== "eliminar") {
                                const error = "Necesario escribir la la palabra eliminar para confirmar"
                                throw new Error(error)
                            }
                            const filtroPagoUID = /^\d+$/
                            if (!filtroPagoUID.test(reembolsoUID)) {
                                const error = "El reembolsoUID debe de ser una cadena con numeros"
                                throw new Error(error)
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const consultaEliminarReembolso = `
                            DELETE FROM "reservaReembolsos"
                            WHERE "reembolsoUID" = $1;
                            `
                            const resuelveEliminarReembolso = await conexion.query(consultaEliminarReembolso, [reembolsoUID])
                            if (resuelveEliminarReembolso.rowCount === 0) {
                                const error = "No se encuentra el reembolso con ese identificador, revisa el reembolsoUID"
                                throw new Error(error)
                            }

                            if (resuelveEliminarReembolso.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha eliminado irreversiblemente el el reembolso",
                                    reembolsoUID: reembolsoUID
                                }
                                salida.json(ok)
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción

                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }
                },
                gestionTitular: {
                    asociarTitular: async () => {
                        try {
                            const clienteUID = entrada.body.clienteUID
                            const reservaUID = entrada.body.reservaUID

                            if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
                                const error = "el campo 'clienteUID' solo puede un numero, entero y positivo"
                                throw new Error(error)
                            }
                            if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
                                const error = "el campo 'reservaUID' solo puede un numero, entero y positivo"
                                throw new Error(error)
                            }

                            const validarCliente = `
                            SELECT
                            uid,
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email
                            FROM 
                            clientes
                            WHERE
                            uid = $1`
                            const resuelveValidarCliente = await conexion.query(validarCliente, [clienteUID])
                            if (resuelveValidarCliente.rowCount === 0) {
                                const error = "No existe el cliente"
                                throw new Error(error)
                            }

                            if (resuelveValidarCliente.rowCount === 1) {

                                const consultaElimintarTitularPool = `
                                DELETE FROM 
                                "poolTitularesReserva"
                                WHERE
                                reserva = $1;
                                `
                                await conexion.query(consultaElimintarTitularPool, [reservaUID])

                                const nombre = resuelveValidarCliente.rows[0].nombre
                                const primerApellido = resuelveValidarCliente.rows[0].primerApellido ? resuelveValidarCliente.rows[0].primerApellido : ""
                                const segundoApellido = resuelveValidarCliente.rows[0].segundoApellido ? resuelveValidarCliente.rows[0].segundoApellido : ""
                                const pasaporte = resuelveValidarCliente.rows[0].pasaporte
                                const email = resuelveValidarCliente.rows[0].email ? resuelveValidarCliente.rows[0].email : ""
                                const telefono = resuelveValidarCliente.rows[0].telefono ? resuelveValidarCliente.rows[0].telefono : ""

                                const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`

                                await validadoresCompartidos.reservas.validarReserva(reservaUID)
                                const consultaActualizarTitular = `
                                UPDATE
                                    reservas
                                SET 
                                    titular = $1
                                WHERE 
                                    reserva = $2;`
                                const datosParaActualizar = [
                                    clienteUID,
                                    reservaUID
                                ]

                                const resuelveActualizarTitular = await conexion.query(consultaActualizarTitular, datosParaActualizar)


                                if (resuelveActualizarTitular.rowCount === 0) {
                                    const error = "No se ha podido actualizar el titular de la reserva"
                                    throw new Error(error)
                                }

                                const ok = {
                                    ok: "Se ha actualizado correctamente el titular en la reserva",
                                    clienteUID: clienteUID,
                                    nombreCompleto: nombreCompleto,
                                    email: email,
                                    nombre: nombre,
                                    telefono: telefono,
                                    primerApellido: primerApellido,
                                    segundoApellido: segundoApellido,
                                    pasaporte: pasaporte
                                }
                                salida.json(ok)

                            }

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    desasociarClienteComoTitular: async () => {
                        try {
                            const reservaUID = entrada.body.reservaUID
                            await validadoresCompartidos.reservas.validarReserva(reservaUID)

                            const consultaElimintarTitularPool = `
                            DELETE FROM 
                                "poolTitularesReserva"
                            WHERE
                                reserva = $1;
                            `
                            await conexion.query(consultaElimintarTitularPool, [reservaUID])

                            const consultaActualizarTitular = `
                                UPDATE
                                    reservas
                                SET 
                                    titular = $1
                                WHERE 
                                    reserva = $2;`
                            const datosParaActualizar = [
                                null,
                                reservaUID
                            ]
                            const resuelveActualizarTitular = await conexion.query(consultaActualizarTitular, datosParaActualizar)
                            if (resuelveActualizarTitular.rowCount === 0) {
                                const error = "No se ha podido actualizar el titular de la reserva"
                                throw new Error(error)
                            }
                            const ok = {
                                ok: "Se ha eliminado el titular de la reserva, la reserva ahora no tiene titular"
                            }
                            salida.json(ok)



                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    crearTitular: async () => {
                        try {

                            const reservaUID = entrada.body.reservaUID

                            let nombre = entrada.body.nombre
                            let primerApellido = entrada.body.primerApellido
                            let segundoApellido = entrada.body.segundoApellido
                            let pasaporte = entrada.body.pasaporte
                            let telefono = entrada.body.telefono
                            let correoElectronico = entrada.body.correo
                            let notas = entrada.body?.notas
                            await conexion.query('BEGIN'); // Inicio de la transacción

                            const reserva = await validadoresCompartidos.reservas.validarReserva(reservaUID)

                            const consultaElimintarTitularPool = `
                            DELETE FROM 
                            "poolTitularesReserva"
                            WHERE
                            reserva = $1;`
                            await conexion.query(consultaElimintarTitularPool, [reservaUID])

                            const datosNuevoCliente = {
                                nombre: nombre,
                                primerApellido: primerApellido,
                                segundoApellido: segundoApellido,
                                pasaporte: pasaporte,
                                telefono: telefono,
                                correoElectronico: correoElectronico,
                                notas: notas,
                            }

                            const nuevoCliente = await insertarCliente(datosNuevoCliente)

                            const clienteUID = nuevoCliente.uid
                            const nombre_ = nuevoCliente.nombre
                            const primerApellido_ = nuevoCliente.primerApellido ? nuevoCliente.primerApellido : ""
                            const segundoApellido_ = nuevoCliente.segundoApellido ? nuevoCliente.segundoApellido : ""
                            const email_ = nuevoCliente.email ? nuevoCliente.email : ""
                            const pasaporte_ = nuevoCliente.pasaporte
                            const telefono_ = nuevoCliente.telefono ? nuevoCliente.telefono : ""

                            const nombreCompleto = `${nombre_} ${primerApellido_} ${segundoApellido_}`
                            // Asociar nuevo cliente como titular


                            const consultaInsertaTitularReserva = `
                            UPDATE reservas
                            SET
                              titular = $1
                            WHERE
                              reserva = $2
                            `
                            const resuelveInsertarTitular = await conexion.query(consultaInsertaTitularReserva, [clienteUID, reservaUID])
                            if (resuelveInsertarTitular.rowCount === 0) {
                                const error = "No se ha podio insertar el titular por favor vuelve a intentarlo"
                                throw new Error(error)
                            }
                            if (resuelveInsertarTitular.rowCount === 1) {
                                const ok = {
                                    ok: "Se  ha insertado el nuevo cliente en la base de datos y se ha asociado a la reserva",
                                    nombreCompleto: nombreCompleto,
                                    clienteUID: clienteUID,
                                    nombre: nombre_,
                                    primerApellido: primerApellido_,
                                    segundoApellido: segundoApellido_,
                                    email: email_,
                                    telefono: telefono_,
                                    pasaporte: pasaporte_
                                }
                                salida.json(ok)
                            }
                            await conexion.query('COMMIT'); // Confirmar la transacción
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }
                },
                generarPdf: async () => {
                    try {
                        const reservaUID = entrada.body.reservaUID
                        await validadoresCompartidos.reservas.validarReserva(reservaUID)
                        const metadatos = {
                            reservaUID: reservaUID
                        }
                        const reserva = await detallesReserva(metadatos)
                        const pdf = await generadorPDF3(reserva)

                        salida.setHeader('Content-Type', 'application/pdf');
                        salida.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
                        salida.send(pdf);

                    } catch (errorCapturado) {

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                detallesDelPernoctantePorComprobar: async () => {


                    try {
                        const reservaUID = entrada.body.reservaUID
                        await validadoresCompartidos.reservas.validarReserva(reservaUID)

                        const pernoctanteUID = entrada.body.pernoctanteUID
                        if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                            const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }

                        const validarPernoctante = `
                        SELECT 
                        "clienteUID"
                        FROM 
                        "reservaPernoctantes" 
                        WHERE
                        reserva = $1 AND "pernoctanteUID" = $2;`
                        const resulveValidarPernoctante = await conexion.query(validarPernoctante, [reservaUID, pernoctanteUID])
                        if (resulveValidarPernoctante.rowCount === 0) {
                            const error = "No existe ningun pernoctante con ese UID dentro del la reserva"
                            throw new Error(error)
                        }
                        if (resulveValidarPernoctante.rowCount === 1) {
                            const clienteUID = resulveValidarPernoctante.rows[0].clienteUID
                            if (clienteUID) {
                                const error = "El pernoctante ya ha pasado el proceso de comporbacion"
                                throw new Error(error)
                            } else {
                                const datosClientePool = `
                                SELECT 
                                "nombreCompleto",
                                pasaporte
                                FROM 
                                "poolClientes" 
                                WHERE
                                "pernoctanteUID" = $1;`
                                const resuelveClientePool = await conexion.query(datosClientePool, [pernoctanteUID])
                                const nombreCompleto = resuelveClientePool.rows[0].nombreCompleto
                                const pasaporte = resuelveClientePool.rows[0].pasaporte

                                const ok = {
                                    pernoctanteUID: pernoctanteUID,
                                    nombreCompleto: nombreCompleto,
                                    pasaporte: pasaporte

                                }
                                salida.json(ok)

                            }

                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                confirmarFechaCheckIn: async () => {
                    try {
                        const pernoctantaUID = entrada.body.pernoctanteUID
                        const fechaCheckIn = entrada.body.fechaCheckIn

                        if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                            const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        const fechaCheckIn_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaCheckIn)).fecha_ISO
                        const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn_ISO)
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        // Validar pernoctanteUID
                        const validarPernoctante = `
                        SELECT 
                        reserva,
                        to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') as "checkoutAdelantado_ISO", 
                        "clienteUID"
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `
                        const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID])
                        if (resuelvePernoctante.rowCount === 0) {
                            const error = "No existe el pernoctanteUID"
                            throw new Error(error)
                        }
                        // Validar que el pernoctatne sea cliente y no cliente pool
                        const clienteUID = resuelvePernoctante.rows[0].clienteUID
                        if (!clienteUID) {
                            const error = "El pernoctante esta pendiente de validacion documental. Valide primero la documentacion antes de hacer el checkin"
                            throw new Error(error)
                        }
                        const reservaUID = resuelvePernoctante.rows[0].reserva
                        const checkoutAdelantado_ISO = resuelvePernoctante.rows[0].checkoutAdelantado_ISO

                        const fechasReserva = `
                        SELECT 
                        "estadoReserva",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `
                        const resuelveReserva = await conexion.query(fechasReserva, [reservaUID])
                        if (resuelveReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        // validar que la reserva no este cancelada
                        const estadoReserva = resuelveReserva.rows[0].estadoReserva
                        if (estadoReserva === "cancelada") {
                            const error = "No se puede alterar una fecha de checkin de una reserva cancelada"
                            throw new Error(error)
                        }

                        const fechaEntrada_ISO = resuelveReserva.rows[0].fechaEntrada_ISO
                        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO)

                        const fechaSalida_ISO = resuelveReserva.rows[0].fechaSalida_ISO
                        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO)

                        if (fechaCheckIn_Objeto < fechaEntrada_Objeto) {
                            const error = "La fecha de Checkin no puede ser inferior a la fecha de entrada de la reserva"
                            throw new Error(error)
                        }

                        if (checkoutAdelantado_ISO) {
                            const checkoutAdelantado_Objeto = DateTime.fromISO(checkoutAdelantado_ISO)
                            if (fechaCheckIn_Objeto >= checkoutAdelantado_Objeto) {
                                const error = "La fecha de Checkin no puede ser igual o superior a la fecha de checkout adelantado"
                                throw new Error(error)
                            }
                        }

                        if (fechaCheckIn_Objeto >= fechaSalida_Objeto) {
                            const error = "La fecha de Checkin no puede ser igual o superior a la fecha de salida de la reserva"
                            throw new Error(error)
                        }

                        const actualizerFechaCheckIn = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckIn" = $1
                        WHERE
                          "pernoctanteUID" = $2;
                        `

                        const actualizarCheckIn = await conexion.query(actualizerFechaCheckIn, [fechaCheckIn_ISO, pernoctantaUID])
                        if (actualizarCheckIn.rowCount === 0) {
                            const error = "No se ha podido actualziar la fecha de checkin"
                            throw new Error(error)
                        }

                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "Se ha actualizado la fecha de checkin correctamente",
                            fechaCheckIn: fechaCheckIn
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    } finally {

                    }
                },
                eliminarCheckIN: async () => {
                    try {
                        const pernoctantaUID = entrada.body.pernoctanteUID

                        if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                            const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        // Validar pernoctanteUID
                        const validarPernoctante = `
                        SELECT 
                        reserva
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `
                        const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID])
                        if (resuelvePernoctante.rowCount === 0) {
                            const error = "No existe el pernoctanteUID"
                            throw new Error(error)
                        }
                        // Validar que el pernoctatne sea cliente y no cliente pool
                        const reservaUID = resuelvePernoctante.rows[0].reserva

                        const fechasReserva = `
                        SELECT 
                        "estadoReserva"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `
                        const resuelveReserva = await conexion.query(fechasReserva, [reservaUID])
                        if (resuelveReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        // validar que la reserva no este cancelada
                        const estadoReserva = resuelveReserva.rows[0].estadoReserva
                        if (estadoReserva === "cancelada") {
                            const error = "No se puede alterar una fecha de checkin de una reserva cancelada"
                            throw new Error(error)
                        }

                        const actualizerFechaCheckIn = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckIn" = NULL,
                          "fechaCheckOutAdelantado" = NULL
                        WHERE
                          "pernoctanteUID" = $1;
                        `
                        const actualizarCheckIn = await conexion.query(actualizerFechaCheckIn, [pernoctantaUID])
                        if (actualizarCheckIn.rowCount === 0) {
                            const error = "No se ha podido eliminar la fecha de checkin"
                            throw new Error(error)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "Se ha eliminado la fecha de checkin correctamente"
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    } finally {

                    }
                },
                confirmarFechaCheckOutAdelantado: async () => {
                    try {
                        const pernoctantaUID = entrada.body.pernoctanteUID
                        const fechaCheckOut = entrada.body.fechaCheckOut

                        if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                            const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        const fechaCheckOut_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaCheckOut)).fecha_ISO
                        const fechaCheckOut_Objeto = DateTime.fromISO(fechaCheckOut_ISO)
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        // Validar pernoctanteUID
                        const validarPernoctante = `
                        SELECT 
                        reserva,
                        to_char("fechaCheckIn", 'YYYY-MM-DD') as "fechaCheckIn_ISO", 
                        "clienteUID"
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `
                        const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID])
                        if (resuelvePernoctante.rowCount === 0) {
                            const error = "No existe el pernoctanteUID"
                            throw new Error(error)
                        }
                        // Validar que el pernoctatne sea cliente y no cliente pool
                        const clienteUID = resuelvePernoctante.rows[0].clienteUID
                        if (!clienteUID) {
                            const error = "El pernoctante esta pendiente de validacion documental. Valide primero la documentacion antes de hacer el checkin"
                            throw new Error(error)
                        }
                        const reservaUID = resuelvePernoctante.rows[0].reserva
                        const fechaCheckIn_ISO = resuelvePernoctante.rows[0].fechaCheckIn_ISO

                        if (!fechaCheckIn_ISO) {
                            const error = "No puedes determinar un checkout adelantado a un pernoctante que no ha reazliado el checkin. Primero realiza el checkin"
                            throw new Error(error)

                        }
                        const fechasReserva = `
                        SELECT 
                        "estadoReserva",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `
                        const resuelveReserva = await conexion.query(fechasReserva, [reservaUID])
                        if (resuelveReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        // validar que la reserva no este cancelada
                        const estadoReserva = resuelveReserva.rows[0].estadoReserva
                        if (estadoReserva === "cancelada") {
                            const error = "No se puede alterar una fecha de checkin de una reserva cancelada"
                            throw new Error(error)
                        }

                        const fechaEntrada_ISO = resuelveReserva.rows[0].fechaEntrada_ISO
                        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO)

                        const fechaSalida_ISO = resuelveReserva.rows[0].fechaSalida_ISO
                        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO)

                        if (fechaCheckOut_Objeto >= fechaSalida_Objeto) {
                            const error = "La fecha de Checkout adelantado no puede ser superior o igual a la fecha de salida de la reserva, si el checkout se hace el mismo dia que finaliza la reserva no hace falta has un checkout adelantado"
                            throw new Error(error)
                        }

                        if (fechaCheckIn_ISO) {
                            const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn_ISO)
                            if (fechaCheckIn_Objeto >= fechaCheckOut_Objeto) {
                                const error = "La fecha de Checkout no puede ser igual o inferior a la fecha de checkin"
                                throw new Error(error)
                            }
                        }

                        if (fechaCheckOut_Objeto <= fechaEntrada_Objeto) {
                            const error = "La fecha de Checkout no puede ser inferior o igual a la fecha de entrada de la reserva"
                            throw new Error(error)
                        }


                        const actualizerFechaCheckOut = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckOutAdelantado" = $1
                        WHERE
                          "pernoctanteUID" = $2;
                        `

                        const actualizarCheckOut = await conexion.query(actualizerFechaCheckOut, [fechaCheckOut_ISO, pernoctantaUID])
                        if (actualizarCheckOut.rowCount === 0) {
                            const error = "No se ha podido actualziar la fecha de checkout"
                            throw new Error(error)
                        }

                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "Se ha actualizado la fecha de checkin correctamente",
                            fechaCheckOut: fechaCheckOut
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    } finally {

                    }
                },
                eliminarCheckOutAdelantado: async () => {
                    try {
                        const pernoctantaUID = entrada.body.pernoctanteUID

                        if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
                            const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        // Validar pernoctanteUID
                        const validarPernoctante = `
                        SELECT 
                        reserva
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `
                        const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID])
                        if (resuelvePernoctante.rowCount === 0) {
                            const error = "No existe el pernoctanteUID"
                            throw new Error(error)
                        }
                        // Validar que el pernoctatne sea cliente y no cliente pool
                        const reservaUID = resuelvePernoctante.rows[0].reserva

                        const fechasReserva = `
                        SELECT 
                        "estadoReserva"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `
                        const resuelveReserva = await conexion.query(fechasReserva, [reservaUID])
                        if (resuelveReserva.rowCount === 0) {
                            const error = "No existe la reserva"
                            throw new Error(error)
                        }
                        // validar que la reserva no este cancelada
                        const estadoReserva = resuelveReserva.rows[0].estadoReserva
                        if (estadoReserva === "cancelada") {
                            const error = "No se puede alterar una fecha de checkin de una reserva cancelada"
                            throw new Error(error)
                        }

                        const actualizerFechaCheckOut = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckOutAdelantado" = NULL
                        WHERE
                          "pernoctanteUID" = $1;
                        `
                        const actualizarCheckOut = await conexion.query(actualizerFechaCheckOut, [pernoctantaUID])
                        if (actualizarCheckOut.rowCount === 0) {
                            const error = "No se ha podido eliminar la fecha de checkin"
                            throw new Error(error)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "Se ha eliminado la fecha de checkin correctamente"
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    } finally {

                    }
                },
            },
            situacion: {
                obtenerSituacion: async () => {
                    try {
                        const apartamentosObjeto = {}
                        const estadoDisonible = "disponible"
                        const consultaEstadoApartamentos = `
                        SELECT 
                        "apartamentoIDV",
                        "estadoConfiguracion"
                        FROM 
                        "configuracionApartamento"
                        WHERE "estadoConfiguracion" = $1
                        ORDER BY "apartamentoIDV" ASC
                        `
                        let resuelveConsultaEstadoApartamentos = await conexion.query(consultaEstadoApartamentos, [estadoDisonible])
                        if (resuelveConsultaEstadoApartamentos.rowCount === 0) {
                            const error = "No hay apartamentos configurados"
                            throw new Error(error)
                        }

                        resuelveConsultaEstadoApartamentos = resuelveConsultaEstadoApartamentos.rows
                        for (const apartamento of resuelveConsultaEstadoApartamentos) {
                            const apartamentoIDV = apartamento.apartamentoIDV
                            const estadoApartamento = apartamento.estadoConfiguracion

                            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                            apartamentosObjeto[apartamentoIDV] = {
                                apartamentoUI: apartamentoUI,
                                estadoApartamento: estadoApartamento,
                                reservas: [],
                                estadoPernoctacion: "libre"
                            }

                        }

                        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                        const tiempoZH = DateTime.now().setZone(zonaHoraria);

                        const fechaActualCompletaTZ = tiempoZH.toISO()
                        const fechaActualTZ = tiempoZH.toISODate()
                        const fechaActualUTC = DateTime.now().toUTC().toISODate();

                        const diaHoyTZ = tiempoZH.day
                        const mesPresenteTZ = tiempoZH.month
                        const anoPresenteTZ = tiempoZH.year

                        const horaPresenteTZ = tiempoZH.hour
                        const minutoPresenteTZ = tiempoZH.minute

                        const consultaReservasHoy = `
                        SELECT 
                        reserva, 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        to_char(entrada, 'DD/MM/YYYY') as "entradaHumano", 
                        to_char(salida, 'DD/MM/YYYY') as "salidaHumano"
                        FROM reservas
                        WHERE entrada <= $1::DATE AND salida >= $1::DATE; 
                        `
                        const resuelveConsultaReservasHoy = await conexion.query(consultaReservasHoy, [fechaActualTZ])
                        const ok = {}

                        if (resuelveConsultaReservasHoy.rowCount === 0) {
                            ok.ok = apartamentosObjeto
                        }
                        if (resuelveConsultaReservasHoy.rowCount > 0) {
                            const reservasHoy = resuelveConsultaReservasHoy.rows

                            const horasSalidaEntrada = await componentes.administracion.reservas.horasSalidaEntrada()
                            const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ
                            const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ

                            //ok.fechaUTC = fechaActualUTC;
                            ok.fechaTZ = `${diaHoyTZ}/${mesPresenteTZ}/${anoPresenteTZ}`
                            ok.horaTZ = `${horaPresenteTZ}:${minutoPresenteTZ}`
                            ok.horaEntrada = horaEntradaTZ
                            ok.horaSalida = horaSalidaTZ

                            for (const reservaDetalles of reservasHoy) {

                                const reservaUID = reservaDetalles.reserva

                                // Fecha de la base de datos
                                const fechaEntradaReservaISO = reservaDetalles.fechaEntrada_ISO
                                const fechaSalidaReservaISO = reservaDetalles.fechaSalida_ISO

                                const fechaEntradaReservaHumano = reservaDetalles.entradaHumano
                                const fechaSalidaReservaHumano = reservaDetalles.salidaHumano


                                // Formatos fecha
                                const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
                                const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();

                                const consultaApartamentos = `
                                SELECT 
                                apartamento
                                FROM 
                                "reservaApartamentos"
                                WHERE 
                                reserva = $1;`
                                const resuelveConsultaApartamentos = await conexion.query(consultaApartamentos, [reservaUID])
                                if (resuelveConsultaApartamentos.rowCount > 0) {
                                    const apartamentosResueltos = resuelveConsultaApartamentos.rows
                                    apartamentosResueltos.map((apartamento) => {

                                        if (apartamentosObjeto[apartamento.apartamento]) {
                                            apartamentosObjeto[apartamento.apartamento].estadoPernoctacion = "ocupado"
                                        }

                                        const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ)
                                        const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH)
                                        const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ)

                                        let porcentajeFinal = porcentajeTranscurrido
                                        if (porcentajeTranscurrido >= 100) {
                                            porcentajeFinal = "100"
                                        }
                                        if (porcentajeTranscurrido <= 0) {
                                            porcentajeFinal = "0"
                                        }
                                        const diaEntrada = utilidades.comparadorFechasStringDDMMAAAA(fechaEntradaReservaISO, fechaActualTZ)
                                        const diaSalida = utilidades.comparadorFechasStringDDMMAAAA(fechaSalidaReservaISO, fechaActualTZ)
                                        let identificadoDiaLimite = "diaInterno"

                                        if (diaEntrada) {
                                            identificadoDiaLimite = "diaDeEntrada"
                                        }
                                        if (diaSalida) {
                                            identificadoDiaLimite = "diaDeSalida"
                                        }

                                        let numeroDiaReservaUI
                                        if (cantidadDias.diasDiferencia > 1) {
                                            numeroDiaReservaUI = cantidadDias.diasDiferencia + " días"
                                        }
                                        if (cantidadDias.diasDiferencia === 1) {
                                            numeroDiaReservaUI = cantidadDias.diasDiferencia + " día y " + cantidadDias.horasDiferencia.toFixed(0) + " horas"

                                        }
                                        if (cantidadDias.diasDiferencia === 0) {
                                            if (cantidadDias.horasDiferencia > 1) {
                                                numeroDiaReservaUI = cantidadDias.horasDiferencia + " horas"

                                            }
                                            if (cantidadDias.horasDiferencia === 1) {
                                                numeroDiaReservaUI = cantidadDias.horasDiferencia + " hora"

                                            }
                                            if (cantidadDias.horasDiferencia === 0) {
                                                numeroDiaReservaUI = "menos de una hora"

                                            }

                                        }
                                        const detalleReservaApartamento = {
                                            reserva: reservaUID,
                                            diaLimite: identificadoDiaLimite,

                                            fechaEntrada: fechaEntradaReservaHumano,
                                            fechaSalida: fechaSalidaReservaHumano,

                                            porcentajeTranscurrido: porcentajeFinal + '%',
                                            tiempoRestante: tiempoRestante,
                                            numeroDiasReserva: numeroDiaReservaUI
                                        }
                                        if (apartamentosObjeto[apartamento.apartamento]) {
                                            apartamentosObjeto[apartamento.apartamento].reservas.push(detalleReservaApartamento)
                                        }
                                    })
                                }
                            }
                            ok.ok = apartamentosObjeto
                        }

                        // buscar reservas en el dia actual

                        const eventosCalendarios_airbnbn = await apartamentosOcupadosHoy(fechaActualTZ)

                        for (const calendariosSincronizadosAirbnb of eventosCalendarios_airbnbn) {
                            /*
                            {
                                  apartamentoIDV: 'apartamento3',
                                  eventos: [
                                    {
                                      fechaFinal: '2024-03-31',
                                      fechaInicio: '2024-03-27',
                                      uid: '6fec1092d3fa-51854b16859896e37a57944c187c806c@airbnb.com',
                                      nombreEvento: 'Airbnb (Not available)'
                                    }
                                  ]
                                }
                            */

                            const apartamentoIDV_destino = calendariosSincronizadosAirbnb.apartamentoIDV
                            const eventosDelApartamento = calendariosSincronizadosAirbnb.eventos
                            ok.ok[apartamentoIDV_destino].calendariosSincronizados = {}
                            ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb = {}
                            ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb.eventos = eventosDelApartamento
                            ok.ok[apartamentoIDV_destino].estadoPernoctacion = "ocupado"
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                detallesSituacionApartamento: async () => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV
                        const filtroCadena = /^[a-z0-9]+$/;

                        if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                            const error = "el campo 'apartmentoIDV' solo puede ser letras minúsculas y numeros. sin pesacios"
                            throw new Error(error)
                        }

                        // Validar que existe el apartamento
                        const detalleApartamento = {}
                        const estadoDisonible = "disponible"

                        const validarApartamento = `
                        SELECT 
                        "apartamentoIDV",
                        "estadoConfiguracion"
                        FROM
                        "configuracionApartamento"
                        WHERE
                        "apartamentoIDV" = $1 AND "estadoConfiguracion" = $2
                        `
                        const consultaValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV, estadoDisonible])
                        if (consultaValidarApartamento.rowCount === 0) {
                            const error = "No existe el apartamento"
                            throw new Error(error)

                        }
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                        // Ver las reservas que existen hoy

                        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                        const tiempoZH = DateTime.now().setZone(zonaHoraria);

                        const fechaActualCompletaTZ = tiempoZH.toISO()
                        const fechaActualTZ = tiempoZH.toISODate()
                        const fechaActualUTC = DateTime.now().toUTC().toISODate();

                        const diaHoyTZ = tiempoZH.day
                        const mesPresenteTZ = tiempoZH.month
                        const anoPresenteTZ = tiempoZH.year

                        const horaPresenteTZ = tiempoZH.hour
                        const minutoPresenteTZ = tiempoZH.minute

                        const horasSalidaEntrada = await componentes.administracion.reservas.horasSalidaEntrada()
                        //const zonaHoraria = horasSalidaEntrada.zonaHoraria
                        const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ
                        const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ
                        const objetoFinal = {
                            apartamentoUI: apartamentoUI,
                            apartamentoIDV: apartamentoIDV,
                            zonaHoraria: zonaHoraria,
                            horaEntradaTZ: horaEntradaTZ,
                            horaSalidaTZ: horaSalidaTZ,
                            estadoPernoctacion: "libre",
                            reservas: []
                        }

                        const consultaReservasHoy = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "entradaISO", 
                        to_char(salida, 'YYYY-MM-DD') as "salidaISO",
                        to_char(entrada, 'DD/MM/YYYY') as "entradaHumano", 
                        to_char(salida, 'DD//MM/YYYY') as "salidaHumano",
                        reserva
                        FROM reservas
                        WHERE entrada <= $1::DATE AND salida >= $1::DATE; 
                        `
                        const resuelveConsultaReservasHoy = await conexion.query(consultaReservasHoy, [fechaActualTZ])
                        if (resuelveConsultaReservasHoy.rowCount > 0) {
                            const reservasEncontradasHoy = resuelveConsultaReservasHoy.rows

                            for (const reserva of reservasEncontradasHoy) {

                                const reservaUID = reserva.reserva

                                // Fecha de la base de datos
                                const fechaEntradaReservaISO = reserva.entradaISO
                                const fechaSalidaReservaISO = reserva.salidaISO

                                const fechaEntradaReservaHumano = reserva.entradaHumano
                                const fechaSalidaReservaHumano = reserva.salidaHumano

                                // Formatos fecha
                                const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
                                const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();


                                const consultaApartamentosReserva = `
                                SELECT 
                                uid
                                FROM "reservaApartamentos"
                                WHERE reserva = $1 AND apartamento = $2; 
                                `
                                const resuelveConsultaApartamentosReserva = await conexion.query(consultaApartamentosReserva, [reservaUID, apartamentoIDV])
                                if (resuelveConsultaApartamentosReserva.rowCount > 0) {


                                    const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ)
                                    const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaEntradaReservaISO, fechaSalidaReservaISO)
                                    const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ)


                                    let porcentajeFinal = porcentajeTranscurrido
                                    if (porcentajeTranscurrido >= 100) {
                                        porcentajeFinal = "100"
                                    }
                                    if (porcentajeTranscurrido <= 0) {
                                        porcentajeFinal = "0"
                                    }
                                    const diaEntrada = utilidades.comparadorFechasStringDDMMAAAA(fechaEntradaReservaISO, fechaActualTZ)
                                    const diaSalida = utilidades.comparadorFechasStringDDMMAAAA(fechaSalidaReservaISO, fechaActualTZ)
                                    let identificadoDiaLimite = "diaInterno"

                                    if (diaEntrada) {
                                        identificadoDiaLimite = "diaDeEntrada"
                                    }
                                    if (diaSalida) {
                                        identificadoDiaLimite = "diaDeSalida"
                                    }

                                    const estructuraReserva = {
                                        reservaUID: reservaUID,
                                        fechaEntrada: fechaEntradaReservaHumano,
                                        fechaSalida: fechaSalidaReservaHumano,
                                        diaLimite: identificadoDiaLimite,

                                        tiempoRestante: tiempoRestante,
                                        cantidadDias: cantidadDias,
                                        porcentajeTranscurrido: porcentajeFinal + '%',
                                        habitaciones: []
                                    }
                                    objetoFinal.estadoPernoctacion = "ocupado"
                                    const apartamentoUID = resuelveConsultaApartamentosReserva.rows[0].uid

                                    // Extraer las habitaciones
                                    const consultaHabitaciones = `
                                    SELECT 
                                    uid, habitacion
                                    FROM "reservaHabitaciones"
                                    WHERE reserva = $1 AND apartamento = $2 ; 
                                    `
                                    const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [reservaUID, apartamentoUID])

                                    if (resuelveConsultaHabitaciones.rowCount > 0) {
                                        const habitaciones = resuelveConsultaHabitaciones.rows

                                        for (const habitacion of habitaciones) {

                                            const habitacionUID = habitacion.uid
                                            const habitacionIDV = habitacion.habitacion

                                            const resolverHabitacionUI = `
                                            SELECT 
                                            "habitacionUI"
                                            FROM habitaciones
                                            WHERE habitacion = $1; 
                                            `
                                            const resuelveResolverHabitacionUI = await conexion.query(resolverHabitacionUI, [habitacionIDV])
                                            const habitacionUI = resuelveResolverHabitacionUI.rows[0].habitacionUI
                                            const detalleHabitacion = {
                                                habitacionIDV: habitacionIDV,
                                                habitacionUI: habitacionUI,
                                                pernoctantes: []
                                            }
                                            const consultaPernoctanesHabitacion = `
                                            SELECT 
                                            "clienteUID",
                                            "pernoctanteUID",
                                            to_char("fechaCheckIn", 'YYYY-MM-DD') as "fechaCheckIn_ISO", 
                                            to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') as "fechaCheckOutAdelantado_ISO"
                                            FROM "reservaPernoctantes"
                                            WHERE reserva = $1 AND habitacion = $2 ; 
                                            `
                                            const resuelveConsultaPernoctanesHabitacion = await conexion.query(consultaPernoctanesHabitacion, [reservaUID, habitacionUID])

                                            if (resuelveConsultaPernoctanesHabitacion.rowCount > 0) {
                                                const pernoctantes = resuelveConsultaPernoctanesHabitacion.rows
                                                const pernoctantesObjetoTemporal = []
                                                for (const pernoctante of pernoctantes) {
                                                    const clienteUID = pernoctante.clienteUID
                                                    const fechaCheckIn_ISO = pernoctante.fechaCheckIn_ISO
                                                    const fechaCheckOutAdelantado_ISO = pernoctante.fechaCheckOutAdelantado_ISO
                                                    if (clienteUID) {
                                                        const resolverDatosPernoctante = `
                                                        SELECT 
                                                        nombre,
                                                        "primerApellido",
                                                        "segundoApellido",
                                                        uid,
                                                        pasaporte
                                                        FROM clientes
                                                        WHERE uid = $1 ; 
                                                        `
                                                        const resuelveResolverDatosPernoctante = await conexion.query(resolverDatosPernoctante, [clienteUID])
                                                        const datosCliente = resuelveResolverDatosPernoctante.rows[0]
                                                        const nombre = datosCliente.nombre
                                                        const primerApellido = datosCliente.primerApellido || ""
                                                        const segundoApellido = datosCliente.segundoApellido || ""
                                                        const pasaporte = datosCliente.pasaporte
                                                        const constructorNombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`
                                                        const uid = resuelveResolverDatosPernoctante.rows[0].uid

                                                        const detallesPernoctante = {
                                                            nombreCompleto: constructorNombreCompleto.trim(),
                                                            tipoPernoctante: "cliente",
                                                            pasaporte: pasaporte,
                                                            uidCliente: uid
                                                        }

                                                        if (fechaCheckIn_ISO) {
                                                            const fechaCheckIn_array = fechaCheckIn_ISO.split("-")
                                                            const fechaCheckIn_humano = `${fechaCheckIn_array[2]}/${fechaCheckIn_array[1]}/${fechaCheckIn_array[0]}`
                                                            detallesPernoctante.fechaCheckIn = fechaCheckIn_humano
                                                        }
                                                        if (fechaCheckOutAdelantado_ISO) {
                                                            const fechaCheckOutAdelantado_array = fechaCheckOutAdelantado_ISO.split("-")
                                                            const fechaCheckOut_humano = `${fechaCheckOutAdelantado_array[2]}/${fechaCheckOutAdelantado_array[1]}/${fechaCheckOutAdelantado_array[0]}`
                                                            detallesPernoctante.fechaCheckOut = fechaCheckOut_humano

                                                        }
                                                        pernoctantesObjetoTemporal.push(detallesPernoctante)

                                                    } else {
                                                        const pernoctanteUID = pernoctante.pernoctanteUID
                                                        const resolverDatosPernoctante = `
                                                        SELECT 
                                                        "nombreCompleto",
                                                        uid,
                                                        pasaporte
                                                        FROM "poolClientes"
                                                        WHERE "pernoctanteUID" = $1 ; 
                                                        `
                                                        const resuelveResolverDatosPernoctante = await conexion.query(resolverDatosPernoctante, [pernoctanteUID])
                                                        const nombreCompleto = resuelveResolverDatosPernoctante.rows[0].nombreCompleto
                                                        const uid = resuelveResolverDatosPernoctante.rows[0].uid
                                                        const pasaporte = resuelveResolverDatosPernoctante.rows[0].pasaporte


                                                        const detallesPernoctante = {
                                                            nombreCompleto: nombreCompleto,
                                                            tipoPernoctante: "clientePool",
                                                            pasaporte: pasaporte,
                                                            uidCliente: uid

                                                        }
                                                        pernoctantesObjetoTemporal.push(detallesPernoctante)
                                                    }
                                                }
                                                detalleHabitacion.pernoctantes = pernoctantesObjetoTemporal
                                            }
                                            estructuraReserva.habitaciones.push(detalleHabitacion)
                                        }
                                    }
                                    objetoFinal.reservas.push(estructuraReserva)

                                }

                            }


                        }



                        // Calendarios sincronizados
                        const datosAirbnb = {
                            apartamentoIDV: apartamentoIDV,
                            fechaHoy_ISO: fechaActualTZ
                        }
                        const eventosSincronizadosAirbnb = await eventosDelApartamento(datosAirbnb)

                        objetoFinal.calendariosSincronizados = {}

                        objetoFinal.calendariosSincronizados.airbnb = {
                            eventos: eventosSincronizadosAirbnb.eventos
                        }

                        if (eventosSincronizadosAirbnb.eventos.length > 0) {
                            objetoFinal.estadoPernoctacion = "ocupado"
                        }

                        const ok = {
                            ok: objetoFinal
                        }
                        salida.json(ok)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                    }
                }
            },
            configuracion: {
                IDX: {
                    ROL: ["administrador", "empleado"]
                },
                zonaHoraria: {
                    obtenerConfiguracion: {
                        IDX: {
                            ROL: [
                                "administrador",
                                "empleado"
                            ]
                        },
                        X: async () => {
                            try {
                                const consultaConfiguracionGlobal = `
                            SELECT 
                            *
                            FROM 
                            "configuracionGlobal"
                            WHERE
                            "configuracionUID" = $1
                            `
                                const configuracionUID = [
                                    "zonaHoraria"
                                ]
                                const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID)
                                if (resuelveConfiguracionGlobal.rowCount === 0) {
                                    const error = "No hay configuraciones globales"
                                    throw new Error(error)
                                }
                                const listaZonasHorarias = zonasHorarias()

                                const ok = {
                                    ok: resuelveConfiguracionGlobal.rows[0],
                                    listaZonasHorarias: listaZonasHorarias
                                }
                                salida.json(ok)


                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    guardarConfiguracion: {
                        IDX: {
                            ROL: [
                                "administrador"
                            ]
                        },
                        X: async () => {
                            try {
                                const zonaHoraria = entrada.body.zonaHoraria
     
                                const filtroZonaHoraria = /^[a-zA-Z0-9\/_\-+]+$/;
                                const filtroHora = /^(0\d|1\d|2[0-3]):([0-5]\d)$/;

                                if (!zonaHoraria || !filtroZonaHoraria.test(zonaHoraria)) {
                                    const error = "el campo 'zonaHorarial' solo puede ser letras minúsculas, mayúsculas, guiones bajos y medios, signo mac y numeros"
                                    throw new Error(error)
                                }


        

                                // Validar que la zona horarai exista
                                const validarZonaHoraria = (zonaHorariaAValidar) => {
                                    let resultadoFinal = "no"
                                    const listaZonasHorarias = zonasHorarias()

                                    for (const zonaHoraria of listaZonasHorarias) {

                                        if (zonaHoraria === zonaHorariaAValidar) {
                                            resultadoFinal = "si"
                                        }
                                    }

                                    return resultadoFinal
                                }

                                if (validarZonaHoraria(zonaHoraria) === "no") {
                                    const error = "el campo 'zonaHorariaGlobal' no existe"
                                    throw new Error(error)
                                }


                                await conexion.query('BEGIN'); // Inicio de la transacción
                                const actualizarConfiguracionGlobal = `
                                        UPDATE "configuracionGlobal"
                                        SET
                                          "zonaHoraria" = $1
                                        WHERE
                                          "configuracionUID" = $2;
                                        `
                                const nuevaConfiguracion = [
                                    zonaHoraria,
                                    "zonaHoraria"
                                ]
                                const consultaValidarApartamento = await conexion.query(actualizarConfiguracionGlobal, nuevaConfiguracion)
                                if (consultaValidarApartamento.rowCount === 0) {
                                    const error = "No se ha podido actualizar la configuracion, reintentalo"
                                    throw new Error(error)
                                }

                                await conexion.query('COMMIT'); // Confirmar la transacción
                                const ok = {
                                    ok: "Se ha actualizado correctamente la configuracion"
                                }
                                salida.json(ok)

                            } catch (errorCapturado) {
                                await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    }
                },
                horaDeEntradaSalida: {
                    obtenerConfiguracion: {
                        IDX: {
                            ROL: [
                                "administrador",
                                "empleado"
                            ]
                        },
                        X: async () => {
                            try {
                                const consultaConfiguracionGlobal = `
                            SELECT 
                            *
                            FROM 
                            "configuracionGlobal"
                            WHERE
                            "configuracionUID" = $1
                            `
                                const configuracionUID = [
                                    "zonaHoraria"
                                ]
                                const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID)
                                if (resuelveConfiguracionGlobal.rowCount === 0) {
                                    const error = "No hay configuraciones globales"
                                    throw new Error(error)
                                }


                                const ok = {
                                    ok: resuelveConfiguracionGlobal.rows[0]
                                }
                                salida.json(ok)


                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    guardarConfiguracion: {
                        IDX: {
                            ROL: [
                                "administrador"
                            ]
                        },
                        X: async () => {
                            try {
                                const horaEntradaTZ = entrada.body.horaEntradaTZ
                                const horaSalidaTZ = entrada.body.horaSalidaTZ

                                const filtroHora = /^(0\d|1\d|2[0-3]):([0-5]\d)$/;


                                if (!horaEntradaTZ || !filtroHora.test(horaEntradaTZ)) {
                                    const error = "La hora de entrada debe de ser 00:00 y no puede ser superior a 23:59, si quieres poner la hora por ejemplo 7:35 -> Tienes que poner el 0 delante del siete, por ejemplo 07:35"
                                    throw new Error(error)
                                }

                                if (!horaSalidaTZ || !filtroHora.test(horaSalidaTZ)) {
                                    const error = "el campo 'horaEntradaTZ' debe de ser 00:00 y no puede ser superior a 23:59,si quieres poner la hora por ejemplo 7:35 -> Tienes que poner el 0 delante del siete, por ejemplo 07:35"
                                    throw new Error(error)
                                }

                                // Parsear las cadenas de hora a objetos DateTime de Luxon
                                const horaEntradaControl = DateTime.fromFormat(horaEntradaTZ, 'HH:mm');
                                const horaSalidaControl = DateTime.fromFormat(horaSalidaTZ, 'HH:mm');

                                // Comparar las horas
                                if (horaSalidaControl >= horaEntradaControl) {
                                    const error = "La hora de entrada no puede ser anterior o igual a la hora de salida. Los pernoctantes primero salen del apartamento a su hora de salida y luego los nuevos pernoctantes entran en el apartamento a su hora de entrada. Por eso la hora de entrada tiene que ser mas tarde que al hora de salida. Por que primero salen del apartamento ocupado, el apartmento entonces pasa a estar libre y luego entran los nuevo pernoctantes al apartamento ahora libre de los anteriores pernoctantes."
                                    throw new Error(error)
                                }
              


                                await conexion.query('BEGIN'); // Inicio de la transacción
                                const actualizarConfiguracionGlobal = `
                                  UPDATE "configuracionGlobal"
                                  SET
                                    "horaEntradaTZ" = $1,
                                    "horaSalidaTZ" = $2
                                  WHERE
                                    "configuracionUID" = $3;
                                  `
                                const nuevaConfiguracion = [
                                    horaEntradaTZ,
                                    horaSalidaTZ,
                                    "zonaHoraria"
                                ]
                                const consultaValidarApartamento = await conexion.query(actualizarConfiguracionGlobal, nuevaConfiguracion)
                                if (consultaValidarApartamento.rowCount === 0) {
                                    const error = "No se ha podido actualizar la configuracion, reintentalo"
                                    throw new Error(error)
                                }

                                await conexion.query('COMMIT'); // Confirmar la transacción
                                const ok = {
                                    ok: "Se ha actualizado correctamente la configuracion"
                                }
                                salida.json(ok)

                            } catch (errorCapturado) {
                                await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    }
                },
                calendariosSincronizados: {
                    obtenerCalendarios: {
                        IDX: {
                            ROL: [
                                "administrador",
                                "empleado"
                            ]
                        },
                        X: async () => {
                            try {
                                const plataformaCalendarios = entrada.body.plataformaCalendarios
                                const filtroCadena = /^[a-z0-9]+$/;

                                if (!plataformaCalendarios || !filtroCadena.test(plataformaCalendarios)) {
                                    const error = "Hay que definir la plataformaCalendarios, solo se admiten minusculas y numeros sin espacios."
                                    throw new Error(error)
                                }
                                const ok = {
                                    ok: []
                                }
                                const consultaConfiguracion = `
                                    SELECT 
                                    uid,
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "uidPublico"
                                    FROM 
                                    "calendariosSincronizados"
                                    WHERE
                                    "plataformaOrigen" = $1
                                    `
                                const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [plataformaCalendarios])
                                if (resuelveCalendariosSincronizados.rowCount > 0) {

                                    for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                                        const apartamentoIDV = detallesDelCalendario.apartamentoIDV
                                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
                                        detallesDelCalendario.apartamentoUI = apartamentoUI
                                    }

                                    ok.ok = resuelveCalendariosSincronizados.rows
                                }
                                salida.json(ok)

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }

                        }
                    },
                    detallesDelCalendario: {
                        IDX: {
                            ROL: [
                                "administrador",
                                "empleado"
                            ]
                        },
                        X: async () => {
                            try {
                                const calendarioUID = entrada.body.calendarioUID
                                const filtroNumeros = /^[0-9]+$/;

                                if (!calendarioUID || !filtroNumeros.test(calendarioUID)) {
                                    const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios."
                                    throw new Error(error)
                                }
                                const ok = {
                                    ok: []
                                }
                                const consultaConfiguracion = `
                                    SELECT 
                                    uid,
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "uidPublico"
                                    FROM 
                                    "calendariosSincronizados"
                                    WHERE
                                    uid = $1
                                    `
                                const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [calendarioUID])
                                if (resuelveCalendariosSincronizados.rowCount > 0) {

                                    for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                                        const apartamentoIDV = detallesDelCalendario.apartamentoIDV
                                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
                                        detallesDelCalendario.apartamentoUI = apartamentoUI
                                    }
                                    ok.ok = resuelveCalendariosSincronizados.rows[0]
                                } else {
                                    const error = "No existe ningun calendario con ese identificador, revisa el identificador."
                                    throw new Error(error)
                                }
                                salida.json(ok)

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }

                        }
                    },
                    airbnb: {
                        crearCalendario: {
                            IDX: {
                                ROL: [
                                    "administrador"
                                ]
                            },
                            X: async () => {
                                try {
                                    let nombre = entrada.body.nombre
                                    const apartamentoIDV = entrada.body.apartamentoIDV
                                    const url = entrada.body.url

                                    const filtroCadenaIDV = /^[a-z0-9]+$/;
                                    const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
                                    const filtroURL = /^https:\/\/[^\s/$.?#].[^\s]*$/;

                                    if (!nombre || !filtroCadenaUI.test(nombre)) {
                                        const error = "Hay que definir el nombre solo se admiten minusculas, mayusculas, numeros y espacios"
                                        throw new Error(error)
                                    }
                                    nombre = nombre.trim()
                                    if (!apartamentoIDV || !filtroCadenaIDV.test(apartamentoIDV)) {
                                        const error = "Hay que definir el apartamentoIDV solo se admiten minusculas, numeros y espacios"
                                        throw new Error(error)
                                    }
                                    if (!url || !filtroURL.test(url)) {
                                        const error = "Hay que definir el url y que esta cumpla el formato de url"
                                        throw new Error(error)
                                    }
                                    if (!validator.isURL(url)) {
                                        const error = "La url no cumple con el formato esperado, por favor revisa la url"
                                        throw new Error(error)
                                    }

                                    // Tambien hay que validar que exista el apartmentoIDV, que no esta hecho
                                    const validarApartamentoIDV = `
                                    SELECT
                                    "apartamentoIDV"
                                    FROM 
                                    "configuracionApartamento"
                                    WHERE
                                    "apartamentoIDV" = $1`
                                    const resuelveValidarCliente = await conexion.query(validarApartamentoIDV, [apartamentoIDV])
                                    if (resuelveValidarCliente.rowCount === 0) {
                                        const error = "No existe el identificador de apartamento, verifica el apartamentoIDV"
                                        throw new Error(error)
                                    }

                                    const controlDominio = new URL(url);
                                    const dominiofinal = controlDominio.hostname;
                                    if (dominiofinal !== "www.airbnb.com" && dominiofinal !== "airbnb.com") {
                                        const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com"
                                        throw new Error(error)
                                    }

                                    const errorDeFormado = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb"
                                    let calendarioRaw

                                    try {
                                        const maxContentLengthBytes = 10 * 1024 * 1024; // 10 MB

                                        const calendarioData = await axios.get(url, {
                                            maxContentLength: maxContentLengthBytes,
                                        }); calendarioRaw = calendarioData.data
                                        const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                                        const jcal = new ICAL.Component(jcalData); // Crea un componente jCal
                                        
                                        // Verifica si el componente es un calendario (VCALENDAR)
                                        if (jcal?.name.toLowerCase() !== 'vcalendar') {
                                            
                                            throw new Error(errorDeFormado)
                                        }
                                    } catch (errorCapturado) {
                                        

                                        throw new Error(errorDeFormado)
                                    }

                                    const generarCadenaAleatoria = (longitud) => {
                                        const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                                        let cadenaAleatoria = '';
                                        for (let i = 0; i < longitud; i++) {
                                            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                                            cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                                        }
                                        return cadenaAleatoria;
                                    }
                                    const validarCodigo = async (codigoAleatorio) => {
                                        const validarCodigoAleatorio = `
                                        SELECT
                                        "uidPublico"
                                        FROM "calendariosSincronizados"
                                        WHERE "uidPublico" = $1;`
                                        const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio])

                                        if (resuelveValidarCodigoAleatorio.rowCount > 0) {
                                            return true
                                        }
                                    }

                                    const controlCodigo = async () => {
                                        const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                                        let codigoGenerado;
                                        let codigoExiste;
                                        do {
                                            codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                                            codigoExiste = await validarCodigo(codigoGenerado);
                                        } while (codigoExiste);
                                        // En este punto, tenemos un código único que no existe en la base de datos
                                        return codigoGenerado;
                                    }
                                    const codigoAleatorioUnico = await controlCodigo();

                                    const plataformaOrigen = "airbnb"
                                    const consultaConfiguracion = `
                                    INSERT INTO "calendariosSincronizados"
                                    (
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "dataIcal", 
                                    "uidPublico"
                                    )
                                    VALUES ($1, $2, $3, $4, $5, $6)
                                    RETURNING uid
                                        `
                                    const nuevoCalendario = [
                                        nombre,
                                        url,
                                        apartamentoIDV,
                                        plataformaOrigen,
                                        calendarioRaw,
                                        codigoAleatorioUnico
                                    ]
                                    const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, nuevoCalendario)
                                    const nuevoUID = resuelveCalendariosSincronizados.rows[0].uid
                                    const ok = {
                                        ok: "Se ha guardado el nuevo calendario y esta listo para ser sincronizado",
                                        nuevoUID: nuevoUID
                                    }
                                    salida.json(ok)

                                } catch (errorCapturado) {
                                    const error = {
                                        error: errorCapturado.message
                                    }

                                    salida.json(error)
                                }

                            }
                        },
                        actualizarCalendario: {
                            IDX: {
                                ROL: [
                                    "administrador"
                                ]
                            },
                            X: async () => {
                                try {
                                    const calendarioUID = entrada.body.calendarioUID;
                                    let nombre = entrada.body.nombre || null;
                                    const apartamentoIDV = entrada.body.apartamentoIDV || null;
                                    let url = entrada.body.url || null;

                                    const filtroCadenaNumeros = /^[0-9]+$/;
                                    const filtroCadena_m_ss_n = /^[a-z0-9]+$/;

                                    const filtroCadena_m_M_cs_n = /^[a-zA-Z0-9\s]+$/;
                                    const filtroURL = /^https:\/\/[^\s/$.?#].[^\s]*$/;


                                    if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
                                        const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                        throw new Error(error);
                                    }

                                    const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`
                                    const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID])
                                    if (resuelveSelecionarCalendario.rowCount === 0) {
                                        const error = "No existe el calendario que quieres actualizar, por favor revisa el identificado calendarioUID que has introducido.";
                                        throw new Error(error);
                                    }

                                    if (nombre) {
                                        nombre = nombre.trim()
                                        if (!filtroCadena_m_M_cs_n.test(nombre)) {
                                            const error = "Hay que definir la nombre, solo se admiten mayusculas, minusculas, numeros y espacios.";
                                            throw new Error(error);
                                        }
                                    }

                                    if (apartamentoIDV) {
                                        if (!filtroCadena_m_ss_n.test(apartamentoIDV)) {
                                            const error = "Hay que definir la nombre, solo se admiten minusculas y numeros.";
                                            throw new Error(error);
                                        }
                                        // Tambien hay que validar que exista el apartmentoIDV, que no esta hecho
                                        const validarApartamentoIDV = `
                                            SELECT
                                            "apartamentoIDV"
                                            FROM 
                                            "configuracionApartamento"
                                            WHERE
                                            "apartamentoIDV" = $1`;
                                        const resuelveValidarCliente = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
                                        if (resuelveValidarCliente.rowCount === 0) {
                                            const error = "No existe el identificador de apartamento, verifica el apartamentoIDV";
                                            throw new Error(error);
                                        }
                                    }

                                    let calendarioRaw = null
                                    if (url) {

                                        if (!filtroURL.test(url)) {
                                            const error = "Hay que definir el url y que esta cumpla el formato de url";
                                            throw new Error(error);
                                        }

                                        const controlDominio = new URL(url);
                                        const dominiofinal = controlDominio.hostname;
                                        if (dominiofinal !== "www.airbnb.com" && dominiofinal !== "airbnb.com") {
                                            const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com";
                                            throw new Error(error);
                                        }

                                        const errorDeFormado = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb"


                                        try {

                                            const calendarioData = await axios.get(url);
                                            calendarioRaw = calendarioData.data
                                            const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                                            const jcal = new ICAL.Component(jcalData); // Crea un componente jCal
                                            
                                            // Verifica si el componente es un calendario (VCALENDAR)
                                            if (jcal?.name.toLowerCase() !== 'vcalendar') {
                                                
                                                throw new Error(errorDeFormado)
                                            }
                                        } catch (errorCapturado) {
                                            

                                            throw new Error(errorDeFormado)
                                        }
                                    }

                                    const actualizarCliente = `
                                    UPDATE "calendariosSincronizados"
                                    SET 
                                    nombre = COALESCE($1, nombre),
                                    url = COALESCE($2, url),
                                    "apartamentoIDV" = COALESCE($3, "apartamentoIDV"),
                                    "dataIcal" = COALESCE($4, "dataIcal")

                                    WHERE uid = $5;
                                    `;
                                    const datosParaActualizar = [
                                        nombre,
                                        url,
                                        apartamentoIDV,
                                        calendarioRaw,
                                        calendarioUID
                                    ];
                                    const resuelveActualizarCliente = await conexion.query(actualizarCliente, datosParaActualizar);
                                    if (resuelveActualizarCliente.rowCount === 0) {
                                        const error = "Los datos se han enviado a la base de datos pero el servido de base de datos infomra que no se ha actualizado el calendario vuelve a intentarlo mas tarde. Discule las molestias";
                                        throw new Error(error);
                                    }

                                    const ok = {
                                        ok: "Se ha actualizado correctamente el calendario"
                                    };
                                    salida.json(ok);

                                } catch (errorCapturado) {
                                    const error = {
                                        error: errorCapturado.message
                                    };

                                    salida.json(error);
                                }

                            }

                        },
                        eliminarCalendario: {
                            IDX: {
                                ROL: [
                                    "administrador"
                                ]
                            },
                            X: async () => {
                                try {
                                    const calendarioUID = entrada.body.calendarioUID;
                                    const filtroCadenaNumeros = /^[0-9]+$/;

                                    if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
                                        const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                        throw new Error(error);
                                    }

                                    const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`
                                    const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID])
                                    if (resuelveSelecionarCalendario.rowCount === 0) {
                                        const error = "No existe el calendario que quieres borrar, por favor revisa el identificado calendarioUID que has introducido.";
                                        throw new Error(error);
                                    }

                                    const consultaEliminar = `
                                    DELETE FROM "calendariosSincronizados"
                                    WHERE uid = $1;
                                    `
                                    const resuelveEliminarCalendario = await conexion.query(consultaEliminar, [calendarioUID])
                                    if (resuelveEliminarCalendario.rowCount === 1) {
                                        const ok = {
                                            ok: "Se ha eliminado correctamente el calendario"
                                        };
                                        salida.json(ok);
                                    }
                                    if (resuelveEliminarCalendario.rowCount === 0) {
                                        const error = "Se ha enviado la información a la base de datos pero esta informa que no ha eliminado el calendario.";
                                        throw new Error(error);
                                    }


                                } catch (errorCapturado) {
                                    const error = {
                                        error: errorCapturado.message
                                    };

                                    salida.json(error);
                                }

                            }

                        },
                        exportarCalendario: {
                            IDX: {
                                ROL: [
                                    "administrador"
                                ]
                            },
                            X: async () => {
                                try {
                                    const calendarioUID = entrada.body.calendarioUID;
                                    const filtroCadenaNumeros = /^[0-9]+$/;

                                    if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
                                        const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                        throw new Error(error);
                                    }

                                    const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`
                                    const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID])
                                    if (resuelveSelecionarCalendario.rowCount === 0) {
                                        const error = "No existe el calendario que quieres borrar, por favor revisa el identificado calendarioUID que has introducido.";
                                        throw new Error(error);
                                    }





                                    // Obtener las las reservas
                                    // Verificar que el apartmento este en esa reserva
                                    // añadirlo a una array
                                    // parsearlo en formato ical


                                } catch (errorCapturado) {
                                    const error = {
                                        error: errorCapturado.message
                                    };

                                    salida.json(error);
                                }

                            }


                        }

                    }




                }

            },
            clientes: {
                IDX: {
                    ROL: [
                        "administrador",
                        "empleado"
                    ]
                },
                buscar: async () => {
                    try {

                        let buscar = entrada.body.buscar;
                        let tipoBusqueda = entrada.body.tipoBusqueda
                        let nombreColumna = entrada.body.nombreColumna
                        let sentidoColumna = entrada.body.sentidoColumna
                        if (tipoBusqueda !== "rapido") {
                            tipoBusqueda = null;
                        }

                        if (!buscar || typeof buscar !== "string") {
                            let error = "se tiene que espeficiar 'buscar' y lo que se desea buscar"
                            throw new Error(error)
                        }
                        let Pagina = entrada.body["pagina"]
                        Pagina = Pagina ? Pagina : 1
                        if (typeof Pagina !== "number" || !Number.isInteger(Pagina) || Pagina <= 0) {
                            const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales"
                            throw new Error(error)
                        }

                        let condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = ""
                        let nombreColumnaSentidoUI
                        let nombreColumnaUI

                        if (nombreColumna) {
                            const filtronombreColumna = /^[a-zA-Z]+$/;
                            if (!filtronombreColumna.test(nombreColumna)) {
                                const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas."
                                throw new Error(error)
                            }
                            const consultaExistenciaNombreColumna = `
                            SELECT column_name
                            FROM information_schema.columns
                            WHERE table_name = 'clientes' AND column_name = $1;
                            `
                            const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna])
                            if (resuelveNombreColumna.rowCount === 0) {
                                const error = "No existe el nombre de la columna en la tabla clientes"
                                throw new Error(error)
                            }



                            // OJO con la coma, OJO LA COMA ES IMPORTANTISMA!!!!!!!!
                            //!!!!!!!
                            if (sentidoColumna !== "descendente" && sentidoColumna !== "ascendente") {
                                sentidoColumna = "ascendente"
                            }
                            if (sentidoColumna == "ascendente") {
                                sentidoColumna = "ASC"
                                nombreColumnaSentidoUI = "ascendente"
                            }
                            if (sentidoColumna == "descendente") {
                                sentidoColumna = "DESC"
                                nombreColumnaSentidoUI = "descendente"
                            }
                            // nombreColumnaUI = nombreColumna.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

                            condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = `,"${nombreColumna}" ${sentidoColumna}`
                        }


                        const terminoBuscar = buscar.split(" ")
                        let terminosFormateados = []
                        terminoBuscar.map((termino) => {
                            const terminoFinal = "%" + termino + "%"
                            terminosFormateados.push(terminoFinal)
                        })
                        const numeroPorPagina = 10
                        const numeroPagina = Number((Pagina - 1) + "0");
                        const consultaConstructor =
                            `    
                            SELECT *,
                            COUNT(*) OVER() as "totalClientes"
                        FROM clientes
                        WHERE  
                            (
                            LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("email", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("telefono", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
                            )
                        ORDER BY
                            (
                              CASE
                                WHEN (
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 1 THEN 1
                                WHEN (
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 3 THEN 3
                                ELSE 2
                              END
                            ) 
                            ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                        LIMIT $2 OFFSET $3;`

                        let consultaReservas = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina])

                        consultaReservas = consultaReservas.rows
                        let consultaConteoTotalFilas = consultaReservas[0]?.totalClientes ? consultaReservas[0].totalClientes : 0
                        if (tipoBusqueda === "rapido") {
                            consultaReservas.map((cliente) => {
                                delete cliente.Telefono
                                delete cliente.email
                                delete cliente.notas

                            })
                        }
                        consultaReservas.map((cliente) => {
                            delete cliente.totalClientes
                        })
                        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                        const corretorNumeroPagina = String(numeroPagina).replace("0", "")
                        const Respuesta = {
                            buscar: buscar,
                            totalClientes: consultaConteoTotalFilas,
                            paginasTotales: totalPaginas,
                            pagina: Number(corretorNumeroPagina) + 1,
                        }
                        if (nombreColumna) {
                            Respuesta["nombreColumna"] = nombreColumna
                            Respuesta["sentidoColumna"] = nombreColumnaSentidoUI
                        }

                        Respuesta["clientes"] = consultaReservas

                        salida.json(Respuesta)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        return salida.json(error)
                    } finally {

                    }

                },
                crearCliente: async () => {
                    const mutex = new Mutex();
                    const bloqueoCrearCliente = await mutex.acquire();
                    try {

                        let nombre = entrada.body.nombre
                        let primerApellido = entrada.body.primerApellido
                        let segundoApellido = entrada.body.segundoApellido
                        let pasaporte = entrada.body.pasaporte
                        let telefono = entrada.body.telefono
                        let correoElectronico = entrada.body.correo
                        let notas = entrada.body.notas

                        const nuevoCliente = {
                            nombre: nombre,
                            primerApellido: primerApellido,
                            segundoApellido: segundoApellido,
                            pasaporte: pasaporte,
                            telefono: telefono,
                            correoElectronico: correoElectronico,
                            notas: notas,
                        }

                        const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoCliente)
                        nombre = datosValidados.nombre
                        primerApellido = datosValidados.primerApellido
                        segundoApellido = datosValidados.segundoApellido
                        pasaporte = datosValidados.pasaporte
                        telefono = datosValidados.telefono
                        correoElectronico = datosValidados.correoElectronico
                        notas = datosValidados.notas



                        const nuevoUIDCliente = await insertarCliente(nuevoCliente)
                        if (nuevoUIDCliente) {
                            const ok = {
                                ok: "Se ha anadido correctamente el cliente",
                                nuevoUIDCliente: nuevoUIDCliente.uid
                            }
                            salida.json(ok)
                        } else {
                            const error = "Ha ocurrido un error interno y no se ha podido obtener el nuevo UID de cliente"
                            throw new Error(error)
                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoCrearCliente()
                    }




                },
                detallesCliente: async () => {
                    try {
                        let cliente = entrada.body.cliente
                        if (!cliente || !Number.isInteger(cliente)) {
                            const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente"
                            throw new Error(error)
                        }
                        let consultaDetallesCliente = `
                        SELECT 
                        uid, 
                        nombre,
                        "primerApellido",
                        "segundoApellido",
                        pasaporte,
                        telefono,
                        email,
                        notas 
                        FROM 
                        clientes 
                        WHERE 
                        uid = $1`
                        let resolverConsultaDetallesCliente = await conexion.query(consultaDetallesCliente, [cliente])
                        if (resolverConsultaDetallesCliente.rowCount === 0) {
                            const error = "No existe ningun clinete con ese UID"
                            throw new Error(error)
                        }

                        let detallesCliente = resolverConsultaDetallesCliente.rows[0]
                        let ok = {
                            "ok": detallesCliente
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                modificarCliente: async () => {

                    const mutex = new Mutex();
                    const bloqueoModificarClinete = await mutex.acquire();
                    try {
                        let cliente = entrada.body.cliente
                        let nombre = entrada.body.nombre
                        let primerApellido = entrada.body.primerApellido
                        let segundoApellido = entrada.body.segundoApellido
                        let pasaporte = entrada.body.pasaporte
                        let telefono = entrada.body.telefono
                        let correoElectronico = entrada.body.email
                        let notas = entrada.body.notas

                        if (!cliente || !Number.isInteger(cliente)) {
                            const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente"
                            throw new Error(error)
                        }
                        const clienteParaValidar = {
                            nombre: nombre,
                            primerApellido: primerApellido,
                            segundoApellido: segundoApellido,
                            pasaporte: pasaporte,
                            telefono: telefono,
                            correoElectronico: correoElectronico,
                            notas: notas,
                        }
                        const datosValidados = await validadoresCompartidos.clientes.actualizarCliente(clienteParaValidar)
                        nombre = datosValidados.nombre
                        primerApellido = datosValidados.primerApellido
                        segundoApellido = datosValidados.segundoApellido
                        pasaporte = datosValidados.pasaporte
                        telefono = datosValidados.telefono
                        correoElectronico = datosValidados.correoElectronico
                        notas = datosValidados.notas


                        const validarCliente = `
                        SELECT
                        uid
                        FROM 
                        clientes
                        WHERE
                        uid = $1`
                        const resuelveValidarCliente = await conexion.query(validarCliente, [cliente])
                        if (resuelveValidarCliente.rowCount === 0) {
                            const error = "No existe el cliente"
                            throw new Error(error)

                        }





                        const actualizarCliente = `
                        UPDATE clientes
                        SET 
                        nombre = COALESCE($1, nombre),
                        "primerApellido" = COALESCE($2, "primerApellido"),
                        "segundoApellido" = COALESCE($3, "segundoApellido"),
                        pasaporte = COALESCE($4, pasaporte),
                        telefono = COALESCE($5, telefono),
                        email = COALESCE($6, email),
                        notas = COALESCE($7, notas)
                        WHERE uid = $8
                        RETURNING
                        nombre,
                        "primerApellido",
                        "segundoApellido",
                        pasaporte,
                        telefono,
                        email,
                        notas;
                        `
                        const resuelveActualizarCliente = await conexion.query(actualizarCliente, [nombre, primerApellido, segundoApellido, pasaporte, telefono, correoElectronico, notas, cliente])
                        if (resuelveActualizarCliente.rowCount === 0) {
                            const error = "No se ha actualizado el cliente por que la base de datos no ha entontrado al cliente"
                            throw new Error(error)
                        }
                        const ok = {
                            ok: "Se ha anadido correctamente el cliente",
                            detallesCliente: resuelveActualizarCliente.rows
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                        bloqueoModificarClinete()
                    }


                },
                reservasDelCliente: async () => {
                    try {
                        const cliente = entrada.body.cliente
                        let nombreColumna = entrada.body.nombreColumna
                        let sentidoColumna = entrada.body.sentidoColumna
                        if (!cliente || !Number.isInteger(cliente) || cliente <= 0) {
                            const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente"
                            throw new Error(error)
                        }
                        const pagina = entrada.body.pagina
                        if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
                            const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales"
                            throw new Error(error)
                        }

                        const validadores = {
                            nombreColumna: async (nombreColumna) => {
                                const filtronombreColumna = /^[a-zA-Z]+$/;
                                if (!filtronombreColumna.test(nombreColumna)) {
                                    const error = "el campo 'nombreColumna' solo puede ser letras minúsculas y mayúsculas."
                                    throw new Error(error)
                                }
                                const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'reservas' AND column_name = $1;
                                `
                                const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna])
                                if (resuelveNombreColumna.rowCount === 0) {
                                    const miArray = [
                                        'como'
                                    ];

                                    if (!miArray.includes(nombreColumna)) {
                                        const error = "No existe el nombre de la columna que quieres ordenar"
                                        throw new Error(error)
                                    }
                                }

                            },
                            sentidoColumna: (sentidoColumna) => {
                                let sentidoColumnaSQL
                                const sentidoColumnaPreVal = sentidoColumna
                                if (sentidoColumnaPreVal !== "descendente" && sentidoColumnaPreVal !== "ascendente") {
                                    const error = "El sentido del ordenamiento de la columna es ascendente o descendente"
                                    throw new Error(error)
                                }
                                if (sentidoColumnaPreVal === "ascendente") {
                                    sentidoColumnaSQL = "ASC"
                                }

                                if (sentidoColumnaPreVal === "descendente") {
                                    sentidoColumnaSQL = "DESC"
                                }
                                const estructuraFinal = {
                                    sentidoColumna: sentidoColumnaPreVal,
                                    sentidoColumnaSQL: sentidoColumnaSQL
                                }
                                return estructuraFinal
                            },
                            validarFechaEntrada: (fecha) => {
                                const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;

                                if (!filtroFecha.test(fecha)) {
                                    const error = "La fecha de entrada no cumple el criterio de formato"
                                    throw new Error(error)
                                }
                            },
                            validarFechaSalida: (fecha) => {
                                const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;

                                if (!filtroFecha.test(fecha)) {
                                    const error = "La fecha de salida no cumple el criterio de formato"
                                    throw new Error(error)
                                }
                            }
                        }

                        let sentidoColumnaSQL

                        if (nombreColumna) {
                            await validadores.nombreColumna(nombreColumna)
                            sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL
                            sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna
                        }

                        let ordenColumnaSQL = ""
                        if (nombreColumna) {
                            ordenColumnaSQL = `
                                    ORDER BY 
                                    "${nombreColumna}" ${sentidoColumnaSQL} 
                                    `
                        }

                        const comoTitularPreProcesado = []
                        const comoPernoctantePreProcesado = []

                        const consultaComoTitular = `
                        SELECT 
                        reserva
                        FROM 
                        reservas 
                        WHERE 
                        titular = $1`
                        const resuelveConsultaComoTitular = await conexion.query(consultaComoTitular, [cliente])
                        if (resuelveConsultaComoTitular.rowCount > 0) {
                            const uidsComoTitular = resuelveConsultaComoTitular.rows
                            uidsComoTitular.map((detallesReserva) => {
                                const uid = detallesReserva.reserva
                                comoTitularPreProcesado.push(uid)
                            })
                        }

                        const consultaComoPernoctante = `
                        SELECT 
                        reserva
                        FROM 
                        "reservaPernoctantes" 
                        WHERE 
                        "clienteUID" = $1`
                        const resuelveConsultaComoPernoctante = await conexion.query(consultaComoPernoctante, [cliente])
                        if (resuelveConsultaComoPernoctante.rowCount > 0) {
                            const uidsComoPernoctante = resuelveConsultaComoPernoctante.rows
                            uidsComoPernoctante.map((detallesReserva) => {
                                const reserva = detallesReserva.reserva
                                comoPernoctantePreProcesado.push(reserva)
                            })
                        }

                        const encontrarRepetidosEliminar = (comoTitular, comoPernoctante) => {
                            // Crear conjuntos a partir de los arrays
                            const set1 = new Set(comoTitular);
                            const set2 = new Set(comoPernoctante);
                            // Encontrar la intersección (elementos comunes) entre los conjuntos
                            const comoAmbos = [...set1].filter((elemento) => set2.has(elemento));
                            // Eliminar los elementos repetidos de los arrays originales
                            comoTitular = comoTitular.filter((elemento) => !comoAmbos.includes(elemento));
                            comoPernoctante = comoPernoctante.filter((elemento) => !comoAmbos.includes(elemento));
                            // Concatenar los arrays originales y los elementos repetidos
                            const estructuraFinal = {
                                comoTitular: comoTitular,
                                comoPernoctante: comoPernoctante,
                                comoAmbos: comoAmbos,
                            };
                            return estructuraFinal;
                        }

                        const reservasEstructuradas = encontrarRepetidosEliminar(comoTitularPreProcesado, comoPernoctantePreProcesado)

                        const UIDSreservasComoTitular = reservasEstructuradas.comoTitular
                        const UIDSreservasComoPernoctante = reservasEstructuradas.comoPernoctante
                        const UIDSreservasComoAmbos = reservasEstructuradas.comoAmbos
                        const numeroPaginaSQL = Number((pagina - 1) + "0");

                        const reservasClasificadas = []
                        const numeroPorPagina = 10


                        const consultaFusionada = `
                        WITH resultados AS (
                            SELECT 
                                'Titular' AS como,
                                reserva::text,
                                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                to_char(salida, 'DD/MM/YYYY') as salida
                            FROM 
                                reservas 
                            WHERE 
                                reserva = ANY($1)
                        
                            UNION ALL
                        
                            SELECT 
                                'Pernoctante' AS como,
                                reserva::text,
                                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                to_char(salida, 'DD/MM/YYYY') as salida
                            FROM 
                                reservas 
                            WHERE 
                                reserva = ANY($2)
                        
                            UNION ALL
                        
                            SELECT 
                                'Ambos' AS como,
                                reserva::text,
                                to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                to_char(salida, 'DD/MM/YYYY') as salida
                            FROM 
                                reservas 
                            WHERE 
                                reserva = ANY($3)                   
                        )
                        SELECT 
                            como,
                            reserva,
                            entrada,
                            salida,
                            COUNT(*) OVER ()::text as total_filas
                            -- ROW_NUMBER() OVER (PARTITION BY reserva ORDER BY reserva) as fila_duplicada

                        FROM resultados
                        ${ordenColumnaSQL}
                        LIMIT $4 OFFSET $5;
                        
                        `

                        const parametrosConsulta = [
                            UIDSreservasComoTitular,
                            UIDSreservasComoPernoctante,
                            UIDSreservasComoAmbos,
                            numeroPorPagina,
                            numeroPaginaSQL
                        ]

                        const resuelveConsulta = await conexion.query(consultaFusionada, parametrosConsulta)
                        if (resuelveConsulta.rowCount > 0) {
                            reservasClasificadas.push(...resuelveConsulta.rows)
                        }
                        const consultaConteoTotalFilas = resuelveConsulta.rows[0]?.total_filas ? resuelveConsulta.rows[0].total_filas : 0
                        for (const detallesFila of reservasClasificadas) {
                            delete detallesFila.total_filas
                        }
                        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);

                        const estructuraFinal = {
                            ok: "Reservas del cliente encontradas",
                            totalReservas: Number(consultaConteoTotalFilas),
                            paginasTotales: totalPaginas,
                            pagina: pagina,
                            nombreColumna: nombreColumna,
                            sentidoColumna: sentidoColumna,
                            reservas: reservasClasificadas
                        }
                        salida.json(estructuraFinal)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                eliminar: async () => {
                    try {
                        const clienteUID = entrada.body.clienteUID

                        if (!clienteUID || !Number.isInteger(clienteUID)) {
                            const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente"
                            throw new Error(error)
                        }
                        const validarCliente = `
                        SELECT
                        uid
                        FROM 
                        clientes
                        WHERE
                        uid = $1`
                        const resuelveValidarCliente = await conexion.query(validarCliente, [clienteUID])
                        if (resuelveValidarCliente.rowCount === 0) {
                            const error = "No existe el cliente, revisa su identificador"
                            throw new Error(error)
                        }
                        if (resuelveValidarCliente.rowCount === 1) {
                            const consultaEliminarCliente = `
                            DELETE FROM clientes
                            WHERE uid = $1;
                            `
                            const resuelveValidarYEliminarImpuesto = await conexion.query(consultaEliminarCliente, [clienteUID])
                            if (resuelveValidarYEliminarImpuesto.rowCount === 0) {
                                const error = "No existe el cliente, revisa su identificador"
                                throw new Error(error)
                            }
                            if (resuelveValidarYEliminarImpuesto.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha eliminado correctamente el cliente",
                                    clienteUID: clienteUID
                                }
                                salida.json(ok)
                            }


                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                }
            },
            impuestos: {
                IDX: {
                    ROL: ["administrador", "empleado"]
                },
                listaImpuestos: async () => {
                    try {
                        /*
                        "totalReservas": 16,
                        "paginasTotales": 2,
                        "pagina": 1,
                        "nombreColumna": "entrada",
                        "sentidoColumna": "descendente",
                        */
                        const validadores = {
                            nombreColumna: async (nombreColumna) => {
                                const filtronombreColumna = /^[a-zA-Z]+$/;
                                if (!filtronombreColumna.test(nombreColumna)) {
                                    const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas."
                                    throw new Error(error)
                                }
                                const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'impuestos' AND column_name = $1;
                                `
                                const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna])
                                if (resuelveNombreColumna.rowCount === 0) {
                                    const miArray = [
                                        'nombreCompleto',
                                        'pasaporteTitular',
                                        'emailTitular'
                                    ];

                                    if (!miArray.includes(nombreColumna)) {
                                        const error = "No existe el nombre de la columna que quieres ordenar"
                                        throw new Error(error)
                                    }

                                }

                            },
                            sentidoColumna: (sentidoColumna) => {
                                let sentidoColumnaSQL
                                const sentidoColumnaPreVal = sentidoColumna
                                if (sentidoColumnaPreVal !== "descendente" && sentidoColumnaPreVal !== "ascendente") {
                                    const error = "El sentido del ordenamiento de la columna es ascendente o descendente"
                                    throw new Error(error)
                                }
                                if (sentidoColumnaPreVal === "ascendente") {
                                    sentidoColumnaSQL = "ASC"
                                }

                                if (sentidoColumnaPreVal === "descendente") {
                                    sentidoColumnaSQL = "DESC"
                                }
                                const estructuraFinal = {
                                    sentidoColumna: sentidoColumnaPreVal,
                                    sentidoColumnaSQL: sentidoColumnaSQL
                                }
                                return estructuraFinal
                            }

                        }



                        // Si hay nombre columna que halla sentido
                        let nombreColumna = entrada.body.nombreColumna
                        let sentidoColumna = entrada.body.sentidoColumna
                        const pagina = entrada.body.pagina
                        if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
                            const error = "Debe de especificarse la clave 'pagina' y su valor debe de ser numerico, entero, positivo y mayor a cero."
                            throw new Error(error)
                        }

                        const numeroPagina = Number((pagina - 1) + "0");

                        let ordenamientoFinal
                        const ok = {}
                        if (nombreColumna || sentidoColumna) {
                            await validadores.nombreColumna(nombreColumna)
                            const sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL
                            sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna
                            ordenamientoFinal = `
                            ORDER BY 
                            "${nombreColumna}" ${sentidoColumnaSQL}
                            `
                            ok.nombreColumna = nombreColumna
                            ok.sentidoColumna = sentidoColumna
                        } else {
                            ordenamientoFinal = ""
                        }

                        const numeroPorPagina = 10
                        // si hay nombre columna validarlo
                        const listarImpuestos = `
                        SELECT
                        idv,
                        impuesto,
                        "tipoImpositivo",
                        "tipoValor",
                        "aplicacionSobre",
                        "moneda",
                        COUNT(*) OVER() as total_filas
                        FROM 
                        impuestos
                        ${ordenamientoFinal}
                        LIMIT $1
                        OFFSET $2;  
                        `
                        const resuelvelistarImpuestos = await conexion.query(listarImpuestos, [numeroPorPagina, numeroPagina])
                        if (resuelvelistarImpuestos.rowCount === 0) {
                            const error = "No hay ningun impuesto en sl sistema"
                            throw new Error(error)
                        }
                        const consultaConteoTotalFilas = resuelvelistarImpuestos?.rows[0]?.total_filas ? resuelvelistarImpuestos.rows[0].total_filas : 0
                        const impuestosEncontradoas = resuelvelistarImpuestos.rows
                        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);

                        for (const detallesFila of impuestosEncontradoas) {
                            delete detallesFila.total_filas
                        }
                        if (nombreColumna) {
                            ok.nombreColumna = nombreColumna
                            ok.sentidoColumna = sentidoColumna
                        }
                        ok.totalImpuestos = Number(consultaConteoTotalFilas)
                        ok.paginasTotales = totalPaginas
                        ok.pagina = pagina
                        ok.impuestos = impuestosEncontradoas




                        salida.json(ok)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                detalleImpuesto: async () => {
                    try {
                        const impuestoUID = entrada.body.impuestoUID

                        if (!impuestoUID || typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
                            const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }

                        const validarImpuesto = `
                        SELECT
                        i.impuesto AS "nombreImpuesto",
                        i.idv AS "impuestoUID",
                        i.impuesto,
                        i."tipoImpositivo",
                        i."tipoValor" AS "tipoValorIDV",
                        itv."tipoValorUI" AS "tipoValorUI",
                        i."aplicacionSobre" AS "aplicacionSobreIDV",
                        ias."aplicacionUI" AS "aplicacionSobreUI",
                        i."moneda" AS "monedaIDV",
                        mon."monedaUI" AS "monedaUI"
                        FROM
                        impuestos i
                        JOIN
                        "impuestoTipoValor" itv ON i."tipoValor" = itv."tipoValorIDV"
                        JOIN
                        "impuestosAplicacion" ias ON i."aplicacionSobre" = ias."aplicacionIDV"
                        JOIN
                        "monedas" mon ON i."moneda" = mon."monedaIDV"
                        WHERE
                        i.idv = $1;
                        `
                        const resuelveValidarImpuesto = await conexion.query(validarImpuesto, [impuestoUID])
                        if (resuelveValidarImpuesto.rowCount === 0) {
                            const error = "No existe el perfil del impuesto"
                            throw new Error(error)
                        }
                        const perfilImpuesto = resuelveValidarImpuesto.rows[0]

                        const ok = {
                            "ok": perfilImpuesto
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                guardarModificacionImpuesto: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const impuestoUID = entrada.body.impuestoUID
                            let nombreImpuesto = entrada.body.nombreImpuesto
                            let tipoImpositivo = entrada.body.tipoImpositivo
                            let tipoValor = entrada.body.tipoValor
                            let aplicacionSobre = entrada.body.aplicacionSobre
                            let moneda = entrada.body.moneda

                            if (typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
                                const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo"
                                throw new Error(error)
                            }

                            const filtroCadena = /^[a-zA-Z0-9 ]+$/;
                            if (nombreImpuesto?.length > 0 && !filtroCadena.test(nombreImpuesto)) {
                                const error = "El campo nombreImpuesto solo puede ser un una cadena de minúsculas"
                                throw new Error(error)
                            }
                            const filtroTipoImpositivo = /^\d+(\.\d{2})?$/;
                            if (tipoImpositivo?.length > 0 && (typeof tipoImpositivo !== "string" || !filtroTipoImpositivo.test(tipoImpositivo))) {
                                const error = "El campo tipoImpositivo solo puede ser una cadena con un numero y dos decimlaes"
                                throw new Error(error)
                            }
                            const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
                            if (tipoValor?.length > 0 && !filtroCadenaSinEspacio.test(tipoValor)) {
                                const error = "El campo tipoValor solo puede ser un una cadena de minúsculas y numeros sin espacios"
                                throw new Error(error)
                            }
                            const filtroCadena_mMN = /^[a-zA-Z0-9]+$/;

                            if (aplicacionSobre?.length > 0 && !filtroCadena_mMN.test(aplicacionSobre)) {
                                const error = "El campo aplicacionSobre solo puede ser un una cadena de minúsculas y numeros sin espacios"
                                throw new Error(error)
                            }
                            if (moneda?.length > 0 && !filtroCadenaSinEspacio.test(moneda)) {
                                const error = "El campo moneda solo puede ser un una cadena de minúsculas y numeros sin espacios"
                                throw new Error(error)
                            }

                            if (tipoValor) {

                                const validarTipoValor = `
                            SELECT 
                            "tipoValorIDV"
                            FROM "impuestoTipoValor"
                            WHERE "tipoValorIDV" = $1
                            `
                                const resuelveValidarTipoValor = await conexion.query(validarTipoValor, [tipoValor])
                                if (resuelveValidarTipoValor.rowCount === 0) {
                                    const error = "No existe el tipo valor verifica el campor tipoValor"
                                    throw new Error(error)
                                }
                            }

                            if (aplicacionSobre) {
                                const validarAplicacionSobre = `
                            SELECT 
                            "aplicacionIDV"
                            FROM "impuestosAplicacion"
                            WHERE "aplicacionIDV" = $1
                            `
                                const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre, [aplicacionSobre])
                                if (resuelveValidarAplicacionSobre.rowCount === 0) {
                                    const error = "No existe el contexto de aplicacion verifica el campor resuelveValidarAplicacionSobre"
                                    throw new Error(error)
                                }
                            }

                            if (moneda) {

                                const validarMoneda = `
                            SELECT 
                            "monedaIDV"
                            FROM monedas
                            WHERE "monedaIDV" = $1
                            `
                                const resuelveValidarMoneda = await conexion.query(validarMoneda, [moneda])
                                if (resuelveValidarMoneda.rowCount === 0) {
                                    const error = "No existe la moneda, verifica el campo moneda"
                                    throw new Error(error)
                                }
                            }


                            const validarImpuestoYActualizar = `
                        UPDATE impuestos
                        SET 
                        impuesto = COALESCE($1, impuesto),
                        "tipoImpositivo" = COALESCE($2, "tipoImpositivo"),
                        "tipoValor" = COALESCE($3, "tipoValor"),
                        "aplicacionSobre" = COALESCE($4, "aplicacionSobre"),
                        moneda = COALESCE($5, moneda)
                        WHERE idv = $6
                        RETURNING
                        impuesto,
                        "tipoImpositivo",
                        "tipoValor",
                        "aplicacionSobre",
                        moneda
                        `
                            const resuelveValidarImpuesto = await conexion.query(validarImpuestoYActualizar, [nombreImpuesto, tipoImpositivo, tipoValor, aplicacionSobre, moneda, impuestoUID])
                            if (resuelveValidarImpuesto.rowCount === 0) {
                                const error = "No existe el perfil del impuesto"
                                throw new Error(error)
                            }

                            const validarImpuesto = `
                        SELECT
                        i.impuesto AS "nombreImpuesto",
                        i.idv AS "impuestoUID",
                        i."tipoImpositivo",
                        i."tipoValor" AS "tipoValorIDV",
                        itv."tipoValorUI" AS "tipoValorUI",
                        i."aplicacionSobre" AS "aplicacionSobreIDV",
                        ias."aplicacionUI" AS "aplicacionSobreUI",
                        i."moneda" AS "monedaIDV",
                        mon."monedaUI" AS "monedaUI"
                        FROM
                        impuestos i
                        JOIN
                        "impuestoTipoValor" itv ON i."tipoValor" = itv."tipoValorIDV"
                        JOIN
                        "impuestosAplicacion" ias ON i."aplicacionSobre" = ias."aplicacionIDV"
                        JOIN
                        "monedas" mon ON i."moneda" = mon."monedaIDV"
                        WHERE
                        i.idv = $1;
                        `
                            const resuelveObtenerDetallesImpuesto = await conexion.query(validarImpuesto, [impuestoUID])
                            if (resuelveObtenerDetallesImpuesto.rowCount === 0) {
                                const error = "No existe el perfil del impuesto"
                                throw new Error(error)
                            }


                            const perfilImpuesto = resuelveObtenerDetallesImpuesto.rows[0]



                            const ok = {
                                "ok": "El impuesto se ha actualizado correctamente",
                                "detallesImpuesto": perfilImpuesto
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();
                        }

                    }
                },
                opcionesEditarImpuesto: async () => {
                    try {
                        const impuestoUID = entrada.body.impuestoUID

                        if (typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
                            const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }

                        const validarImpuesto = `
                        SELECT
                        "tipoValor", "aplicacionSobre", moneda
                        FROM 
                        impuestos
                        WHERE idv = $1
                        `
                        const resuelveValidarImpuesto = await conexion.query(validarImpuesto, [impuestoUID])
                        if (resuelveValidarImpuesto.rowCount === 0) {
                            const error = "No existe el perfil del impuesto"
                            throw new Error(error)
                        }

                        const opcionesTipoValor = []
                        const opcionesAplicacionSobre = []
                        const opcionesMonedas = []

                        const validarTipoValor = `
                        SELECT 
                        "tipoValorIDV", "tipoValorUI", simbolo
                        FROM "impuestoTipoValor"
                        `
                        const resuelveValidarTipoValor = await conexion.query(validarTipoValor)
                        if (resuelveValidarTipoValor.rowCount > 0) {
                            opcionesTipoValor.push(...resuelveValidarTipoValor.rows);
                        }
                        const validarAplicacionSobre = `
                        SELECT 
                        "aplicacionIDV", "aplicacionUI"
                        FROM "impuestosAplicacion"
                        `
                        const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre)
                        if (resuelveValidarAplicacionSobre.rowCount > 0) {
                            opcionesAplicacionSobre.push(...resuelveValidarAplicacionSobre.rows);
                        }

                        const validarMoneda = `
                        SELECT 
                        "monedaIDV", "monedaUI", simbolo
                        FROM monedas
                        `
                        const resuelveValidarMoneda = await conexion.query(validarMoneda)
                        if (resuelveValidarMoneda.rowCount > 0) {
                            opcionesMonedas.push(...resuelveValidarMoneda.rows);
                        }

                        const detallesImpuesto = {
                            tipoValor: opcionesTipoValor,
                            aplicacionSobre: opcionesAplicacionSobre,
                            moneda: opcionesMonedas
                        }

                        const ok = {
                            ok: detallesImpuesto
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                eliminarPerfilImpuesto: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const impuestoUID = entrada.body.impuestoUID
                            if (typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
                                const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo"
                                throw new Error(error)
                            }

                            const validarYEliminarImpuesto = `
                        DELETE FROM impuestos
                        WHERE idv = $1;
                        `
                            const resuelveValidarYEliminarImpuesto = await conexion.query(validarYEliminarImpuesto, [impuestoUID])
                            if (resuelveValidarYEliminarImpuesto.rowCount === 0) {
                                const error = "No existe el perfil del impuesto que deseas eliminar"
                                throw new Error(error)
                            }
                            const ok = {
                                "ok": "Perfil del impuesto eliminado"
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();

                        }

                    }
                },
                crearNuevoImpuesto: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const nombreImpuesto = entrada.body.nombreImpuesto
                            const tipoImpositivo = entrada.body.tipoImpositivo
                            const tipoValor = entrada.body.tipoValor
                            const aplicacionSobre = entrada.body.aplicacionSobre
                            const moneda = entrada.body.moneda

                            const filtroCadena = /^[a-zA-Z0-9 ]+$/;
                            if (!nombreImpuesto || !filtroCadena.test(nombreImpuesto)) {
                                const error = "El campo nombreImpuesto solo puede ser un una cadena de minúsculas"
                                throw new Error(error)
                            }
                            const filtroTipoImpositivo = /^\d+(\.\d{2})?$/;
                            if (!tipoImpositivo || (typeof tipoImpositivo !== "string" || !filtroTipoImpositivo.test(tipoImpositivo))) {
                                const error = "El campo tipoImpositivo solo puede ser una cadena con un numero y dos decimlaes"
                                throw new Error(error)
                            }
                            const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
                            if (!tipoValor || !filtroCadenaSinEspacio.test(tipoValor)) {
                                const error = "El campo tipoValor solo puede ser un una cadena de minúsculas y numeros sin espacios"
                                throw new Error(error)
                            }
                            const filtroCadena_mMN = /^[a-zA-Z0-9]+$/;
                            if (!aplicacionSobre || !filtroCadena_mMN.test(aplicacionSobre)) {
                                const error = "El campo aplicacionSobre solo puede ser un una cadena de minúsculas y numeros sin espacios"
                                throw new Error(error)
                            }
                            if (!moneda || !filtroCadenaSinEspacio.test(moneda)) {
                                const error = "El campo moneda solo puede ser un una cadena de minúsculas y numeros sin espacios"
                                throw new Error(error)
                            }

                            if (tipoValor) {

                                const validarTipoValor = `
                            SELECT 
                            "tipoValorIDV"
                            FROM "impuestoTipoValor"
                            WHERE "tipoValorIDV" = $1
                            `
                                const resuelveValidarTipoValor = await conexion.query(validarTipoValor, [tipoValor])
                                if (resuelveValidarTipoValor.rowCount === 0) {
                                    const error = "No existe el tipo valor verifica el campor tipoValor"
                                    throw new Error(error)
                                }
                            }

                            if (aplicacionSobre) {
                                const validarAplicacionSobre = `
                            SELECT 
                            "aplicacionIDV"
                            FROM "impuestosAplicacion"
                            WHERE "aplicacionIDV" = $1
                            `
                                const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre, [aplicacionSobre])
                                if (resuelveValidarAplicacionSobre.rowCount === 0) {
                                    const error = "No existe el contexto de aplicacion verifica el campor resuelveValidarAplicacionSobre"
                                    throw new Error(error)
                                }
                            }

                            if (moneda) {

                                const validarMoneda = `
                            SELECT 
                            "monedaIDV"
                            FROM monedas
                            WHERE "monedaIDV" = $1
                            `
                                const resuelveValidarMoneda = await conexion.query(validarMoneda, [moneda])
                                if (resuelveValidarMoneda.rowCount === 0) {
                                    const error = "No existe la moneda, verifica el campo moneda"
                                    throw new Error(error)
                                }
                            }


                            const validarImpuestoYActualizar = `
                        INSERT INTO impuestos
                        (
                        impuesto,
                        "tipoImpositivo",
                        "tipoValor",
                        "aplicacionSobre",
                        moneda
                        )
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING idv
                        `
                            const resuelveValidarImpuesto = await conexion.query(validarImpuestoYActualizar, [nombreImpuesto, tipoImpositivo, tipoValor, aplicacionSobre, moneda])
                            const nuevoUIDImpuesto = resuelveValidarImpuesto.rows[0].idv


                            const ok = {
                                "ok": "Sea creado el nuevo impuesto",
                                "nuevoImpuestoUID": nuevoUIDImpuesto
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();
                        }


                    }
                },
                opcionesCrearImpuesto: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            let opcionesTipoValor = []
                            let opcionesAplicacionSobre = []
                            let opcionesMonedas = []

                            const validarTipoValor = `
                        SELECT 
                        "tipoValorIDV", "tipoValorUI", simbolo
                        FROM "impuestoTipoValor"
                        `
                            const resuelveValidarTipoValor = await conexion.query(validarTipoValor)
                            if (resuelveValidarTipoValor.rowCount > 0) {

                                opcionesTipoValor = resuelveValidarTipoValor.rows

                            }
                            const validarAplicacionSobre = `
                        SELECT 
                        "aplicacionIDV", "aplicacionUI"
                        FROM "impuestosAplicacion"
                        `
                            const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre)
                            if (resuelveValidarAplicacionSobre.rowCount > 0) {
                                opcionesAplicacionSobre = resuelveValidarAplicacionSobre.rows

                            }

                            const validarMoneda = `
                        SELECT 
                        "monedaIDV", "monedaUI", simbolo
                        FROM monedas
                        `
                            const resuelveValidarMoneda = await conexion.query(validarMoneda)
                            if (resuelveValidarMoneda.rowCount > 0) {
                                opcionesMonedas = resuelveValidarMoneda.rows
                            }


                            const detallesImpuesto = {
                                "tipoValor": opcionesTipoValor,
                                "aplicacionSobre": opcionesAplicacionSobre,
                                "moneda": opcionesMonedas
                            }

                            const ok = {
                                "ok": detallesImpuesto
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {

                        }

                    }
                }
            },
            precios: {
                IDX: {
                    ROL: ["administrador", "empleado"]
                },
                listaPreciosApartamentos: {
                    IDX: {
                        ROL: ["administrador", "empleado"]
                    },
                    X: async () => {
                        try {

                            const apartamentos = `
                            SELECT
                            "apartamentoIDV"
                            FROM 
                            "configuracionApartamento"
                            `
                            const resuelveApartamentos = await conexion.query(apartamentos)
                            if (resuelveApartamentos.rowCount === 0) {
                                const error = "No hay ningun apartamento en el sistema"
                                throw new Error(error)
                            }

                            const apartamentosEncontrados = resuelveApartamentos.rows

                            const seleccionarImpuestos = `
                            SELECT
                            impuesto, "tipoImpositivo", "tipoValor", moneda
                            FROM
                            impuestos
                            WHERE
                            "aplicacionSobre" = $1 OR "aplicacionSobre" = $2;
                          
                            `
                            const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto"])
                            const objetoFInal = []
                            for (const apartamentoEncotrado of apartamentosEncontrados) {

                                const apartamentoIDV = apartamentoEncotrado.apartamentoIDV
                                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                                const apartamento = {
                                    "apartamento": apartamentoIDV,
                                    "apartamentoUI": apartamentoUI

                                }
                                const listarPreciosApartamentos = `
                                SELECT
                                uid, apartamento, precio, moneda
                                FROM 
                                "preciosApartamentos"
                                WHERE apartamento = $1
                                `

                                const resuelveListarPreciosApartamentos = await conexion.query(listarPreciosApartamentos, [apartamentoIDV])
                                if (resuelveListarPreciosApartamentos.rowCount === 1) {

                                    const precioEncontrados = resuelveListarPreciosApartamentos.rows[0]
                                    const precioApartamento = precioEncontrados.precio
                                    const moneda = precioEncontrados.moneda
                                    const uidPrecio = precioEncontrados.uid
                                    apartamento["uid"] = uidPrecio
                                    apartamento["precio"] = precioApartamento
                                    apartamento["moneda"] = moneda


                                    if (resuelveSeleccionarImpuestos.rowCount > 0) {
                                        const impuestosEncontrados = resuelveSeleccionarImpuestos.rows
                                        apartamento["totalImpuestos"] = 0.00
                                        let sumaTotalImpuestos = 0.00
                                        impuestosEncontrados.map((detalleImpuesto) => {

                                            const tipoImpositivo = detalleImpuesto.tipoImpositivo
                                            const tipoValor = detalleImpuesto.tipoValor
                                            if (tipoValor === "porcentaje") {
                                                const resultadoApliacado = (precioApartamento * (tipoImpositivo / 100)).toFixed(2);
                                                sumaTotalImpuestos += parseFloat(resultadoApliacado)
                                            }
                                            if (tipoValor === "tasa") {
                                                sumaTotalImpuestos += parseFloat(tipoImpositivo)
                                            }

                                        })
                                        apartamento["totalImpuestos"] = Number(sumaTotalImpuestos).toFixed(2)

                                        let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioApartamento)
                                        totalDiaBruto = totalDiaBruto.toFixed(2)
                                        apartamento["totalDiaBruto"] = totalDiaBruto


                                    }

                                }


                                objetoFInal.push(apartamento)





                            }





                            let ok = {
                                "ok": objetoFInal
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {

                        }

                    }
                },
                detallePrecioBaseApartamento: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV
                            const filtroCadena = /^[a-z0-9]+$/;

                            if (typeof apartamentoIDV !== "string" || !filtroCadena.test(apartamentoIDV)) {
                                const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios"
                                throw new Error(error)
                            }

                            const transaccionInterna = await precioBaseApartamento(apartamentoIDV)
                            transaccionInterna.precioNetoPorDia = new Decimal(transaccionInterna.precioNetoPorDia).toFixed(2)
                            transaccionInterna.totalImpuestos = new Decimal(transaccionInterna.totalImpuestos).toFixed(2)
                            transaccionInterna.totalBrutoPordia = new Decimal(transaccionInterna.totalBrutoPordia).toFixed(2)
                            transaccionInterna.impuestos.map((impuesto) => {
                                const tipoImpositivo = impuesto.tipoImpositivo
                                const totalImpuesto = impuesto.totalImpuesto
                                impuesto.tipoImpositivo = new Decimal(tipoImpositivo).toFixed(2)
                                impuesto.totalImpuesto = new Decimal(totalImpuesto).toFixed(2)
                            })
                            const ok = {
                                ok: transaccionInterna
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {

                        }
                    }
                },
                previsualizarPrecioApartamento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {

                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV
                            const filtroCadena = /^[a-z0-9]+$/;
                            const propuestaPrecio = entrada.body.propuestaPrecio

                            if (typeof apartamentoIDV !== "string") {
                                const error = "El campo apartamentoIDV debe de ser una cadena"
                                throw new Error(error)
                            }


                            if (!filtroCadena.test(apartamentoIDV)) {
                                const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios"
                                throw new Error(error)
                            }


                            const filtroPropuestaPrecio = /^\d+(\.\d{2})?$/;
                            if (!filtroPropuestaPrecio.test(propuestaPrecio)) {
                                const error = "El campo propuestaPrecio solo puede ser un numero con dos decimales y nada mas, los decimales deben de separarse con un punto y no una coma"
                                throw new Error(error)
                            }

                            const validarApartamento = `
                        SELECT
                        "apartamentoIDV"
                        FROM 
                        "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `
                            const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV])
                            if (resuelveValidarApartamento.rowCount === 0) {
                                const error = "No existe el apartamenro"
                                throw new Error(error)
                            }
                            const detallesApartamento = {}
                            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                            detallesApartamento.apartamentoUI = apartamentoUI
                            detallesApartamento.apartamentoIDV = apartamentoIDV


                            const precioNetoApartamentoPorDia = propuestaPrecio
                            detallesApartamento.precioNetoPorDiaPropuesto = precioNetoApartamentoPorDia
                            const seleccionarImpuestos = `
                        SELECT
                        impuesto, "tipoImpositivo", "tipoValor", moneda
                        FROM
                        impuestos
                        WHERE
                        "aplicacionSobre" = $1 OR "aplicacionSobre" = $2;
                      
                        `
                            const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto"])
                            if (resuelveSeleccionarImpuestos.rowCount > 0) {
                                detallesApartamento.impuestos = []
                                const impuestosEncontrados = resuelveSeleccionarImpuestos.rows
                                let impuestosFinal

                                let sumaTotalImpuestos = 0.00
                                impuestosEncontrados.map((detalleImpuesto) => {
                                    const tipoImpositivo = detalleImpuesto.tipoImpositivo
                                    const nombreImpuesto = detalleImpuesto.impuesto
                                    const tipoValor = detalleImpuesto.tipoValor
                                    impuestosFinal = {
                                        "nombreImpuesto": nombreImpuesto,
                                        "tipoImpositivo": tipoImpositivo,
                                        "tipoValor": tipoValor,


                                    }
                                    if (tipoValor === "porcentaje") {
                                        const resultadoApliacado = (precioNetoApartamentoPorDia * (tipoImpositivo / 100)).toFixed(2);
                                        sumaTotalImpuestos += parseFloat(resultadoApliacado)
                                        impuestosFinal.totalImpuesto = resultadoApliacado
                                    }
                                    if (tipoValor === "tasa") {
                                        sumaTotalImpuestos += parseFloat(tipoImpositivo)
                                        impuestosFinal.totalImpuesto = tipoImpositivo

                                    }
                                    (detallesApartamento.impuestos).push(impuestosFinal)

                                })

                                let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorDia)

                                totalDiaBruto = totalDiaBruto.toFixed(2)
                                detallesApartamento.totalImpuestos = sumaTotalImpuestos
                                detallesApartamento.totalBrutoPordia = totalDiaBruto;


                            }


                            const ok = {
                                "ok": detallesApartamento
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {

                        }

                    }
                },
                establecerNuevoPrecioApartamento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV
                            const nuevoPrecio = entrada.body.nuevoPrecio

                            if (typeof apartamentoIDV !== "string") {
                                const error = "El campo apartamentoIDV debe de ser una cadena"
                                throw new Error(error)
                            }
                            const filtroCadena = /^[a-z0-9]+$/;
                            if (!filtroCadena.test(apartamentoIDV)) {
                                const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios"
                                throw new Error(error)
                            }
                            const filtroPropuestaPrecio = /^\d+\.\d{2}$/;



                            if (!filtroPropuestaPrecio.test(nuevoPrecio)) {
                                const error = "El campo nuevoPrecio solo puede ser un numero con dos decimales y nada mas, los decimales deben de separarse con un punto y no una coma"
                                throw new Error(error)
                            }

                            const validarApartamento = `
                        SELECT
                        "apartamentoIDV", "estadoConfiguracion"
                        FROM 
                        "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `
                            const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV])
                            if (resuelveValidarApartamento.rowCount === 0) {
                                const error = "No existe el apartamenro"
                                throw new Error(error)
                            }
                            if (resuelveValidarApartamento.rows[0].estadoConfiguracion === "disponible") {
                                const error = "No se puede puede establecer un precio a este apartmento cuadno la configuracion esta en modo disponible. Primero desactive la configuracion del apartmento dejandola en estado No disponible y luego podra hacer las modificaciones que necesite"
                                throw new Error(error)
                            }


                            const detallesApartamento = {}
                            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)


                            detallesApartamento.apartamentoUI = apartamentoUI
                            detallesApartamento.apartamentoIDV = apartamentoIDV

                            const insertarNuevoPrecioApartamento = `
                        UPDATE "preciosApartamentos"
                        SET precio = $1
                        WHERE "apartamento" = $2;
                        `
                            const resuelveInsertarNuevoPrecioApartamento = await conexion.query(insertarNuevoPrecioApartamento, [nuevoPrecio, apartamentoIDV])
                            if (resuelveInsertarNuevoPrecioApartamento.rowCount === 0) {
                                const error = "No existe ningun perfil de precio que actualizar para este apartamento"
                                throw new Error(error)

                            }

                            const listarPrecioApartamento = `
                        SELECT
                        uid, apartamento, precio, moneda
                        FROM 
                        "preciosApartamentos"
                        WHERE apartamento = $1
                        `
                            const resuelveListarPrecioApartamento = await conexion.query(listarPrecioApartamento, [apartamentoIDV])
                            if (resuelveListarPrecioApartamento.rowCount === 0) {
                                const error = "No hay ningun precio de este apartamento en el sistema"
                                throw new Error(error)
                            }
                            const precioNetoApartamentoPorDia = resuelveListarPrecioApartamento.rows[0].precio
                            detallesApartamento.precioNetoPorDia = precioNetoApartamentoPorDia
                            const seleccionarImpuestos = `
                        SELECT
                        impuesto, "tipoImpositivo", "tipoValor", moneda
                        FROM
                        impuestos
                        WHERE
                        "aplicacionSobre" = $1 OR "aplicacionSobre" = $2;
                      
                        `
                            const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto"])
                            if (resuelveSeleccionarImpuestos.rowCount > 0) {
                                detallesApartamento.impuestos = []
                                const impuestosEncontrados = resuelveSeleccionarImpuestos.rows
                                let impuestosFinal

                                let sumaTotalImpuestos = 0.00
                                impuestosEncontrados.map((detalleImpuesto) => {
                                    const tipoImpositivo = detalleImpuesto.tipoImpositivo
                                    const nombreImpuesto = detalleImpuesto.impuesto
                                    const tipoValor = detalleImpuesto.tipoValor
                                    impuestosFinal = {
                                        "nombreImpuesto": nombreImpuesto,
                                        "tipoImpositivo": tipoImpositivo,
                                        "tipoValor": tipoValor,


                                    }
                                    if (tipoValor === "porcentaje") {
                                        const resultadoApliacado = (precioNetoApartamentoPorDia * (tipoImpositivo / 100)).toFixed(2);
                                        sumaTotalImpuestos += parseFloat(resultadoApliacado)
                                        impuestosFinal.totalImpuesto = resultadoApliacado
                                    }
                                    if (tipoValor === "tasa") {
                                        sumaTotalImpuestos += parseFloat(tipoImpositivo)
                                        impuestosFinal.totalImpuesto = tipoImpositivo

                                    }
                                    (detallesApartamento.impuestos).push(impuestosFinal)

                                })

                                let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorDia)

                                totalDiaBruto = totalDiaBruto.toFixed(2)
                                detallesApartamento.totalImpuestos = sumaTotalImpuestos.toFixed(2)
                                detallesApartamento.totalBrutoPordia = totalDiaBruto;


                            }


                            const ok = {
                                "ok": detallesApartamento
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();

                        }

                    }
                },
                eliminarPerfilPrecioApartamento: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV

                            if (typeof apartamentoIDV !== "string") {
                                const error = "El campo apartamentoIDV debe de ser una cadena"
                                throw new Error(error)
                            }
                            const filtroCadena = /^[a-z0-9]+$/;
                            if (!filtroCadena.test(apartamentoIDV)) {
                                const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios"
                                throw new Error(error)
                            }

                            const validarApartamento = `
                        SELECT
                        "apartamentoIDV", 
                        "estadoConfiguracion"
                        FROM 
                        "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `
                            const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV])
                            if (resuelveValidarApartamento.rowCount === 0) {
                                const error = "No existe el apartamenro"
                                throw new Error(error)
                            }
                            if (resuelveValidarApartamento.rows[0].estadoConfiguracion === "disponible") {
                                const error = "No se puede eliminar un perfil de precio de una configuracion de apartamento mientras esta configuracion esta disponible para su uso. Por favor primero ponga la configuracion en no disponible y luego realiza las modificaciones pertinentes."
                                throw new Error(error)
                            }
                            const eliminarPerfilPrecio = `
                        DELETE FROM "preciosApartamentos"
                        WHERE apartamento = $1;
                        `
                            const resuelveEliminarPerfilPrecio = await conexion.query(eliminarPerfilPrecio, [apartamentoIDV])
                            if (resuelveEliminarPerfilPrecio.rowCount === 0) {
                                const error = "No hay ningun perfil de precio que elimintar de este apartamento"
                                throw new Error(error)
                            }

                            const ok = {
                                "ok": "Se ha eliminado correctamnte el perfil de apartamento"
                            }

                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();

                        }
                    }
                },
                resolverMoneda: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    X: async () => {

                        try {
                            let monedaIDV = entrada.body.monedaIDV
                            const filtroCadena = /^[a-z]+$/;
                            if (!monedaIDV || !filtroCadena.test(monedaIDV)) {
                                const error = "El campo monedaIDV solo puede ser un una cadena de minúsculas"
                                throw new Error(error)
                            }

                            const transaccionInterna = await resolverMoneda(monedaIDV)
                            salida.json(transaccionInterna)


                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {

                        }

                    }
                }
            },
            ofertas: {
                IDX: {
                    ROL: ["administrador", "empleado"]
                },
                crearOferta: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const nombreOferta = entrada.body.nombreOferta
                            const fechaInicio = entrada.body.fechaInicio
                            const fechaFin = entrada.body.fechaFin
                            const tipoOferta = entrada.body.tipoOferta
                            const tipoDescuento = entrada.body.tipoDescuento ? entrada.body.tipoDescuento : null
                            let cantidad = entrada.body.cantidad
                            const contextoAplicacion = entrada.body.contextoAplicacion
                            const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados
                            const simboloNumero = entrada.body.simboloNumero
                            const numero = entrada.body.numero

                            const filtroCantidad = /^\d+(\.\d{1,2})?$/;
                            const filtroNombre = /^[^'"]+$/;

                            const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;


                            if (!nombreOferta || !filtroNombre.test(nombreOferta)) {
                                const error = "El campo nombreOferta no admice comillas simples o dobles"
                                throw new Error(error)
                            }

                            const fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO
                            const fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO

                            if (tipoOferta !== "porNumeroDeApartamentos" &&
                                tipoOferta !== "porApartamentosEspecificos" &&
                                tipoOferta !== "porDiasDeAntelacion" &&
                                tipoOferta !== "porRangoDeFechas" &&
                                tipoOferta !== "porDiasDeReserva"
                            ) {
                                const error = "No se reconoce el tipo de oferta"
                                throw new Error(error)
                            }

                            // Validar nombre unico oferta
                            const validarNombreOfertaUnico = `
                        SELECT "nombreOferta"
                        FROM ofertas
                        WHERE "nombreOferta" = $1
                        `
                            const consultaValidarNombreOfertaUnico = await conexion.query(validarNombreOfertaUnico, [nombreOferta])
                            if (consultaValidarNombreOfertaUnico.rowCount > 0) {
                                const error = "Ya existe un nombre de oferta exactamente igual a este, por favor elige otro nombre para esta oferta con el fin de evitar confusiones"
                                throw new Error(error)
                            }
                            if (tipoDescuento === "precioEstablecido") {
                                const controlPrecioEstablecido = `
                            SELECT 
                            *
                            FROM ofertas
                            WHERE ("fechaInicio" <= $1 AND "fechaFin" >= $2) AND "tipoDescuento" = $3;
                            `
                                const resuelveControlPrecioEstablecido = await conexion.query(controlPrecioEstablecido, [fechaInicio_ISO, fechaFin_ISO, tipoDescuento]);

                            }

                            const validadores = {
                                numero: (numero) => {
                                    numero = Number(numero)
                                    if (!numero || !Number.isInteger(numero) || numero <= 0) {
                                        const error = "El campo numero debe de ser un numer entero y positivo1"
                                        throw new Error(error)
                                    }
                                },
                                simboloNumero: (simboloNumero) => {
                                    if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                                        const error = "El campo simboloNumero debe de ser un numer entero y positivo"
                                        throw new Error(error)
                                    }
                                },
                                tipoDescuento: (tipoDescuento) => {
                                    if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                                        const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`
                                        throw new Error(error)
                                    }
                                },
                                contextoAplicacion: (contextoAplicacion) => {
                                    if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartmentoDedicado")) {
                                        const error = `El campo contexto de aplicacion solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`
                                        throw new Error(error)
                                    }
                                },
                                cantidad: (cantidad) => {
                                    if (!cantidad || !filtroCantidad.test(cantidad)) {
                                        const error = "El campo cantidad debe ser un número con un máximo de dos decimales separados por punto. Recuerda que number es sin comillas.";
                                        throw new Error(error);
                                    }
                                    cantidad = Number(cantidad)

                                },
                                controlLimitePorcentaje: (tipoDescuento, cantidad) => {
                                    if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                                        const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                                        throw new Error(error);
                                    }
                                }
                            }

                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const inertarOfertaValidada = async (metadatos) => {


                                try {

                                    const nombreOferta = metadatos.nombreOferta
                                    const fechaInicio_ISO = metadatos.fechaInicio_ISO
                                    const fechaFin_ISO = metadatos.fechaFin_ISO

                                    const simboloNumero = metadatos.simboloNumero
                                    const numero = metadatos.numero

                                    const contextoAplicacion = metadatos.contextoAplicacion
                                    const estadoInicalDesactivado = "desactivada"
                                    const tipoOferta = metadatos.tipoOferta
                                    const cantidad = metadatos.cantidad
                                    const tipoDescuento = metadatos.tipoDescuento

                                    const crearOfertaDesactivada = `
                                    INSERT INTO ofertas
                                    (
                                        "nombreOferta",
                                        "fechaInicio",
                                        "fechaFin",
                                        "simboloNumero",
                                        "numero",
                                        "descuentoAplicadoA",
                                        "estadoOferta",
                                        "tipoOferta",
                                        cantidad,
                                        "tipoDescuento"
                                    )
                                    VALUES
                                    (
                                        COALESCE($1, NULL),
                                        COALESCE($2::date, NULL),
                                        COALESCE($3::date, NULL),
                                        NULLIF($4, NULL),
                                        NULLIF($5::numeric, NULL),
                                        COALESCE($6, NULL),
                                        COALESCE($7, NULL),
                                        COALESCE($8, NULL),
                                        NULLIF($9::numeric, NULL),
                                        NULLIF($10, NULL)
                                    )
                                    RETURNING uid;
                                    `
                                    const datos = [
                                        nombreOferta,
                                        fechaInicio_ISO,
                                        fechaFin_ISO,
                                        simboloNumero,
                                        numero,
                                        contextoAplicacion,
                                        estadoInicalDesactivado,
                                        tipoOferta,
                                        cantidad,
                                        tipoDescuento
                                    ]
                                    const resuelveCrearOfertaDesactivada = await conexion.query(crearOfertaDesactivada, datos)
                                    if (resuelveCrearOfertaDesactivada.rowCount === 1) {
                                        const estructuraFinal = {
                                            ok: "Se ha creado la oferta correctamente",
                                            nuevoUIDOferta: resuelveCrearOfertaDesactivada.rows[0].uid
                                        }
                                        return estructuraFinal
                                    }
                                    if (resuelveCrearOfertaDesactivada.rowCount === 0) {
                                        const error = "Ha ocurrido un error y no se ha insertado la oferta"
                                        throw new Error(error)
                                    }
                                } catch (error) {
                                    throw error
                                }


                            }

                            if (tipoOferta === "porNumeroDeApartamentos") {

                                validadores.simboloNumero(simboloNumero)
                                validadores.numero(numero)
                                validadores.cantidad(cantidad)
                                validadores.tipoDescuento(tipoDescuento)
                                validadores.controlLimitePorcentaje(tipoDescuento, cantidad)




                                const oferta = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    simboloNumero: simboloNumero,
                                    numero: numero,
                                    tipoOferta: tipoOferta,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento
                                }
                                const resolutor = await inertarOfertaValidada(oferta)
                                salida.json(resolutor)

                            }
                            if (tipoOferta === "porApartamentosEspecificos") {
                                const filtroCadena = /^[a-zA-Z0-9]+$/;
                                const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
                                if (typeof apartamentosSeleccionados !== 'object' && !Array.isArray(apartamentosSeleccionados)) {
                                    const error = "El campo apartamentosSeleccionados solo admite un arreglo"
                                    throw new Error(error)
                                }
                                if (apartamentosSeleccionados.length === 0) {
                                    const error = "Anada al menos un apartmento dedicado"
                                    throw new Error(error)
                                }


                                validadores.contextoAplicacion(contextoAplicacion)
                                if (contextoAplicacion === "totalNetoReserva") {
                                    validadores.cantidad(cantidad)
                                    validadores.tipoDescuento(tipoDescuento)
                                    validadores.controlLimitePorcentaje(tipoDescuento, cantidad)

                                }
                                for (const apartamentoSeleccionado of apartamentosSeleccionados) {
                                    const apartamentoIDV = apartamentoSeleccionado.apartamentoIDV
                                    const apartamentoUI = apartamentoSeleccionado.apartamentoUI
                                    const tipoDescuentoApartamento = apartamentoSeleccionado.tipoDescuento
                                    const cantidadPorApartamento = apartamentoSeleccionado.cantidad
                                    if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                                        const error = "El campo apartamentoIDV solo admite minúsculas, mayúsculas y numeros nada mas ni espacios"
                                        throw new Error(error)
                                    }
                                    if (!apartamentoUI || !filtroCadenaUI.test(apartamentoUI)) {
                                        const error = "El campo apartamentoUI solo admite minúsculas, mayúsculas, numeros y espacios nada mas ni espacios"
                                        throw new Error(error)
                                    }
                                    if (contextoAplicacion === "totalNetoApartmentoDedicado") {

                                        if (!tipoDescuentoApartamento || (tipoDescuentoApartamento !== "cantidadFija" && tipoDescuentoApartamento !== "porcentaje") && tipoDescuentoApartamento !== "precioEstablecido") {
                                            const error = `El apartamento ${apartamentoUI} debe de tener un tipo de descuente seleccionado, revisa los apartamentos para ver si en alguno falta un tipo de descuente`
                                            throw new Error(error)
                                        }
                                        if (!cantidadPorApartamento || typeof cantidadPorApartamento !== "string" || !filtroCantidad.test(cantidadPorApartamento)) {
                                            const error = `El campo cantidad del ${apartamentoUI} dedicado debe ser un número con un máximo de dos decimales separados por punto. Escribe los decimales igualmente, ejemplo 10.00`
                                            throw new Error(error);
                                        }
                                        validadores.controlLimitePorcentaje(tipoDescuentoApartamento, cantidadPorApartamento)

                                    }
                                }

                                // No pueden existir dos apartamentos o mas iguales
                                const apartamentosSeleccionadosPreProcesados = apartamentosSeleccionados.map((detallesApartamento) => { return detallesApartamento.apartamentoIDV })
                                const apartamentosSeleccionadosUnicos = new Set(apartamentosSeleccionadosPreProcesados);
                                const controlApartamentosIDV = apartamentosSeleccionadosPreProcesados.length !== apartamentosSeleccionadosUnicos.size;
                                if (controlApartamentosIDV) {
                                    const error = "No se permiten apartamentos repetidos en el objeto de apartamentosSeleccionados"
                                    throw new Error(error)
                                }
                                // que los identificadores no existan.


                                const consultaValidarApartamentoIDV = `
                            SELECT
                            "apartamentoIDV"
                            FROM
                            "configuracionApartamento"
                            WHERE
                            "apartamentoIDV" = ANY($1)
                            `
                                const resuelveConsultaValidarApartamentoIDV = await conexion.query(consultaValidarApartamentoIDV, [apartamentosSeleccionadosPreProcesados])
                                // Extraer los valores encontrados en la base de datos
                                const apartamentosIDVEncontrados = resuelveConsultaValidarApartamentoIDV.rows.map(row => row.apartamentoIDV);

                                // Encontrar las cadenas que no coincidieron
                                const cadenasNoCoincidentes = apartamentosSeleccionadosPreProcesados.filter(apartamentoIDV => !apartamentosIDVEncontrados.includes(apartamentoIDV));
                                if (cadenasNoCoincidentes.length > 0) {
                                    const error = `Se hace referencia a identificadores visuales de apartamentos que no existen. Por favor revisa los identificadores de los apartamentos a lo que quieres aplicar una oferta por que no existen`
                                    throw new Error(error);

                                }




                                if (contextoAplicacion === "totalNetoApartmentoDedicado") {
                                    cantidad = null
                                }
                                const oferta = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    contextoAplicacion: contextoAplicacion,
                                    tipoOferta: tipoOferta,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento
                                }
                                const resolutor = await inertarOfertaValidada(oferta)
                                const nuevoUIDOferta = resolutor.nuevoUIDOferta

                                for (const apartamentoDedicado of apartamentosSeleccionados) {
                                    const apartamentoIDV = apartamentoDedicado.apartamentoIDV
                                    let tipoDescuento = null
                                    let cantidadPorApartamento = null
                                    if (contextoAplicacion === "totalNetoApartmentoDedicado") {
                                        tipoDescuento = apartamentoDedicado.tipoDescuento
                                        cantidadPorApartamento = apartamentoDedicado.cantidad
                                        cantidadPorApartamento = Number(cantidadPorApartamento)
                                    }
                                    const ofertaApartamentosDedicados = `
                                INSERT INTO "ofertasApartamentos"
                                (
                                    oferta,
                                    apartamento,
                                    "tipoDescuento",
                                    cantidad
                                )
                                VALUES
                                (
                                    NULLIF($1::numeric, NULL),
                                    NULLIF($2, NULL),
                                    NULLIF($3, NULL),
                                    NULLIF($4::numeric, NULL)
                                )
                                `
                                    const detallesApartamentoDedicado = [
                                        nuevoUIDOferta,
                                        apartamentoIDV,
                                        tipoDescuento,
                                        cantidadPorApartamento
                                    ]
                                    await conexion.query(ofertaApartamentosDedicados, detallesApartamentoDedicado)

                                }
                                const ok = {
                                    "ok": "La oferta se ha creado bien",
                                    "nuevoUIDOferta": nuevoUIDOferta
                                }
                                salida.json(ok)

                            }
                            if (tipoOferta === "porDiasDeAntelacion") {

                                validadores.simboloNumero(simboloNumero)
                                validadores.numero(numero)
                                validadores.cantidad(cantidad)
                                validadores.tipoDescuento(tipoDescuento)
                                validadores.controlLimitePorcentaje(tipoDescuento, cantidad)


                                const oferta = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    simboloNumero: simboloNumero,
                                    contextoAplicacion: contextoAplicacion,
                                    tipoOferta: tipoOferta,
                                    numero: numero,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento
                                }
                                const resolutor = await inertarOfertaValidada(oferta)
                                salida.json(resolutor)
                            }
                            if (tipoOferta === "porDiasDeReserva") {
                                validadores.simboloNumero(simboloNumero)
                                validadores.numero(numero)
                                validadores.cantidad(cantidad)
                                validadores.tipoDescuento(tipoDescuento)
                                validadores.controlLimitePorcentaje(tipoDescuento, cantidad)



                                //    simboloNumero = entrada.body.simboloNumero
                                const oferta = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    simboloNumero: simboloNumero,
                                    numero: numero,
                                    contextoAplicacion: contextoAplicacion,
                                    tipoOferta: tipoOferta,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento
                                }
                                const resolutor = await inertarOfertaValidada(oferta)
                                salida.json(resolutor)

                            }
                            if (tipoOferta === "porRangoDeFechas") {
                                validadores.tipoDescuento(tipoDescuento)
                                validadores.cantidad(cantidad)

                                const oferta = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    tipoOferta: tipoOferta,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento
                                }
                                const resolutor = await inertarOfertaValidada(oferta)
                                salida.json(resolutor)
                            }

                            await conexion.query('COMMIT'); // Confirmar la transacción
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();

                        }
                    }
                },
                listasOfertasAdministracion: async () => {
                    try {
                        const listarOfertas = `
                        SELECT
                        "nombreOferta",
                        uid,
                        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
                        "numero",
                        "simboloNumero",
                        "descuentoAplicadoA" ,
                        "estadoOferta",
                        "tipoOferta",
                        "cantidad",
                        "tipoDescuento"
                        FROM 
                        ofertas 
                        ORDER BY 
                        "fechaInicio" ASC;
                        `
                        const resuelveListarOfertas = await conexion.query(listarOfertas)
                        if (resuelveListarOfertas.rowCount === 0) {
                            const ok = {
                                ok: "No hay ofertas configuradas"
                            }
                            salida.json(ok)
                        }

                        if (resuelveListarOfertas.rowCount > 0) {
                            const ofertas = resuelveListarOfertas.rows
                            for (const ofertaDetalles of ofertas) {
                                const uid = ofertaDetalles.uid
                                const tipoOferta = ofertaDetalles.tipoOferta
                                const descuentoAplicadoA = ofertaDetalles.descuentoAplicadoA

                                if (tipoOferta === "porApartamentosEspecificos") {


                                    //Arreglar esto, esto esta bien es una resolucion en modo joint
                                    const detallesApartamentosDedicados = `
                                    SELECT
                                    oa.apartamento AS "apartamentoIDV",
                                    a."apartamentoUI",
                                    oa."tipoDescuento",
                                    oa."cantidad"
                                    FROM 
                                    "ofertasApartamentos" oa
                                    LEFT JOIN
                                    "apartamentos" a ON oa.apartamento = a.apartamento
                                    WHERE oferta = $1
                                    `
                                    const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [uid])
                                    if (resuelveDetallesApartamentosDedicados.rowCount === 0) {
                                        ofertaDetalles.apartamentosDedicados = []
                                    }

                                    if (resuelveDetallesApartamentosDedicados.rowCount > 0) {
                                        const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows
                                        ofertaDetalles.apartamentosDedicados = []
                                        apartamentosDedicados.map((apartamento) => {
                                            const apartamentoIDV = apartamento.apartamentoIDV
                                            const apartamentoUI = apartamento.apartamentoUI
                                            const tipoDescuentoApartamento = apartamento.tipoDescuento
                                            const cantidadApartamento = apartamento.cantidad
                                            const detallesApartamentoDedicado = {
                                                apartamentoIDV: apartamentoIDV,
                                                apartamentoUI: apartamentoUI,
                                                tipoDescuento: tipoDescuentoApartamento,
                                                cantidadApartamento: cantidadApartamento

                                            }
                                            ofertaDetalles.apartamentosDedicados.push(detallesApartamentoDedicado)
                                        })
                                    }
                                }
                            }

                            const ok = {
                                ok: ofertas
                            }
                            salida.json(ok)
                        }


                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                detallesOferta: async () => {

                    try {
                        const ofertaUID = entrada.body.ofertaUID
                        if (!ofertaUID || typeof ofertaUID !== "number" || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                            const error = "El campo 'ofertaUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        const consultaDetallesOferta = `
                        SELECT
                        o.uid,
                        to_char(o."fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                        to_char(o."fechaFin", 'DD/MM/YYYY') as "fechaFin", 
                        o."numero",
                        o."simboloNumero",
                        o."descuentoAplicadoA" as "descuentoAplicadoAIDV",
                        oa."aplicacionUI" as "descuentoAplicadoAUI",
                        o."estadoOferta" as "estadoOfertaIDV",
                        oe."estadoUI" as "estadoOfertaUI",
                        o."tipoOferta" as "tipoOfertaIDV",
                        ot."tipoOfertaUI" as "tipoOfertaUI",
                        o."tipoDescuento" as "tipoDescuentoIDV",
                        otd."tipoDescuentoUI" as "tipoDescuentoUI",
                        o.cantidad AS "cantidad",
                        o."nombreOferta"
                        FROM
                        ofertas o
                        LEFT JOIN
                        "ofertasAplicacion" oa ON o."descuentoAplicadoA" = oa."aplicacionIDV"
                        LEFT JOIN
                        "ofertasEstado" oe ON o."estadoOferta" = oe."estadoIDV"
                        LEFT JOIN
                        "ofertasTipo" ot ON o."tipoOferta" = ot."tipoOfertaIDV"
                        LEFT JOIN
                        "ofertasTipoDescuento" otd ON o."tipoDescuento" = otd."tipoDescuentoIDV"
                        WHERE
                        o.uid = $1;
                        `
                        const resuelveConsultaDetallesOferta = await conexion.query(consultaDetallesOferta, [ofertaUID])
                        const oferta = resuelveConsultaDetallesOferta.rows[0]
                        if (resuelveConsultaDetallesOferta.rowCount === 0) {
                            const error = "No existe ninguna reserva con ese UID"
                            throw new Error(error)
                        }

                        if (resuelveConsultaDetallesOferta.rowCount === 1) {
                            if (oferta.tipoOfertaIDV === "porNumeroDeApartamentos" || oferta.tipoOfertaIDV === "porDiasDeAntelacion" || oferta.tipoOfertaIDV === "porDiasDeReserva" || oferta.tipoOfertaIDV === "porRangoDeFechas") {
                                const ok = {
                                    "ok": oferta
                                }
                                salida.json(ok)
                            }

                            if (oferta.tipoOfertaIDV === "porApartamentosEspecificos") {
                                const detallesOferta = oferta
                                detallesOferta["apartamentosDedicados"] = []
                                const detallesApartamentosDedicados = `
                                SELECT
                                oa.apartamento AS "apartamentoIDV",
                                a."apartamentoUI",
                                oa."tipoDescuento",
                                oa."cantidad"
                                FROM 
                                "ofertasApartamentos" oa
                                LEFT JOIN
                                "apartamentos" a ON oa.apartamento = a.apartamento
                                WHERE oferta = $1
                                `
                                const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [oferta.uid])

                                if (resuelveDetallesApartamentosDedicados.rowCount > 0) {

                                    const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows
                                    detallesOferta["apartamentosDedicados"] = []

                                    apartamentosDedicados.map((apartamento) => {
                                        const apartamentoIDV = apartamento.apartamentoIDV
                                        const apartamentoUI = apartamento.apartamentoUI
                                        const tipoDescuentoApartamento = apartamento.tipoDescuento
                                        const cantidadApartamento = apartamento.cantidad
                                        const detallesApartamentoDedicado = {
                                            apartamentoIDV: apartamentoIDV,
                                            apartamentoUI: apartamentoUI,
                                            tipoDescuento: tipoDescuentoApartamento,
                                            cantidadApartamento: cantidadApartamento

                                        }
                                        detallesOferta["apartamentosDedicados"].push(detallesApartamentoDedicado)
                                    })
                                }
                                const ok = {
                                    ok: detallesOferta
                                }
                                salida.json(ok)
                            }
                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                opcionesCrearOferta: async () => {
                    try {
                        const opcionesCrearOferta = {}
                        const listaAplicacionOferta = `
                        SELECT
                        "aplicacionIDV", "aplicacionUI"
                        FROM 
                        "ofertasAplicacion";`
                        const resuelveListaAplicacionOferta = await conexion.query(listaAplicacionOferta)
                        opcionesCrearOferta.aplicacionSobre = resuelveListaAplicacionOferta.rows

                        const listaTipoOfertas = `
                        SELECT
                        "tipoOfertaIDV", "tipoOfertaUI"
                        FROM 
                        "ofertasTipo";`
                        const resuelveListaTipoOfertas = await conexion.query(listaTipoOfertas)
                        opcionesCrearOferta.tipoOfertas = resuelveListaTipoOfertas.rows

                        const listaTipoDescuento = `
                        SELECT
                        "tipoDescuentoIDV", "tipoDescuentoUI"
                        FROM 
                        "ofertasTipoDescuento";`
                        const resuelveListaTipoDescuento = await conexion.query(listaTipoDescuento)
                        opcionesCrearOferta.tipoDescuento = resuelveListaTipoDescuento.rows

                        const ok = {
                            ok: opcionesCrearOferta
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                actualizarOferta: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        await mutex.acquire();
                        try {
                            const nombreOferta = entrada.body.nombreOferta;
                            const fechaInicio = entrada.body.fechaInicio;
                            const fechaFin = entrada.body.fechaFin;
                            const tipoOferta = entrada.body.tipoOferta;
                            const ofertaUID = entrada.body.ofertaUID;
                            const tipoDescuento = entrada.body.tipoDescuento ? entrada.body.tipoDescuento : null;
                            let cantidad = entrada.body.cantidad;
                            const numero = entrada.body.numero;
                            const simboloNumero = entrada.body.simboloNumero;
                            const contextoAplicacion = entrada.body.contextoAplicacion;
                            const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados;
                            const filtroCantidad = /^\d+\.\d{2}$/;
                            const filtroNombre = /^[^'"]+$/;


                            if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                                const error = "El campo ofertaUID tiene que ser un numero, positivo y entero"
                                throw new Error(error)
                            }
                            if (!filtroNombre.test(nombreOferta)) {
                                const error = "El campo nombreOferta no admice comillas simples o dobles"
                                throw new Error(error)
                            }

                            const fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO
                            const fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO


                            if (tipoOferta !== "porNumeroDeApartamentos" &&
                                tipoOferta !== "porApartamentosEspecificos" &&
                                tipoOferta !== "porDiasDeAntelacion" &&
                                tipoOferta !== "porRangoDeFechas" &&
                                tipoOferta !== "porDiasDeReserva") {
                                const error = "No se reconoce el tipo de oferta"
                                throw new Error(error)
                            }

                            const validadoresLocales = {
                                numero: (numero) => {
                                    numero = Number(numero)
                                    if (!numero || !Number.isInteger(numero) || numero <= 0) {
                                        const error = "El campo numero debe de ser un numer entero y positivo1"
                                        throw new Error(error)
                                    }
                                },
                                simboloNumero: (simboloNumero) => {
                                    if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                                        const error = "El campo simboloNumero debe de ser un numer entero y positivo"
                                        throw new Error(error)
                                    }
                                },
                                tipoDescuento: (tipoDescuento) => {
                                    if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                                        const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`
                                        throw new Error(error)
                                    }
                                },
                                contextoAplicacion: (contextoAplicacion) => {
                                    if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartmentoDedicado")) {
                                        const error = `El campo contexto de aplicacion solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`
                                        throw new Error(error)
                                    }
                                },
                                cantidad: (cantidad) => {
                                    if (!cantidad || !filtroCantidad.test(cantidad)) {
                                        const error = "El campo cantidad debe ser un número con un máximo de dos decimales separados por punto. Recuerda que number es sin comillas.";
                                        throw new Error(error);
                                    }
                                },
                                controlLimitePorcentaje: (tipoDescuento, cantidad) => {
                                    if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                                        const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                                        throw new Error(error);
                                    }
                                }
                            }

                            // Validar existencia de la oferta y estado
                            const validarNombreOfertaUnico = `
                                SELECT 
                                "estadoOferta"
                                FROM ofertas
                                WHERE uid = $1;`
                            const consultaValidarNombreOfertaUnico = await conexion.query(validarNombreOfertaUnico, [ofertaUID])
                            const estadoOferta = consultaValidarNombreOfertaUnico.rows[0].estadoOferta
                            if (consultaValidarNombreOfertaUnico.rowCount === 0) {
                                const error = "No existe ninguna oferta con este identificador. Por lo tanto no se puede actualizar."
                                throw new Error(error)
                            }
                            if (estadoOferta === "activada") {
                                const error = "No se puede modificar una oferta activa. Primero desactiva con el boton de estado."
                                throw new Error(error)
                            }

                            const consultaActualizarCompartido = async (metadatos) => {
                                const nombreOferta = metadatos.nombreOferta
                                const fechaInicio_ISO = metadatos.fechaInicio_ISO
                                const fechaFin_ISO = metadatos.fechaFin_ISO
                                const numero = metadatos.numero
                                const simboloNumero = metadatos.simboloNumero
                                const contextoAplicacion = metadatos.contextoAplicacion
                                const tipoOferta = metadatos.tipoOferta
                                const cantidad = metadatos.cantidad ? metadatos.cantidad : null
                                const tipoDescuento = metadatos.tipoDescuento
                                const ofertaUID = metadatos.ofertaUID

                                const actualizarOferta = `
                            UPDATE ofertas
                            SET
                            "nombreOferta" = COALESCE($1, NULL),
                            "fechaInicio" = COALESCE($2::date, NULL),
                            "fechaFin" = COALESCE($3::date, NULL),
                            "numero" = COALESCE($4::numeric, NULL),
                            "simboloNumero" = COALESCE($5, NULL),
                            "descuentoAplicadoA" = COALESCE($6, NULL),
                            "tipoOferta" = COALESCE($7, NULL),
                            cantidad = COALESCE($8::numeric, NULL),
                            "tipoDescuento" = COALESCE($9, NULL)
                            WHERE uid = $10;`
                                const datos = [
                                    nombreOferta,
                                    fechaInicio_ISO,
                                    fechaFin_ISO,
                                    numero,
                                    simboloNumero,
                                    contextoAplicacion,
                                    tipoOferta,
                                    cantidad,
                                    tipoDescuento,
                                    ofertaUID
                                ]
                                const resuelveActualizarOferta = await conexion.query(actualizarOferta, datos)
                            }

                            const eliminaPerfilApartamentoEspecificos = async (ofertaUID) => {
                                const eliminarApartamentosDedicados = `
                            DELETE FROM "ofertasApartamentos"
                            WHERE oferta = $1;`
                                await conexion.query(eliminarApartamentosDedicados, [ofertaUID])
                            }

                            await conexion.query('BEGIN'); // Inicio de la transacción
                            // validadoresCompartidos.contextoAplicacion(contextoAplicacion)
                            if (tipoOferta === "porNumeroDeApartamentos" ||
                                tipoOferta === "porDiasDeAntelacion" ||
                                tipoOferta === "porDiasDeReserva") {

                                validadoresLocales.cantidad(cantidad)
                                cantidad = Number(cantidad)
                                validadoresLocales.tipoDescuento(tipoDescuento)
                                validadoresLocales.numero(numero)
                                validadoresLocales.simboloNumero(simboloNumero)
                                validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad)



                                eliminaPerfilApartamentoEspecificos(ofertaUID)
                                const metadatos = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    numero: numero,
                                    simboloNumero: simboloNumero,
                                    // contextoAplicacion: contextoAplicacion,
                                    tipoOferta: tipoOferta,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento,
                                    ofertaUID: ofertaUID,
                                }
                                await consultaActualizarCompartido(metadatos)
                                const ok = {
                                    ok: "Se ha acualizado correctamente la oferta"
                                }
                                salida.json(ok)
                            }


                            if (tipoOferta === "porRangoDeFechas") {
                                validadoresLocales.cantidad(cantidad)
                                cantidad = Number(cantidad)
                                validadoresLocales.tipoDescuento(tipoDescuento)
                                validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad)


                                await eliminaPerfilApartamentoEspecificos(ofertaUID)
                                const metadatos = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    numero: numero,
                                    simboloNumero: simboloNumero,
                                    // contextoAplicacion: contextoAplicacion,
                                    tipoOferta: tipoOferta,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento,
                                    ofertaUID: ofertaUID,
                                }
                                await consultaActualizarCompartido(metadatos)
                                const ok = {
                                    ok: "Se ha acualizado correctamente la oferta"
                                }
                                salida.json(ok)
                            }

                            if (tipoOferta === "porApartamentosEspecificos") {
                                validadoresLocales.contextoAplicacion(contextoAplicacion)


                                const filtroCadena = /^[a-zA-Z0-9]+$/;
                                const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;


                                if (contextoAplicacion === "totalNetoReserva") {
                                    validadoresLocales.cantidad(cantidad)
                                    cantidad = Number(cantidad)
                                    validadoresLocales.tipoDescuento(tipoDescuento)
                                    validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad)

                                }
                                if (contextoAplicacion === "totalNetoApartmentoDedicado") {

                                }
                                await eliminaPerfilApartamentoEspecificos(ofertaUID)

                                const metadatos = {
                                    nombreOferta: nombreOferta,
                                    fechaInicio_ISO: fechaInicio_ISO,
                                    fechaFin_ISO: fechaFin_ISO,
                                    contextoAplicacion: contextoAplicacion,
                                    tipoOferta: tipoOferta,
                                    cantidad: cantidad,
                                    tipoDescuento: tipoDescuento,
                                    ofertaUID: ofertaUID,
                                }
                                await consultaActualizarCompartido(metadatos)


                                if (typeof apartamentosSeleccionados !== 'object' && !Array.isArray(apartamentosSeleccionados)) {
                                    const error = "El campo apartamentosSeleccionados solo admite un arreglo"
                                    throw new Error(error)
                                }
                                if (apartamentosSeleccionados.length === 0) {
                                    const error = "Anada al menos un apartmento dedicado"
                                    throw new Error(error)
                                }

                                for (const apartamentoSeleccionado of apartamentosSeleccionados) {
                                    const apartamentoIDV = apartamentoSeleccionado.apartamentoIDV
                                    const apartamentoUI = apartamentoSeleccionado.apartamentoUI
                                    const tipoDescuentoApartamento = apartamentoSeleccionado.tipoDescuento
                                    const cantidadPorApartamento = apartamentoSeleccionado.cantidad
                                    if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                                        const error = "El campo apartamentoIDV solo admite minúsculas, mayúsculas y numeros nada mas ni espacios"
                                        throw new Error(error)
                                    }
                                    if (!apartamentoUI || !filtroCadenaUI.test(apartamentoUI)) {
                                        const error = "El campo apartamentoUI solo admite minúsculas, mayúsculas, numeros y espacios nada mas ni espacios"
                                        throw new Error(error)
                                    }
                                    if (contextoAplicacion === "totalNetoApartmentoDedicado") {
                                        if (!tipoDescuentoApartamento || (tipoDescuentoApartamento !== "cantidadFija" && tipoDescuentoApartamento !== "porcentaje") && tipoDescuentoApartamento !== "precioEstablecido") {
                                            const error = `El apartamento ${apartamentoUI} debe de tener un tipo de descuente seleccionado, revisa los apartamentos para ver si en alguno falta un tipo de descuente`
                                            throw new Error(error)
                                        }
                                        if (!cantidadPorApartamento || typeof cantidadPorApartamento !== "string" || !filtroCantidad.test(cantidadPorApartamento)) {
                                            const error = `El campo cantidad del ${apartamentoUI} dedicado debe ser un número con un máximo de dos decimales separados por punto. Escribe los decimales igualmente, ejemplo 10.00`
                                            throw new Error(error);
                                        }
                                        validadoresLocales.controlLimitePorcentaje(tipoDescuentoApartamento, cantidadPorApartamento)

                                    }

                                }
                                for (const apartamentoDedicado of apartamentosSeleccionados) {
                                    const apartamentoIDV = apartamentoDedicado.apartamentoIDV
                                    let tipoDescuento = null
                                    let cantidadPorApartamento = null
                                    if (contextoAplicacion === "totalNetoApartmentoDedicado") {
                                        tipoDescuento = apartamentoDedicado.tipoDescuento
                                        cantidadPorApartamento = apartamentoDedicado.cantidad
                                    }

                                    const ofertaApartamentosDedicados = `
                                INSERT INTO "ofertasApartamentos"
                                (
                                oferta,
                                apartamento,
                                "tipoDescuento",
                                cantidad
                                )
                                VALUES
                                (
                                NULLIF($1::numeric, NULL),
                                COALESCE($2, NULL),
                                COALESCE($3, NULL),
                                NULLIF($4::numeric, NULL)
                                )
                                RETURNING uid;`
                                    const detallesApartamentoDedicado = [
                                        Number(ofertaUID),
                                        apartamentoIDV,
                                        tipoDescuento,
                                        Number(cantidadPorApartamento)
                                    ]

                                    await conexion.query(ofertaApartamentosDedicados, detallesApartamentoDedicado)
                                }
                                const ok = {
                                    ok: "La oferta actualizado bien junto con los apartamentos dedicados"
                                }
                                salida.json(ok)
                            }
                            await conexion.query('COMMIT');
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK');
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {

                            mutex.release();

                        }
                    }
                },
                actualizarEstadoOferta: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const ofertaUID = entrada.body.ofertaUID
                            const estadoOferta = entrada.body.estadoOferta
                            const filtroCadena = /^[a-z]+$/;

                            if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                                const error = "El campo ofertaUID tiene que ser un numero, positivo y entero"
                                throw new Error(error)
                            }
                            if (!estadoOferta || !filtroCadena.test(estadoOferta) || (estadoOferta !== "activada" && estadoOferta !== "desactivada")) {
                                const error = "El campo estadoOferta solo admite minúsculas y nada mas, debe de ser un estado activada o desactivada"
                                throw new Error(error)
                            }
                            // Validar nombre unico oferta
                            const validarOferta = `
                        SELECT uid
                        FROM ofertas
                        WHERE uid = $1;
                        `
                            const resuelveValidarOferta = await conexion.query(validarOferta, [ofertaUID])
                            if (resuelveValidarOferta.rowCount === 0) {
                                const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number"
                                throw new Error(error)
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            const actualizarEstadoOferta = `
                        UPDATE ofertas
                        SET "estadoOferta" = $2
                        WHERE uid = $1
                        RETURNING "estadoOferta";
                        `
                            const datos = [
                                ofertaUID,
                                estadoOferta,
                            ]
                            const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos)

                            const ok = {
                                "ok": "El estado de la oferta se ha actualziado correctamente",
                                "estadoOferta": resuelveEstadoOferta.rows[0].estadoOferta
                            }
                            salida.json(ok)
                            await conexion.query('COMMIT'); // Confirmar la transacción
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();

                        }
                    }
                },
                eliminarOferta: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        await mutex.acquire();

                        try {
                            const ofertaUID = entrada.body.ofertaUID
                            if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                                const error = "El campo ofertaUID tiene que ser un numero, positivo y entero"
                                throw new Error(error)
                            }
                            // Validar nombre unico oferta
                            const validarOferta = `
                        SELECT uid
                        FROM ofertas
                        WHERE uid = $1;
                        `
                            let resuelveValidarOferta = await conexion.query(validarOferta, [ofertaUID])
                            if (resuelveValidarOferta.rowCount === 0) {
                                const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number"
                                throw new Error(error)
                            }
                            await conexion.query('BEGIN'); // Inicio de la transacción
                            let eliminarEstadoOferta = `
                        DELETE FROM ofertas
                        WHERE uid = $1;
                        `
                            let resuelveEliminarEstadoOferta = await conexion.query(eliminarEstadoOferta, [ofertaUID])
                            const ok = {
                                "ok": "Se ha eliminado la oferta correctamente",
                            }
                            salida.json(ok)
                            await conexion.query('COMMIT'); // Confirmar la transacción
                        } catch (errorCapturado) {
                            await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        } finally {
                            mutex.release();

                        }
                    }
                }
            },
            comportamientoDePrecios: {
                IDX: {
                    ROL: ["administrador"]
                },
                listaComportamientosPrecios: async () => {
                    try {
                        const listaComportamientoPrecios = `
                        SELECT
                        "nombreComportamiento",
                        uid,
                        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                        to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal",
                        explicacion
                        FROM 
                        "comportamientoPrecios"
                        ORDER BY 
                        "fechaInicio" ASC;
                        `
                        const resuelveListaComportamientoPrecios = await conexion.query(listaComportamientoPrecios)
                        if (resuelveListaComportamientoPrecios.rowCount === 0) {
                            const ok = {
                                ok: "No hay comportamiento de precios configurados"
                            }
                            salida.json(ok)
                        }
                        if (resuelveListaComportamientoPrecios.rowCount > 0) {
                            const ok = {
                                "ok": resuelveListaComportamientoPrecios.rows
                            }
                            salida.json(ok)
                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                crearComportamiento: async () => {
                    await mutex.acquire();

                    try {
                        const nombreComportamiento = entrada.body.nombreComportamiento
                        const fechaInicio = entrada.body.fechaInicio
                        const fechaFin = entrada.body.fechaFin
                        let comportamientos = entrada.body.comportamientos

                        const filtroCantidad = /^\d+(\.\d{1,2})?$/;
                        const filtroNombre = /^[a-zA-Z0-9\s]+$/;
                        const filtroCadenaSinEspacui = /^[a-z0-9]+$/;
                        if (!nombreComportamiento || !filtroNombre.test(nombreComportamiento)) {
                            const error = "El campo nombreComportamiento solo admite minúsculas, mayúsculas, numeros y espacios"
                            throw new Error(error)
                        }
                        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                        if (!filtroFecha.test(fechaInicio)) {
                            const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000"
                            throw new Error(error)
                        }
                        if (!filtroFecha.test(fechaFin)) {
                            const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000"
                            throw new Error(error)
                        }


                        const fechaInicioArreglo = fechaInicio.split("/")
                        const diaEntrada = fechaInicioArreglo[0]
                        const mesEntrada = fechaInicioArreglo[1]
                        const anoEntrada = fechaInicioArreglo[2]

                        const fechaFinArreglo = fechaFin.split("/")
                        const diaSalida = fechaFinArreglo[0]
                        const mesSalida = fechaFinArreglo[1]
                        const anoSalida = fechaFinArreglo[2]

                        const fechaInicio_ISO = `${anoEntrada}-${mesEntrada}-${diaEntrada}`
                        const fechaFin_ISO = `${anoSalida}-${mesSalida}-${diaSalida}`


                        const fechaInicio_Objeto = new Date(fechaInicio_ISO); // El formato es día/mes/ano
                        const fechaFin_Objeto = new Date(fechaFin_ISO);


                        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
                        if (fechaInicio_Objeto > fechaFin_Objeto) {
                            const error = "La fecha de entrada no puede ser superior que la fecha de salida, si pueden ser iguales para hacer un comportamiento de un solo dia"
                            throw new Error(error)
                        }


                        if (typeof comportamientos !== 'object' && !Array.isArray(comportamientos)) {
                            const error = "El campo comportamientos solo admite un arreglo"
                            throw new Error(error)
                        }

                        if (comportamientos.length === 0) {
                            const error = "Añada al menos un apartmento dedicado"
                            throw new Error(error)
                        }

                        let apartamentosSeleccionadosPreProcesados = comportamientos.map((detallesDelComportamiento) => { return detallesDelComportamiento.apartamentoIDV })
                        const apartamentosSeleccionadosUnicos = new Set(apartamentosSeleccionadosPreProcesados);
                        const controlApartamentosIDV = apartamentosSeleccionadosPreProcesados.length !== apartamentosSeleccionadosUnicos.size;
                        if (controlApartamentosIDV) {
                            const error = "No se permiten apartamentos repetidos en el objeto de apartamentosSeleccionados"
                            throw new Error(error)
                        }

                        await conexion.query('BEGIN'); // Inicio de la transacción


                        const apartamentosArreglo = []
                        for (const comportamiento of comportamientos) {
                            const apartamentoIDV = comportamiento.apartamentoIDV
                            let cantidad = comportamiento.cantidad
                            const simbolo = comportamiento.simbolo

                            if (!apartamentoIDV || !filtroCadenaSinEspacui.test(apartamentoIDV)) {
                                const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            const consultaValidarApartamentoIDV = `
                            SELECT *
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1
                            `
                            const resuelveConfiguraValidarApartamentoIDV = await conexion.query(consultaValidarApartamentoIDV, [apartamentoIDV])
                            if (resuelveConfiguraValidarApartamentoIDV.rowCount === 0) {
                                const error = "No exista el apartmento" + String(apartamentoIDV)
                                throw new Error(error)
                            }

                            if (!simbolo ||
                                (
                                    simbolo !== "aumentoPorcentaje" &&
                                    simbolo !== "aumentoCantidad" &&
                                    simbolo !== "reducirCantidad" &&
                                    simbolo !== "reducirPorcentaje" &&
                                    simbolo !== "precioEstablecido"
                                )) {
                                const error = "El campo simbolo solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido"
                                throw new Error(error)
                            }

                            if (!cantidad || !filtroCantidad.test(cantidad)) {
                                const error = "El campo cantidad solo admite minúsculas, numeros y espacios"
                                throw new Error(error)
                            }

                            cantidad = Number(cantidad)
                            if (cantidad === 0) {
                                const error = "No se puede asignar una cantidad de cero por logica y por seguridad"
                                throw new Error(error)
                            }
                            apartamentosArreglo.push(apartamentoIDV)
                        }


                        // Validar nombre unico oferta
                        const validarNombreComportamiento = `
                        SELECT "nombreComportamiento"
                        FROM "comportamientoPrecios"
                        WHERE "nombreComportamiento" = $1
                        `
                        const consultaValidarNombreComportamiento = await conexion.query(validarNombreComportamiento, [nombreComportamiento])
                        if (consultaValidarNombreComportamiento.rowCount > 0) {
                            const error = "Ya existe un nombre exactamente igual a este comportamiento de precio, por favor elige otro nombre con el fin de evitar confusiones"
                            throw new Error(error)
                        }


                        const validarEspacioTemporalUnico = `
                        SELECT uid 
                        FROM "comportamientoPrecios" 
                        WHERE "fechaInicio" <= $1::DATE AND "fechaFinal" >= $2::DATE;`


                        const resuelveVevalidarEspacioTemporalUnico = await conexion.query(validarEspacioTemporalUnico, [fechaFin_ISO, fechaInicio_ISO])
                        if (resuelveVevalidarEspacioTemporalUnico.rowCount > 0) {
                            const detallesApartamentosEntontradosPorValidas = []
                            const comportamientoPreciosCocheTemporalPorAnalizar = resuelveVevalidarEspacioTemporalUnico.rows

                            for (const apartmentosEnComportamiento of comportamientoPreciosCocheTemporalPorAnalizar) {
                                const UIDComportamientoChoque = apartmentosEnComportamiento.uid

                                const seleccionarApartamentosPorComportamiento = `
                                SELECT
                                cpa."apartamentoIDV", 
                                cpa.uid,
                                a."apartamentoUI",
                                cp."nombreComportamiento"
                                FROM
                                "comportamientoPreciosApartamentos" cpa
                                JOIN 
                                apartamentos a ON cpa."apartamentoIDV" = a.apartamento
                                JOIN 
                                "comportamientoPrecios" cp ON cpa."comportamientoUID" = cp.uid
                                WHERE "comportamientoUID" = $1;`
                                const resuelveSeleccionarApartamentosPorComportamiento = await conexion.query(seleccionarApartamentosPorComportamiento, [UIDComportamientoChoque])


                                if (resuelveSeleccionarApartamentosPorComportamiento.rowCount > 0) {

                                    // Aqui falta un loop
                                    const apartamentoExistentes = resuelveSeleccionarApartamentosPorComportamiento.rows
                                    apartamentoExistentes.map((apartamentoExistente) => {

                                        const apartamentoIDVEntonctrado = apartamentoExistente.apartamentoIDV
                                        const apartamentoUIEncontrado = apartamentoExistente.apartamentoUI
                                        const nombreComportamiento = apartamentoExistente.nombreComportamiento

                                        const apartamentoCoincidenteDetalles = {
                                            apartamentoIDV: apartamentoIDVEntonctrado,
                                            apartamentoUI: apartamentoUIEncontrado,
                                            nombreComportamiento: nombreComportamiento,
                                        }
                                        detallesApartamentosEntontradosPorValidas.push(apartamentoCoincidenteDetalles)
                                    })
                                }
                            }

                            const coincidenciasExistentes = []
                            for (const detalleApartemtno of comportamientos) {
                                const apartamentoIDVSolicitante = detalleApartemtno.apartamentoIDV
                                for (const detalleApartamentoYaExistente of detallesApartamentosEntontradosPorValidas) {
                                    const apartamentoIDVExistente = detalleApartamentoYaExistente.apartamentoIDV
                                    const nombreComportamiento = detalleApartamentoYaExistente.nombreComportamiento
                                    const apartamentoUIExistente = detalleApartamentoYaExistente.apartamentoUI
                                    if (apartamentoIDVSolicitante === apartamentoIDVExistente) {
                                        const apartamentoImposibleDeGuardar = {
                                            apartamentoIDV: apartamentoIDVExistente,
                                            apartamentoUI: apartamentoUIExistente,
                                            nombreComportamiento: nombreComportamiento,
                                        }
                                        coincidenciasExistentes.push(apartamentoImposibleDeGuardar)
                                    }
                                }
                            }
                            const coincidenciaAgrupdasPorNombreComportamiento = {}
                            coincidenciasExistentes.map((coincidencia) => {
                                const apartamentoUI = coincidencia.apartamentoUI
                                const nombreComportamiento = coincidencia.nombreComportamiento

                                if (coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento]) {
                                    coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento].push(apartamentoUI)
                                } else {
                                    coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento] = []
                                    coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento].push(apartamentoUI)
                                }

                            })

                            const infoFinal = []
                            for (const coincidenciaAgrupada of Object.entries(coincidenciaAgrupdasPorNombreComportamiento)) {
                                const nombreComportamiento = coincidenciaAgrupada[0]
                                const apartamentosCoincidentes = coincidenciaAgrupada[1].join(", ")
                                infoFinal.push(`${nombreComportamiento} (${apartamentosCoincidentes})`)

                            }
                            infoFinal.join(", ")
                            if (coincidenciasExistentes.length > 0) {
                                const error = `No se puede crear este comportamiento de precio por que hay apartamentos en este comportamiento que existen en otros comportamientos cuyos rangos de fechas se pisan. Concretamente en: ${infoFinal}`
                                throw new Error(error)
                            }
                        }


                        const estadoInicalDesactivado = "desactivado"

                        const crearComportamiento = `
                        INSERT INTO "comportamientoPrecios"
                        (
                            "nombreComportamiento",
                            "fechaInicio",
                            "fechaFinal",
                             estado
                        )
                        VALUES
                        (
                            COALESCE($1, NULL),
                            COALESCE($2::date, NULL),
                            COALESCE($3::date, NULL),
                            COALESCE($4, NULL)
                        )
                        RETURNING uid;
                        `
                        const datos = [
                            nombreComportamiento,
                            fechaInicio_ISO,
                            fechaFin_ISO,
                            estadoInicalDesactivado
                        ]
                        const resuelveCrearComportamiento = await conexion.query(crearComportamiento, datos)


                        if (resuelveCrearComportamiento.rowCount === 1) {
                            const nuevoUIDComportamiento = resuelveCrearComportamiento.rows[0].uid

                            for (const comportamiento of comportamientos) {
                                const apartamentoIDV = comportamiento.apartamentoIDV
                                let cantidad = comportamiento.cantidad
                                const simbolo = comportamiento.simbolo


                                const insertarComportamiento = `
                                INSERT INTO "comportamientoPreciosApartamentos"
                                (
                                    "comportamientoUID",
                                    "apartamentoIDV",
                                     cantidad,
                                     simbolo
                                )
                                VALUES
                                (
                                    NULLIF($1::numeric, NULL),
                                    NULLIF($2, NULL),
                                    NULLIF($3::numeric, NULL),
                                    NULLIF($4, NULL)
                                )
                                `
                                const detalleComportamiento = [
                                    nuevoUIDComportamiento,
                                    apartamentoIDV,
                                    cantidad,
                                    simbolo
                                ]
                                const resuelveInsertarComportamiento = await conexion.query(insertarComportamiento, detalleComportamiento)
                                if (resuelveInsertarComportamiento.rowCount === 0) {
                                    const error = `Ha ocurrido un error y no se ha podido insertar el apartamento ${apartamentoIDV} en el comportamiento`
                                    throw new Error(error)
                                }
                            }
                            const ok = {
                                ok: "Se ha creado correctamente el comportamiento",
                                nuevoUIDComportamiento: nuevoUIDComportamiento
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT');
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK');
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                        mutex.release();

                    }
                },
                detallesComportamiento: async () => {

                    try {
                        let comportamientoUID = entrada.body.comportamientoUID
                        if (!comportamientoUID || typeof comportamientoUID !== "number" || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                            const error = "El campo 'comportamientoUID' debe ser un tipo numero, entero y positivo"
                            throw new Error(error)
                        }
                        const consultaDetallesComportamiento = `
                        SELECT
                        uid,
                        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                        to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal", 
                        "nombreComportamiento",
                        "estado"
                        FROM
                        "comportamientoPrecios" 
                        WHERE
                        uid = $1;
                        `
                        const resuelveConsultaDetallesComportamiento = await conexion.query(consultaDetallesComportamiento, [comportamientoUID])
                        const detallesComportamiento = {
                            uid: resuelveConsultaDetallesComportamiento.rows[0].uid,
                            fechaInicio: resuelveConsultaDetallesComportamiento.rows[0].fechaInicio,
                            fechaFinal: resuelveConsultaDetallesComportamiento.rows[0].fechaFinal,
                            nombreComportamiento: resuelveConsultaDetallesComportamiento.rows[0].nombreComportamiento,
                            estado: resuelveConsultaDetallesComportamiento.rows[0].estado
                        }
                        comportamientoUID = resuelveConsultaDetallesComportamiento.rows[0].uid
                        if (resuelveConsultaDetallesComportamiento.rowCount === 0) {
                            const error = "No existe ninguna comportamiento de precio con ese UID"
                            throw new Error(error)
                        }

                        if (resuelveConsultaDetallesComportamiento.rowCount === 1) {
                            detallesComportamiento["apartamentos"] = []
                            const detallesApartamentosDedicados = `
                                SELECT
                                cpa.uid,
                                cpa."apartamentoIDV",
                                cpa."cantidad",
                                cpa."comportamientoUID",
                                a."apartamentoUI",
                                cpa."simbolo"
                                FROM 
                                "comportamientoPreciosApartamentos" cpa
                                JOIN
                                apartamentos a ON cpa."apartamentoIDV" = a.apartamento
                                WHERE "comportamientoUID" = $1;
                                `
                            const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [comportamientoUID])
                            if (resuelveDetallesApartamentosDedicados.rowCount > 0) {
                                const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows
                                apartamentosDedicados.map((apartamento) => {
                                    const cantidad = apartamento.cantidad
                                    const apartamentoIDV = apartamento.apartamentoIDV
                                    const comportamientoUID = apartamento.comportamientoUID
                                    const simbolo = apartamento.simbolo
                                    const apartamentoUI = apartamento.apartamentoUI
                                    const detallesApartamentoDedicado = {
                                        apartamentoIDV: apartamentoIDV,
                                        apartamentoUI: apartamentoUI,
                                        cantidad: cantidad,
                                        comportamientoUID: comportamientoUID,
                                        simbolo: simbolo
                                    }
                                    detallesComportamiento["apartamentos"].push(detallesApartamentoDedicado)
                                })
                            }
                            const ok = {
                                ok: detallesComportamiento
                            }
                            salida.json(ok)

                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }

                },
                actualizarComportamiento: async () => {
                    await mutex.acquire();

                    try {
                        const nombreComportamiento = entrada.body.nombreComportamiento
                        let fechaInicio = entrada.body.fechaInicio
                        let fechaFinal = entrada.body.fechaFinal
                        const comportamientoUID = entrada.body.comportamientoUID
                        let comportamientos = entrada.body.comportamientos
                        const filtroCantidad = /^\d+\.\d{2}$/;
                        const filtroNombre = /^[a-zA-Z0-9\s]+$/;
                        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;

                        if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                            const error = "El campo comportamientoUID tiene que ser un numero, positivo y entero"
                            throw new Error(error)
                        }
                        if (!nombreComportamiento || !filtroNombre.test(nombreComportamiento)) {
                            const error = "El campo nombreComportamiento solo admite minúsculas, mayúsculas, numeros y espacios"
                            throw new Error(error)
                        }
                        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                        if (!filtroFecha.test(fechaInicio)) {
                            const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000"
                            throw new Error(error)
                        }
                        if (!filtroFecha.test(fechaFinal)) {
                            const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000"
                            throw new Error(error)
                        }

                        if (typeof comportamientos !== 'object' && !Array.isArray(comportamientos)) {
                            const error = "El campo comportamientos solo admite un arreglo"
                            throw new Error(error)
                        }

                        if (comportamientos.length === 0) {
                            const error = "Anada al menos un apartmento dedicado"
                            throw new Error(error)
                        }


                        const fechaInicioArreglo = fechaInicio.split("/")
                        const diaEntrada = fechaInicioArreglo[0]
                        const mesEntrada = fechaInicioArreglo[1]
                        const anoEntrada = fechaInicioArreglo[2]


                        const fechaFinArreglo = fechaFinal.split("/")
                        const diaSalida = fechaFinArreglo[0]
                        const mesSalida = fechaFinArreglo[1]
                        const anoSalida = fechaFinArreglo[2]

                        const fechaInicio_ISO = `${anoEntrada}-${mesEntrada}-${diaEntrada}`
                        const fechaFin_ISO = `${anoSalida}-${mesSalida}-${diaSalida}`

                        const fechaInicio_Objeto = new Date(fechaInicio_ISO); // El formato es día/mes/ano
                        const fechaFin_Objeto = new Date(fechaFin_ISO);

                        if (fechaInicio_Objeto > fechaFin_Objeto) {
                            const error = "La fecha de entrada no puede ser superior que la fecha de salida"
                            throw new Error(error)
                        }
                        if (typeof comportamientos !== 'object' && !Array.isArray(comportamientos)) {
                            const error = "El campo comportamientos solo admite un arreglo"
                            throw new Error(error)
                        }

                        if (comportamientos.length === 0) {
                            const error = "Anada al menos un apartmento dedicado"
                            throw new Error(error)
                        }
                        const apartamentosArreglo = []
                        for (const comportamiento of comportamientos) {
                            const apartamentoIDV = comportamiento.apartamentoIDV
                            let cantidad = comportamiento.cantidad
                            const simbolo = comportamiento.simbolo

                            if (!apartamentoIDV || !filtroCadenaSinEspacio.test(apartamentoIDV)) {
                                const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            if (!simbolo ||
                                (
                                    simbolo !== "aumentoPorcentaje" &&
                                    simbolo !== "aumentoCantidad" &&
                                    simbolo !== "reducirCantidad" &&
                                    simbolo !== "reducirPorcentaje" &&
                                    simbolo !== "precioEstablecido"
                                )) {
                                const error = "El campo simbolo solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido"
                                throw new Error(error)
                            }

                            if (!cantidad || !filtroCantidad.test(cantidad)) {
                                const error = "El campo cantidad solo admite minúsculas, numeros y espacios"
                                throw new Error(error)
                            }

                            cantidad = Number(cantidad)
                            if (cantidad === 0) {
                                const error = "No se puede asignar una cantidad de cero por logica y por seguridad"
                                throw new Error(error)
                            }
                            apartamentosArreglo.push(apartamentoIDV)
                        }

                        // Validar nombre unico oferta
                        const validarComportamiento = `
                        SELECT 
                        estado
                        FROM 
                        "comportamientoPrecios"
                        WHERE uid = $1
                        `
                        const resuelveValidarComportamiento = await conexion.query(validarComportamiento, [comportamientoUID])
                        if (resuelveValidarComportamiento.rowCount === 0) {
                            const error = "No existe ningún comportamiento de precios con ese identificador"
                            throw new Error(error)
                        }
                        const estadoComportamiento = resuelveValidarComportamiento.rows[0].estado
                        if (estadoComportamiento === "activado") {
                            const error = "No se puede modificar un comportamiento de precio que esta activa. Primero desativalos con el boton de estado"
                            throw new Error(error)
                        }
                        const validarEspacioTemporalUnico = `
                        SELECT uid 
                        FROM "comportamientoPrecios" 
                        WHERE "fechaInicio" <= $1::DATE AND "fechaFinal" >= $2::DATE AND uid <> $3;`

                        const resuelveVevalidarEspacioTemporalUnico = await conexion.query(validarEspacioTemporalUnico, [fechaFin_ISO, fechaInicio_ISO, comportamientoUID])
                        if (resuelveVevalidarEspacioTemporalUnico.rowCount > 0) {
                            const detallesApartamentosEntontradosPorValidas = []
                            const comportamientoPreciosCocheTemporalPorAnalizar = resuelveVevalidarEspacioTemporalUnico.rows

                            for (const apartmentosEnComportamiento of comportamientoPreciosCocheTemporalPorAnalizar) {
                                const UIDComportamientoChoque = apartmentosEnComportamiento.uid

                                const seleccionarApartamentosPorComportamiento = `
                                SELECT
                                cpa."apartamentoIDV", 
                                cpa.uid,
                                a."apartamentoUI",
                                cp."nombreComportamiento"
                                FROM
                                "comportamientoPreciosApartamentos" cpa
                                JOIN 
                                apartamentos a ON cpa."apartamentoIDV" = a.apartamento
                                JOIN 
                                "comportamientoPrecios" cp ON cpa."comportamientoUID" = cp.uid
                                WHERE "comportamientoUID" = $1;`
                                const resuelveSeleccionarApartamentosPorComportamiento = await conexion.query(seleccionarApartamentosPorComportamiento, [UIDComportamientoChoque])
                                if (resuelveSeleccionarApartamentosPorComportamiento.rowCount > 0) {

                                    // Aqui falta un loop
                                    const apartamentoExistentes = resuelveSeleccionarApartamentosPorComportamiento.rows
                                    apartamentoExistentes.map((apartamentoExistente) => {

                                        const apartamentoIDVEntonctrado = apartamentoExistente.apartamentoIDV
                                        const apartamentoUIEncontrado = apartamentoExistente.apartamentoUI
                                        const nombreComportamiento = apartamentoExistente.nombreComportamiento

                                        const apartamentoCoincidenteDetalles = {
                                            apartamentoIDV: apartamentoIDVEntonctrado,
                                            apartamentoUI: apartamentoUIEncontrado,
                                            nombreComportamiento: nombreComportamiento,
                                        }
                                        detallesApartamentosEntontradosPorValidas.push(apartamentoCoincidenteDetalles)

                                    })
                                }
                            }

                            const coincidenciasExistentes = []


                            for (const detalleApartemtno of comportamientos) {
                                const apartamentoIDVSolicitante = detalleApartemtno.apartamentoIDV

                                for (const detalleApartamentoYaExistente of detallesApartamentosEntontradosPorValidas) {
                                    const apartamentoIDVExistente = detalleApartamentoYaExistente.apartamentoIDV
                                    const nombreComportamiento = detalleApartamentoYaExistente.nombreComportamiento
                                    const apartamentoUIExistente = detalleApartamentoYaExistente.apartamentoUI

                                    if (apartamentoIDVSolicitante === apartamentoIDVExistente) {

                                        const apartamentoImposibleDeGuardar = {
                                            apartamentoIDV: apartamentoIDVExistente,
                                            apartamentoUI: apartamentoUIExistente,
                                            nombreComportamiento: nombreComportamiento,
                                        }
                                        coincidenciasExistentes.push(apartamentoImposibleDeGuardar)
                                    }
                                }
                            }

                            const coincidenciaAgrupdasPorNombreComportamiento = {}

                            coincidenciasExistentes.map((coincidencia) => {
                                const apartamentoUI = coincidencia.apartamentoUI
                                const nombreComportamiento = coincidencia.nombreComportamiento

                                if (coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento]) {
                                    coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento].push(apartamentoUI)
                                } else {
                                    coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento] = []
                                    coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento].push(apartamentoUI)
                                }

                            })
                            const infoFinal = []
                            for (const coincidenciaAgrupada of Object.entries(coincidenciaAgrupdasPorNombreComportamiento)) {
                                const nombreComportamiento = coincidenciaAgrupada[0]
                                const apartamentosCoincidentes = coincidenciaAgrupada[1].join(", ")
                                infoFinal.push(`${nombreComportamiento} (${apartamentosCoincidentes})`)


                            }
                            infoFinal.join(", ")
                            if (coincidenciasExistentes.length > 0) {
                                const error = `No se puede crear este comportamiento de precio por que hay apartamentos en este comportamiento que existen en otros comportamientos cuyos rangos de fechas se pisan. Concretamente en: ${infoFinal}`
                                throw new Error(error)
                            }
                        }

                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarComportamiento = `
                        UPDATE "comportamientoPrecios"
                        SET "nombreComportamiento" = $1, "fechaInicio" = $2 ,"fechaFinal" = $3
                        WHERE uid = $4;
            
                        `
                        const datos = [
                            nombreComportamiento,
                            fechaInicio_ISO,
                            fechaFin_ISO,
                            comportamientoUID
                        ]
                        const resuelveActualizarComportamiento = await conexion.query(actualizarComportamiento, datos)
                        if (resuelveActualizarComportamiento.rowCount === 1) {

                            const eliminarComportamiento = `
                            DELETE FROM "comportamientoPreciosApartamentos"
                            WHERE "comportamientoUID" = $1 ;
                            `
                            await conexion.query(eliminarComportamiento, [comportamientoUID])
                            const filtroCadenaSinEspacui = /^[a-z0-9]+$/;

                            for (const comportamiento of comportamientos) {

                                const apartamentoIDV = comportamiento.apartamentoIDV
                                const simbolo = comportamiento.simbolo
                                let cantidadPorApartamento = comportamiento.cantidad

                                if (!apartamentoIDV || !filtroCadenaSinEspacui.test(apartamentoIDV)) {
                                    const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios"
                                    throw new Error(error)
                                }
                                if (!simbolo ||
                                    (
                                        simbolo !== "aumentoPorcentaje" &&
                                        simbolo !== "aumentoCantidad" &&
                                        simbolo !== "reducirCantidad" &&
                                        simbolo !== "reducirPorcentaje" &&
                                        simbolo !== "precioEstablecido"
                                    )) {
                                    const error = "El campo simbolo solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido"
                                    throw new Error(error)
                                }

                                if (!cantidadPorApartamento || !filtroCantidad.test(cantidadPorApartamento)) {
                                    const error = "El campo cantidad solo admite una cadena con un numero con dos decimales separados por punto. Asegurate de escribir los decimales"
                                    throw new Error(error)
                                }

                                cantidadPorApartamento = Number(cantidadPorApartamento)
                                if (cantidadPorApartamento === 0) {
                                    const error = "No se puede asignar una cantidad de cero por seguridad"
                                    throw new Error(error)
                                }

                                const actualizarComportamientoDedicado = `
                                    INSERT INTO "comportamientoPreciosApartamentos"
                                    (
                                        "apartamentoIDV",
                                        simbolo,
                                        cantidad,
                                        "comportamientoUID"
                                    )
                                    VALUES
                                    (
                                        NULLIF($1, NULL),
                                        COALESCE($2, NULL),
                                        COALESCE($3::numeric, NULL),
                                        NULLIF($4::numeric, NULL)
                                    );
                                    `
                                const comportamientoDedicado = [
                                    apartamentoIDV,
                                    simbolo,
                                    cantidadPorApartamento,
                                    comportamientoUID

                                ]

                                await conexion.query(actualizarComportamientoDedicado, comportamientoDedicado)


                            }
                            const ok = {
                                ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados"
                            }
                            salida.json(ok)



                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                        mutex.release();

                    }
                },
                eliminarComportamiento: async () => {
                    await mutex.acquire();

                    try {
                        const comportamientoUID = entrada.body.comportamientoUID
                        if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                            const error = "El campo ofertaUID tiene que ser un numero, positivo y entero"
                            throw new Error(error)
                        }
                        // Validar nombre unico oferta
                        const validarComportamiento = `
                        SELECT uid
                        FROM "comportamientoPrecios"
                        WHERE uid = $1;
                        `
                        const resuelveValidarComportamiento = await conexion.query(validarComportamiento, [comportamientoUID])
                        if (resuelveValidarComportamiento.rowCount === 0) {
                            const error = "No existe el comportamiento, revisa el UID introducie en el campo comportamientoUID, recuerda que debe de ser un numero"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const eliminarComportamiento = `
                        DELETE FROM "comportamientoPrecios"
                        WHERE uid = $1;
                        `
                        const resuelveEliminarComportamiento = await conexion.query(eliminarComportamiento, [comportamientoUID])
                        if (resuelveEliminarComportamiento.rowCount === 1) {
                            const ok = {
                                ok: "Se ha eliminado el comportamiento correctamente",
                            }
                            salida.json(ok)
                        }

                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                        mutex.release();

                    }
                },
                actualizarEstadoComportamiento: async () => {
                    await mutex.acquire();

                    try {
                        const comportamientoUID = entrada.body.comportamientoUID
                        const estadoPropuesto = entrada.body.estadoPropuesto
                        const filtroCadena = /^[a-z]+$/;

                        if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                            const error = "El campo comportamientoUID tiene que ser un numero, positivo y entero"
                            throw new Error(error)
                        }
                        if (!estadoPropuesto || !filtroCadena.test(estadoPropuesto) || (estadoPropuesto !== "activado" && estadoPropuesto !== "desactivado")) {
                            const error = "El campo estadoPropuesto solo admite minúsculas y nada mas, debe de ser un estado activado o desactivado"
                            throw new Error(error)
                        }
                        // Validar nombre unico oferta
                        const validarOferta = `
                        SELECT uid
                        FROM "comportamientoPrecios"
                        WHERE uid = $1;
                        `
                        const resuelveValidarOferta = await conexion.query(validarOferta, [comportamientoUID])
                        if (resuelveValidarOferta.rowCount === 0) {
                            const error = "No existe al oferta, revisa el UID introducie en el campo comportamientoUID, recuerda que debe de ser un number"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarEstadoOferta = `
                        UPDATE "comportamientoPrecios"
                        SET estado = $1
                        WHERE uid = $2
                        RETURNING estado;
                        `
                        const datos = [
                            estadoPropuesto,
                            comportamientoUID
                        ]
                        const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos)

                        const ok = {
                            ok: "El estado del comportamiento se ha actualziado correctamente",
                            estadoComportamiento: resuelveEstadoOferta.rows[0].estado
                        }
                        salida.json(ok)
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {
                        mutex.release();

                    }
                },
                precioRangoApartamentos: async () => {
                    try {
                        const fechaEntrada = entrada.body.fechaEntrada
                        const fechaSalida = entrada.body.fechaSalida
                        const apartamentosIDVArreglo = entrada.body.apartamentosIDVArreglo

                        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;

                        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                        if (!filtroFecha.test(fechaEntrada)) {
                            const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000"
                            throw new Error(error)
                        }
                        if (!filtroFecha.test(fechaSalida)) {
                            const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000"
                            throw new Error(error)
                        }

                        if (typeof apartamentosIDVArreglo !== 'object' && !Array.isArray(apartamentosIDVArreglo)) {
                            const error = "El campo apartamentosIDVArreglo solo admite un arreglo"
                            throw new Error(error)
                        }

                        if (apartamentosIDVArreglo.length === 0) {
                            const error = "Anada al menos un apartmentoIDV en el arreglo"
                            throw new Error(error)
                        }

                        for (const apartamentoIDV of apartamentosIDVArreglo) {
                            if (!filtroCadenaSinEspacio.test(apartamentoIDV)) {
                                const error = "El identificador visual del apartmento, el apartmentoIDV solo puede estar hecho de minuscuals y numeros y nada mas, ni espacios"
                                throw new Error(error)
                            }
                        }
                        const metadatos = {
                            fechaEntrada: fechaEntrada,
                            fechaSalida: fechaSalida,
                            apartamentosIDVArreglo: apartamentosIDVArreglo
                        }

                        const preciosApartamentosResuelos = await precioRangoApartamento(metadatos)

                        const ok = {
                            ok: preciosApartamentosResuelos
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    }

                }
            },
            bloqueos: {
                IDX: {
                    ROL: ["administrador", "empleado"]
                },
                listarApartamentosConBloqueos: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()

                            const consultaApartamentosConBloqueo = `
                        SELECT
                        uid,
                        to_char(entrada, 'DD/MM/YYYY') as entrada, 
                        to_char(salida, 'DD/MM/YYYY') as salida, 
                        apartamento,
                        "tipoBloqueo"
                        FROM "bloqueosApartamentos";`
                            const resuelveApartamentosBloqueados = await conexion.query(consultaApartamentosConBloqueo)
                            const ok = {}
                            if (resuelveApartamentosBloqueados.rowCount === 0) {
                                ok.ok = []
                            }
                            if (resuelveApartamentosBloqueados.rowCount > 0) {
                                const bloqueosEncontrados = resuelveApartamentosBloqueados.rows
                                const apartamentosEncontradosConDuplicados = []
                                bloqueosEncontrados.map((detalleBloqueo) => {
                                    const apartamento = detalleBloqueo.apartamento
                                    apartamentosEncontradosConDuplicados.push(apartamento)

                                })
                                const apartamentosEncontrados = [...new Set(apartamentosEncontradosConDuplicados)];
                                const estructuraSalidaFinal = []
                                for (const apartamento of apartamentosEncontrados) {

                                    const apartamentoUI = await resolverApartamentoUI(apartamento)
                                    const conteoDeBloqueosPorApartamento = `
                                SELECT
                                apartamento
                                FROM "bloqueosApartamentos"
                                WHERE apartamento = $1;`
                                    const resuelveConteoDeBloqueosPorApartamento = await conexion.query(conteoDeBloqueosPorApartamento, [apartamento])
                                    const numeroDeBloqueosPorApartamento = resuelveConteoDeBloqueosPorApartamento.rowCount
                                    const estructuraFinal = {
                                        apartamentoIDV: apartamento,
                                        apartamentoUI: apartamentoUI,
                                        numeroDeBloqueos: numeroDeBloqueosPorApartamento,
                                    }
                                    estructuraSalidaFinal.push(estructuraFinal)
                                }
                                ok.ok = estructuraSalidaFinal
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)

                        }

                    }
                },
                listaBloquoeosDelApartamento: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV
                            const filtroCadena = /^[a-z0-9]+$/;
                            if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
                                const error = "el campo 'apartmentoIDV' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }
                            await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()

                            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                            const consultaDetallesBloqueoApartamento = `
                        SELECT
                        uid,
                        to_char(entrada, 'DD/MM/YYYY') as entrada, 
                        to_char(salida, 'DD/MM/YYYY') as salida, 
                        apartamento,
                        "tipoBloqueo",
                        motivo,
                        zona
                        FROM "bloqueosApartamentos"
                        WHERE apartamento = $1;`
                            const resuelveBloqueosPorApartmento = await conexion.query(consultaDetallesBloqueoApartamento, [apartamentoIDV])
                            const ok = {}

                            if (resuelveBloqueosPorApartmento.rowCount === 0) {
                                ok.ok = "No hay ningun bloqueo para el apartamento " + apartamentoUI
                            }

                            if (resuelveBloqueosPorApartmento.rowCount > 0) {
                                const bloqueosEncontradosDelApartamento = resuelveBloqueosPorApartmento.rows
                                const bloqueosDelApartamentoEntonctrado = []
                                bloqueosEncontradosDelApartamento.map((bloqueoDelApartamento) => {
                                    const uidBloqueo = bloqueoDelApartamento.uid
                                    const tipoBloqueo = bloqueoDelApartamento.tipoBloqueo
                                    const entrada = bloqueoDelApartamento.entrada
                                    const salida = bloqueoDelApartamento.salida
                                    const motivo = bloqueoDelApartamento.motivo
                                    const zona = bloqueoDelApartamento.zona

                                    const estructuraBloqueo = {
                                        uidBloqueo: uidBloqueo,
                                        tipoBloqueo: tipoBloqueo,
                                        entrada: entrada,
                                        salida: salida,
                                        motivo: motivo,
                                        zona: zona
                                    }
                                    bloqueosDelApartamentoEntonctrado.push(estructuraBloqueo)
                                })
                                ok.apartamentoIDV = apartamentoIDV
                                ok.apartamentoUI = apartamentoUI
                                ok.ok = bloqueosDelApartamentoEntonctrado
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)

                        }

                    }
                },
                detallesDelBloqueo: {
                    IDX: {
                        ROL: [
                            "administrador",
                            "empleado"
                        ]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV
                            const bloqueoUID = entrada.body.bloqueoUID
                            const filtroCadena = /^[a-z0-9]+$/;
                            if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
                                const error = "el campo 'apartmentoIDV' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }

                            if (typeof bloqueoUID !== "number" || !Number.isInteger(bloqueoUID) && bloqueoUID <= 0) {
                                const error = "la clave 'bloqueoUID' debe de tener un dato tipo 'number', positivo y entero"
                                throw new Error(error)
                            }
                            await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()

                            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                            const consultaDetallesBloqueo = `
                        SELECT
                        uid,
                        to_char(entrada, 'DD/MM/YYYY') as entrada, 
                        to_char(salida, 'DD/MM/YYYY') as salida, 
                        apartamento,
                        "tipoBloqueo",
                        motivo,
                        zona
                        FROM "bloqueosApartamentos"
                        WHERE apartamento = $1 AND uid = $2;`
                            const resuelveConsultaDetallesBloqueo = await conexion.query(consultaDetallesBloqueo, [apartamentoIDV, bloqueoUID])

                            if (resuelveConsultaDetallesBloqueo.rowCount === 0) {
                                const error = "No existe el bloqueo, comprueba el apartamentoIDV y el bloqueoUID"
                                throw new Error(error)
                            }

                            if (resuelveConsultaDetallesBloqueo.rowCount === 1) {
                                const bloqueosEncontradosDelApartamento = resuelveConsultaDetallesBloqueo.rows[0]

                                const uidBloqueo = bloqueosEncontradosDelApartamento.uid
                                const tipoBloqueo = bloqueosEncontradosDelApartamento.tipoBloqueo
                                const entrada = bloqueosEncontradosDelApartamento.entrada
                                const salida_ = bloqueosEncontradosDelApartamento.salida
                                const motivo = bloqueosEncontradosDelApartamento.motivo
                                const zona = bloqueosEncontradosDelApartamento.zona

                                const estructuraBloqueo = {
                                    uidBloqueo: uidBloqueo,
                                    tipoBloqueo: tipoBloqueo,
                                    entrada: entrada,
                                    salida: salida_,
                                    motivo: motivo,
                                    zona: zona
                                }
                                const ok = {}
                                ok.apartamentoIDV = apartamentoIDV
                                ok.apartamentoUI = apartamentoUI
                                ok.ok = estructuraBloqueo
                                salida.json(ok)

                            }

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }
                },
                eliminarBloqueo: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const bloqueoUID = entrada.body.bloqueoUID
                            if (typeof bloqueoUID !== "number" || !Number.isInteger(bloqueoUID) && bloqueoUID <= 0) {
                                const error = "la clave 'bloqueoUID' debe de tener un dato tipo 'number', positivo y entero"
                                throw new Error(error)
                            }

                            const seleccionarBloqueo = await conexion.query(`SELECT uid, apartamento FROM "bloqueosApartamentos" WHERE uid = $1`, [bloqueoUID])
                            if (seleccionarBloqueo.rowCount === 0) {
                                const error = "No existe el bloqueo que se desea eliminar"
                                throw new Error(error)
                            }
                            const apartmamentoIDV = seleccionarBloqueo.rows[0].apartamento
                            const ContarBloqueosPorApartamento = await conexion.query(`SELECT apartamento FROM "bloqueosApartamentos" WHERE apartamento = $1`, [apartmamentoIDV])
                            let tipoDeRetroceso

                            if (ContarBloqueosPorApartamento.rowCount === 1) {
                                tipoDeRetroceso = "aPortada"
                            }
                            if (ContarBloqueosPorApartamento.rowCount > 1) {
                                tipoDeRetroceso = "aApartamento"
                            }
                            const eliminarBloqueo = `
                        DELETE FROM "bloqueosApartamentos"
                        WHERE uid = $1;
                        `
                            const resuelveEliminarBloqueo = await conexion.query(eliminarBloqueo, [bloqueoUID])
                            if (resuelveEliminarBloqueo.rowCount === 0) {
                                const error = "No se ha eliminado el bloqueo"
                                throw new Error(error)
                            }
                            if (resuelveEliminarBloqueo.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha eliminado el bloqueo correctamente",
                                    tipoRetroceso: tipoDeRetroceso
                                }
                                salida.json(ok)
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }
                },
                eliminarBloqueoCaducado: async () => {
                    try {

                        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                        const tiempoZH = DateTime.now().setZone(zonaHoraria);
                        const fechaActual_ISO = tiempoZH.toISODate()

                        const eliminarBloqueo = `
                        DELETE FROM "bloqueosApartamentos"
                        WHERE salida < $1;
                        `
                        await conexion.query(eliminarBloqueo, [fechaActual_ISO])
                    } catch (errorCapturado) {
                        throw errorCapturado
                    }
                },
                modificarBloqueo: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const bloqueoUID = entrada.body.bloqueoUID
                            const tipoBloqueo = entrada.body.tipoBloqueo


                            const motivo = entrada.body.motivo
                            const zona = entrada.body.zonaBloqueo

                            if (typeof bloqueoUID !== "number" || !Number.isInteger(bloqueoUID) && bloqueoUID <= 0) {
                                const error = "la clave 'bloqueoUID' debe de tener un dato tipo 'number', positivo y entero"
                                throw new Error(error)
                            }

                            if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal") {
                                const error = "tipoBloqueo solo puede ser permanente o rangoTemporal"
                                throw new Error(error)
                            }
                            if (zona !== "global" && zona !== "publico" && zona !== "privado") {
                                const error = "zona solo puede ser global, publico o privado"
                                throw new Error(error)
                            }

                            const filtroTextoSimple = /^[^'"]+$/;

                            const validarFechaInicioSuperiorFechaFinal = async (fechaInicio_ISO, fechaFin_ISO) => {
                                const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO)
                                const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO)

                                if (fechaInicio_Objeto > fechaFin_Objeto) {
                                    const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo dia"
                                    throw new Error(error)
                                }

                                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                                const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
                                const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });


                                if (tiempoZH > fechaFin_TZ_Objeto) {
                                    const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos."
                                    throw new Error(error)
                                }

                            }

                            await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()

                            let fechaInicio_ISO = null
                            let fechaFin_ISO = null
                            if (tipoBloqueo === "rangoTemporal") {
                                const fechaInicio_Humano = entrada.body.fechaInicio
                                const fechaFin_Humano = entrada.body.fechaFin


                                const consultaFechasBloqueoActual = `
                            SELECT
                            to_char(entrada, 'DD/MM/YYYY') as "fechaInicioBloqueo_ISO", 
                            to_char(salida, 'DD/MM/YYYY') as "fechaFinBloqueo_ISO"
                            FROM 
                            "bloqueosApartamentos"
                            WHERE
                            uid = $1`
                                const validarFechaInicioExistente = await conexion.query(consultaFechasBloqueoActual, [bloqueoUID])
                                const fechaInicioBloqueo_ISO = validarFechaInicioExistente.rows[0].fechaInicioBloqueo_ISO
                                const fechaFinBloqueo_ISO = validarFechaInicioExistente.rows[0].fechaFinBloqueo_ISO



                                if (fechaInicio_Humano !== null) {
                                    fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio_Humano)).fecha_ISO
                                    await validarFechaInicioSuperiorFechaFinal(fechaInicio_ISO, fechaFinBloqueo_ISO)

                                }
                                if (fechaFin_Humano !== null) {
                                    fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin_Humano)).fecha_ISO
                                    await validarFechaInicioSuperiorFechaFinal(fechaInicioBloqueo_ISO, fechaFin_ISO)

                                }

                            }

                            if (motivo && !filtroTextoSimple.test(motivo)) {
                                const error = "Por temas de seguridad ahora mismo en el campo motivo, solo pueden aceptarse minúsculas, mayúsculas, espacio y numeros. Mas adelante se aceptaran todos los caracteres"
                                throw new Error(error)
                            }

                            const seleccionarBloqueo = await conexion.query(`SELECT uid FROM "bloqueosApartamentos" WHERE uid = $1`, [bloqueoUID])
                            if (seleccionarBloqueo.rowCount === 0) {
                                const error = "No existe el bloqueo, revisa el bloqueoUID"
                                throw new Error(error)
                            }

                            const modificarBloqueo = `
                        UPDATE "bloqueosApartamentos"
                        SET 
                        "tipoBloqueo" = COALESCE($1, "tipoBloqueo"),
                        entrada = COALESCE($2, entrada),
                        salida = COALESCE($3, salida),
                        motivo = COALESCE($4, motivo),
                        zona = COALESCE($5, zona)
                        WHERE uid = $6;
                        `

                            const datosParaActualizar = [
                                tipoBloqueo,
                                fechaInicio_ISO,
                                fechaFin_ISO,
                                motivo,
                                zona,
                                bloqueoUID
                            ]
                            const resuelveModificarBloqueo = await conexion.query(modificarBloqueo, datosParaActualizar)
                            if (resuelveModificarBloqueo.rowCount === 0) {
                                const error = "No se ha podido actualizar el bloqueo con los nuevo datos."
                                throw new Error(error)
                            }
                            if (resuelveModificarBloqueo.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha actualizado el bloqueo correctamente"
                                }
                                salida.json(ok)
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }
                },
                crearNuevoBloqueo: {
                    IDX: {
                        ROL: [
                            "administrador"
                        ]
                    },
                    X: async () => {
                        try {
                            const apartamentoIDV = entrada.body.apartamentoIDV
                            let tipoBloqueo = entrada.body.tipoBloqueo
                            let motivo = entrada.body.motivo
                            let zonaUI = entrada.body.zonaUI


                            const filtroApartamentoIDV = /^[a-z0-9]+$/;
                            if (!apartamentoIDV || typeof apartamentoIDV !== "string" || !filtroApartamentoIDV.test(apartamentoIDV)) {
                                const error = "el campo 'apartmentoIDV' solo puede ser letras minúsculas y numeros. Sin pesacios en formato cadena"
                                throw new Error(error)
                            }
                            await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()

                            const validarApartamenotIDV = `
                        SELECT
                        *
                        FROM "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1;`
                            const resuelveValidarApartmento = await conexion.query(validarApartamenotIDV, [apartamentoIDV])
                            if (resuelveValidarApartmento.rowCount === 0) {
                                const error = "No existe el identificador del apartamento"
                                throw new Error(error)
                            }

                            if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal") {
                                const error = "tipoBloqueo solo puede ser permanente o rangoTemporal"
                                throw new Error(error)
                            }
                            if (zonaUI !== "global" && zonaUI !== "publico" && zonaUI !== "privado") {
                                const error = "zona solo puede ser global, publico o privado"
                                throw new Error(error)
                            }
                            const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
                            let fechaInicio_ISO = null
                            let fechaFin_ISO = null
                            if (tipoBloqueo === "rangoTemporal") {
                                const fechaInicio = entrada.body.fechaInicio
                                const fechaFin = entrada.body.fechaFin

                                fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO
                                fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO

                                const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
                                const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);

                                if (fechaInicio_Objeto > fechaFin_Objeto) {
                                    const error = "La fecha de inicio del bloqueo no puede ser inferior a la fecha de fin del bloqueo, si puede ser igual para determinar un solo día."
                                    throw new Error(error)
                                }

                                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                                const tiempoZH = DateTime.now().setZone(zonaHoraria).startOf('day');
                                const fechaFin_TZ_Objeto = DateTime.fromISO(fechaFin_ISO, { zone: zonaHoraria });


                                if (tiempoZH > fechaFin_TZ_Objeto) {
                                    const error = "La fecha de fin del bloqueo no puede ser inferior a la fecha actual porque estarías creando un bloqueo enteramente en el pasado. Puedes crear un bloqueo que empieza en el pasado, pero debe que acabar en el futuro o en hoy. Los bloqueo que acaban en el pasado son automaticamente borrados por ser bloqueos caducos."
                                    throw new Error(error)
                                }
                            }

                            if (motivo) {
                                if (!filtroTextoSimple.test(motivo)) {
                                    const error = "Por temas de seguridad ahora mismo en el campo motivo, solo pueden aceptarse minúsculas, mayúsculas, espacio y números. Mas adelante se aceptarán todos los caracteres."
                                    throw new Error(error)
                                }

                            } else {
                                motivo = null
                            }

                            const insertarNuevoBloqueo = `
                            INSERT INTO "bloqueosApartamentos"
                            (
                            apartamento,
                            "tipoBloqueo",
                            entrada,
                            salida,
                            motivo,
                            zona
                            )
                            VALUES ($1, $2, $3, $4, $5, $6) RETURNING uid
                            `
                            const datosNuevoBloqueo = [
                                apartamentoIDV,
                                tipoBloqueo,
                                fechaInicio_ISO,
                                fechaFin_ISO,
                                motivo,
                                zonaUI
                            ]
                            const resuelveInsertarNuevoBloqueo = await conexion.query(insertarNuevoBloqueo, datosNuevoBloqueo)
                            if (resuelveInsertarNuevoBloqueo.rowCount === 0) {
                                const error = "No se ha podido insertar el nuevo bloqueo"
                                throw new Error(error)
                            }

                            if (resuelveInsertarNuevoBloqueo.rowCount === 1) {
                                const nuevoUIDBloqueo = resuelveInsertarNuevoBloqueo.rows[0].uid
                                const ok = {
                                    ok: "Se ha creado el bloqueo correctamente",
                                    nuevoBloqueoUID: nuevoUIDBloqueo,
                                    apartamentoIDV: apartamentoIDV
                                }
                                salida.json(ok)
                            }

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }
                }
            },
            enlacesDePago: {
                obtenerEnlaces: async () => {
                    try {
                        await controlCaducidadEnlacesDePago()

                        const consultaEnlaces = `
                        SELECT
                        "nombreEnlace", 
                        reserva,
                        codigo,
                        "enlaceUID",
                        caducidad,
                        cantidad,
                        "estadoPago",
                        descripcion
                        FROM "enlacesDePago"
                        ORDER BY 
                        "enlaceUID" DESC;`
                        const resuelveConsultaEnlaces = await conexion.query(consultaEnlaces)
                        const ok = {
                            ok: []
                        }
                        if (resuelveConsultaEnlaces.rowCount > 0) {
                            const enlacesGenerados = resuelveConsultaEnlaces.rows

                            for (const detallesEnlace of enlacesGenerados) {
                                const nombreEnlace = detallesEnlace.nombreEnlace
                                const enlaceUID = detallesEnlace.enlaceUID
                                const reservaUID = detallesEnlace.reserva
                                const codigo = detallesEnlace.codigo
                                const estadoPago = detallesEnlace.estadoPago
                                const cantidad = detallesEnlace.cantidad
                                const descripcion = detallesEnlace.descripcion
                                const totalIDV = "totalConImpuestos"
                                const consultaPrecioCentralizado = `
                                SELECT
                                "totalConImpuestos"
                                FROM "reservaTotales"
                                WHERE 
                                    reserva = $1;`
                                const resuelveConsultaPrecioCentralizado = await conexion.query(consultaPrecioCentralizado, [reservaUID])
                                let precio
                                if (resuelveConsultaPrecioCentralizado.rowCount === 0) {
                                    precio = "Reserva sin total"
                                }
                                if (resuelveConsultaPrecioCentralizado.rowCount === 1) {
                                    precio = resuelveConsultaPrecioCentralizado.rows[0].totalConImpuestos
                                }

                                const estructuraFinal = {
                                    enlaceUID: enlaceUID,
                                    nombreEnlace: nombreEnlace,
                                    reservaUID: reservaUID,
                                    estadoPago: estadoPago,
                                    descripcion: descripcion,
                                    enlace: codigo,
                                    cantidad: cantidad,
                                    totalReserva: precio,
                                }
                                ok.ok.push(estructuraFinal)
                            }

                        }
                        salida.json(ok)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)

                    }
                },
                detallesDelEnlace: async () => {
                    try {
                        const enlaceUID = entrada.body.enlaceUID
                        const filtroCadena = /^[0-9]+$/;
                        if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                            const error = "el campo 'enlaceUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                            throw new Error(error)
                        }
                        await controlCaducidadEnlacesDePago()

                        const consultaDetallesEnlace = `
                        SELECT
                        "nombreEnlace", 
                        codigo, 
                        reserva,
                        cantidad,
                        "estadoPago",
                        TO_CHAR(caducidad AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS caducidad
                        FROM "enlacesDePago"
                        WHERE "enlaceUID" = $1;`
                        const resuelveConsultaDetallesEnlace = await conexion.query(consultaDetallesEnlace, [enlaceUID])

                        if (resuelveConsultaDetallesEnlace.rowCount === 0) {
                            const error = "noExisteElEnlace"
                            throw new Error(error)
                        }
                        if (resuelveConsultaDetallesEnlace.rowCount === 1) {
                            const detallesEnlace = resuelveConsultaDetallesEnlace.rows[0]
                            const nombreEnlace = detallesEnlace.nombreEnlace
                            const codigo = detallesEnlace.codigo
                            const descripcion = detallesEnlace.descripcion
                            const reserva = detallesEnlace.reserva
                            const cantidad = detallesEnlace.cantidad
                            const caducidad = detallesEnlace.caducidad


                            const caducidadUTC = utilidades.convertirFechaUTCaHumano(caducidad)


                            const caducidadMadrid = utilidades.deUTCaZonaHoraria(caducidad, "Europe/Madrid")
                            const caducidadNicaragua = utilidades.deUTCaZonaHoraria(caducidad, "America/Managua")

                            const consultaEstadoPago = `
                            SELECT
                            "estadoPago"
                            FROM reservas
                            WHERE reserva = $1;`

                            const resuelveConsultaEstadoPago = await conexion.query(consultaEstadoPago, [reserva])
                            const estadoPago = resuelveConsultaEstadoPago.rows[0].estadoPago

                            const ok = {
                                ok: {
                                    enlaceUID: enlaceUID,
                                    nombreEnlace: nombreEnlace,
                                    codigo: codigo,
                                    reserva: reserva,
                                    cantidad: cantidad,
                                    estadoPago: estadoPago,
                                    caducidadUTC: caducidadUTC,
                                    caducidadMadrid: caducidadMadrid,
                                    caducidadNicaragua: caducidadNicaragua
                                }
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {}
                        if (errorCapturado.message === "noExisteElEnlace") {
                            error.error = errorCapturado.message
                            error.noExisteElEnlace = "reservaSinEnlace"
                        } else {
                            error.error = errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                eliminarEnlace: async () => {
                    try {
                        const enlaceUID = entrada.body.enlaceUID

                        const filtroCadena = /^[0-9]+$/;
                        if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                            const error = "el campo 'enlaceUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                            throw new Error(error)
                        }

                        const seleccionarEnlace = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID])
                        if (seleccionarEnlace.rowCount === 0) {
                            const error = "No existe el enlace de pago"
                            throw new Error(error)
                        }
                        const eliminarEnlace = `
                        DELETE FROM "enlacesDePago"
                        WHERE "enlaceUID" = $1;
                        `
                        const resuelveEliminarEnlace = await conexion.query(eliminarEnlace, [enlaceUID])
                        if (resuelveEliminarEnlace.rowCount === 0) {
                            const error = "No existe el enlace"
                            throw new Error(error)
                        }
                        if (resuelveEliminarEnlace.rowCount === 1) {
                            const ok = {
                                ok: "Se ha eliminado el enlace correctamente"
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                modificarEnlace: async () => {
                    try {
                        const enlaceUID = entrada.body.enlaceUID
                        const nombreEnlace = entrada.body.nombreEnlace
                        const cantidad = entrada.body.cantidad
                        let horasCaducidad = entrada.body.horasCaducidad
                        const descripcion = entrada.body.descripcion

                        const filtroCadena = /^[0-9]+$/;

                        if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                            const error = "el campo 'enlaceUID' solo puede ser una cadena de numeros."
                            throw new Error(error)
                        }

                        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
                        if (!nombreEnlace || !filtroTextoSimple.test(nombreEnlace)) {
                            const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                            throw new Error(error)
                        }
                        if (descripcion) {
                            if (!filtroTextoSimple.test(descripcion)) {
                                const error = "el campo 'descripcion' solo puede ser una cadena de letras, numeros y espacios."
                                throw new Error(error)
                            }
                        }

                        if (horasCaducidad) {
                            if (!filtroCadena.test(horasCaducidad)) {
                                const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00."
                                throw new Error(error)
                            }
                        } else {
                            horasCaducidad = 72
                        }
                        if (!cantidad || !filtroDecimales.test(cantidad)) {
                            const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00."
                            throw new Error(error)
                        }
                        await controlCaducidadEnlacesDePago()

                        const validarEnlaceUID = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID])
                        if (validarEnlaceUID.rowCount === 0) {
                            const error = "No existe el enlace de pago verifica el enlaceUID"
                            throw new Error(error)
                        }
                        const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
                        const actualizarEnlace = `
                        UPDATE "enlacesDePago"
                        SET 
                        "nombreEnlace" = $1,
                        descripcion = $2,
                        cantidad = $3,
                        caducidad = $4
                        WHERE reserva = $5;
                        `

                        const datosParaActualizar = [
                            nombreEnlace,
                            descripcion,
                            cantidad,
                            fechaDeCaducidad
                        ]
                        const resuelveActualizarEnlace = await conexion.query(actualizarEnlace, datosParaActualizar)
                        if (resuelveActualizarEnlace.rowCount === 0) {
                            const error = "No se ha podido actualizar los datos del enlace, reintentalo."
                            throw new Error(error)
                        }
                        if (resuelveActualizarEnlace.rowCount === 1) {
                            const ok = {
                                "ok": "Se ha actualizado corratmente los datos del enlace"
                            }
                            salida.json(ok)
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                crearNuevoEnlace: async () => {
                    try {
                        let nombreEnlace = entrada.body.nombreEnlace
                        const reservaUID = entrada.body.reservaUID
                        const cantidad = entrada.body.cantidad
                        let horasCaducidad = entrada.body.horasCaducidad

                        const filtroCadena = /^[0-9]+$/;
                        const filtroDecimales = /^\d+\.\d{2}$/;
                        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;

                        if (horasCaducidad) {
                            if (!filtroCadena.test(horasCaducidad)) {
                                const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00."
                                throw new Error(error)
                            }
                        } else {
                            horasCaducidad = 72
                        }

                        if (!cantidad || !filtroDecimales.test(cantidad)) {
                            const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00."
                            throw new Error(error)
                        }
                        if (nombreEnlace) {
                            if (!filtroTextoSimple.test(nombreEnlace)) {
                                const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                                throw new Error(error)
                            }
                        } else {
                            nombreEnlace = `Enlace de pago de la reserva ${reservaUID}`
                        }

                        const descripcion = entrada.body.descripcion
                        if (descripcion) {
                            if (!filtroTextoSimple.test(descripcion)) {
                                const error = "el campo 'descripcion' solo puede ser una cadena de letras, numeros y espacios."
                                throw new Error(error)
                            }
                        }
                        await controlCaducidadEnlacesDePago()
                        const resuelveValidarReserva = await validadoresCompartidos.reservas.validarReserva(reservaUID)

                        const estadoReserva = resuelveValidarReserva.estadoReserva
                        const estadoPago = resuelveValidarReserva.estadoPago
                        if (estadoReserva === "cancelada") {
                            const error = "No se puede generar un enlace de pago una reserva cancelada"
                            throw new Error(error)
                        }
                        if (estadoReserva !== "confirmada") {
                            const error = "No se puede generar un enlace de pago una reserva que no esta confirmada por que entonces el cliente podria pagar una reserva cuyo alojamiento no esta garantizado, reservado sin pagar vamos"
                            throw new Error(error)
                        }

                        const generarCadenaAleatoria = (longitud) => {
                            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                            let cadenaAleatoria = '';

                            for (let i = 0; i < longitud; i++) {
                                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                            }
                            return cadenaAleatoria;
                        }

                        const validarCodigo = async (codigoAleatorio) => {
                            const validarCodigoAleatorio = `
                            SELECT
                            codigo
                            FROM "enlacesDePago"
                            WHERE codigo = $1;`
                            const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio])

                            if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                                return true
                            }
                        }

                        const controlCodigo = async () => {
                            const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                            let codigoGenerado;
                            let codigoExiste;
                            do {
                                codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                                codigoExiste = await validarCodigo(codigoGenerado);
                            } while (codigoExiste);

                            // En este punto, tenemos un código único que no existe en la base de datos
                            return codigoGenerado;
                        }

                        const codigoAleatorioUnico = await controlCodigo();

                        const fechaActual = new Date();
                        const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
                        const estadoPagoInicial = "noPagado"
                        const insertarEnlace = `
                            INSERT INTO "enlacesDePago"
                            (
                            "nombreEnlace",
                            reserva,
                            descripcion,
                            caducidad,
                            cantidad,
                            codigo,
                            "estadoPago"
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7) 
                            RETURNING
                            "enlaceUID",
                            "nombreEnlace",
                            cantidad,
                            codigo
                            `
                        const datosEnlace = [
                            nombreEnlace,
                            reservaUID,
                            descripcion,
                            fechaDeCaducidad,
                            cantidad,
                            codigoAleatorioUnico,
                            estadoPagoInicial
                        ]
                        const resuelveInsertarEnlace = await conexion.query(insertarEnlace, datosEnlace)
                        if (resuelveInsertarEnlace.rowCount === 0) {
                            const error = "No se ha podido insertar el nuevo enlace, reintentalo"
                            throw new Error(error)
                        }

                        if (resuelveInsertarEnlace.rowCount === 1) {
                            const enlaceUID = resuelveInsertarEnlace.rows[0].enlaceUID
                            const nombreEnlace = resuelveInsertarEnlace.rows[0].nombreEnlace
                            const cantidad = resuelveInsertarEnlace.rows[0].cantidad
                            const enlace = resuelveInsertarEnlace.rows[0].codigo
                            const ok = {
                                ok: "Se ha creado el enlace correctamente",
                                enlaceUID: enlaceUID,
                                nombreEnlace: nombreEnlace,
                                cantidad: cantidad,
                                enlace: enlace
                            }
                            salida.json(ok)
                        }

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                }

            },
            arquitectura: {
                entidades: {
                    IDX: {
                        ROL: ["administrador"]
                    },
                    listarEntidadesAlojamiento: async () => {
                        try {
                            const estructuraFinal = {}
                            const consultaApartamento = `
                            SELECT
                            apartamento,
                            "apartamentoUI"
                            FROM apartamentos
                            ;`
                            const resuleveConsultaApartamento = await conexion.query(consultaApartamento)
                            if (resuleveConsultaApartamento.rowCount > 0) {
                                const apartamentoEntidad = resuleveConsultaApartamento.rows
                                estructuraFinal.apartamentos = apartamentoEntidad
                            }
                            const consultaHabitaciones = `
                            SELECT
                            habitacion,
                            "habitacionUI"
                            FROM habitaciones
                            ;`
                            const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones)
                            if (resuelveConsultaHabitaciones.rowCount > 0) {
                                const habitacionEntidad = resuelveConsultaHabitaciones.rows
                                estructuraFinal.habitaciones = habitacionEntidad
                            }
                            const consultaCamas = `
                            SELECT
                            cama,
                            "camaUI"
                            FROM camas
                            ;`
                            const resuelveConsultaCamas = await conexion.query(consultaCamas)
                            if (resuelveConsultaCamas.rowCount > 0) {
                                const camaEntidades = resuelveConsultaCamas.rows
                                estructuraFinal.camas = camaEntidades
                            }
                            const ok = {
                                "ok": estructuraFinal
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    listarApartamentosComoEntidades: async () => {
                        try {
                            const estructuraApartamentosObjeto = {}
                            const consultaApartamento = `
                            SELECT
                            apartamento,
                            "apartamentoUI"
                            FROM apartamentos;`
                            const resuleveConsultaApartamento = await conexion.query(consultaApartamento)
                            if (resuleveConsultaApartamento.rowCount === 0) {
                                const ok = {
                                    "ok": "No existe ningun apartamento como entidad, por favor crea uno para poder construir una configuracion de alojamiento sobre el",
                                    "apartamentosComoEntidadesDisponibles": []
                                }
                                salida.json(ok)
                            }

                            if (resuleveConsultaApartamento.rowCount > 0) {
                                const apartamentoEntidades = resuleveConsultaApartamento.rows

                                apartamentoEntidades.map((detallesApartamento) => {
                                    const apartamentoIDV = detallesApartamento.apartamento
                                    const apartamentoUI = detallesApartamento.apartamento
                                    estructuraApartamentosObjeto[apartamentoIDV] = apartamentoUI


                                })

                                const apartamentosComoEntidades_formatoArrayString = []

                                apartamentoEntidades.map((detallesDelApartamento) => {
                                    const apartamentoIDV = detallesDelApartamento.apartamento
                                    apartamentosComoEntidades_formatoArrayString.push(apartamentoIDV)
                                })


                                const consultaConfiguraciones = `
                                SELECT
                                "apartamentoIDV"
                                FROM "configuracionApartamento"
                                ;`
                                const resuelveConsultaApartamento = await conexion.query(consultaConfiguraciones)
                                const apartamentoConfiguraciones = resuelveConsultaApartamento.rows

                                const apartamentosIDVConfiguraciones_formatoArrayString = []

                                apartamentoConfiguraciones.map((detallesapartamento) => {
                                    const apartamentoIDV = detallesapartamento.apartamentoIDV
                                    apartamentosIDVConfiguraciones_formatoArrayString.push(apartamentoIDV)


                                })




                                const apartamentosDisponiblesParaConfigurar = apartamentosComoEntidades_formatoArrayString.filter(entidad => !apartamentosIDVConfiguraciones_formatoArrayString.includes(entidad));

                                const estructuraFinal = []

                                for (const apartamentoDisponible of apartamentosDisponiblesParaConfigurar) {
                                    if (estructuraApartamentosObjeto[apartamentoDisponible]) {
                                        const estructuraFinalObjeto = {
                                            apartamentoIDV: apartamentoDisponible,
                                            apartamentoUI: estructuraApartamentosObjeto[apartamentoDisponible]
                                        }
                                        estructuraFinal.push(estructuraFinalObjeto)
                                    }

                                }
                                const ok = {
                                    "ok": "Apartamento especificos disponbiles",
                                    "apartamentosComoEntidadesDisponibles": estructuraFinal
                                }
                                salida.json(ok)


                            }







                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    detallesDeEntidadDeAlojamiento: async () => {
                        try {
                            const tipoEntidad = entrada.body.tipoEntidad
                            const entidadIDV = entrada.body.entidadIDV

                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
                            const filtroCadenaMinusculasConEspacios = /^[a-z0-9\s]+$/i;
                            const filtroCadenaMinusculasMayusculasYEspacios = /^[a-zA-Z0-9\s]+$/;


                            if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
                                const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios"
                                throw new Error(error)
                            }
                            if (!entidadIDV || !filtroCadenaMinusculasSinEspacios.test(entidadIDV)) {
                                const error = "el campo 'entidadIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                throw new Error(error)
                            }


                            if (tipoEntidad === "apartamento") {
                                const consultaDetalles = `
                                SELECT 
                                apartamento,
                                "apartamentoUI"
                                FROM apartamentos 
                                WHERE apartamento = $1;`
                                const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV])
                                if (resuelveConsultaDetalles.rowCount === 0) {
                                    const error = "No existe el apartamento"
                                    throw new Error(error)

                                }
                                if (resuelveConsultaDetalles.rowCount === 1) {
                                    const consultaCaracteristicas = `
                                    SELECT 
                                    caracteristica
                                    FROM "apartamentosCaracteristicas" 
                                    WHERE "apartamentoIDV" = $1;`
                                    const resuelveCaracteristicas = await conexion.query(consultaCaracteristicas, [entidadIDV])
                                    const ok = {
                                        ok: resuelveConsultaDetalles.rows,
                                        caracteristicas: resuelveCaracteristicas.rows
                                    }
                                    salida.json(ok)
                                }
                            }

                            if (tipoEntidad === "habitacion") {
                                const consultaDetalles = `
                                SELECT 
                                habitacion,
                                "habitacionUI"
                                FROM habitaciones 
                                WHERE habitacion = $1;`
                                const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV])
                                if (resuelveConsultaDetalles.rowCount === 0) {
                                    const error = "No existe la habitacion"
                                    throw new Error(error)

                                }
                                if (resuelveConsultaDetalles.rowCount === 1) {
                                    const ok = {
                                        ok: resuelveConsultaDetalles.rows
                                    }
                                    salida.json(ok)
                                }
                            }
                            if (tipoEntidad === "cama") {
                                const consultaDetalles = `
                                SELECT 
                                cama,
                                "camaUI",
                                capacidad
                                FROM camas
                                WHERE cama = $1;`
                                const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV])
                                if (resuelveConsultaDetalles.rowCount === 0) {

                                    const error = "No existe la cama"
                                    throw new Error(error)
                                }
                                if (resuelveConsultaDetalles.rowCount === 1) {
                                    const ok = {
                                        ok: resuelveConsultaDetalles.rows
                                    }
                                    salida.json(ok)
                                }
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }








                    },
                    crearEntidadAlojamiento: async () => {
                        try {
                            const tipoEntidad = entrada.body.tipoEntidad

                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
                            const filtroCadenaMinusculasConEspacios = /^[a-z0-9\s]+$/i;
                            const filtroCadenaMinusculasMayusculasYEspacios = /^[a-zA-Z0-9\s]+$/;


                            if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
                                const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios"
                                throw new Error(error)
                            }

                            if (tipoEntidad === "apartamento") {

                                let apartamentoIDV = entrada.body.apartamentoIDV
                                let apartamentoUI = entrada.body.apartamentoUI


                                apartamentoUI = apartamentoUI.replace(/['"]/g, '');
                                if (!apartamentoUI || !filtroCadenaMinusculasSinEspacios.test(apartamentoUI) || apartamentoUI.length > 50) {
                                    const error = "el campo 'apartamentoUI' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres"
                                    throw new Error(error)
                                }
                                if (!apartamentoIDV) {
                                    apartamentoIDV = apartamentoUI.replace(/[^a-z0-9]/g, '');

                                } else {
                                    apartamentoIDV = apartamentoIDV.replace(/[^a-z0-9]/g, '');
                                }



                                const validarCodigo = async (apartamentoIDV) => {
                                    const validarCodigoAleatorio = `
                                    SELECT
                                    apartamento
                                    FROM apartamentos
                                    WHERE apartamento = $1;`
                                    const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [apartamentoIDV])

                                    if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                                        return true
                                    }
                                }

                                const controlApartamentoIDV = async (apartamentoIDV) => {
                                    let codigoGenerado = apartamentoIDV;
                                    let codigoExiste;
                                    do {
                                        codigoExiste = await validarCodigo(codigoGenerado);

                                        if (codigoExiste) {
                                            // Si el código ya existe, agrega un cero al final y vuelve a verificar
                                            codigoGenerado = codigoGenerado + "0";
                                        }
                                    } while (codigoExiste);
                                    return codigoGenerado
                                }

                                apartamentoIDV = await controlApartamentoIDV(apartamentoIDV);




                                const validarIDV = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE apartamento = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV])
                                if (resuelveValidarIDV.rowCount === 1) {
                                    const error = "Ya existe un identificador visual igual que el apartamento que propones, escoge otro"
                                    throw new Error(error)
                                }


                                const validarUI = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE "apartamentoUI" = $1
                                `
                                const resuelveValidarUI = await conexion.query(validarUI, [apartamentoUI])
                                if (resuelveValidarUI.rowCount === 1) {
                                    const error = "Ya existe un apartamento con ese nombre, por tema de legibilidad escoge otro"
                                    throw new Error(error)
                                }


                                const crearEntidad = `
                                INSERT INTO apartamentos
                                (
                                apartamento,
                                "apartamentoUI"
                                )
                                VALUES 
                                (
                                $1,
                                $2
                                )
                                RETURNING apartamento
                                `
                                const matriozDatosNuevaEntidad = [
                                    apartamentoIDV,
                                    apartamentoUI
                                ]
                                const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad)
                                if (resuelveCrearEntidad.rowCount === 0) {
                                    const error = "No se ha podido crear la nueva entidad"
                                    throw new Error(error)
                                }
                                if (resuelveCrearEntidad.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha creado correctament la nuevo entidad como apartamento",
                                        nuevoUID: resuelveCrearEntidad.rows[0].apartamento
                                    }
                                    salida.json(ok)
                                }
                            }

                            if (tipoEntidad === "habitacion") {

                                let habitacionIDV = entrada.body.habitacionIDV
                                let habitacionUI = entrada.body.habitacionUI

                                habitacionUI = habitacionUI.replace(/['"]/g, '');
                                if (!habitacionUI || !filtroCadenaMinusculasSinEspacios.test(habitacionUI) || habitacionUI.length > 50) {
                                    const error = "el campo 'habitacionUI' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres"
                                    throw new Error(error)
                                }

                                if (!habitacionIDV) {
                                    habitacionIDV = habitacionUI.replace(/[^a-z0-9]/g, '');

                                } else {
                                    habitacionIDV = habitacionIDV.replace(/[^a-z0-9]/g, '');
                                }


                                const validarCodigo = async (habitacionIDV) => {
                                    const validarCodigoAleatorio = `
                                    SELECT
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1;`
                                    const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [habitacionIDV])

                                    if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                                        return true
                                    }
                                }

                                const controlHabitacionIDV = async (habitacionIDV) => {
                                    let codigoGenerado = habitacionIDV;
                                    let codigoExiste;
                                    do {
                                        codigoExiste = await validarCodigo(codigoGenerado);

                                        if (codigoExiste) {
                                            // Si el código ya existe, agrega un cero al final y vuelve a verificar
                                            codigoGenerado = codigoGenerado + "0";
                                        }
                                    } while (codigoExiste);
                                    return codigoGenerado
                                }

                                habitacionIDV = await controlHabitacionIDV(habitacionIDV);




                                const validarIDV = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE habitacion = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [habitacionIDV])
                                if (resuelveValidarIDV.rowCount === 1) {
                                    const error = "Ya existe un identificador visual igual que el que propones, escoge otro"
                                    throw new Error(error)
                                }


                                const validarUI = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE "habitacionUI" = $1
                                `
                                const resuelveValidarUI = await conexion.query(validarUI, [habitacionUI])
                                if (resuelveValidarUI.rowCount === 1) {
                                    const error = "Ya existe un nombre de la habitacion exactamente igual, por tema de legibilidad escoge otro"
                                    throw new Error(error)
                                }


                                const crearEntidad = `
                                INSERT INTO habitaciones
                                (
                                habitacion,
                                "habitacionUI"
                                )
                                VALUES 
                                (
                                $1,
                                $2
                                )
                                RETURNING habitacion
                                `
                                const matriozDatosNuevaEntidad = [
                                    habitacionIDV,
                                    habitacionUI,
                                ]
                                let resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad)
                                if (resuelveCrearEntidad.rowCount === 0) {
                                    const error = "No se ha podido crear la nueva entidad"
                                    throw new Error(error)
                                }
                                if (resuelveCrearEntidad.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha creado correctament la nuevo entidad como habitacion",
                                        nuevoUID: resuelveCrearEntidad.rows[0].habitacion
                                    }
                                    salida.json(ok)
                                }
                            }
                            if (tipoEntidad === "cama") {
                                let camaIDV = entrada.body.camaIDV
                                let camaUI = entrada.body.camaUI
                                let capacidad = entrada.body.capacidad

                                camaUI = camaUI.replace(/['"]/g, '');
                                if (!camaUI || !filtroCadenaMinusculasSinEspacios.test(camaUI) || camaUI.length > 50) {
                                    const error = "el campo 'camaUI' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres."
                                    throw new Error(error)
                                }

                                if (!camaIDV) {
                                    camaIDV = camaUI.replace(/[^a-z0-9]/g, '');

                                } else {
                                    camaIDV = camaIDV.replace(/[^a-z0-9]/g, '');
                                }

                                const validarCodigo = async (camaIDV) => {
                                    const validarCodigoAleatorio = `
                                    SELECT
                                    *
                                    FROM camas
                                    WHERE cama = $1;`
                                    const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [camaIDV])

                                    if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                                        return true
                                    }
                                }

                                const controlCamaIDV = async (camaIDV) => {
                                    let codigoGenerado = camaIDV;
                                    let codigoExiste;
                                    do {
                                        codigoExiste = await validarCodigo(codigoGenerado);

                                        if (codigoExiste) {
                                            // Si el código ya existe, agrega un cero al final y vuelve a verificar
                                            codigoGenerado = codigoGenerado + "0";
                                        }
                                    } while (codigoExiste);
                                    return codigoGenerado
                                }

                                camaIDV = await controlCamaIDV(camaIDV);

                                const filtroSoloNumeros = /^\d+$/;
                                if (filtroSoloNumeros.test(capacidad)) {
                                    capacidad = parseInt(capacidad);
                                }
                                if (!capacidad || !Number.isInteger(capacidad) || capacidad < 0) {
                                    const error = "el campo 'capacidad' solo puede ser numeros, entero y positivo"
                                    throw new Error(error)
                                }


                                const validarIDV = `
                                SELECT 
                                *
                                FROM camas
                                WHERE cama = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [camaIDV])
                                if (resuelveValidarIDV.rowCount === 1) {
                                    const error = "Ya existe un identificador visual igual que la cama que propones, escoge otro"
                                    throw new Error(error)
                                }

                                const validarUI = `
                                SELECT 
                                *
                                FROM camas
                                WHERE "camaUI" = $1
                                `
                                const resuelveValidarUI = await conexion.query(validarUI, [camaUI])
                                if (resuelveValidarUI.rowCount === 1) {
                                    const error = "Ya existe una cama con ese nombre, por tema de legibilidad escoge otro"
                                    throw new Error(error)
                                }

                                const crearEntidad = `
                                INSERT INTO camas
                                (
                                cama,
                                "camaUI",
                                capacidad
                                )
                                VALUES 
                                (
                                $1,
                                $2,
                                $3
                                )
                                RETURNING cama
                                `
                                const matriozDatosNuevaEntidad = [
                                    camaIDV,
                                    camaUI,
                                    capacidad
                                ]
                                const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad)
                                if (resuelveCrearEntidad.rowCount === 0) {
                                    const error = "No se ha podido crear la nueva entidad"
                                    throw new Error(error)
                                }
                                if (resuelveCrearEntidad.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha creado correctament la nuevo entidad como cama",
                                        nuevoUID: resuelveCrearEntidad.rows[0].cama
                                    }
                                    salida.json(ok)
                                }
                            }





                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    modificarEntidadAlojamiento: async () => {
                        try {
                            const tipoEntidad = entrada.body.tipoEntidad
                            const entidadIDV = entrada.body.entidadIDV

                            const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                            const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
                            const filtroCadenaMinusculasConEspacios = /^[a-z0-9\s]+$/i;
                            const filtroCadenaMinusculasMayusculasYEspacios = /^[a-zA-Z0-9\s]+$/;

                            if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
                                const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios"
                                throw new Error(error)
                            }
                            if (!entidadIDV || !filtroCadenaMinusculasSinEspacios.test(entidadIDV)) {
                                const error = "el campo 'entidadIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                throw new Error(error)
                            }

                            if (tipoEntidad === "apartamento") {

                                const apartamentoIDV = entrada.body.apartamentoIDV
                                let apartamentoUI = entrada.body.apartamentoUI
                                const caracteristicas = entrada.body.caracteristicas

                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV) || apartamentoIDV.length > 50) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres."
                                    throw new Error(error)
                                }
                                apartamentoUI = apartamentoUI.replace(/['"]/g, '');
                                /*
                                if (!apartamentoUI || !filtroCadenaMinusculasMayusculasYEspacios.test(apartamentoUI)) {
                                    const error = "el campo 'apartamentoUI' solo puede ser letras minúsculas, mayúsculas, numeros y espacios"
                                    throw new Error(error)
                                }
                                */


                                if (!Array.isArray(caracteristicas)) {
                                    const error = "el campo 'caractaristicas' solo puede ser un array"
                                    throw new Error(error)
                                }
                                const filtroCaracteristica = /^[a-zA-Z0-9\s.,_\-\u00F1ñ]+$/u;

                                for (const caractaristica of caracteristicas) {
                                    if (!filtroCaracteristica.test(caractaristica)) {
                                        const error = "Revisa las caracteristicas por que hay una que no cumple con el formato esperado. Recuerda que los campo de caracteristicas solo aceptan mayusculas, minusculas, numeros, espacios, puntos, comas, guion bajo y medio y nada mas"
                                        throw new Error(error)
                                    }
                                }




                                const validarIDV = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE apartamento = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe el apartamento, revisa el apartamentopIDV"
                                    throw new Error(error)
                                }

                                // Comprobar que no existe el nuevo IDV
                                if (entidadIDV !== apartamentoIDV) {
                                    const validarNuevoIDV = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE apartamento = $1
                                    `
                                    const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [apartamentoIDV])
                                    if (resuelveValidarNuevoIDV.rowCount === 1) {
                                        const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor"
                                        throw new Error(error)
                                    }
                                }

                                const guardarCambios = `
                                UPDATE apartamentos
                                SET 
                                apartamento= COALESCE($1, apartamento),
                                "apartamentoUI" = COALESCE($2, "apartamentoUI")
                                WHERE apartamento = $3
                                `
                                const matrizCambios = [
                                    apartamentoIDV,
                                    apartamentoUI,
                                    entidadIDV
                                ]
                                const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios)
                                if (resuelveGuardarCambios.rowCount === 0) {
                                    const error = "No se ha podido guardar los datos por que no se han encontrado el apartamento"
                                    throw new Error(error)
                                }
                                if (resuelveGuardarCambios.rowCount === 1) {

                                    const eliminarEntidad = `
                                    DELETE FROM "apartamentosCaracteristicas"
                                    WHERE "apartamentoIDV" = $1;
                                    `
                                    await conexion.query(eliminarEntidad, [apartamentoIDV])

                                    if (caracteristicas.length > 0) {

                                        const insertarCaracteristicas = `
                                        INSERT INTO "apartamentosCaracteristicas" (caracteristica, "apartamentoIDV")
                                        SELECT unnest($1::text[]), $2
                                        `;

                                        await conexion.query(insertarCaracteristicas, [caracteristicas, apartamentoIDV])
                                    }

                                    const ok = {
                                        ok: "Se ha actualizado correctamente el apartamento"
                                    }
                                    salida.json(ok)
                                }
                            }
                            if (tipoEntidad === "habitacion") {

                                const habitacionIDV = entrada.body.habitacionIDV
                                let habitacionUI = entrada.body.habitacionUI

                                if (!habitacionIDV || !filtroCadenaMinusculasSinEspacios.test(habitacionIDV) || habitacionIDV.length > 50) {
                                    const error = "el campo 'habitacionIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres"
                                    throw new Error(error)
                                }
                                habitacionUI = habitacionUI.replace(/['"]/g, '');
                                /*
                                if (!habitacionUI || !filtroCadenaMinusculasMayusculasYEspacios.test(habitacionUI)) {
                                    const error = "el campo 'habitacionUI' solo puede ser letras mayúsculas, minúsculas, numeros y espacios"
                                    throw new Error(error)
                                }
                                */
                                const validarIDV = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE habitacion = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe la habitacion, revisa el habitacionIDV"
                                    throw new Error(error)
                                }

                                // Comprobar que no existe el nuevo IDV
                                if (entidadIDV !== habitacionIDV) {
                                    const validarNuevoIDV = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1
                                    `
                                    const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [habitacionIDV])
                                    if (resuelveValidarNuevoIDV.rowCount === 1) {
                                        const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor"
                                        throw new Error(error)
                                    }
                                }

                                const guardarCambios = `
                                UPDATE habitaciones
                                SET 
                                habitacion = COALESCE($1, habitacion),
                                "habitacionUI" = COALESCE($2, "habitacionUI")
                                WHERE habitacion = $3
                                `
                                const matrizCambios = [
                                    habitacionIDV,
                                    habitacionUI,
                                    entidadIDV
                                ]
                                const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios)
                                if (resuelveGuardarCambios.rowCount === 0) {
                                    const error = "No se ha podido guardar los datosd por que no se han encontrado la habitacion"
                                    throw new Error(error)
                                }
                                if (resuelveGuardarCambios.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha actualizado correctamente la habitacion"
                                    }
                                    salida.json(ok)
                                }
                            }
                            if (tipoEntidad === "cama") {
                                const camaIDV = entrada.body.camaIDV
                                let camaUI = entrada.body.camaUI
                                let capacidad = entrada.body.capacidad





                                if (!camaIDV || !filtroCadenaMinusculasSinEspacios.test(camaIDV) || camaIDV.length > 50) {
                                    const error = "el campo 'camaIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres"
                                    throw new Error(error)
                                }
                                camaUI = camaUI.replace(/['"]/g, '');
                                /*
                                if (!camaUI || !filtroCadenaMinusculasMayusculasYEspacios.test(camaUI)) {
                                    const error = "el campo 'camaUI' solo puede ser letras minúsculas, mayúsculas, numeros y espacios"
                                    throw new Error(error)
                                }
                                */
                                const filtroSoloNumeros = /^\d+$/;
                                if (filtroSoloNumeros.test(capacidad)) {
                                    capacidad = parseInt(capacidad);
                                }
                                if (!capacidad || !Number.isInteger(capacidad) || capacidad < 0) {
                                    const error = "el campo 'capacidad' solo puede ser numeros, entero y positivo"
                                    throw new Error(error)
                                }


                                const validarIDV = `
                                SELECT 
                                *
                                FROM camas
                                WHERE cama = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe la habitacion, revisa el habitacionIDV"
                                    throw new Error(error)
                                }

                                // Comprobar que no existe el nuevo IDV
                                if (entidadIDV !== camaIDV) {
                                    const validarNuevoIDV = `
                                    SELECT 
                                    *
                                    FROM camas
                                    WHERE cama = $1
                                    `
                                    const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [camaIDV])
                                    if (resuelveValidarNuevoIDV.rowCount === 1) {
                                        const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor"
                                        throw new Error(error)
                                    }
                                }

                                const guardarCambios = `
                                UPDATE camas
                                SET 
                                cama = COALESCE($1, cama),
                                "camaUI" = COALESCE($2, "camaUI"),
                                capacidad = COALESCE($3, "capacidad")
                                WHERE cama = $4
                                `
                                const matrizCambios = [
                                    camaIDV,
                                    camaUI,
                                    capacidad,
                                    entidadIDV,
                                ]
                                const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios)
                                if (resuelveGuardarCambios.rowCount === 0) {
                                    const error = "No se ha podido guardar los datosd por que no se han encontrado la cama"
                                    throw new Error(error)
                                }
                                if (resuelveGuardarCambios.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha actualizado correctamente la cama"
                                    }
                                    salida.json(ok)
                                }
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    },
                    eliminarEntidadAlojamiento: async () => {
                        try {
                            const tipoEntidad = entrada.body.tipoEntidad
                            const entidadIDV = entrada.body.entidadIDV

                            const filtroCadenaSinEspacios = /^[a-z0-9]+$/;
                            const filtroCadenaConEspacios = /^[a-z0-9\s]+$/i;


                            if (!tipoEntidad || !filtroCadenaSinEspacios.test(tipoEntidad)) {
                                const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios"
                                throw new Error(error)
                            }
                            if (!entidadIDV || !filtroCadenaSinEspacios.test(entidadIDV)) {
                                const error = "el campo 'entidadIDV' solo puede ser letras minúsculas y numeros. sin pesacios"
                                throw new Error(error)
                            }

                            if (tipoEntidad === "apartamento") {

                                const validarIDV = `
                                SELECT 
                                *
                                FROM apartamentos
                                WHERE apartamento = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe el apartamento que desea borrar, revisa el apartamentoIDV"
                                    throw new Error(error)
                                }

                                const eliminarEntidad = `
                                DELETE FROM apartamentos
                                WHERE apartamento = $1;
                                `
                                const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV])
                                if (resuelveEliminarBloqueo.rowCount === 0) {
                                    const error = "No se ha eliminado el apartamento por que no se ha encontrado el registo en la base de datos"
                                    throw new Error(error)
                                }
                                if (resuelveEliminarBloqueo.rowCount === 1) {
                                    const ok = {
                                        "ok": "Se ha eliminado correctamente el apartamento como entidad",
                                    }
                                    salida.json(ok)
                                }

                            }

                            if (tipoEntidad === "habitacion") {

                                const validarIDV = `
                                SELECT 
                                *
                                FROM habitaciones
                                WHERE habitacion = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe la habitacion, revisa el habitacionIDV"
                                    throw new Error(error)
                                }

                                const eliminarEntidad = `
                                DELETE FROM habitaciones
                                WHERE habitacion = $1;
                                `
                                const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV])
                                if (resuelveEliminarBloqueo.rowCount === 0) {
                                    const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos"
                                    throw new Error(error)
                                }
                                if (resuelveEliminarBloqueo.rowCount === 1) {
                                    const ok = {
                                        "ok": "Se ha eliminado correctamente la habitacion como entidad",
                                    }
                                    salida.json(ok)
                                }



                            }
                            if (tipoEntidad === "cama") {
                                const validarIDV = `
                                SELECT 
                                *
                                FROM camas
                                WHERE cama = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe la cama, revisa el camaIDV"
                                    throw new Error(error)
                                }

                                const eliminarEntidad = `
                                DELETE FROM camas
                                WHERE cama = $1;
                                `
                                const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV])
                                if (resuelveEliminarBloqueo.rowCount === 0) {
                                    const error = "No se ha eliminado la cama por que no se ha entonctrado el registo en la base de datos"
                                    throw new Error(error)
                                }
                                if (resuelveEliminarBloqueo.rowCount === 1) {
                                    const ok = {
                                        "ok": "Se ha eliminado correctamente la cama como entidad",
                                    }
                                    salida.json(ok)
                                }

                            }





                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            salida.json(error)
                        }
                    }
                },
                configuraciones: {
                    listarConfiguracionApartamentos: {
                        IDX: {
                            ROL: [
                                "administrador",
                                "empleado"
                            ]
                        },
                        X: async () => {
                            try {
                                const seleccionaApartamentos = `
                                SELECT 
                                uid,
                                "apartamentoIDV",
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                `
                                const resuelveSeleccionaApartamentos = await conexion.query(seleccionaApartamentos)
                                const apartamentosConConfiguracion = []
                                if (resuelveSeleccionaApartamentos.rowCount > 0) {
                                    const apartamentoEntidad = resuelveSeleccionaApartamentos.rows
                                    for (const detallesDelApartamento of apartamentoEntidad) {

                                        const apartamentoIDV = detallesDelApartamento.apartamentoIDV
                                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
                                        const estadoConfiguracion = detallesDelApartamento.estadoConfiguracion

                                        const estructuraFinal = {
                                            apartamentoIDV: apartamentoIDV,
                                            apartamentoUI: apartamentoUI,
                                            estadoConfiguracion: estadoConfiguracion
                                        }
                                        apartamentosConConfiguracion.push(estructuraFinal)


                                    }
                                }
                                const ok = {
                                    ok: apartamentosConConfiguracion
                                }
                                salida.json(ok)

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    detalleConfiguracionAlojamiento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV

                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                    throw new Error(error)
                                }


                                const consultaPerfilConfiguracion = `
                            SELECT 
                            uid,
                            "apartamentoIDV",
                            "estadoConfiguracion",
                            imagen
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `
                                const resuelveConsultaPerfilConfiguracion = await conexion.query(consultaPerfilConfiguracion, [apartamentoIDV])
                                if (resuelveConsultaPerfilConfiguracion.rowCount === 0) {
                                    const ok = {
                                        ok: "No hay ninguna configuracion disponible para este apartamento"
                                    }
                                    salida.json(ok)
                                }
                                if (resuelveConsultaPerfilConfiguracion.rowCount > 0) {

                                    const estadoConfiguracion = resuelveConsultaPerfilConfiguracion.rows[0].estadoConfiguracion
                                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

                                    const consultaHabitaciones = `
                                SELECT 
                                uid,
                                apartamento,
                                habitacion
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE apartamento = $1;
                                `
                                    const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [apartamentoIDV])
                                    const habitacionesEncontradas = resuelveConsultaHabitaciones.rows


                                    for (const detalleHabitacion of habitacionesEncontradas) {
                                        const uidHabitacion = detalleHabitacion.uid
                                        const apartamentoIDV = detalleHabitacion.apartamento
                                        const habitacionIDV = detalleHabitacion.habitacion

                                        const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV])
                                        if (resolucionNombreHabitacion.rowCount === 0) {
                                            const error = "No existe el identificador de la habitacionIDV"
                                            throw new Error(error)
                                        }
                                        const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI
                                        detalleHabitacion.habitacionUI = habitacionUI


                                        const consultaCamas = `
                                    SELECT
                                    uid,
                                    habitacion, 
                                    cama
                                    FROM
                                    "configuracionCamasEnHabitacion"
                                    WHERE
                                    habitacion = $1
                                    `
                                        const resolverConsultaCamas = await conexion.query(consultaCamas, [uidHabitacion])
                                        detalleHabitacion.camas = []
                                        if (resolverConsultaCamas.rowCount > 0) {


                                            const camasEntontradas = resolverConsultaCamas.rows
                                            for (const detallesCama of camasEntontradas) {

                                                const uidCama = detallesCama.uid
                                                const camaIDV = detallesCama.cama

                                                const resolucionNombreCama = await conexion.query(`SELECT "camaUI", capacidad FROM camas WHERE cama = $1`, [camaIDV])
                                                if (resolucionNombreCama.rowCount === 0) {
                                                    const error = "No existe el identificador de la camaIDV"
                                                    throw new Error(error)
                                                }

                                                const camaUI = resolucionNombreCama.rows[0].camaUI
                                                const capacidad = resolucionNombreCama.rows[0].capacidad

                                                const estructuraCama = {
                                                    uid: uidCama,
                                                    camaIDV: camaIDV,
                                                    camaUI: camaUI,
                                                    capacidad: capacidad

                                                }
                                                detalleHabitacion.camas.push(estructuraCama)

                                            }
                                        }
                                    }

                                    const ok = {
                                        ok: habitacionesEncontradas,
                                        apartamentoIDV: apartamentoIDV,
                                        apartamentoUI: apartamentoUI,
                                        estadoConfiguracion: estadoConfiguracion,
                                    }
                                    salida.json(ok)



                                }





                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }

                        }
                    },
                    obtenerImagenConfiguracionAdministracion: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                    throw new Error(error)
                                }
                                const consultaPerfilConfiguracion = `
                            SELECT 
                            imagen
                            imagen
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `
                                const resuelveConsultaPerfilConfiguracion = await conexion.query(consultaPerfilConfiguracion, [apartamentoIDV])
                                if (resuelveConsultaPerfilConfiguracion.rowCount === 0) {
                                    const ok = {
                                        ok: "No hay ninguna configuracion disponible para este apartamento"
                                    }
                                    salida.json(ok)
                                }
                                if (resuelveConsultaPerfilConfiguracion.rowCount === 1) {
                                    const imagen = resuelveConsultaPerfilConfiguracion.rows[0].imagen

                                    const ok = {
                                        ok: "Imagen de la configuracion adminsitrativa del apartamento, png codificado en base64",
                                        imagen: imagen
                                    }
                                    salida.json(ok)

                                }


                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }

                        }
                    },
                    listarHabitacionesDisponbilesApartamentoConfiguracion: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                    throw new Error(error)
                                }

                                const consultaDetallesConfiguracion = `
                            SELECT 
                            *
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `
                                const metadatos = [
                                    apartamentoIDV
                                ]
                                const resuelveConsultaDetallesConfiguracion = await conexion.query(consultaDetallesConfiguracion, metadatos)
                                if (resuelveConsultaDetallesConfiguracion.rowCount === 0) {
                                    const ok = {
                                        ok: "No hay ninguna configuracion disponible para este apartamento"
                                    }
                                    salida.json(ok)
                                }


                                if (resuelveConsultaDetallesConfiguracion.rowCount > 0) {


                                    const consultaHabitacionesEnConfiguracion = await conexion.query(`SELECT habitacion FROM "configuracionHabitacionesDelApartamento" WHERE apartamento = $1`, [apartamentoIDV])
                                    const habitacionesEnConfiguracionArrayLimpio = []
                                    const habitacionesEnConfiguracion = consultaHabitacionesEnConfiguracion.rows
                                    for (const detalleHabitacion of habitacionesEnConfiguracion) {
                                        const habitacionIDV = detalleHabitacion.habitacion
                                        habitacionesEnConfiguracionArrayLimpio.push(habitacionIDV)
                                    }


                                    const resuelveHabitacionesComoEntidad = await conexion.query(`SELECT habitacion, "habitacionUI" FROM habitaciones`)
                                    const habitacionesComoEntidad = resuelveHabitacionesComoEntidad.rows
                                    const habitacionComoEntidadArrayLimpio = []
                                    const habitacionesComoEntidadEstructuraFinal = {}
                                    for (const detalleHabitacion of habitacionesComoEntidad) {
                                        const habitacionUI = detalleHabitacion.habitacionUI
                                        const habitacionIDV = detalleHabitacion.habitacion

                                        habitacionComoEntidadArrayLimpio.push(habitacionIDV)

                                        habitacionesComoEntidadEstructuraFinal[habitacionIDV] = habitacionUI

                                    }


                                    const habitacionesDisponiblesNoInsertadas = habitacionComoEntidadArrayLimpio.filter(entidad => !habitacionesEnConfiguracionArrayLimpio.includes(entidad));

                                    const estructuraFinal = []

                                    for (const habitacionDisponible of habitacionesDisponiblesNoInsertadas) {
                                        if (habitacionesComoEntidadEstructuraFinal[habitacionDisponible]) {

                                            const estructuraFinalObjeto = {
                                                habitacionIDV: habitacionDisponible,
                                                habitacionUI: habitacionesComoEntidadEstructuraFinal[habitacionDisponible]

                                            }

                                            estructuraFinal.push(estructuraFinalObjeto)

                                        }

                                    }
                                    const ok = {
                                        ok: estructuraFinal
                                    }
                                    salida.json(ok)

                                }





                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }


                        }
                    },
                    addHabitacionToConfiguracionApartamento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV
                                const habitacionIDV = entrada.body.habitacionIDV
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                    throw new Error(error)
                                }

                                if (!habitacionIDV || !filtroCadenaMinusculasSinEspacios.test(habitacionIDV)) {
                                    const error = "el campo 'habitacionIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                    throw new Error(error)
                                }

                                const consultaApartamento = `
                            SELECT 
                            "estadoConfiguracion"
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `
                                const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV])
                                if (resuelveConsultaApartamento.rowCount === 0) {
                                    const error = "No hay ningun apartamento con ese identificador visual"
                                    throw new Error(error)
                                }
                                if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                    const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama"
                                    throw new Error(error)
                                }


                                if (resuelveConsultaApartamento.rowCount === 1) {


                                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)


                                    const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV])
                                    if (resolucionNombreHabitacion.rowCount === 0) {
                                        const error = "No existe el identificador visual de la habitacion"
                                        throw new Error(error)
                                    }
                                    const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI

                                    const validarInexistenciaHabitacionEnConfiguracionDeApartamento = await conexion.query(`SELECT * FROM "configuracionHabitacionesDelApartamento" WHERE apartamento = $1 AND habitacion = $2 `, [apartamentoIDV, habitacionIDV])
                                    if (validarInexistenciaHabitacionEnConfiguracionDeApartamento.rowCount === 1) {
                                        const error = `Ya existe la ${habitacionUI} en esta configuracion del ${apartamentoUI}`
                                        throw new Error(error)
                                    }

                                    const insertarHabitacion = `
                                INSERT INTO "configuracionHabitacionesDelApartamento"
                                (
                                apartamento,
                                habitacion
                                )
                                VALUES ($1, $2) RETURNING uid
                                `
                                    const resuelveInsertarHabitacion = await conexion.query(insertarHabitacion, [apartamentoIDV, habitacionIDV])
                                    if (resuelveInsertarHabitacion.rowCount === 0) {
                                        const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`
                                        throw new Error(error)
                                    }

                                    if (resuelveInsertarHabitacion.rowCount === 1) {
                                        const ok = {
                                            ok: "Se ha insertado correctament la nueva habitacion",
                                            habitacionUID: resuelveInsertarHabitacion.rows[0].uid,
                                            habitacionIDV: habitacionIDV,
                                            habitacionUI: habitacionUI
                                        }
                                        salida.json(ok)
                                    }
                                }


                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }


                        }
                    },
                    listarCamasDisponbilesApartamentoConfiguracion: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const habitacionUID = entrada.body.habitacionUID
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                                if (!habitacionUID || !Number.isInteger(habitacionUID) || habitacionUID < 0) {
                                    const error = "el campo 'habitacionUID' solo puede ser numeros"
                                    throw new Error(error)
                                }

                                const validarHabitacionUID = `
                            SELECT 
                            habitacion
                            FROM "configuracionHabitacionesDelApartamento"
                            WHERE uid = $1;
                            `
                                const metadatos = [
                                    habitacionUID
                                ]
                                const resuelveConsultaDetallesConfiguracion = await conexion.query(validarHabitacionUID, metadatos)
                                if (resuelveConsultaDetallesConfiguracion.rowCount === 0) {
                                    const ok = {
                                        ok: "No hay ninguna habitacion con ese identificador disponible para este apartamento"
                                    }
                                    salida.json(ok)
                                }


                                if (resuelveConsultaDetallesConfiguracion.rowCount > 0) {


                                    const consultaCamasEnHabitacion = await conexion.query(`SELECT cama FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1`, [habitacionUID])
                                    const camasArrayLimpioEnHabitacion = []
                                    const camasEncontradasEnHabitacion = consultaCamasEnHabitacion.rows
                                    for (const detalleHabitacion of camasEncontradasEnHabitacion) {
                                        const camaIDV = detalleHabitacion.cama
                                        camasArrayLimpioEnHabitacion.push(camaIDV)
                                    }


                                    const resuelveCamasComoEntidad = await conexion.query(`SELECT cama, "camaUI" FROM camas`)
                                    const camasComoEntidad = resuelveCamasComoEntidad.rows
                                    const camasComoEntidadArrayLimpio = []
                                    const camasComoEntidadEstructuraFinal = {}
                                    for (const detalleHabitacion of camasComoEntidad) {
                                        const camaUI = detalleHabitacion.camaUI
                                        const camaIDV = detalleHabitacion.cama

                                        camasComoEntidadArrayLimpio.push(camaIDV)
                                        camasComoEntidadEstructuraFinal[camaIDV] = camaUI

                                    }

                                    const camasDisponiblesNoInsertadas = camasComoEntidadArrayLimpio.filter(entidad => !camasArrayLimpioEnHabitacion.includes(entidad));
                                    const estructuraFinal = []

                                    for (const camaDisponible of camasDisponiblesNoInsertadas) {
                                        if (camasComoEntidadEstructuraFinal[camaDisponible]) {
                                            const estructuraFinalObjeto = {
                                                camaIDV: camaDisponible,
                                                camaUI: camasComoEntidadEstructuraFinal[camaDisponible]
                                            }
                                            estructuraFinal.push(estructuraFinalObjeto)
                                        }

                                    }
                                    const ok = {
                                        ok: estructuraFinal
                                    }
                                    salida.json(ok)

                                }





                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }


                        }
                    },
                    addCamaToConfiguracionApartamentoHabitacion: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const camaIDV = entrada.body.camaIDV;
                                const habitacionUID = entrada.body.habitacionUID;
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                                if (!camaIDV || !filtroCadenaMinusculasSinEspacios.test(camaIDV)) {
                                    const error = "el campo 'camaIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                    throw new Error(error)
                                }

                                if (!habitacionUID || !Number.isInteger(habitacionUID) || habitacionUID < 0) {
                                    const error = "el campo 'habitacionUID' solo puede ser numeros"
                                    throw new Error(error)
                                }

                                // validar la cama
                                const consultaCamaIDV = `
                            SELECT
                            capacidad,
                            "camaUI", 
                            cama
                            FROM camas
                            WHERE cama = $1;
                            `
                                const resuelveConsultaCamaIDV = await conexion.query(consultaCamaIDV, [camaIDV])
                                if (resuelveConsultaCamaIDV.rowCount === 0) {
                                    const error = "No existe ninguna cama con ese identificador visual"
                                    throw new Error(error)
                                }
                                const camaUI = resuelveConsultaCamaIDV.rows[0].camaUI
                                const capacidad = resuelveConsultaCamaIDV.rows[0].capacidad


                                const consultaHabitacion = `
                            SELECT 
                            habitacion, apartamento
                            FROM "configuracionHabitacionesDelApartamento"
                            WHERE uid = $1;
                            `
                                const resuelveConsultaHabitacion = await conexion.query(consultaHabitacion, [habitacionUID])
                                if (resuelveConsultaHabitacion.rowCount === 0) {
                                    const error = "No hay ninguna habitacíon con ese UID"
                                    throw new Error(error)
                                }
                                if (resuelveConsultaHabitacion.rowCount === 1) {
                                    const apartamentoIDV = resuelveConsultaHabitacion.rows[0].apartamento
                                    const consultaApartamento = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `
                                    const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV])
                                    if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                        const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama"
                                        throw new Error(error)
                                    }




                                    const habitacionIDV = resuelveConsultaHabitacion.rows[0].habitacion

                                    const resuelveCamasEnHabitacion = await conexion.query(`SELECT cama FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1 AND cama = $2 `, [habitacionUID, camaIDV])
                                    if (resuelveCamasEnHabitacion.rowCount > 0) {
                                        const error = "Esta cama ya existe"
                                        throw new Error(error)
                                    }

                                    if (resuelveCamasEnHabitacion.rowCount === 0) {

                                        const insertarCamaEnHabitacion = `
                                    INSERT INTO "configuracionCamasEnHabitacion"
                                    (
                                    habitacion,
                                    cama
                                    )
                                    VALUES ($1, $2) RETURNING uid
                                    `
                                        const resuelveInsertarHabitacion = await conexion.query(insertarCamaEnHabitacion, [habitacionUID, camaIDV])
                                        if (resuelveInsertarHabitacion.rowCount === 0) {
                                            const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`
                                            throw new Error(error)
                                        }

                                        if (resuelveInsertarHabitacion.rowCount === 1) {
                                            const nuevoUID = resuelveInsertarHabitacion.rows[0].uid
                                            const ok = {
                                                ok: "Se ha insertardo la cama correctamente en la habitacion",
                                                nuevoUID: nuevoUID,
                                                camaUI: camaUI,
                                                camaIDV: camaIDV,
                                                capaciad: capacidad
                                            }
                                            salida.json(ok)
                                        }



                                    }




                                }


                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }


                        }
                    },
                    eliminarHabitacionDeConfiguracionDeAlojamiento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const habitacionUID = entrada.body.habitacionUID

                                if (!habitacionUID || !Number.isInteger(habitacionUID) || habitacionUID < 0) {
                                    const error = "el campo 'habitacionUID' solo puede ser numeros"
                                    throw new Error(error)
                                }

                                const validarHabitacionUID = `
                                SELECT 
                                apartamento
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE uid = $1
                                `
                                const resuelveValidarHabitacionUID = await conexion.query(validarHabitacionUID, [habitacionUID])
                                if (resuelveValidarHabitacionUID.rowCount === 0) {
                                    const error = "No existe la habitacion, revisa el habitacionUID"
                                    throw new Error(error)
                                }

                                const apartamentoIDV = resuelveValidarHabitacionUID.rows[0].apartamento
                                const consultaApartamento = `
                            SELECT 
                            "estadoConfiguracion"
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `
                                const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV])
                                if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                    const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama"
                                    throw new Error(error)
                                }


                                const eliminarHabitacion = `
                                DELETE FROM "configuracionHabitacionesDelApartamento"
                                WHERE uid = $1;
                                `
                                const resuelveEliminarHabitacion = await conexion.query(eliminarHabitacion, [habitacionUID])
                                if (resuelveEliminarHabitacion.rowCount === 0) {
                                    const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos"
                                    throw new Error(error)
                                }
                                if (resuelveEliminarHabitacion.rowCount === 1) {
                                    const ok = {
                                        "ok": "Se ha eliminado correctamente la habitacion como entidad",
                                    }
                                    salida.json(ok)
                                }

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    eliminarCamaDeConfiguracionDeAlojamiento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const camaUID = entrada.body.camaUID

                                if (!camaUID || !Number.isInteger(camaUID) || camaUID < 0) {
                                    const error = "el campo 'camaUID' solo puede ser numeros"
                                    throw new Error(error)
                                }

                                const validarHabitacionUID = `
                                SELECT 
                                habitacion
                                FROM "configuracionCamasEnHabitacion"
                                WHERE uid = $1
                                `
                                const resuelveValidarHabitacionUID = await conexion.query(validarHabitacionUID, [camaUID])
                                if (resuelveValidarHabitacionUID.rowCount === 0) {
                                    const error = "No existe la cama, revisa el camaUID"
                                    throw new Error(error)
                                }

                                const habitacionUID = resuelveValidarHabitacionUID.rows[0].habitacion
                                const consultaIntermediaEscaleraHaciaArriba = `
                            SELECT 
                            apartamento
                            FROM "configuracionHabitacionesDelApartamento"
                            WHERE uid = $1;
                            `
                                const resuelveConsultaIntermediaEscaleraHaciaArriba = await conexion.query(consultaIntermediaEscaleraHaciaArriba, [habitacionUID])
                                const apartamentoIDV = resuelveConsultaIntermediaEscaleraHaciaArriba.rows[0].apartamento
                                const consultaApartamento = `
                            SELECT 
                            "estadoConfiguracion"
                            FROM "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1;
                            `
                                const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV])
                                if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                                    const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama"
                                    throw new Error(error)
                                }





                                const eliminarCama = `
                                DELETE FROM "configuracionCamasEnHabitacion"
                                WHERE uid = $1;
                                `
                                const resuelveEliminarCama = await conexion.query(eliminarCama, [camaUID])
                                if (resuelveEliminarCama.rowCount === 0) {
                                    const error = "No se ha eliminado la cama por que no se ha entcontrado el registro en la base de datos"
                                    throw new Error(error)
                                }
                                if (resuelveEliminarCama.rowCount === 1) {
                                    const ok = {
                                        "ok": "Se ha eliminado correctamente la cama de la habitacion",
                                    }
                                    salida.json(ok)
                                }

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    eliminarConfiguracionDeAlojamiento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;

                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios"
                                    throw new Error(error)
                                }

                                const validarApartamentoUID = `
                                SELECT 
                                *
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `
                                const resuelveValidarApartamentoUID = await conexion.query(validarApartamentoUID, [apartamentoIDV])
                                if (resuelveValidarApartamentoUID.rowCount === 0) {
                                    const error = "No existe el perfil de configuracion del apartamento"
                                    throw new Error(error)
                                }

                                const eliminarConfiguracionDeApartamento = `
                                DELETE FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `
                                const resuelveEliminarApartamento = await conexion.query(eliminarConfiguracionDeApartamento, [apartamentoIDV])
                                if (resuelveEliminarApartamento.rowCount === 0) {
                                    const error = "No se ha eliminado la configuracion del apartamenro por que no se ha encontrado el registro en la base de datos"
                                    throw new Error(error)
                                }
                                if (resuelveEliminarApartamento.rowCount > 0) {
                                    const ok = {
                                        "ok": "Se ha eliminado correctamente la configuracion de apartamento",
                                    }
                                    salida.json(ok)
                                }

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    crearConfiguracionAlojamiento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV) || apartamentoIDV.length > 50) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres"
                                    throw new Error(error)
                                }

                                const validarIDV = `
                                SELECT 
                                "apartamentoUI"
                                FROM apartamentos
                                WHERE apartamento = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon"
                                    throw new Error(error)
                                }

                                const validarUnicidadConfigurativa = `
                                SELECT 
                                *
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `
                                const resuelveValidarUnicidadConfigurativa = await conexion.query(validarUnicidadConfigurativa, [apartamentoIDV])
                                if (resuelveValidarUnicidadConfigurativa.rowCount > 0) {
                                    const error = "Ya existe una configuracion para la entidad del apartamento por favor selecciona otro apartamento como entidad"
                                    throw new Error(error)
                                }

                                const estadoInicial = "nodisponible"
                                const crearConfiguracion = `
                                INSERT INTO "configuracionApartamento"
                                (
                                "apartamentoIDV",
                                "estadoConfiguracion"
                                )
                                VALUES 
                                (
                                $1,
                                $2
                                )
                                RETURNING "apartamentoIDV"
                                `
                                const resuelveCrearConfiguracion = await conexion.query(crearConfiguracion, [apartamentoIDV, estadoInicial])
                                if (resuelveCrearConfiguracion.rowCount === 0) {
                                    const error = "No se ha podido crear la nueva configuracion"
                                    throw new Error(error)
                                }
                                if (resuelveCrearConfiguracion.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha creado correctament la nuevo configuracion del apartamento",
                                        apartamentoIDV: resuelveCrearConfiguracion.rows[0].apartamentoIDV
                                    }
                                    salida.json(ok)
                                }




                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    cambiarEstadoConfiguracionAlojamiento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV
                                const nuevoEstado = entrada.body.nuevoEstado
                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios"
                                    throw new Error(error)
                                }


                                if (!nuevoEstado || !filtroCadenaMinusculasSinEspacios.test(nuevoEstado)) {
                                    const error = "el campo 'nuevoEstado' solo puede ser letras minúsculas, numeros y sin pesacios"
                                    throw new Error(error)
                                }

                                const validarIDV = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon"
                                    throw new Error(error)
                                }
                                const estadoConfiguracionActual = resuelveValidarIDV.rows[0].estadoConfiguracion
                                const validarEstadoIDV = `
                                SELECT 
                                *
                                FROM "estadoApartamentos"
                                WHERE estado = $1
                                `
                                const resuelveValidarEstadoIDV = await conexion.query(validarEstadoIDV, [nuevoEstado])
                                if (resuelveValidarEstadoIDV.rowCount === 0) {
                                    const error = "Revisa el estado que has introducido por que no se conoce este estado para la configuracion del apartamento"
                                    throw new Error(error)
                                }

                                if (nuevoEstado === "disponible") {
                                    // Mirar que el apartamento tenga al menos una habitacion
                                    const consultaHabitaciones = `
                                SELECT 
                                habitacion,
                                uid
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE apartamento = $1
                                `
                                    const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [apartamentoIDV])
                                    if (resuelveConsultaHabitaciones.rowCount === 0) {
                                        const error = "No se puede poner en disponible esta configuracíon por que no es valida. Necesitas al menos una habitacíon en esta configuracíon y este apartamento no la tiene"
                                        throw new Error(error)
                                    }
                                    // Mirar que todas las habitaciones tengan una cama asignada
                                    if (resuelveConsultaHabitaciones.rowCount > 0) {

                                        const habitacionesSinCama = []
                                        const habitacionesEnConfiguracion = resuelveConsultaHabitaciones.rows
                                        for (const detalleHabitacion of habitacionesEnConfiguracion) {
                                            const habitacionUID = detalleHabitacion.uid
                                            const habitacionIDV = detalleHabitacion.habitacion

                                            const resolucionHabitacionUI = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV])
                                            if (resolucionHabitacionUI.rowCount === 0) {
                                                const error = "No existe el identificador del apartamentoIDV"
                                                throw new Error(error)
                                            }
                                            const habitacionUI = resolucionHabitacionUI.rows[0].habitacionUI

                                            const selectorHabitacionAsignada = await conexion.query(`SELECT "cama" FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1`, [habitacionUID])
                                            if (selectorHabitacionAsignada.rowCount === 0) {
                                                habitacionesSinCama.push(habitacionUI)
                                            }
                                        }

                                        if (habitacionesSinCama.length > 0) {
                                            let funsionArray = habitacionesSinCama.join(", "); // Fusiona los elementos con comas
                                            funsionArray = funsionArray.replace(/,([^,]*)$/, ' y $1');
                                            const error = `No se puede establecer el estado disponible por que la configuracion no es valida. Por favor revisa las camas asignadas ne las habitaciones. En las habitaciones ${funsionArray} no hay una sola cama signada como opcion. Por favor asigna la camas`
                                            throw new Error(error)

                                        }

                                    }

                                    // Mira que tenga un perfil de precio creado y superiro 0
                                    const consultaPerfilPrecio = await conexion.query(`SELECT precio FROM "preciosApartamentos" WHERE apartamento = $1`, [apartamentoIDV])
                                    if (consultaPerfilPrecio.rowCount === 0) {
                                        const error = "La configuración no es válida. No se puede establecer en disponible por que esta configuración no tiene asignado un perfil de precio para poder calcular los impuestos. Por favor establece un perfil de precio para esta configuración."
                                        throw new Error(error)
                                    }

                                    if (consultaPerfilPrecio.rows[0].precio <= 0) {
                                        const error = "El apartamento tiene una configuracion correcta y tambien tiene un perfil de precio pero en el perfil de precio hay establecido 0.00 como precio base y no esta permitido."
                                        throw new Error(error)
                                    }


                                    // No puede haber un estado disponible con precio base en 0.00








                                }


                                const actualizarEstadoConfiguracion = `
                            UPDATE "configuracionApartamento"
                            SET "estadoConfiguracion" = $1
                            WHERE "apartamentoIDV" = $2;
                            `
                                const clienteActualizarEstadoConfiguracion = await conexion.query(actualizarEstadoConfiguracion, [nuevoEstado, apartamentoIDV])
                                if (clienteActualizarEstadoConfiguracion.rowCount === 0) {
                                    const error = "No se ha podido actualizar el estado de la configuracion del apartamento"
                                    throw new Error(error)
                                }
                                if (clienteActualizarEstadoConfiguracion.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha actualizado el estado correctamente",
                                        nuevoEstado: nuevoEstado
                                    }
                                    salida.json(ok)
                                }

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    gestionImagenConfiguracionApartamento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV
                                const contenidoArchivo = entrada.body.contenidoArchivo

                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios"
                                    throw new Error(error)
                                }

                                const filtroBase64 = /^[A-Za-z0-9+/=]+$/;
                                if (typeof contenidoArchivo !== "string" || !filtroBase64.test(contenidoArchivo)) {
                                    const error = "El campo contenido archivo solo acepta archivos codificados en base64";
                                    throw new Error(error);
                                }

                                const esImagenPNG = (contenidoArchivo) => {
                                    const binarioMagicoPNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
                                    // Decodifica la cadena base64 a un buffer
                                    const buffer = Buffer.from(contenidoArchivo, 'base64');
                                    // Compara los primeros 8 bytes del buffer con el binario mágico
                                    return buffer.subarray(0, 8).compare(binarioMagicoPNG) === 0;
                                }

                                const esImagenTIFF = (contenidoArchivo) => {
                                    const binarioMagicoTIFF = Buffer.from([73, 73, 42, 0]); // Puedes ajustar estos valores según el formato TIFF que estés buscando
                                    const buffer = Buffer.from(contenidoArchivo, 'base64');
                                    return buffer.subarray(0, 4).compare(binarioMagicoTIFF) === 0 || buffer.subarray(0, 4).compare(Buffer.from([77, 77, 0, 42])) === 0; // Otro formato posible
                                };

                                const esImagenJPEG = (contenidoArchivo) => {
                                    const binarioMagicoJPEG = Buffer.from([255, 216, 255]);
                                    const buffer = Buffer.from(contenidoArchivo, 'base64');
                                    return buffer.subarray(0, 3).compare(binarioMagicoJPEG) === 0;
                                };

                                if (esImagenPNG(contenidoArchivo)) {
                                } else if (esImagenTIFF(contenidoArchivo)) {
                                } else if (esImagenJPEG(contenidoArchivo)) {
                                } else {
                                    const error = "Solo se acetan imagenes PNG, TIFF, JPEG y JPG.";
                                    throw new Error(error);
                                }

                                await conexion.query('BEGIN'); // Inicio de la transacción

                                const validarIDV = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon"
                                    throw new Error(error)
                                }

                                if (resuelveValidarIDV.rows[0].estadoConfiguracion === "disponible") {
                                    const error = "No se puede actualizar la imagen de una configuracion de apartamento cuando esta disponbile,cambie el estado primero"
                                    throw new Error(error)
                                }

                                const actualizarImagenConfiguracion = `
                            UPDATE "configuracionApartamento"
                            SET imagen = $1
                            WHERE "apartamentoIDV" = $2;
                            `
                                const resuelveActualizarImagenConfiguracion = await conexion.query(actualizarImagenConfiguracion, [contenidoArchivo, apartamentoIDV])
                                if (resuelveActualizarImagenConfiguracion.rowCount === 0) {
                                    const error = "No se ha podido actualizar la imagen del apartmento reintentalo"
                                    throw new Error(error)
                                }
                                if (resuelveActualizarImagenConfiguracion.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha actualizado imagen correctamnte",
                                        imagen: String(contenidoArchivo)
                                    }
                                    salida.json(ok)
                                }
                                await conexion.query('COMMIT'); // Confirmar la transacción

                            } catch (errorCapturado) {
                                await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    },
                    eliminarImagenConfiguracionApartamento: {
                        IDX: {
                            ROL: ["administrador"]
                        },
                        X: async () => {
                            try {
                                const apartamentoIDV = entrada.body.apartamentoIDV

                                const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                                if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                                    const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios"
                                    throw new Error(error)
                                }

                                const validarIDV = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1
                                `
                                const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV])
                                if (resuelveValidarIDV.rowCount === 0) {
                                    const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon"
                                    throw new Error(error)
                                }

                                if (resuelveValidarIDV.rows[0].estadoConfiguracion === "disponible") {
                                    const error = "No se puede actualizar la imagen de una configuracion de apartamento cuando esta disponbile,cambie el estado primero"
                                    throw new Error(error)
                                }

                                const actualizarImagenConfiguracion = `
                            UPDATE "configuracionApartamento"
                            SET imagen = NULL
                            WHERE "apartamentoIDV" = $1;
                            `
                                const resuelveActualizarImagenConfiguracion = await conexion.query(actualizarImagenConfiguracion, [apartamentoIDV])
                                if (resuelveActualizarImagenConfiguracion.rowCount === 0) {
                                    const error = "No se ha podido borrar la imagen del apartmento reintentalo"
                                    throw new Error(error)
                                }
                                if (resuelveActualizarImagenConfiguracion.rowCount === 1) {
                                    const ok = {
                                        ok: "Se ha borrado imagen correctamnte"
                                    }
                                    salida.json(ok)
                                }

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                salida.json(error)
                            }
                        }
                    }
                },

            },
            usuarios: {
                IDX: {
                    ROL: ["administrador"]
                },
                buscarUsuarios: async () => {
                    try {

                        const buscar = entrada.body.buscar;
                        const nombreColumna = entrada.body.nombreColumna
                        let sentidoColumna = entrada.body.sentidoColumna

                        if (!buscar) {
                            let error = "se tiene que espeficiar 'buscar' y lo que se desea buscar"
                            throw new Error(error)
                        }
                        let Pagina = entrada.body.pagina
                        Pagina = Pagina ? Pagina : 1
                        if (typeof Pagina !== "number" || !Number.isInteger(Pagina) || Pagina <= 0) {
                            const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales"
                            throw new Error(error)
                        }

                        let condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = ""
                        let nombreColumnaSentidoUI
                        let nombreColumnaUI
                        if (nombreColumna) {
                            const filtronombreColumna = /^[a-zA-Z]+$/;
                            if (!filtronombreColumna.test(nombreColumna)) {
                                const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas."
                                throw new Error(error)
                            }
                            const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'datosDeUsuario' AND column_name = $1;
                                `
                            const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna])
                            if (resuelveNombreColumna.rowCount === 0) {
                                const error = "No existe el nombre de la columna que quieres ordenar"
                                throw new Error(error)
                            }

                            // OJO con la coma, OJO LA COMA ES IMPORTANTISMA!!!!!!!!
                            //!!!!!!!
                            if (sentidoColumna !== "descendente" && sentidoColumna !== "ascendente") {
                                sentidoColumna = "ascendente"
                            }
                            if (sentidoColumna == "ascendente") {
                                sentidoColumna = "ASC"
                                nombreColumnaSentidoUI = "ascendente"
                            }
                            if (sentidoColumna == "descendente") {
                                sentidoColumna = "DESC"
                                nombreColumnaSentidoUI = "descendente"
                            }
                            nombreColumnaUI = nombreColumna
                            condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = `,"${nombreColumna}" ${sentidoColumna}`
                        }



                        const terminoBuscar = buscar.split(" ")
                        const terminosFormateados = []
                        terminoBuscar.map((termino) => {
                            const terminoFinal = "%" + termino + "%"
                            terminosFormateados.push(terminoFinal)
                        })
                        const numeroPorPagina = 10
                        const numeroPagina = Number((Pagina - 1) + "0");
                        const consultaConstructor =
                            `    
                            SELECT "usuarioIDX", email, nombre, "primerApellido", "segundoApellido", pasaporte, telefono,
                            COUNT(*) OVER() as "totalUsuarios"
                            FROM "datosDeUsuario"
                            WHERE  
                            (
                                
                            LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(email, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(telefono, '')) ILIKE ANY($1) OR
            
            
                            LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
                            LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
                            )
                            ORDER BY
                            (
                              CASE
                                WHEN (
            
                                  (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
            
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 1 THEN 1
                                WHEN (
            
            
                                  (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
            
                                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                ) = 3 THEN 3
                                ELSE 2
                              END
                            ) DESC
                            ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                        LIMIT $2 OFFSET $3;`

                        const consultaUsuarios = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina])
                        const usuariosEncontrados = consultaUsuarios.rows
                        const consultaConteoTotalFilas = usuariosEncontrados[0]?.totalUsuarios ? usuariosEncontrados[0].totalUsuarios : 0

                        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                        const corretorNumeroPagina = String(numeroPagina).replace("0", "")
                        const Respuesta = {
                            buscar: buscar,
                            totalUsuarios: consultaConteoTotalFilas,
                            nombreColumna: nombreColumna,
                            paginasTotales: totalPaginas,
                            pagina: Number(corretorNumeroPagina) + 1,
                        }
                        if (nombreColumna) {
                            Respuesta.nombreColumna
                            Respuesta.sentidoColumna = nombreColumnaSentidoUI
                        }

                        usuariosEncontrados.map((detallesUsuario) => {
                            delete detallesUsuario.totalUsuarios
                        })


                        Respuesta.usuarios = usuariosEncontrados

                        salida.json(Respuesta)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        return salida.json(error)
                    } finally {

                    }

                },
                datosCuentaIDX: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!usuarioIDX || !filtroCadena.test(usuarioIDX)) {
                            const error = "el campo 'usuarioIDX' solo puede ser letras minúsculas, numeros y sin pesacios"
                            throw new Error(error)
                        }

                        const consultaDetallesUsuario = `
                        SELECT 
                        usuario, 
                        rol,
                        "estadoCuenta"
                        FROM 
                        usuarios
                        WHERE 
                        usuario = $1;`
                        const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX])
                        if (resolverConsultaDetallesUsuario.rowCount === 0) {
                            const error = "No existe ningun usuario con ese IDX"
                            throw new Error(error)
                        }

                        const detallesCliente = resolverConsultaDetallesUsuario.rows[0]
                        const ok = {
                            ok: detallesCliente
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }


                        salida.json(error)
                    } finally {

                    }

                },
                detallesUsuario: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        const filtroCadena = /^[a-z0-9]+$/;
                        if (!usuarioIDX || !filtroCadena.test(usuarioIDX)) {
                            const error = "el campo 'usuarioIDX' solo puede ser letras minúsculas, numeros y sin pesacios"
                            throw new Error(error)
                        }


                        const consultaDetallesUsuario = `
                        SELECT 
                        ddu."usuarioIDX", 
                        ddu.nombre,
                        ddu."primerApellido",
                        ddu."segundoApellido",
                        ddu.pasaporte,
                        ddu.telefono,
                        ddu.email,
                        u.rol,
                        u."estadoCuenta"
                        FROM 
                        "datosDeUsuario" ddu
                        JOIN usuarios u ON ddu."usuarioIDX" = u.usuario
                        WHERE 
                        ddu."usuarioIDX" = $1;`

                        const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX])
                        if (resolverConsultaDetallesUsuario.rowCount === 0) {
                            const error = "No existe ningun usuario con ese IDX"
                            throw new Error(error)
                        }

                        const detallesCliente = resolverConsultaDetallesUsuario.rows[0]
                        const ok = {
                            ok: detallesCliente
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }

                },
                actualizarDatosUsuarioDesdeAdministracion: async () => {
                    try {
                        let usuarioIDX = entrada.body.usuarioIDX
                        let nombre = entrada.body.nombre
                        let primerApellido = entrada.body.primerApellido
                        let segundoApellido = entrada.body.segundoApellido
                        let pasaporte = entrada.body.pasaporte
                        let telefono = entrada.body.telefono
                        let email = entrada.body.email

                        const validarDatosUsuario = {
                            usuarioIDX: usuarioIDX,
                            nombre: nombre,
                            primerApellido: primerApellido,
                            segundoApellido: segundoApellido,
                            pasaporte: pasaporte,
                            telefono: telefono,
                            email: email
                        }

                        const datosValidados = await validadoresCompartidos.usuarios.actualizarDatos(validarDatosUsuario)
                        usuarioIDX = datosValidados.usuarioIDX
                        nombre = datosValidados.nombre
                        primerApellido = datosValidados.primerApellido
                        segundoApellido = datosValidados.segundoApellido
                        pasaporte = datosValidados.pasaporte
                        telefono = datosValidados.telefono
                        email = datosValidados.email



                        await conexion.query('BEGIN'); // Inicio de la transacción
                        // validar existencia de contrasena
                        const validarUsuario = `
                         SELECT 
                         usuario
                         FROM usuarios
                         WHERE usuario = $1;
                         `
                        const resuelveValidarUsuario = await conexion.query(validarUsuario, [usuarioIDX])
                        if (!resuelveValidarUsuario.rowCount === 0) {
                            const error = "No existe el usuario"
                            throw new Error(error)
                        }

                        const actualizarDatosUsuario2 = `
                        UPDATE "datosDeUsuario"
                        SET 
                          nombre = COALESCE(NULLIF($1, ''), nombre),
                          "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
                          "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
                          pasaporte = COALESCE(NULLIF($4, ''), pasaporte),
                          telefono = COALESCE(NULLIF($5, ''), telefono),
                          email = COALESCE(NULLIF($6, ''), email)
                        WHERE "usuarioIDX" = $7
                        RETURNING 
                          nombre,
                          "primerApellido",
                          "segundoApellido",
                          pasaporte,
                          telefono,
                          email;                       
                        `
                        const datos = [
                            nombre,
                            primerApellido,
                            segundoApellido,
                            pasaporte,
                            telefono,
                            email,
                            usuarioIDX,
                        ]

                        const resuelveActualizarDatosUsuario2 = await conexion.query(actualizarDatosUsuario2, datos)

                        if (resuelveActualizarDatosUsuario2.rowCount === 1) {
                            const datosActualizados = resuelveActualizarDatosUsuario2.rows

                            const ok = {
                                ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
                                datosActualizados: datosActualizados
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                actualizarIDXAdministracion: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        let nuevoIDX = entrada.body.nuevoIDX

                        const filtroCantidad = /^\d+\.\d{2}$/;
                        const filtro_minúsculas_Mayusculas_numeros_espacios = /^[a-zA-Z0-9\s]+$/;
                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                        const filtroNumeros = /^[0-9]+$/;
                        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;

                        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                            const error = "El campo usuarioIDX solo admite minúsculas y numeros"
                            throw new Error(error)
                        }

                        nuevoIDX = nuevoIDX.toLowerCase();
                        if (!nuevoIDX || !filtro_minúsculas_numeros.test(nuevoIDX)) {
                            const error = "El campo nuevoIDX solo admite minúsculas y numeros"
                            throw new Error(error)
                        }
                        await componentes.eliminarCuentasNoVerificadas()
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarIDX = `
                        UPDATE usuarios
                        SET 
                            usuario = $2
                        WHERE 
                            usuario = $1
                        RETURNING 
                            usuario           
                        `
                        const datos = [
                            usuarioIDX,
                            nuevoIDX
                        ]
                        nuevoIDX = `"${nuevoIDX}"`
                        const resuelveActualizarIDX = await conexion.query(actualizarIDX, datos)
                        if (resuelveActualizarIDX.rowCount === 0) {
                            const error = "No existe el nombre de usuario"
                            throw new Error(error)

                        }

                        if (resuelveActualizarIDX.rowCount === 1) {

                            const actualizarSessionesActivas = `
                            UPDATE sessiones
                            SET sess = jsonb_set(sess::jsonb, '{usuario}', $1::jsonb)::json
                            WHERE sess->>'usuario' = $2;
                                                   
                            `
                            await conexion.query(actualizarSessionesActivas, [nuevoIDX, usuarioIDX])
                            const IDXEstablecido = resuelveActualizarIDX.rows[0].usuario
                            const ok = {
                                "ok": "Se ha actualizado el IDX correctamente",
                                usuarioIDX: IDXEstablecido
                            }
                            salida.json(ok)

                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                actualizarClaveUsuarioAdministracion: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        const claveNueva = entrada.body.claveNueva
                        const claveNuevaDos = entrada.body.claveNuevaDos

                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;


                        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                            const error = "El campo usuarioIDX solo admite minúsculas y numeros"
                            throw new Error(error)
                        }


                        if (claveNueva !== claveNuevaDos) {
                            const error = "No has escrito dos veces la misma nueva contrasena"
                            throw new Error(error)
                        } else {
                            validadoresCompartidos.claves.minimoRequisitos(claveNueva)
                        }
                        const cryptoData = {
                            sentido: "cifrar",
                            clavePlana: claveNueva
                        }

                        const retorno = vitiniCrypto(cryptoData)
                        const nuevaSal = retorno.nuevaSal
                        const hashCreado = retorno.hashCreado


                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarClave = `
                        UPDATE usuarios
                        SET 
                            clave = $1,
                            sal = $2
                        WHERE 
                            usuario = $3
                        `
                        const datos = [
                            hashCreado,
                            nuevaSal,
                            usuarioIDX
                        ]
                        const resuelveActualizarClave = await conexion.query(actualizarClave, datos)
                        if (resuelveActualizarClave.rowCount === 1) {
                            const ok = {
                                "ok": "Se ha actualizado la nueva clave"
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                actualizarEstadoCuentaDesdeAdministracion: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        const nuevoEstado = entrada.body.nuevoEstado

                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                            const error = "El campo usuarioIDX solo admite minúsculas y numeros"
                            throw new Error(error)
                        }

                        if (nuevoEstado !== "activado" && nuevoEstado !== "desactivado") {
                            const error = "El campo nuevoEstado solo puede ser activado o desactivado"
                            throw new Error(error)
                        }


                        // validar existencia de contrasena
                        const validarClave = `
                        SELECT 
                        clave
                        FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveValidarClave = await conexion.query(validarClave, [usuarioIDX])
                        if (!resuelveValidarClave.rows[0].clave) {
                            const error = "No se puede activar una cuenta que carece de contrasena, por favor establece una contrasena primero"
                            throw new Error(error)
                        }



                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarEstadoCuenta = `
                        UPDATE usuarios
                        SET 
                            "estadoCuenta" = $1
                        WHERE 
                            usuario = $2
                        `
                        const datos = [
                            nuevoEstado,
                            usuarioIDX
                        ]
                        const resuelveEstadoCuenta = await conexion.query(actualizarEstadoCuenta, datos)
                        if (resuelveEstadoCuenta.rowCount === 0) {
                            const error = "No se encuentra el usuario"
                            throw new Error(error)
                        }
                        if (resuelveEstadoCuenta.rowCount === 1) {

                            if (nuevoEstado !== "desactivado") {
                                const cerrarSessiones = `
                                DELETE FROM sessiones
                                WHERE sess->> 'usuario' = $1;
                                `
                                await conexion.query(cerrarSessiones, [usuarioIDX])

                            }










                            const ok = {
                                ok: "Se ha actualizado el estado de la cuenta",
                                estadoCuenta: nuevoEstado
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                eliminarCuentaDesdeAdministracion: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                            const error = "El campo usuarioIDX solo admite minúsculas y numeros"
                            throw new Error(error)
                        }

                        await conexion.query('BEGIN'); // Inicio de la transacción
                        // Validar si es un usuario administrador
                        const validarTipoCuenta = `
                        SELECT 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveValidarTipoCuenta = await conexion.query(validarTipoCuenta, [usuarioIDX])
                        const rol = resuelveValidarTipoCuenta.rows[0].rol
                        const rolAdministrador = "administrador"

                        if (rol === rolAdministrador) {
                            const validarUltimoAdministrador = `
                            SELECT 
                            rol
                            FROM usuarios
                            WHERE rol = $1;
                            `
                            const resuelValidarUltimoAdministrador = await conexion.query(validarUltimoAdministrador, [rolAdministrador])
                            if (resuelValidarUltimoAdministrador.rowCount === 1) {
                                const error = "No se puede eliminar esta cuenta por que es la unica cuenta adminsitradora existente. Si quieres eliminar esta cuenta tienes que crear otra cuenta administradora. Por que en el sistema debe de existir al menos una cuenta adminitrador"
                                throw new Error(error)
                            }
                        }


                        const cerrarSessiones = `
                        DELETE FROM sessiones
                        WHERE sess->> 'usuario' = $1;
                        `
                        await conexion.query(cerrarSessiones, [usuarioIDX])



                        const eliminarCuenta = `
                        DELETE FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveEliminarCuenta = await conexion.query(eliminarCuenta, [usuarioIDX])
                        if (resuelveEliminarCuenta.rowCount === 0) {
                            const error = "No se encuentra el usuario"
                            throw new Error(error)
                        }
                        if (resuelveEliminarCuenta.rowCount === 1) {
                            const ok = {
                                ok: "Se ha eliminado correctamente la cuenta de usuario",
                            }
                            salida.json(ok)
                        }
                        await conexion.query('COMMIT');
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK');

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                crearCuentaDesdeAdministracion: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        const clave = entrada.body.clave
                        const rol = entrada.body.rol

                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                            const error = "El campo usuarioIDX solo admite minúsculas y numeros y nada mas"
                            throw new Error(error)
                        }

                        if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
                            const error = "El nombre de usuario no esta disponbile, escoge otro"
                            throw new Error(error)
                        }

                        if (!rol) {
                            const error = "Selecciona un rol para la nueva cuenta de usuario"
                            throw new Error(error)
                        }

                        if (!filtro_minúsculas_numeros.test(rol)) {
                            const error = "El campo rol solo admite minúsculas y numeros y nada mas"
                            throw new Error(error)
                        }

                        // validar rol
                        const validarRol = `
                        SELECT 
                        rol
                        FROM "usuariosRoles"
                        WHERE rol = $1
                        `
                        const resuelveValidarRol = await conexion.query(validarRol, [rol])
                        if (resuelveValidarRol.rowCount === 0) {
                            const error = "No existe el rol, revisa el rol introducido"
                            throw new Error(error)
                        }


                        // comporbar que no exista la el usuario
                        const validarNuevoUsuario = `
                        SELECT 
                        usuario
                        FROM usuarios
                        WHERE usuario = $1
                        `
                        const resuelveValidarNuevoUsaurio = await conexion.query(validarNuevoUsuario, [usuarioIDX])
                        if (resuelveValidarNuevoUsaurio.rowCount > 0) {
                            const error = "El nombre de usuario no esta disponbile, escoge otro"
                            throw new Error(error)
                        }
                        await componentes.eliminarCuentasNoVerificadas()
                        const estadoCuenta = "desactivado"
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        const cryptoData = {
                            sentido: "cifrar",
                            clavePlana: clave
                        }

                        const retorno = vitiniCrypto(cryptoData)
                        const nuevaSal = retorno.nuevaSal
                        const hashCreado = retorno.hashCreado
                        const cuentaVerificada = "no"
                        const crearNuevoUsuario = `
                        INSERT INTO usuarios
                        (
                        usuario,
                        rol,
                        "estadoCuenta",
                        sal,
                        clave,
                        "cuentaVerificada"
                        )
                        VALUES 
                        ($1, $2, $3, $4, $5, $6)
                        RETURNING
                        usuario
                        `
                        const datosNuevoUsuario = [
                            usuarioIDX,
                            rol,
                            estadoCuenta,
                            nuevaSal,
                            hashCreado,
                            cuentaVerificada
                        ]
                        const resuelveCrearNuevoUsuario = await conexion.query(crearNuevoUsuario, datosNuevoUsuario)
                        if (resuelveCrearNuevoUsuario.rowCount === 0) {
                            const error = "No se ha insertado el nuevo usuario en la base de datos"
                            throw new Error(error)
                        }
                        const crearNuevosDatosUsuario = `
                        INSERT INTO "datosDeUsuario"
                        (
                        "usuarioIDX"
                        )
                        VALUES 
                        ($1)
                        `
                        const resuelveCrearNuevosDatosUsuario = await conexion.query(crearNuevosDatosUsuario, [usuarioIDX])
                        if (resuelveCrearNuevosDatosUsuario.rowCount === 0) {
                            const error = "No se ha insertado los datos del nuevo usuario"
                            throw new Error(error)
                        }
                        const ok = {
                            ok: "Se ha creado el nuevo usuario",
                            usuarioIDX: resuelveCrearNuevoUsuario.rows[0].usuario
                        }
                        salida.json(ok)

                        await conexion.query('COMMIT');
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK');

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                },
                obtenerRoles: async () => {
                    try {
                        const consultaRoles = `
                        SELECT 
                        rol, 
                        "rolUI"
                        FROM 
                        "usuariosRoles";`
                        const resolverConsultaRoles = await conexion.query(consultaRoles)
                        if (resolverConsultaRoles.rowCount === 0) {
                            const error = "No existe ningún rol"
                            throw new Error(error)
                        }
                        const roles = resolverConsultaRoles.rows
                        const ok = {
                            ok: roles
                        }
                        salida.json(ok)

                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }


                        salida.json(error)
                    } finally {

                    }

                },
                actualizarRolCuenta: async () => {
                    try {
                        const usuarioIDX = entrada.body.usuarioIDX
                        const nuevoRol = entrada.body.nuevoRol

                        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;

                        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                            const error = "El campo usuarioIDX solo admite minúsculas y numeros"
                            throw new Error(error)
                        }
                        if (!nuevoRol || !filtro_minúsculas_numeros.test(nuevoRol)) {
                            const error = "El rolIDX solo admine minúsculas y numeros y nada mas"
                            throw new Error(error)
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción

                        // Validas usaurios
                        const validarUsuario = `
                        SELECT 
                        usuario
                        FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveValidarUsuario = await conexion.query(validarUsuario, [usuarioIDX])
                        if (resuelveValidarUsuario.rowCount === 0) {
                            const error = "No existe el usuarios"
                            throw new Error(error)
                        }

                        // Validar rol
                        const validarRol = `
                        SELECT 
                        "rolUI",
                        rol
                        FROM "usuariosRoles"
                        WHERE rol = $1;
                        `
                        const resuelveValidarRol = await conexion.query(validarRol, [nuevoRol])
                        if (resuelveValidarRol.rowCount === 0) {
                            const error = "No existe el rol"
                            throw new Error(error)
                        }
                        const rolUI = resuelveValidarRol.rows[0].rolUI
                        const rolIDV = resuelveValidarRol.rows[0].rol

                        // Validar que el usuario que hace el cambio sea administrador
                        const IDXActor = entrada.session.usuario
                        const validarIDXActor = `
                        SELECT 
                        rol
                        FROM usuarios
                        WHERE usuario = $1;
                        `
                        const resuelveValidarIDXActor = await conexion.query(validarIDXActor, [IDXActor])
                        if (resuelveValidarIDXActor.rowCount === 0) {
                            const error = "No existe el usuario de origen que intenta realizar esta operacion."
                            throw new Error(error)
                        }

                        const rolActor = resuelveValidarIDXActor.rows[0].rol
                        if (rolActor !== "administrador") {
                            const error = "No estas autorizado a realizar un cambio de rol. Solo los Administradores pueden realizar cambios de rol"
                            throw new Error(error)

                        }

                        const actualizarRol = `
                        UPDATE
                        usuarios
                        SET
                        rol = $1
                        WHERE
                        usuario = $2;
                        `
                        const resuelveActualizarRol = await conexion.query(actualizarRol, [nuevoRol, usuarioIDX])
                        if (resuelveActualizarRol.rowCount === 0) {
                            const error = "No se ha podido actualizar el rol de este usuario"
                            throw new Error(error)
                        }


                        // Actualizar la fila sessiones
                        const consultaActualizarSessionesActuales = `
                        UPDATE sessiones
                        SET sess = jsonb_set(sess::jsonb, '{rol}', to_jsonb($2::text))
                        WHERE sess->>'usuario' = $1;`;
                        await conexion.query(consultaActualizarSessionesActuales, [usuarioIDX, nuevoRol])

                        const ok = {
                            ok: "Se ha actualizado el rol en esta cuenta",
                            rolIDV: rolIDV,
                            rolUI: rolUI
                        }
                        salida.json(ok)

                        await conexion.query('COMMIT'); // Confirmar la transacción
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error

                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    } finally {

                    }
                }
            },
            componentes: {
                apartamentosDisponiblesConfigurados: async () => {
                    try {
                        const apartamentosDisponiblesParaCrearOfertas = `
                        SELECT 
                        ca."apartamentoIDV",
                        ea."estadoUI",
                        a."apartamentoUI"
                        FROM "configuracionApartamento" ca
                        JOIN "estadoApartamentos" ea ON ca."estadoConfiguracion" = ea.estado
                        JOIN apartamentos a ON ca."apartamentoIDV" = a.apartamento;            
          
                        `
                        const resulveApartamentosDisponiblesParaCrearOfertas = await conexion.query(apartamentosDisponiblesParaCrearOfertas)
                        if (resulveApartamentosDisponiblesParaCrearOfertas.rowCount === 0) {
                            const error = "No hay ningun apartamento disponible configurado"
                            throw new Error(error)
                        }
                        const apartamenosDisponiblesEcontrados = resulveApartamentosDisponiblesParaCrearOfertas.rows
                        const ok = {
                            ok: apartamenosDisponiblesEcontrados
                        }
                        salida.json(ok)
                    } catch (errorCatpurado) {
                        const error = {
                            error: errorCapurado.message
                        }
                        salida.json(error)
                    } finally {

                    }
                },

                UI: async () => {
                    try {
                        const administracionJS = administracionUI()

                        const ok = {
                            ok: administracionJS
                        }
                        salida.json(ok)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }
                },
                calculadora: () => {

                    try {
                        const numero1 = entrada.body.numero1
                        const numero2 = entrada.body.numero2
                        const operador = entrada.body.operador
                        const validarNumero = (numero) => {
                            const regex = /^-?\d+(\.\d{1,2})?$/;
                            return regex.test(numero);
                        }
                        const validarOperador = (operador) => {
                            const operadoresValidos = ['+', '-', '*', '/', '%'];
                            return operadoresValidos.includes(operador);
                        }

                        if (!validarNumero(numero1) || !validarNumero(numero2)) {
                            const error = 'Entrada no válida. Por favor, ingrese números enteros o con hasta dos decimales.';
                            throw new Error(error)
                        }
                        if (!validarOperador(operador)) {
                            const error = 'Operador no válido. Los operadores válidos son +, -, *, /.';
                            throw new Error(error)

                        }
                        const resultado = utilidades.calculadora(numero1, numero2, operador)
                        const ok = {
                            ok: resultado
                        }
                        salida.json(ok)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }

                        salida.json(error)
                    }







                },
                crearEnlacesPDF: async () => {

                    try {
                        const reserva = entrada.body.reserva
                        const enlaces = await componentes.gestionEnlacesPDF.crearEnlacePDF(reserva)

                        const ok = {
                            ok: "ok",
                            enlaces: enlaces
                        }
                        salida.json(ok)
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        }
                        salida.json(error)
                    }


                }

            },
            calendario: {
                capas: {
                    reservas: async () => {
                        try {
                            const fecha = entrada.body.fecha
                            const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;

                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
                                throw new Error(error)
                            }
                            const eventos = await eventosReservas(fecha)
                            const ok = {
                                ok: "Aqui tienes las reservas de este mes",
                                ...eventos
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return salida.json(error)
                        }
                    },
                    todosLosApartamentos: async () => {
                        try {
                            const fecha = entrada.body.fecha
                            const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;

                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
                                throw new Error(error)
                            }

                            const eventos = await eventosTodosLosApartamentos(fecha)
                            const ok = {
                                ok: "Aqui tienes todos los apartamentos de este mes",
                                ...eventos
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return salida.json(error)
                        }
                    },
                    todosLosBloqueos: async () => {
                        try {
                            const fecha = entrada.body.fecha
                            const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;

                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
                                throw new Error(error)
                            }
                            await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()
                            const eventos = await eventosTodosLosBloqueos(fecha)

                            const ok = {
                                ok: "Aqui tienes todos los apartamentos de este mes",
                                ...eventos
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return salida.json(error)
                        }
                    },
                    porApartamento: async () => {
                        try {
                            const fecha = entrada.body.fecha
                            const apartamentoIDV = entrada.body.apartamentoIDV
                            const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;

                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
                                throw new Error(error)
                            }
                            const filtroCadena = /^[a-z0-9]+$/;
                            if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
                                const error = "el campo 'apartamentoIDV' solo puede ser una cadena de letras minúsculas y numeros."
                                throw new Error(error)
                            }
                            await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()
                            const metadatosEventos = {
                                fecha: fecha,
                                apartamentoIDV: apartamentoIDV
                            }
                            const eventos = await eventosPorApartamneto(metadatosEventos)
                            const ok = {
                                ok: "Aqui tienes las reservas de este mes",
                                ...eventos
                            }
                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return salida.json(error)
                        }
                    },
                    global: async () => {

                        try {
                            const fecha = entrada.body.fecha
                            const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
                                throw new Error(error)
                            }
                            const constructorObjetoPorDias = (fecha) => {
                                const fechaArray = fecha.split("-")
                                const mes = fechaArray[0]
                                const ano = fechaArray[1]
                                const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
                                const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
                                const calendarioObjeto = {}
                                for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
                                    const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`
                                    calendarioObjeto[llaveCalendarioObjeto] = []
                                }
                                return calendarioObjeto
                            }
                            const mesPorDias = constructorObjetoPorDias(fecha)

                            const estructuraGlobal = {
                                eventosMes: mesPorDias,
                                eventosEnDetalles: []
                            }

                            const eventosReservas_ = await eventosReservas(fecha)

                            for (const [fechaDia, contenedorEventos] of Object.entries(eventosReservas_.eventosMes)) {
                                const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                selectorDia.push(...contenedorEventos)
                            }
                            estructuraGlobal.eventosEnDetalles.push(...eventosReservas_.eventosEnDetalle)


                            const eventosTodosLosApartamentos_ = await eventosTodosLosApartamentos(fecha)
                            for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosApartamentos_.eventosMes)) {
                                const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                selectorDia.push(...contenedorEventos)
                            }
                            estructuraGlobal.eventosEnDetalles.push(...eventosTodosLosApartamentos_.eventosEnDetalle)


                            const eventosTodosLosBloqueos_ = await eventosTodosLosBloqueos(fecha)
                            for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosBloqueos_.eventosMes)) {
                                const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                selectorDia.push(...contenedorEventos)
                            }
                            estructuraGlobal.eventosEnDetalles.push(...eventosTodosLosBloqueos_.eventosEnDetalle)


                            // Obtengo todo los uids de los calendarios sincronizados en un objeto y lo itero
                            const plataformaAibnb = "airbnb"
                            const obtenerUIDCalendriosSincronizadosAirbnb = `
                            SELECT uid
                            FROM "calendariosSincronizados"
                            WHERE "plataformaOrigen" = $1
                            `
                            const calendariosSincronizadosAirbnbUIDS = await conexion.query(obtenerUIDCalendriosSincronizadosAirbnb, [plataformaAibnb])
                            if (calendariosSincronizadosAirbnbUIDS.rowCount > 0) {

                                const calendariosUIDS = calendariosSincronizadosAirbnbUIDS.rows.map((calendario) => {
                                    return calendario.uid
                                })

                                for (const calendarioUID of calendariosUIDS) {
                                    const metadatosEventos = {
                                        fecha: fecha,
                                        calendarioUID: String(calendarioUID)
                                    }
                                    
                                    const eventosPorApartamentoAirbnb_ = await eventosPorApartamentoAirbnb(metadatosEventos)
                                    for (const [fechaDia, contenedorEventos] of Object.entries(eventosPorApartamentoAirbnb_.eventosMes)) {
                                        const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                        selectorDia.push(...contenedorEventos)
                                    }
                                    estructuraGlobal.eventosEnDetalles.push(...eventosPorApartamentoAirbnb_.eventosEnDetalle)
                                }
                            }

                            salida.json(estructuraGlobal)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return salida.json(error)
                        }


                    },
                    multiCapa: async () => {
                        try {
                            const fecha = entrada.body.fecha
                            const contenedorCapas = entrada.body.contenedorCapas
                            const capas = contenedorCapas?.capas
                            const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
                                throw new Error(error)
                            }

                            if (!capas) {
                                const error = "Falta determinar capas, debe de ser un array con las cadenas de las capasIDV"
                                throw new Error(error)
                            }
                            if (!Array.isArray(capas) || capas == null || capas === undefined) {
                                const error = "El campo capaIDV debe de ser un array con cadenas"
                                throw new Error(error)
                            }
                            const filtroCapa = /^[a-zA-Z0-9]+$/
                            const controlCapaIDV = capas.every(cadena => {
                                if (typeof cadena !== "string") {
                                    return false
                                }
                                return filtroCapa.test(cadena);
                            });
                            if (!controlCapaIDV) {
                                const error = "Los identificadores visuales de las capas solo pueden contener, minusculas, mayusculas y numeros"
                                throw new Error(error)
                            }
                            const constructorObjetoPorDias = (fecha) => {
                                const fechaArray = fecha.split("-")
                                const mes = fechaArray[0]
                                const ano = fechaArray[1]
                                const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
                                const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
                                const calendarioObjeto = {}
                                for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
                                    const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`
                                    calendarioObjeto[llaveCalendarioObjeto] = []
                                }
                                return calendarioObjeto
                            }
                            const mesPorDias = constructorObjetoPorDias(fecha)
                            const estructuraGlobal = {
                                eventosMes: mesPorDias,
                                eventosEnDetalle: []
                            }

                            const capasComoComponentes = {
                                reservas: async () => {
                                    const eventosReservas_ = await eventosReservas(fecha)
                                    for (const [fechaDia, contenedorEventos] of Object.entries(eventosReservas_.eventosMes)) {
                                        const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                        selectorDia.push(...contenedorEventos)
                                    }
                                    estructuraGlobal.eventosEnDetalle.push(...eventosReservas_.eventosEnDetalle)
                                },
                                todosLosApartamentos: async () => {
                                    const eventosTodosLosApartamentos_ = await eventosTodosLosApartamentos(fecha)
                                    for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosApartamentos_.eventosMes)) {
                                        const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                        selectorDia.push(...contenedorEventos)
                                    }
                                    estructuraGlobal.eventosEnDetalle.push(...eventosTodosLosApartamentos_.eventosEnDetalle)
                                },
                                todosLosBloqueos: async () => {
                                    await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado()

                                    const eventosTodosLosBloqueos_ = await eventosTodosLosBloqueos(fecha)
                                    for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosBloqueos_.eventosMes)) {
                                        const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                        selectorDia.push(...contenedorEventos)
                                    }
                                    estructuraGlobal.eventosEnDetalle.push(...eventosTodosLosBloqueos_.eventosEnDetalle)
                                },
                                porApartamento: async () => {
                                    const apartamentosIDV = contenedorCapas.capasCompuestas.porApartamento
                                    if (!Array.isArray(apartamentosIDV) || apartamentosIDV == null || apartamentosIDV === undefined) {
                                        const error = "El campo apartamentosIDV debe de ser un array con cadenas"
                                        throw new Error(error)
                                    }
                                    const filtroCapa = /^[a-zA-Z0-9]+$/
                                    const controlApartamentoIDV = apartamentosIDV.every(cadena => {
                                        if (typeof cadena !== "string") {
                                            return false
                                        }
                                        return filtroCapa.test(cadena);
                                    });
                                    if (!controlApartamentoIDV) {
                                        const error = "Los identificadores visuales de los apartamentos solo pueden contener, minusculas, mayusculas y numeros"
                                        throw new Error(error)
                                    }

                                    // Validar que le nombre del apartamento existe como tal
                                    const obtenerApartamentosIDV = `
                                        SELECT "apartamentoIDV"
                                        FROM "configuracionApartamento"
                                        `
                                    const resuelveApartamentosIDV = await conexion.query(obtenerApartamentosIDV)
                                    if (resuelveApartamentosIDV.rowCount > 0) {
                                        const apartamentosIDVValidos = resuelveApartamentosIDV.rows.map((apartamentoIDV) => {
                                            return apartamentoIDV.apartamentoIDV
                                        })

                                        const controlApartamentosF2 = apartamentosIDV.every(apartamentosIDV => apartamentosIDVValidos.includes(apartamentosIDV));

                                        if (!controlApartamentosF2) {
                                            const elementosFaltantes = apartamentosIDV.filter(apartamentosIDV => !apartamentosIDVValidos.includes(apartamentosIDV));
                                            let error
                                            if (elementosFaltantes.length === 1) {
                                                error = "En el array de apartamentosIDV hay un identificador que no existe: " + elementosFaltantes[0]
                                            } if (elementosFaltantes.length === 2) {
                                                error = "En el array de apartamentosIDV hay identifcadores que no existen: " + elementosFaltantes.join("y")
                                            }
                                            if (elementosFaltantes.length > 2) {
                                                const conComa = elementosFaltantes
                                                const ultima = elementosFaltantes.pop()
                                                error = "En el array de apartamentosIDV hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima
                                            }
                                            throw new Error(error)
                                        }

                                        for (const apartamentoIDV of apartamentosIDV) {
                                            const metadatosEventos = {
                                                fecha: fecha,
                                                apartamentoIDV: apartamentoIDV
                                            }
                                            const eventos = await eventosPorApartamneto(metadatosEventos)
                                            for (const [fechaDia, contenedorEventos] of Object.entries(eventos.eventosMes)) {
                                                const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                                selectorDia.push(...contenedorEventos)
                                            }
                                            estructuraGlobal.eventosEnDetalle.push(...eventos.eventosEnDetalle)
                                        }
                                    }


                                },
                                todoAirbnb: async () => {
                                    // Obtengo todo los uids de los calendarios sincronizados en un objeto y lo itero
                                    const plataformaAibnb = "airbnb"
                                    const obtenerUIDCalendriosSincronizadosAirbnb = `
                                       SELECT uid
                                       FROM "calendariosSincronizados"
                                       WHERE "plataformaOrigen" = $1
                                       `
                                    const calendariosSincronizadosAirbnbUIDS = await conexion.query(obtenerUIDCalendriosSincronizadosAirbnb, [plataformaAibnb])
                                    if (calendariosSincronizadosAirbnbUIDS.rowCount > 0) {

                                        const calendariosUIDS = calendariosSincronizadosAirbnbUIDS.rows.map((calendario) => {
                                            return calendario.uid
                                        })

                                        for (const calendarioUID of calendariosUIDS) {
                                            const metadatosEventos = {
                                                fecha: fecha,
                                                calendarioUID: String(calendarioUID)
                                            }
                                            
                                            const eventosPorApartamentoAirbnb_ = await eventosPorApartamentoAirbnb(metadatosEventos)
                                            for (const [fechaDia, contenedorEventos] of Object.entries(eventosPorApartamentoAirbnb_.eventosMes)) {
                                                const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                                selectorDia.push(...contenedorEventos)
                                            }
                                            estructuraGlobal.eventosEnDetalle.push(...eventosPorApartamentoAirbnb_.eventosEnDetalle)
                                        }
                                    }
                                },
                                calendariosAirbnb: async () => {

                                    const calendariosUID = contenedorCapas.capasCompuestas.calendariosAirbnb

                                    const filtroCadena = /^[0-9]+$/;
                                    if (!calendariosUID) {
                                        const error = "Falta determinar calendariosUID, debe de ser un array con las cadenas de los calendariosUID de airbnb"
                                        throw new Error(error)
                                    }
                                    if (!Array.isArray(capas) || capas == null || capas === undefined) {
                                        const error = "El campo calendariosUID debe de ser un array con cadenas"
                                        throw new Error(error)
                                    }
                                    const controlCalendariosUID = calendariosUID.every(cadena => {
                                        if (typeof cadena !== "string") {
                                            return false
                                        }
                                        return filtroCapa.test(cadena);
                                    });

                                    if (!controlCalendariosUID) {
                                        const error = "Los identificadores visuales de los calendariod de airbnb solo pueden ser cadenas que contengan contener numeros"
                                        throw new Error(error)
                                    }

                                    // Validar que le nombre del apartamento existe como tal
                                    const plataformaOrigen = "airbnb"
                                    const obtenerCalendariosUID = `
                                        SELECT uid
                                        FROM "calendariosSincronizados"
                                        WHERE "plataformaOrigen" = $1
                                        `
                                    const resuelveCalendariosUID = await conexion.query(obtenerCalendariosUID, [plataformaOrigen])
                                    if (resuelveCalendariosUID.rowCount > 0) {

                                        const calendariosUIDValidos = resuelveCalendariosUID.rows.map((calendarioUID) => {
                                            return String(calendarioUID.uid)
                                        })
                                        
                                        const controlCalendariosF2 = calendariosUID.every(calendariosUID => calendariosUIDValidos.includes(calendariosUID));

                                        if (!controlCalendariosF2) {
                                            const elementosFaltantes = calendariosUID.filter(calendariosUID => !calendariosUIDValidos.includes(calendariosUID));
                                            let error
                                            if (elementosFaltantes.length === 1) {
                                                error = "En el array de calendariosUIDS hay un identificador que no existe: " + elementosFaltantes[0]
                                            } if (elementosFaltantes.length === 2) {
                                                error = "En el array de calendariosUIDS hay identifcadores que no existen: " + elementosFaltantes.join("y")
                                            }
                                            if (elementosFaltantes.length > 2) {
                                                const conComa = elementosFaltantes
                                                const ultima = elementosFaltantes.pop()
                                                error = "En el array de calendariosUIDS hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima
                                            }
                                            throw new Error(error)
                                        }
                                        for (const calendarioUID of calendariosUID) {
                                            const metadatosEventos = {
                                                fecha: fecha,
                                                calendarioUID: calendarioUID
                                            }
                                            const eventos = await eventosPorApartamentoAirbnb(metadatosEventos)
                                            for (const [fechaDia, contenedorEventos] of Object.entries(eventos.eventosMes)) {
                                                const selectorDia = estructuraGlobal.eventosMes[fechaDia]
                                                selectorDia.push(...contenedorEventos)
                                            }
                                            estructuraGlobal.eventosEnDetalle.push(...eventos.eventosEnDetalle)

                                        }
                                    }


                                },
                                global: async () => {
                                    await capasComoComponentes.reservas()
                                    await capasComoComponentes.todosLosApartamentos()
                                    await capasComoComponentes.todosLosBloqueos()
                                    await capasComoComponentes.todoAirbnb()
                                }
                            }
                            const capasDisponibles = Object.keys(capasComoComponentes)
                            const todosPresentes = capas.every(capa => capasDisponibles.includes(capa));

                            if (!todosPresentes) {
                                const elementosFaltantes = capas.filter(capa => !capasDisponibles.includes(capa));
                                let error
                                if (elementosFaltantes.length === 1) {
                                    error = "En el array de capasIDV hay un identificador que no existe: " + elementosFaltantes[0]
                                } if (elementosFaltantes.length === 2) {
                                    error = "En el array de capasIDV hay identifcadores que no existen: " + elementosFaltantes.join("y")
                                }
                                if (elementosFaltantes.length > 2) {
                                    const conComa = elementosFaltantes
                                    const ultima = elementosFaltantes.pop()
                                    error = "En el array de capasIDV hay identifcadores que no existen: " + conComa.join(", ") + " y " + ultima
                                }
                                throw new Error(error)
                            }
                            for (const capa of capas) {
                                await capasComoComponentes[capa]()
                            }
                            const ok = {
                                ok: "Eventos del calendario",
                                ...estructuraGlobal
                            }
                            salida.json(ok)
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }
                            return salida.json(error)
                        }
                    },
                    calendariosSincronizados: {
                        airbnb: async () => {
                            try {
                                const fecha = entrada.body.fecha
                                const calendarioUID = entrada.body.calendarioUID
                                const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;

                                if (!filtroFecha.test(fecha)) {
                                    const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
                                    throw new Error(error)
                                }
                                const filtroCadena = /^[0-9]+$/;
                                if (!filtroCadena.test(calendarioUID) || typeof calendarioUID !== "string") {
                                    const error = "el campo 'calendarioUID' solo puede ser una cadena de letras minúsculas y numeros."
                                    throw new Error(error)
                                }

                                const metadatosEventos = {
                                    fecha: fecha,
                                    calendarioUID: calendarioUID
                                }
                                const eventos = await eventosPorApartamentoAirbnb(metadatosEventos)

                                const ok = {
                                    ok: "Aqui tienes las reservas de este mes",
                                    ...eventos

                                }
                                salida.json(ok)

                            } catch (errorCapturado) {
                                const error = {
                                    error: errorCapturado.message
                                }

                                return salida.json(error)
                            }
                        }
                    }
                },
                obtenerNombresCalendarios: {
                    airbnb: async () => {
                        try {

                            const ok = {
                                ok: "Lista con metadtos de los calendarios sincronizados de airbnb",
                                calendariosSincronizados: []
                            }
                            const plataformaOrigen = "airbnb"
                            const consultaCalendarios = `
                            SELECT
                                uid,
                                nombre,
                                "apartamentoIDV"
                            FROM 
                                "calendariosSincronizados"
                            WHERE 
                                "plataformaOrigen" = $1;`
                            const resuelveCalendarios = await conexion.query(consultaCalendarios, [plataformaOrigen])

                            for (const detallesDelCalendario of resuelveCalendarios.rows) {
                                const apartamentoIDV = detallesDelCalendario.apartamentoIDV
                                detallesDelCalendario.apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
                            }

                            ok.calendariosSincronizados = [...resuelveCalendarios.rows]

                            salida.json(ok)

                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            }

                            return salida.json(error)
                        }
                    }
                }
            }
        }
    };
    try {
        const zona = entrada.body.zona
        if (!zona) {
            const error = "zonaIndefinida"
            throw new Error(error)
        }
        const filtroZona = /^[a-zA-Z\/\-_]+$/
        if (!filtroZona.test(zona)) {
            const error = "Las rutas de la zonas solo admiten minusculas y mayusculas junto con barras, nada mas ni siqueira espacios"
            throw new Error(error)
        }

        let arbol = zona.split("/")
        arbol = arbol.filter(rama => rama.trim() !== "");
        if (!arbol) {
            const error = "arbolNoDefinido"
            throw new Error(error)
        }
        let arbolVolatil = casaVitini
        const rol = entrada.session?.rol
        for (const rama of arbol) {
            if (arbolVolatil.hasOwnProperty(rama)) {
                const controlIDX = arbolVolatil[rama]
                if (controlIDX.hasOwnProperty("IDX")) {

                    const usuarioIDX = entrada.session.usuario
                    // Primero estas idenfiticao o no
                    if (!usuarioIDX) {
                        const error = "IDX"
                        throw new Error(error)
                    }
                    if (controlIDX.IDX.hasOwnProperty("ROL")) {
                        // Luego si tiene rol o no, Si tiene rol, cual
                        const roles = controlIDX.IDX.ROL
                        if (!roles.includes(rol)) {
                            const error = "ROL"
                            throw new Error(error)
                        }
                    }

                }
                arbolVolatil = arbolVolatil[rama]
            } else {
                const error = "zonaInexistente"
                throw new Error(error)
            }
        }
        if (arbolVolatil.hasOwnProperty("IDX")) {
            arbolVolatil = arbolVolatil.X
        }
        if (typeof arbolVolatil !== "function") {
            const error = "zonaSinEjecucion"
            throw new Error(error)
        }
        return arbolVolatil()
    } catch (errorCapturado) {
        const estructuraFinal = {}
        if (errorCapturado.message === "IDX") {
            estructuraFinal.tipo = "IDX"
            estructuraFinal.mensaje = "Tienes que identificarte para seguir"
        } else if (errorCapturado.message === "ROL") {
            estructuraFinal.tipo = "ROL"
            estructuraFinal.mensaje = "No estas autorizado, necesitas una cuenta de mas autoridad para acceder aqui"
        } else if (errorCapturado.message === "zonaInexistente") {
            estructuraFinal.tipo = "zonaInexistente"
            estructuraFinal.mensaje = "La zona no existe"
        } else if (errorCapturado.message === "zonaSinEjecucion") {
            estructuraFinal.tipo = "zonaSinEjecucion"
            estructuraFinal.mensaje = "La zona no es procesable"
        } else if (errorCapturado.message === "arbolNoDefinido") {
            estructuraFinal.tipo = "arbolNoDefinido"
            estructuraFinal.mensaje = "Ningun arbol definido"
        } else if (errorCapturado.message === "zonaIndefinida") {
            estructuraFinal.tipo = "zonaIndefinida"
            estructuraFinal.mensaje = "No se ha definido la zona"
        } else {
            estructuraFinal.tipo = "rutaDeZonaIncompatible"
            estructuraFinal.mensaje = errorCapturado.message
        }

        salida.json(estructuraFinal)
    };
    salida.end()
}

const calendarios_compartidos = async (entrada, salida) => {
    try {
        const url = entrada.url.toLowerCase()
        const filtroUrl = /^[a-zA-Z0-9/_]+$/;
        if (!filtroUrl.test(url)) {
            const error = "La url no es valida"
            throw new Error(error)
        }
        const urlArray = url.toLowerCase()
            .split("/")
            .filter(url => url.trim() !== "calendarios_compartidos")
            .filter(url => url.trim() !== "")
        const calendarioUID = urlArray[0];
        

        //Verificara que existe el calendarios
        // ENFOQUE ERRONEO ->> Hay que mostrar los eventos de CASAVITINI por apartmento durante un año a partir de hoy!!!!!! por que este calendario es para sincronizar con las otras plataformas
        const consultaConfiguracion = `
            SELECT 
            uid,
            nombre,
            url,
            "apartamentoIDV",
            "dataIcal",
            "plataformaOrigen"
            FROM 
            "calendariosSincronizados"
            WHERE
            "uidPublico" = $1
            `
        const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [calendarioUID])
        if (resuelveCalendariosSincronizados.rowCount === 0) {
            salida.status(404).end();
        }

        if (resuelveCalendariosSincronizados.rowCount === 1) {

            const detallesDelCalendario = resuelveCalendariosSincronizados.rows[0]
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
            detallesDelCalendario.apartamentoUI = apartamentoUI
            const datosCalendario = resuelveCalendariosSincronizados.rows

            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
            const tiempoZH = DateTime.now().setZone(zonaHoraria);
            const fechaActual_ISO = tiempoZH.toISODate()
            const fechaLimite = tiempoZH.plus({ days: 360 }).toISODate();
            const fechaInicio = DateTime.fromISO(fechaActual_ISO);
            const fechaFin = DateTime.fromISO(fechaLimite);

            const generarFechasEnRango = (fechaInicio, fechaFin) => {
                const fechasEnRango = [];
                let fechaActual = fechaInicio;

                while (fechaActual <= fechaFin) {
                    fechasEnRango.push(fechaActual.toISODate());
                    fechaActual = fechaActual.plus({ days: 1 });
                }
                return fechasEnRango;
            }

            const arrayFechas = generarFechasEnRango(fechaInicio, fechaFin)
            const objetoFechas = {}

            for (const fecha of arrayFechas) {
                objetoFechas[fecha] = {}

            }

            // Primero buscamso si hay bloqueos permanentes
            // si no hay procedemos a buscar bloquoeos temporales y reservas
            const bloqueoPermanente = "permanente"
            const consultaBloqueosPermanentes = `
            SELECT apartamento 
            FROM "bloqueosApartamentos" 
            WHERE 
            "tipoBloqueo" = $1 AND
            apartamento = $2;`
            const resuelveBloqueosPermanentes = await conexion.query(consultaBloqueosPermanentes, [bloqueoPermanente, apartamentoIDV])
            const bloqueosPermamentes = resuelveBloqueosPermanentes.rows
            const eventos = []

            if (bloqueosPermamentes.length > 0) {
                for (const detallesdelBloqueo of bloqueosPermamentes) {
                    const estructuraEVENTO = {
                        start: fechaInicio,
                        end: fechaFin,
                        summary: 'Bloqueo permanente en casavitini.com',
                        description: 'Bloqueo permanente aplicado al ' + apartamentoUI
                    }
                    eventos.push(estructuraEVENTO)
                }
            } else {
                const bloqueoTemporal = "rangoTemporal"

                const apartamenosBloqueadosTemporalmente = `
                SELECT 
                apartamento,
                to_char(entrada, 'YYYY-MM-DD') as "entrada", 
                to_char(salida, 'YYYY-MM-DD') as "salida" 
                FROM "bloqueosApartamentos" 
                WHERE 
                "tipoBloqueo" = $1 AND
                entrada <= $3::DATE AND
                salida >= $2::DATE;`
                const datosConsultaBloqueos = [
                    bloqueoTemporal,
                    fechaActual_ISO,
                    fechaLimite
                ]
                const resuelveBloqueosTemporales = await conexion
                    .query(apartamenosBloqueadosTemporalmente, datosConsultaBloqueos)

                const bloqueosTemporales = resuelveBloqueosTemporales.rows
                

                for (const detalleDelBloqueo of bloqueosTemporales) {

                    const fechaEntradaBloqueo_ISO = detalleDelBloqueo.entrada
                    const fechaSalidaBloqueo_ISO = detalleDelBloqueo.salida

                    const estructuraEVENTO = {
                        start: DateTime.fromISO(fechaEntradaBloqueo_ISO),
                        end: DateTime.fromISO(fechaSalidaBloqueo_ISO),
                        summary: 'Bloqueo temporal en casavitini.com',
                        description: 'Bloqueo temporal aplicado al ' + apartamentoUI
                    }
                    eventos.push(estructuraEVENTO)



                }


                const consultaReservas = `
                SELECT 
                reserva,
                to_char(entrada, 'YYYY-MM-DD') as "entrada", 
                to_char(salida, 'YYYY-MM-DD') as "salida"
                FROM reservas 
                WHERE 
                entrada < $2::DATE AND
                salida > $1::DATE    
                AND "estadoReserva" <> 'cancelada';`

                const resuelveReservas = await conexion.query(consultaReservas, [fechaActual_ISO, fechaLimite])
                for (const detallesReserva of resuelveReservas.rows) {
                    const reservaUID = detallesReserva.reserva
                    const fechaEntrada_ISO = detallesReserva.entrada
                    const fechaSalida_ISO = detallesReserva.salida

                    const consultaApartamentoEnReserva = `
                    SELECT apartamento 
                    FROM "reservaApartamentos" 
                    WHERE reserva = $1 AND apartamento = $2;`
                    const resuelveApartamento = await conexion.query(consultaApartamentoEnReserva, [reservaUID, apartamentoIDV])
                    // 
                    // Aqui esta el error

                    const apartamentosDeLaReserva = resuelveApartamento.rows
                    for (const apartamentos of apartamentosDeLaReserva) {
                        if (apartamentos.apartamento === apartamentoIDV) {

                            const estructuraEVENTO = {
                                start: DateTime.fromISO(fechaEntrada_ISO),
                                end: DateTime.fromISO(fechaSalida_ISO),
                                summary: 'Apartamento reservado en casavitini.com: ' + apartamentoUI,
                                description: 'Apartamento en reserva: ' + reservaUID
                            }
                            eventos.push(estructuraEVENTO)
                        }

                    }


                    if (resuelveApartamento.rows === 1) {
                        // 

                        const evento = {
                            start: DateTime.fromISO(fechaEntrada_ISO),
                            end: DateTime.fromISO(fechaSalida_ISO),
                            sumario: "Reserva " + reservaUID,
                            descripcion: "Reserva en CasaVitini del " + apartamentoUI
                        }
                        eventos.push(evento)
                    }
                }






            }

            const exportarCalendario_ = await exportarClendario(eventos)
            const icalData = exportarCalendario_
            salida.attachment('eventos.ics');
            salida.send(icalData);



        }







    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        }
        salida.json(error)
    }
}


export default {
    arranque,
    calendarios_compartidos,
    puerto
}


