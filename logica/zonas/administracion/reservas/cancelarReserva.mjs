import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { bloquearApartamentos } from "../../../sistema/bloqueos/bloquearApartamentos.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { eliminarEnlaceDePagoPorReservaUID } from "../../../repositorio/enlacesDePago/eliminarEnlaceDePagoPorReservaUID.mjs";
import { DateTime } from "luxon";
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs";
import { actualizarEstadoReservaPorReservaUID } from "../../../repositorio/reservas/reserva/actualizarEstadoReservaPorReservaUID.mjs";

export const cancelarReserva = async (entrada, salida) => {
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
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const tipoBloqueo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueo,
            nombreCampo: "El nombre de tipoBloqueo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        if (tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "permanente" && tipoBloqueo !== "sinBloqueo") {
            const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo";
            throw new Error(error);
        }
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva ya esta cancelada";
            throw new Error(error);
        }
        await eliminarEnlaceDePagoPorReservaUID(reservaUID)
        const fechaEntrada_ISO = reserva.fechaEntrada;
        const fechaSalida_ISO = reserva.fechaSalida;
        // extraer todos los apartamentos de la reserva
        const apartamentosDeLaReserva = obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        for (const apartamento of apartamentosDeLaReserva) {
            const metadatos = {
                reserva: reserva,
                apartamentoUID: apartamento.apartamentoUID,
                tipoBloqueo: tipoBloqueo,
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                zonaBloqueo: "publico",
                origen: "cancelacionDeReserva"
            };
            await bloquearApartamentos(metadatos);
        }
        const estadoReserva = "cancelada";
        const fechaCancelacion = DateTime.utc().toISO();

        await actualizarEstadoReservaPorReservaUID({
            estadoReserva: estadoReserva,
            fechaCancelacion: fechaCancelacion,
            reservaUID: reservaUID
        })

        const ok = {
            ok: "La reserva se ha cancelado correctamente"
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}