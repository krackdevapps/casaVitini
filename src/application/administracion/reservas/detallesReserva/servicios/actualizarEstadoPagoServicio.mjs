import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarEstadoPagoServicioPorServicioUIDPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/actualizarEstadoPagoServicioPorServicioUIDPorReservaUID.mjs"
import { obtenerServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServicioEnReservaPorServicioUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const actualizarEstadoPagoServicio = async (entrada) => {
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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const servicioUID_enReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enReserva,
            nombreCampo: "El identificador universal del servicio (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })


        const nuevoEstadoPagoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoEstadoPagoIDV,
            nombreCampo: "El nuevoEstadoPagoIDV del servicio",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const estadosPagoIDV = [
            "pagado",
            "noPagado"
        ]

        if (!estadosPagoIDV.includes(nuevoEstadoPagoIDV)) {
            throw new Error("En nuevoEstadoPAgoIDV solo se espera pagado o noPagado")
        }

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }
        await obtenerServicioEnReservaPorServicioUID(servicioUID_enReserva)
        await campoDeTransaccion("iniciar")
        const servicioEnReserva = await actualizarEstadoPagoServicioPorServicioUIDPorReservaUID({
            reservaUID,
            servicioUID_enReserva,
            nuevoEstadoPagoIDV,
        })
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el estado del pago del servicio.",
            servicio: servicioEnReserva,
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}