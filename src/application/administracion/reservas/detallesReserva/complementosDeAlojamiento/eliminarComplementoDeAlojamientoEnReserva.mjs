import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarComplementoAlojamientoEnReservaPorComplementoUID } from "../../../../../infraestructure/repository/reservas/complementosAlojamiento/eliminarComplementoAlojamientoEnReservaPorComplementoUID.mjs"
import { obtenerComplementoAlojamientoEnReservaPorComplementoUID } from "../../../../../infraestructure/repository/reservas/complementosAlojamiento/obtenerComplementoAlojamientoEnReservaPorComplementoUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const eliminarComplementoDeAlojamientoEnReserva = async (entrada) => {
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

        const complementoUID_enReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID_enReserva,
            nombreCampo: "El identificador universal de complementoUID_enReserva",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })


        const complementoDeAlojamientoEnReserva = await obtenerComplementoAlojamientoEnReservaPorComplementoUID(complementoUID_enReserva)
        const reservaUID = Number(complementoDeAlojamientoEnReserva.reservaUID)
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

        await campoDeTransaccion("iniciar")
        await eliminarComplementoAlojamientoEnReservaPorComplementoUID(complementoUID_enReserva)
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado el comportamiento de alojamiento del alojamiento de la reserva"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}