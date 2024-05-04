import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { codigoZonaHoraria } from "../../../sistema/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { DateTime } from "luxon";
import { validarModificacionRangoFechaResereva } from "../../../sistema/validadores/validarModificacionRangoFechaResereva.mjs";
import { insertarTotalesReserva } from "../../../sistema/sistemaDeReservas/insertarTotalesReserva.mjs";
import { vitiniSysError } from "../../../sistema/vitiniSysError.mjs";


export const confirmarModificarFechaReserva = async (entrada, salida) => {
    const mutex = new Mutex();
    const bloqueoConfirmarModificarFechaReserva = await mutex.acquire();
    try {
        const reserva = entrada.body.reserva;
        const sentidoRango = entrada.body.sentidoRango;
        const fechaSolicitada_ISO = entrada.body.fechaSolicitada_ISO;
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro";
            throw new Error(error);
        }
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaSolicitada_ISO);
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaSolicitada_objeto = DateTime.fromISO(fechaSolicitada_ISO, { zone: zonaHoraria });
        const fechaSolicitada_array = fechaSolicitada_ISO.split("-");
        await conexion.query('BEGIN'); // Inicio de la transacción
        const mesSeleccionado = fechaSolicitada_array[1];
        const anoSeleccionado = fechaSolicitada_array[0];
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
                        `;
        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
        if (resuelveValidacionReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada, una reserva cancelada no interfiere en los dias ocupados";
            throw new Error(error);
        }
        const detallesReserva = resuelveValidacionReserva.rows[0];
        const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO;
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        const fechaSalida_ISO = detallesReserva.fechaSalida_ISO;
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria });
        const metadatos = {
            reserva: reserva,
            mesCalendario: mesSeleccionado,
            anoCalendario: anoSeleccionado,
            sentidoRango: sentidoRango
        };
        if (sentidoRango === "pasado") {



            if (fechaSalida_Objeto <= fechaSolicitada_objeto) {
                const mensajeSinPasado = "La fecha nueva fecha de entrada solicitada no puede ser igual o superior a la fecha de salida de la reserva.";
                throw new Error(mensajeSinPasado);
            }
            const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
            const codigoFinal = transaccionInterna.ok;
            const transaccionPrecioReserva = {
                tipoProcesadorPrecio: "uid",
                reservaUID: reserva
            };
            const mensajeSinPasado = "No se puede aplicar esa fecha de entrada a la reserva por que en base a los apartamentos de esa reserva no hay dias libres. Puedes ver a continuacíon lo eventos que lo impiden.";


            if ((codigoFinal === "noHayRangoPasado")
                &&
                (fechaEntrada_Objeto > fechaSolicitada_objeto)) {
                const estructura = {
                    detallesDelError: mensajeSinPasado,
                    ...transaccionInterna
                };
                throw new vitiniSysError(estructura);
            }

            if ((codigoFinal === "rangoPasadoLimitado")
                &&
                (fechaEntrada_Objeto > fechaSolicitada_objeto)) {
                const fechaLimite_objeto = DateTime.fromISO(transaccionInterna.limitePasado);
                if (fechaLimite_objeto > fechaSolicitada_objeto) {
                    const estructura = {
                        detallesDelError: mensajeSinPasado,
                        ...transaccionInterna
                    };
                    throw new vitiniSysError(estructura);
                }
            }
            const actualizarModificacionFechaEntradaReserva = `
                            UPDATE reservas
                            SET entrada = $1
                            WHERE reserva = $2
                            RETURNING
                            to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO";
                            `;
            const resuelveActualizarModificacionFechaEntradaReserva = await conexion.query(actualizarModificacionFechaEntradaReserva, [fechaSolicitada_ISO, reserva]);
            if (resuelveActualizarModificacionFechaEntradaReserva.rowCount === 1) {
                const nuevaFechaEntrada = resuelveActualizarModificacionFechaEntradaReserva.rows[0].fechaEntrada_ISO;
                await insertarTotalesReserva(transaccionPrecioReserva);
                const ok = {
                    ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                    sentidoRango: "pasado",
                    fecha_ISO: nuevaFechaEntrada
                };
                salida.json(ok);
            }
        }
        if (sentidoRango === "futuro") {
            if (fechaSolicitada_objeto <= fechaEntrada_Objeto) {
                const error = "La fecha de salida solicitada no puede ser igual o inferior a la fecha de entrada de la reserva.";
                throw new Error(error);
            }
            const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
            const codigoFinal = transaccionInterna.ok;
            const transaccionPrecioReserva = {
                tipoProcesadorPrecio: "uid",
                reservaUID: reserva
            };
            const mensajeSinFuturo = "No se puede seleccionar esa fecha de salida. Con los apartamentos existentes en la reserva no se puede por que hay otros eventos que lo impiden. Puedes ver los eventos que lo impiden detallados a continuación.";
            if ((codigoFinal === "noHayRangoFuturo")
                &&
                (fechaSalida_Objeto < fechaSolicitada_objeto)) {
                const estructura = {
                    detallesDelError: mensajeSinFuturo,
                    ...transaccionInterna
                };
                throw new vitiniSysError(estructura);
            }

            if ((codigoFinal === "rangoFuturoLimitado")
                &&
                (fechaSalida_Objeto < fechaSolicitada_objeto)) {
                const fechaLimite_objeto = DateTime.fromISO(transaccionInterna.limiteFuturo);
                if (fechaLimite_objeto <= fechaSolicitada_objeto) {
                    const estructura = {
                        detallesDelError: mensajeSinFuturo,
                        ...transaccionInterna
                    };
                    throw new vitiniSysError(estructura);
                }


            }

            const actualizarModificacionFechaEntradaReserva = `
                            UPDATE reservas
                            SET salida = $1
                            WHERE reserva = $2
                            RETURNING
                            to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO";`;
            const resuelveConfirmarFecha = await conexion.query(actualizarModificacionFechaEntradaReserva, [fechaSolicitada_ISO, reserva]);
            if (resuelveConfirmarFecha.rowCount === 1) {
                const nuevaFechaSalida = resuelveConfirmarFecha.rows[0].fechaSalida_ISO;
                await insertarTotalesReserva(transaccionPrecioReserva);
                const ok = {
                    ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                    sentidoRango: "futuro",
                    fecha_ISO: nuevaFechaSalida
                };
                salida.json(ok);
            }
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {};
        if (errorCapturado instanceof vitiniSysError) {
            error.error = errorCapturado.objeto;
        } else {
            error.error = errorCapturado.message;
        }
        salida.json(error);
    } finally {
        bloqueoConfirmarModificarFechaReserva();
    }
}