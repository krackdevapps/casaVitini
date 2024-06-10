import { obtenerClientePoolPorPernoctanteUID } from "../../../repositorio/pool/obtenerClientePoolPorPernoctanteUID.mjs"
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs"
import { obtenerTodosLosPernoctantesDeLaReserva } from "../../../repositorio/reservas/pernoctantes/obtenerTodosLosPernoctantesDeLaReserva.mjs"
import { eliminarClientePoolPorPernoctanteUID } from "../../../repositorio/clientes/eliminarClientePoolPorPernoctanteUID.mjs"

export const pernoctantesDeLaReserva = async (reservaUID) => {
    try {
        const pernoctantes = await obtenerTodosLosPernoctantesDeLaReserva(reservaUID)
        const p = []

        for (const pernoctante of pernoctantes) {


            const pernoctanteUID = pernoctante.componenteUID // UID como pernoctante no como clinete
            const clienteUID = pernoctante.clienteUID
            const habitacionUID = pernoctante.habitacionUID
            const reservaUID = pernoctante.reservaUID
            const datosPernoctante = {
                reservaUID,
                pernoctanteUID,
                habitacionUID
            }
            if (clienteUID) {

                await eliminarClientePoolPorPernoctanteUID(pernoctanteUID)

                datosPernoctante.tipoPernoctante = "cliente"
                const cliente = await obtenerDetallesCliente(clienteUID)
                const primeroApellido = cliente.primerApellido ? cliente.primerApellido : ""
                const segundoApellido = cliente.segundoApellido ? cliente.segundoApellido : ""
                datosPernoctante.nombreCompleto = cliente.nombre + " " + primeroApellido + " " + segundoApellido
                datosPernoctante.pasaporte = cliente.pasaporte
                datosPernoctante.clienteUID = clienteUID

            } else {
                datosPernoctante.tipoPernoctante = "clientePool"
                const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
                datosPernoctante.nombreCompleto = clientePool.nombreCompleto
                datosPernoctante.pasaporte = clientePool.pasaporte
            }
            p.push(datosPernoctante)
        }
        return p
    } catch (error) {
        throw error
    }

}
