import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { procesador } from "../../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarDescuentoPorCompatible = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
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
            errorSi: "existe"
        })
        const fechaEntradaReserva = reserva.fechaEntrada
        const fechaSalidaReserva = reserva.fechaSalida
        const fechaCreacion_simple = reserva.fechaCreacion_simple
        // validar aqui que la oferta por condicion no esta ya en la instantanea
        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        })
        // Desde aqui se envia esto mas el ofertaUID
        const desgloseFinanciero = await procesador({

            entidades: {
                reserva: {
                    origen: "hubReservas",
                    reservaUID: reservaUID
                },
                servicios: {
                    origen: "instantaneaServiciosEnReserva",
                    reservaUID: reservaUID
                },
            },
            capas: {
                ofertas: {
                    operacion: {
                        tipo: "insertarDescuentoCompatibleConReserva",
                    },
                    ofertaUID: ofertaUID,
                    ignorarCodigosDescuentos: "si"
                },
                impuestos: {
                    origen: "instantaneaImpuestosEnReserva",
                    reservaUID: reservaUID
                }
            }
        })
        // Ojo por que sobrescribe las ofertas existentes, debe de añadir en el array de ofertas por cocndicion otra mas
        await actualizarDesgloseFinacieroPorReservaUID({
            desgloseFinanciero,
            reservaUID
        })

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el conenedorFinanciero",
            contenedorFinanciero: desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}