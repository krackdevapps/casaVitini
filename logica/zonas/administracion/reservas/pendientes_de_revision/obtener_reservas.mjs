import { obtenerReservaPendientesDeRevision } from "../../../../repositorio/reservas/reserva/obtenerReservaPendientesDeRevision.mjs";
import { detallesReserva } from "../../../../sistema/reservas/detallesReserva.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";


export const obtener_reservas = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        const reseervasPendientesDeRevision = await obtenerReservaPendientesDeRevision( {
            estadoReserva: "pendiente"
        })

        const reservas = []

        for (const reservaPendienteDeRevision of reseervasPendientesDeRevision) {
            const reservaUID = reservaPendienteDeRevision.reservaUID
            const reserva = await detallesReserva({
                reservaUID,
                capas: [
                    "titular",
                    "desgloseFinanciero"
                ]
            });    
            reservas.push(reserva)
        }
        
        const ok = {
            ok: "Aquí tienes las reservas de origen público pendientes por revisar.",
            reservas: reservas
        };

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}