import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { obtenerServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServicioEnReservaPorServicioUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const obtenerDetallesDelServicioEnReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const servicioUID_enReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enReserva,
            nombreCampo: "El identificador universal del servicio (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

        const servicio = await obtenerServicioEnReservaPorServicioUID(servicioUID_enReserva)
        const contenedorServicio = servicio.contenedor
        contenedorServicio.servicioUID = servicio.servicioUID

        const ok = {
            ok: "Detalles del servicio en la reserva",
            servicio
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}