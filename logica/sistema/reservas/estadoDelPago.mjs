import { obtenerReservaPorReservaUID } from "../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarEstadoPago } from "../precios/actualizarEstadoPago.mjs";

export const estadoDelPago = async (reservaUID) => {
    try {
        await obtenerReservaPorReservaUID(reservaUID);
        await actualizarEstadoPago(reservaUID);
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}