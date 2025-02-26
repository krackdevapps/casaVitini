import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"
import { actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"

export const actualizarAutorizacionDescuentoCompatible = async (entrada) => {
    const mutex = new Mutex()
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

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const nuevaAutorizacion = entrada.body.nuevaAutorizacion
        if (nuevaAutorizacion !== "aceptada" && nuevaAutorizacion !== "rechazada") {
            const error = "El campo nuevaAutorizacion solo puede ser aceptada o rechazada"
            throw new Error(error)
        }
        mutex.acquire()
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, no se pueden alterar los descuentos."
            throw new Error(error)
        }

        await campoDeTransaccion("iniciar")
        await obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion({
            reservaUID,
            ofertaUID,
            errorSi: "noExiste"
        })
        await actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID({
            ofertaUID,
            reservaUID,
            nuevaAutorizacion
        })
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el estado de autorización de la oferta en la reserva",
            autorizacion: nuevaAutorizacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) { mutex.release() }
    }
}