import { obtenerReservaPendientesDeRevision } from "../../../../infraestructure/repository/reservas/reserva/obtenerReservaPendientesDeRevision.mjs";
import { detallesReserva } from "../../../../shared/reservas/detallesReserva.mjs";



export const obtener_reservas = async (entrada) => {
    try {



        const reseervasPendientesDeRevision = await obtenerReservaPendientesDeRevision({
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