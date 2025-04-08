import { actualizarEstadoReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/actualizarEstadoReservaPorReservaUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";

import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";

export const actualizarEstadoReserva = async (entrada) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
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

        // Si se confirma que mueva los elementos del iventario
        // Si se pasas a pendiente que no inserte elementos del inventario

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