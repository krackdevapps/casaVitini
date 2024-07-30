import { Mutex } from "async-mutex";
import { interruptor } from "../../../sistema/configuracion/interruptor.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validarObjetoReserva } from "../../../sistema/reservas/validarObjetoReserva.mjs";
import { insertarReserva } from "../../../sistema/reservas/insertarReserva.mjs";
import { detallesReserva } from "../../../sistema/reservas/detallesReserva.mjs";
import { enviarMailReservaConfirmada } from "../../../sistema/mail/enviarMailReservaConfirmada.mjs";
import { actualizarEstadoPago } from "../../../sistema/contenedorFinanciero/entidades/reserva/actualizarEstadoPago.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { generadorPDF } from "../../../sistema/pdf/generadorPDF.mjs";
import { utilidades } from "../../../componentes/utilidades.mjs";

export const preConfirmarReserva = async (entrada) => {
    const mutex = new Mutex()
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        await utilidades.ralentizador(2000)
        await mutex.acquire()

        const reserva = entrada.body.reserva;

        await validarObjetoReserva({
            reservaObjeto: reserva,
            filtroHabitacionesCamas: "si",
            filtroTitular: "si"
        })

        await campoDeTransaccion("iniciar")
        await eliminarBloqueoCaducado()
        const resolvertInsertarReserva = await insertarReserva(reserva)
        const reservaUID = resolvertInsertarReserva.reservaUID

        await actualizarEstadoPago(reservaUID)
        await campoDeTransaccion("confirmar")

        const resolverDetallesReserva = await detallesReserva({
            reservaUID: reservaUID,
            capas: [
                "titular",
                "alojamiento",
                "pernoctantes",
                "desgloseFinanciero"
            ]
        })
        const pdf = await generadorPDF(resolverDetallesReserva);
        enviarMailReservaConfirmada(reservaUID);
        const ok = {
            ok: "Reserva confirmada",
            detalles: resolverDetallesReserva,
            pdf
        }
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