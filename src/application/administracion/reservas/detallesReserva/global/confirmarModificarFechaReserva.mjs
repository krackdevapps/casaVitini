import { Mutex } from "async-mutex";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { DateTime } from "luxon";
import { vitiniSysError } from "../../../../../shared/vitiniSysError.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarModificacionRangoFechaResereva } from "../../../../../shared/reservas/validarModificacionRangoFechaResereva.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarFechaEntradaReserva } from "../../../../../infraestructure/repository/reservas/rangoFlexible/actualizarFechaEntradaReserva.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarFechaSalidaReserva } from "../../../../../infraestructure/repository/reservas/rangoFlexible/actualizarFechaSalidaReserva.mjs";
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs";
import { eliminarChecksPasadosPorNuevasFechasReserva } from "../../../../../infraestructure/repository/reservas/pernoctantes/eliminarChecksPasadosPorNuevasFechasReserva.mjs";

export const confirmarModificarFechaReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSolicitada_ISO,
            nombreCampo: "La fecha solicitada"
        });

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaSolicitada_objeto = DateTime.fromISO(fechaSolicitada_ISO, { zone: zonaHoraria });
        const fechaSolicitada_array = fechaSolicitada_ISO.split("-");
        await campoDeTransaccion("iniciar")
        const mesSeleccionado = fechaSolicitada_array[1];
        const anoSeleccionado = fechaSolicitada_array[0];
        const reserva = await obtenerReservaPorReservaUID(reservaUID)

        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada. Una reserva cancelada no interfiere en los días ocupados.";
            throw new Error(error);
        }

        const fechaEntrada = reserva.fechaEntrada;
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const fechaSalida = reserva.fechaSalida;
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida, { zone: zonaHoraria });

        const metadatos = {
            reservaUID,
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

            const mensajeSinPasado = "No se puede aplicar esa fecha de entrada a la reserva porque, sobre la base de los apartamentos de esta reserva, no hay días libres. Puedes ver a continuación los eventos que lo impiden.";

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
                const fechaLimite_objeto = DateTime.fromISO(transaccionInterna.limitePasado, { zone: zonaHoraria });
                if (fechaLimite_objeto >= fechaSolicitada_objeto) {
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




            const desgloseFinanciero = await actualizadorIntegradoDesdeInstantaneas(reservaUID)
            await eliminarChecksPasadosPorNuevasFechasReserva({
                reservaUID,
                fechaEntrada: fechaSolicitada_ISO,
                fechaSalida: fechaSalida,
            })
            await campoDeTransaccion("confirmar")

            const nuevaFechaEntrada = reservaActualizada.fechaEntrada;
            const ok = {
                ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                sentidoRango: "pasado",
                fecha_ISO: nuevaFechaEntrada,
                desgloseFinanciero
            };
            return ok

        } else if (sentidoRango === "futuro") {
            if (fechaSolicitada_objeto <= fechaEntrada_Objeto) {
                const error = "La fecha de salida solicitada no puede ser igual o inferior a la fecha de entrada de la reserva.";
                throw new Error(error);
            }
            const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
            const codigoFinal = transaccionInterna.ok;
            const mensajeSinFuturo = "No se puede seleccionar esa fecha de salida. Con los apartamentos existentes en la reserva no se puede porque hay otros eventos que lo impiden. Puedes ver los eventos que lo impiden detallados a continuación.";
            if ((codigoFinal === "noHayRangoFuturo")
                &&
                (fechaSalida_Objeto < fechaSolicitada_objeto)) {
                const estructura = {
                    detallesDelError: mensajeSinFuturo,
                    ...transaccionInterna
                };
                throw new vitiniSysError(estructura);
            } else if ((codigoFinal === "rangoFuturoLimitado")
                &&
                (fechaSalida_Objeto < fechaSolicitada_objeto)) {
                const fechaLimite_objeto = DateTime.fromISO(transaccionInterna.limiteFuturo, { zone: zonaHoraria });
                if (fechaLimite_objeto <= fechaSolicitada_objeto) {
                    const estructura = {
                        detallesDelError: mensajeSinFuturo,
                        ...transaccionInterna
                    };
                    throw new vitiniSysError(estructura);
                }
            }
            const reservaActualizada = await actualizarFechaSalidaReserva({
                fechaSolicitada_ISO: fechaSolicitada_ISO,
                reservaUID: reservaUID
            })
            const nuevaFechaSalida = reservaActualizada.fechaSalida;
            const desgloseFinanciero = await actualizadorIntegradoDesdeInstantaneas(reservaUID)
            await eliminarChecksPasadosPorNuevasFechasReserva({
                reservaUID,
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSolicitada_ISO,
            })
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "Se ha actualizado correctamente la fecha de entrada en la reserva",
                sentidoRango: "futuro",
                fecha_ISO: nuevaFechaSalida,
                desgloseFinanciero
            }
            return ok
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}