import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { procesador } from "../../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarDescuentoPorAdministrador = async (entrada) => {
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
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, no se pueden alterar los descuentos."
            throw new Error(error)
        }
        await campoDeTransaccion("iniciar")
        await obtenerOferatPorOfertaUID(ofertaUID)
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
                        tipo: "insertarDescuentoPorAdministrador",
                    },
                    ofertaUID: ofertaUID
                },
                impuestos: {
                    origen: "instantaneaImpuestosEnReserva",
                    reservaUID: reservaUID
                }
            }
        })
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
    }
}