import { obtenerReservaPendientesDeRevision } from "../../../../repositorio/reservas/reserva/obtenerReservaPendientesDeRevision.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";


export const obtener_reservas = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        // Obtener todas las reservas no pagadas de origen cliente
        const dataReservas = {
            estadoReserva: "pendiente"
        }
        const reseervasPendientesDeRevision = await obtenerReservaPendientesDeRevision(dataReservas)
        const ok = {
            ok: "Aquí tienes las reservas de origen publico pendientes por revisar",
            reservas: reseervasPendientesDeRevision
        };

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}