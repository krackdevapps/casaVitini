import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion.mjs"
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs"
import { actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID.mjs"

export const actualizarAutorizacionDescuentoCompatible = async (entrada) => {
    const mutex = new Mutex()
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
        await obtenerOferatPorOfertaUID(ofertaUID)
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
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    reservaUID: reservaUID,
                    capaImpuestos: "si"
                }
            },
        })
        await actualizarDesgloseFinacieroPorReservaUID({
            desgloseFinanciero,
            reservaUID
        })
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
        mutex.release()
    }
}