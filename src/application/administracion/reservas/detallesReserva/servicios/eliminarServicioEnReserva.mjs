import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { eliminarServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/eliminarServicioEnReservaPorServicioUID.mjs"
import { obtenerServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServicioEnReservaPorServicioUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const eliminarServicioEnReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const servicioUID_enReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enReserva,
            nombreCampo: "El identificador universal de la servicio (servicioUID_enReserva)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })


        const servicioEnReserva = await obtenerServicioEnReservaPorServicioUID(servicioUID_enReserva)
        const reservaUID = Number(servicioEnReserva.reservaUID)
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

        await campoDeTransaccion("iniciar")
        await eliminarServicioEnReservaPorServicioUID(servicioUID_enReserva)
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el servicio de la reserva"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}