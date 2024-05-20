import { Mutex } from "async-mutex";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { DateTime } from "luxon";
import { insertarTotalesReserva } from "../../../sistema/reservas/insertarTotalesReserva.mjs";
import { vitiniSysError } from "../../../sistema/vitiniSysError.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validarModificacionRangoFechaResereva } from "../../../sistema/reservas/validarModificacionRangoFechaResereva.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarFechaEntradaReserva } from "../../../repositorio/reservas/rangoFlexible/actualizarFechaEntradaReserva.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const confirmarModificarFechaReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const sentidoRango = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoRango,
            nombreCampo: "El nombre de sentidoRango",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro";
            throw new Error(error);
        }

        const fechaSolicitada_ISO = entrada.body.fechaSolicitada_ISO;
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaSolicitada_ISO);

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaSolicitada_objeto = DateTime.fromISO(fechaSolicitada_ISO, { zone: zonaHoraria });
        const fechaSolicitada_array = fechaSolicitada_ISO.split("-");
        await campoDeTransaccion("iniciar")
        const mesSeleccionado = fechaSolicitada_array[1];
        const anoSeleccionado = fechaSolicitada_array[0];

        const reserva = obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada, una reserva cancelada no interfiere en los dias ocupados";
            throw new Error(error);
        }
        const fechaEntrada_ISO = reserva.fechaEntrada;
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        const fechaSalida_ISO = reserva.fechaSalida;
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
            const reservaActualizada = await actualizarFechaEntradaReserva({
                fechaSolicitada_ISO: fechaSolicitada_ISO,
                reservaUID: reservaUID
            })
            const nuevaFechaEntrada = reservaActualizada.fechaEntrada;
            await insertarTotalesReserva(transaccionPrecioReserva);
            const ok = {
                ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                sentidoRango: "pasado",
                fecha_ISO: nuevaFechaEntrada
            };
            salida.json(ok);

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
            const reservaActualizada = await actualizarFechaEntradaReserva({
                fechaSolicitada_ISO: fechaSolicitada_ISO,
                reservaUID: reservaUID
            })
            const nuevaFechaSalida = reservaActualizada.fechaSalida;
            await insertarTotalesReserva(transaccionPrecioReserva);
            const ok = {
                ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                sentidoRango: "futuro",
                fecha_ISO: nuevaFechaSalida
            };
            salida.json(ok);
        }
        await campoDeTransaccion("confirmar")
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}