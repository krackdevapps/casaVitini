import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs"
import { obtenerImpuestoPorImpuestoUIDPorReservaUID } from "../../../../../repositorio/reservas/transacciones/impuestos/obtenerImpuestoPorImpuestoUIDPorReservaUID.mjs"
import { eliminarImpuestoPorImpuestoUIDPorReservaUID } from "../../../../../repositorio/reservas/transacciones/impuestos/eliminarImpuestoPorImpuestoUIDPorReservaUID.mjs"

export const eliminarImpuestoEnReserva = async (entrada) => {
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

        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El identificador universal del impuesto (impuestoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        mutex.acquire()
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva esta cancelada, no se puede alterar los descuentos"
            throw new Error(error)
        }

        await obtenerImpuestoPorImpuestoUIDPorReservaUID({
            reservaUID,
            impuestoUID,
            errorSi: "noExiste"
        })

     //   await campoDeTransaccion("iniciar")
        // Eliminar impuesto
        await eliminarImpuestoPorImpuestoUIDPorReservaUID({
            reservaUID,
            impuestoUID
        })

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    reservaUID: reservaUID
                }
            },
        })
        await actualizarDesgloseFinacieroPorReservaUID({
            desgloseFinanciero,
            reservaUID
        })

       // await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el conenedorFinanciero",
            contenedorFinanciero: desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        //await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}