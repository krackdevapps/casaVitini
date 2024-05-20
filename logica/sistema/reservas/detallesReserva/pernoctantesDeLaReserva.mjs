import { obtenerClientePoolPorPernoctanteUID } from "../../../repositorio/clientes/obtenerClientePoolPorPernoctanteUID.mjs"
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs"
import { eliminarPernoctantePorPernoctanteUID } from "../../../repositorio/reservas/pernoctantes/eliminarPernoctantePorPernoctanteUID.mjs"
import { obtenerTodosLosPernoctantesDeLaReserva } from "../../../repositorio/reservas/pernoctantes/obtenerTodosLosPernoctantesDeLaReserva.mjs"

export const pernoctantesDeLaReserva = async (reservaUID) => {

    const pernoctantes = await obtenerTodosLosPernoctantesDeLaReserva(reservaUID)
    const p = []

    for (const pernoctante of pernoctantes) {
        const pernoctanteUID = pernoctante.pernoctanteUID // UID como pernoctante no como clinete
        const clienteUID = pernoctante.clienteUID
        const habitacionAsociada = pernoctante.habitacionUID
        const reservaPernoctante = pernoctante.reservaUID
        const datosPernoctante = {
            reserva: reservaPernoctante,
            pernoctanteUID: pernoctanteUID,
            clienteUID: clienteUID,
            habitacion: habitacionAsociada,
        }
        if (clienteUID) {
            await eliminarPernoctantePorPernoctanteUID(pernoctanteUID)
            datosPernoctante.tipoPernoctante = "cliente"
            const cliente = await obtenerDetallesCliente(clienteUID)
            const primeroApellido = cliente.primerApellido ? cliente.primerApellido : ""
            const segundoApellido = cliente.segundoApellido ? cliente.segundoApellido : ""
            datosPernoctante.nombreCompleto = cliente.nombre + " " + primeroApellido + " " + segundoApellido
            datosPernoctante.pasaporte = cliente.pasaporte
        } else {
            datosPernoctante.tipoPernoctante = "clientePool"
            const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
            datosPernoctante.nombreCompleto = clientePool.nombreCompleto
            datosPernoctante.pasaporte = clientePool.pasaporte
        }
        p.push(datosPernoctante)
    }
    return p
}
