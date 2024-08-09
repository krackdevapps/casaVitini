import { actualizarEstadoReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/actualizarEstadoReservaPorReservaUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";

export const actualizarEstadoReserva = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const nuevoEstado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoEstado,
            nombreCampo: "El campo nuevoEstado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (nuevoEstado !== "pendiente" && nuevoEstado !== "confirmada") {
            const m = "El campo nuevo estado solo puede ser pendiente o confirmada."
            throw new Error(m)

        }
        const detallesReserva = await obtenerReservaPorReservaUID(reservaUID)
        if (detallesReserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }

        await actualizarEstadoReservaPorReservaUID({
            reservaUID,
            nuevoEstado,
        })

        const ok = {
            ok: "Se ha actualizado el estado de la reserva",
            estadoActual: nuevoEstado
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}