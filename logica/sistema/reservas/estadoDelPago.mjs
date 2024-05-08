import { actualizarEstadoPago } from "../precios/actualizarEstadoPago.mjs";
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";

export const estadoDelPago = async (reservaUID) => {
    try {
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        await actualizarEstadoPago(reservaUID);
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}