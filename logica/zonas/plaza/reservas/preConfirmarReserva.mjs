import { Mutex } from "async-mutex";
import { interruptor } from "../../../sistema/configuracion/interruptor.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validarObjetoReserva } from "../../../sistema/reservas/validarObjetoReserva.mjs";
import { insertarReserva } from "../../../sistema/reservas/insertarReserva.mjs";
import { detallesReserva } from "../../../sistema/reservas/detallesReserva.mjs";
import { enviarEmailReservaConfirmada } from "../../../sistema/Mail/enviarEmailReservaConfirmada.mjs";
import { actualizarEstadoPago } from "../../../sistema/contenedorFinanciero/entidades/reserva/actualizarEstadoPago.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { crearEnlacePDF } from "../../../sistema/pdf/crearEnlacePDF.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const preConfirmarReserva = async (entrada) => {
    const mutex = new Mutex()
    try {
        await mutex.acquire();
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        const reserva = entrada.body.reserva;

        //ALERTA - ACTIVAME!!!, SISTEMA DE VALIDACIO DESACTIVADO POR TEMAS DE DEV
        // await validarObjetoReserva({
        //     reservaObjeto: reserva,
        //     filtroHabitacionesCamas: "si",
        //     filtroTitular: "si"
        // })

        await campoDeTransaccion("iniciar")
        await eliminarBloqueoCaducado()
        const resolvertInsertarReserva = await insertarReserva(reserva)
        const reservaUID = resolvertInsertarReserva.reservaUID

        await actualizarEstadoPago(reservaUID)
        await campoDeTransaccion("confirmar")
        const resolverDetallesReserva = await detallesReserva({
            reservaUID: reservaUID,
            capas: ["desgloseFinanciero"]
        })
        const enlacePDF = await crearEnlacePDF(reservaUID);

        resolverDetallesReserva.enlacePDF = enlacePDF;
        //enviarEmailReservaConfirmada(reservaUID);
        const ok = {
            ok: "Reserva confirmada",
            detalles: resolverDetallesReserva
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");

        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}