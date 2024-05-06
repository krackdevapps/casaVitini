import { Mutex } from "async-mutex";
import { interruptor } from "../../../sistema/configuracionGlobal/interruptor.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/sistemaDeBloqueos/eliminarBloqueoCaducado.mjs";
import { validarObjetoReserva } from "../../../sistema/sistemaDeReservas/validarObjetoReserva.mjs";
import { insertarReserva } from "../../../sistema/sistemaDeReservas/insertarReserva.mjs";
import { detallesReserva } from "../../../sistema/sistemaDeReservas/detallesReserva.mjs";
import { enviarEmailReservaConfirmada } from "../../../sistema/sistemaDeMail/enviarEmailReservaConfirmada.mjs";
import { actualizarEstadoPago } from "../../../sistema/sistemaDePrecios/actualizarEstadoPago.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { crearEnlacePDF } from "../../../sistema/sistemaDePDF/crearEnlacePDF.mjs";

export const preConfirmarReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        await mutex.acquire();
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        const reserva = entrada.body.reserva;
        await conexion.query('BEGIN');
        const resuelveValidacionObjetoReserva = await validarObjetoReserva(reserva);
        if (!resuelveValidacionObjetoReserva.ok) {
            const error = "Ha ocurrido un error desconocido en la validacion del objeto";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();
        const resolvertInsertarReserva = await insertarReserva(reserva);
        const reservaUID = resolvertInsertarReserva.reservaUID;
        await actualizarEstadoPago(reservaUID);
        if (resolvertInsertarReserva.ok) {
            const metadatos = {
                reservaUID: reservaUID,
                solo: "globalYFinanciera"
            };
            const resolverDetallesReserva = await detallesReserva(metadatos);
            const enlacePDF = await crearEnlacePDF(reservaUID);
            resolverDetallesReserva.enlacePDF = enlacePDF;
            const ok = {
                ok: "Reserva confirmada y pagada",
                detalles: resolverDetallesReserva
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT');
        enviarEmailReservaConfirmada(reservaUID);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }
}