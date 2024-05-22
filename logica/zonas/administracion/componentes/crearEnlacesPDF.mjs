import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { crearEnlacePDF } from "../../../sistema/pdf/crearEnlacePDF.mjs";

import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const crearEnlacesPDF = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reserva = entrada.body.reserva;
        await obtenerReservaPorReservaUID(reserva);
        
        const enlaces = await crearEnlacePDF(reserva);
        const ok = {
            ok: "ok",
            enlaces: enlaces
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}