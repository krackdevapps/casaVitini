import { Mutex } from "async-mutex";
import { interruptor } from "../../../sistema/configuracion/interruptor.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validarObjetoReserva } from "../../../sistema/reservas/validarObjetoReserva.mjs";
import { insertarReserva } from "../../../sistema/reservas/insertarReserva.mjs";
import { detallesReserva } from "../../../sistema/reservas/detallesReserva.mjs";
import { enviarEmailReservaConfirmada } from "../../../sistema/Mail/enviarEmailReservaConfirmada.mjs";
import { actualizarEstadoPago } from "../../../sistema/precios/actualizarEstadoPago.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { crearEnlacePDF } from "../../../sistema/pdf/crearEnlacePDF.mjs";


export const preConfirmarReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        await mutex.acquire();
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        const reserva = entrada.body.reserva;
        await validarObjetoReserva(reserva);
        await campoDeTransaccion("iniciar");

        await eliminarBloqueoCaducado();
        const resolvertInsertarReserva = await insertarReserva(reserva);
        const reservaUID = resolvertInsertarReserva.reservaUID;
        await actualizarEstadoPago(reservaUID);
        await campoDeTransaccion("confirmar");
        const metadatos = {
            reservaUID: reservaUID,
            solo: "globalYFinanciera"
        };
        const resolverDetallesReserva = await detallesReserva(metadatos);
        const enlacePDF = await crearEnlacePDF(reservaUID);
        resolverDetallesReserva.enlacePDF = enlacePDF;
        const ok = {
            ok: "Reserva confirmada",
            detalles: resolverDetallesReserva
        };
        return ok

        enviarEmailReservaConfirmada(reservaUID);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorFinal
    } finally {
        mutex.release();
    }
}