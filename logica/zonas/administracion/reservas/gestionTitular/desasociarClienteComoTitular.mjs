import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerReservaPorReservaUID } from "../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const desasociarClienteComoTitular = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await obtenerReservaPorReservaUID(reservaUID)
        await eliminarTitularPoolPorReservaUID(reservaUID)
        await eliminarTitularPorReservaUID(reservaUID)
        const ok = {
            ok: "Se ha eliminado el titular de la reserva, la reserva ahora no tiene titular"
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}