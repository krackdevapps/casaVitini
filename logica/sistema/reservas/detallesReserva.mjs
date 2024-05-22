import { obtenerReservaPorReservaUID } from "../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { desgloseTotal } from "./detallesReserva/desgloseTotal.mjs"
import { detallesAlojamiento } from "./detallesReserva/detallesAlojamiento.mjs"
import { detallesTitular } from "./detallesReserva/detallesTitular.mjs"
import { clientesReserva } from "./detallesReserva/clientesReserva.mjs"
import { recuperarClientesSinHabitacionAsignada } from "./detallesReserva/recuperarClientesSinHabitacionAsignada.mjs"
import { pernoctantesDeLaReserva } from "./detallesReserva/pernoctantesDeLaReserva.mjs"
export const detallesReserva = async (metadatos) => {
    try {
        const solo = metadatos.solo
        const reservaUID = metadatos.reservaUID
        
        const reserva = await obtenerReservaPorReservaUID(reservaUID)

        reserva.titular = await detallesTitular(reservaUID)
        reserva.clientes = await clientesReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })
        reserva.clientesSinHabitacion = await recuperarClientesSinHabitacionAsignada(reservaUID)
        reserva.alojamiento = await detallesAlojamiento(reservaUID)
        reserva.pernoctantes = await pernoctantesDeLaReserva(reservaUID)
        reserva.desgloseFinanciero = await desgloseTotal(reservaUID)
        switch (solo) {
            case "informacionGlobal":
                await informacionGlobal();
                break;
            case "globalYFinanciera":
                await informacionGlobal();
                await desgloseTotal();
                break;
            case "detallesAlojamiento":
                await detallesAlojamiento();
                break;
            case "pernoctantes":
                await pernoctantes();
                break;
            case "desgloseTotal":
                await desgloseTotal();
                break;
            default:
                await informacionGlobal();
                await detallesAlojamiento();
                await desgloseTotal();
                break;
        }
        return reserva
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
