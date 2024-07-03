import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID.mjs"
import { eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID.mjs"
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs"

export const eliminarDescuentoEnReserva = async (entrada) => {
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
        const posicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.posicion,
            nombreCampo: "El el campo de posicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        if (posicion === "0") {
            const m = "No puedes pasar una posicion en 0, recuerda que aqui las posiciones empiezan a contar desde 1"
            throw new Errror(m)
        }

        const origen = validadoresCompartidos.tipos.cadena({
            string: entrada.body.origen,
            nombreCampo: "El campo origen en el controlador",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada, no se puede alterar los descuentos"
            throw new Error(error)
        }

        if (origen === "porAdministrador") {
            await eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID({
                reservaUID,
                ofertaUID,
                posicion

            })
        } else if (origen === "porCondicion") {
            await eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID({
                reservaUID,
                ofertaUID,
                posicion

            })
        } else {
            const error = "El campo origen solo puede ser porAdminsitrador o porCondicion"
            throw new Error(error)
        }

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    reservaUID: reservaUID,
                    capaImpuestos: "si"
                }
            },
        })
        await campoDeTransaccion("iniciar")
        await actualizarDesgloseFinacieroPorReservaUID({
            desgloseFinanciero,
            reservaUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado correctamente la oferta de la instantanea de la reserva",
            orgien: origen,
            ofertaUID: ofertaUID
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}